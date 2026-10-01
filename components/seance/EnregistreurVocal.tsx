"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { VocalSeance } from "@/lib/objectifs-store";
import { enregistrerMedia, lireMedia, nouvelId } from "@/lib/medias-seances";
import { useDictee } from "@/lib/dictee";
import { Glyphe } from "./outils";

/*
 * Le vocal d'une séance : on parle, l'onde bat en direct, la transcription
 * s'écrit en même temps (là où le navigateur sait le faire). À l'arrêt, le son
 * part dans IndexedDB et sa trace — durée, texte, 56 crêtes — dans le carnet.
 */

const DUREE_MAX = 20 * 60 * 1000;
const CRETES = 56;

const minutesSecondes = (ms: number) => {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const heureDe = (iso: string) => {
  const d = new Date(iso);
  return `${d.getHours()} h ${String(d.getMinutes()).padStart(2, "0")}`;
};

/** Ramène les niveaux mesurés pendant l'enregistrement à n crêtes, de 0,06 à 1 */
function reduire(niveaux: number[], n: number) {
  if (niveaux.length === 0) return Array.from({ length: n }, () => 0.06);
  const paquet = niveaux.length / n;
  const brut = Array.from({ length: n }, (_, i) => {
    const debut = Math.min(niveaux.length - 1, Math.floor(i * paquet));
    const fin = Math.max(debut + 1, Math.floor((i + 1) * paquet));
    return Math.max(...niveaux.slice(debut, fin));
  });
  const max = Math.max(...brut, 0.01);
  return brut.map((v) => Math.round(Math.max(0.06, v / max) * 100) / 100);
}

export function EnregistreurVocal({
  vocaux,
  onAjouter,
  onSupprimer,
  onVersNote,
}: {
  vocaux: VocalSeance[];
  onAjouter: (vocal: VocalSeance) => void;
  onSupprimer: (id: string) => void;
  onVersNote: (texte: string) => void;
}) {
  const [enCours, setEnCours] = useState(false);
  const [ecoule, setEcoule] = useState(0);
  const [transcription, setTranscription] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [sauvegarde, setSauvegarde] = useState(false);
  const toile = useRef<HTMLCanvasElement>(null);
  const arretRef = useRef<(() => void) | null>(null);
  const texteRef = useRef("");

  const dictee = useDictee((phrase) => {
    texteRef.current = texteRef.current ? `${texteRef.current} ${phrase}.` : `${phrase}.`;
    setTranscription(texteRef.current);
  });

  // Fermer le tiroir pendant un enregistrement l'arrête proprement, et le vocal est gardé
  useEffect(() => () => arretRef.current?.(), []);

  async function demarrer() {
    setErreur(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setErreur("L’enregistrement audio n’est pas pris en charge ici.");
      return;
    }
    let flux: MediaStream;
    try {
      flux = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      setErreur("Micro refusé ou introuvable : autorisez le micro pour cette page.");
      return;
    }

    const type = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((t) => MediaRecorder.isTypeSupported(t));
    const enregistreur = new MediaRecorder(flux, type ? { mimeType: type } : undefined);
    const morceaux: Blob[] = [];
    const niveaux: number[] = [];
    const contexte = new AudioContext();
    const analyseur = contexte.createAnalyser();
    analyseur.fftSize = 1024;
    contexte.createMediaStreamSource(flux).connect(analyseur);
    const echantillons = new Uint8Array(analyseur.fftSize);
    const debut = Date.now();
    let image = 0;
    let dernierNiveau = 0;
    let dernierAffichage = 0;

    const arreter = () => {
      arretRef.current = null;
      cancelAnimationFrame(image);
      dictee.arreter();
      if (enregistreur.state !== "inactive") enregistreur.stop();
    };

    const dessiner = () => {
      analyseur.getByteTimeDomainData(echantillons);
      let somme = 0;
      for (const v of echantillons) {
        const c = (v - 128) / 128;
        somme += c * c;
      }
      const niveau = Math.sqrt(somme / echantillons.length);
      const t = Date.now();
      if (t - dernierNiveau >= 50) {
        niveaux.push(niveau);
        dernierNiveau = t;
      }

      const el = toile.current;
      if (el) {
        const dpr = window.devicePixelRatio || 1;
        const l = Math.round(el.clientWidth * dpr);
        const h = Math.round(el.clientHeight * dpr);
        if (el.width !== l || el.height !== h) {
          el.width = l;
          el.height = h;
        }
        const ctx = el.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, l, h);
          ctx.fillStyle = getComputedStyle(el).color;
          const barres = 48;
          const pas = l / barres;
          const recents = niveaux.slice(-barres);
          recents.forEach((v, i) => {
            const hauteur = Math.max(2 * dpr, Math.min(h, v * h * 3.2));
            ctx.fillRect(l - (recents.length - i) * pas + pas * 0.2, (h - hauteur) / 2, pas * 0.6, hauteur);
          });
        }
      }

      if (t - dernierAffichage >= 200) {
        setEcoule(t - debut);
        dernierAffichage = t;
      }
      if (t - debut >= DUREE_MAX) {
        arreter();
        return;
      }
      image = requestAnimationFrame(dessiner);
    };

    enregistreur.ondataavailable = (e) => {
      if (e.data.size) morceaux.push(e.data);
    };
    enregistreur.onstop = async () => {
      flux.getTracks().forEach((piste) => piste.stop());
      void contexte.close();
      setEnCours(false);
      const dureeMs = Date.now() - debut;
      if (dureeMs < 800) return;
      setSauvegarde(true);
      try {
        const id = nouvelId("vocal");
        await enregistrerMedia(id, new Blob(morceaux, { type: enregistreur.mimeType || "audio/webm" }));
        onAjouter({
          id,
          creeLe: new Date(debut).toISOString(),
          dureeMs,
          transcription: texteRef.current.trim(),
          cretes: reduire(niveaux, CRETES),
        });
      } catch {
        setErreur("Le vocal n’a pas pu être enregistré sur cet appareil.");
      } finally {
        setSauvegarde(false);
      }
    };

    arretRef.current = arreter;
    texteRef.current = "";
    setTranscription("");
    setEcoule(0);
    enregistreur.start(1000);
    if (dictee.disponible) dictee.demarrer();
    setEnCours(true);
    image = requestAnimationFrame(dessiner);
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`rounded-lg border px-4 py-4 transition-colors ${
          enCours ? "border-accent-deep/40 bg-accent-coral/30" : "border-hairline bg-surface-secondary"
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => (enCours ? arretRef.current?.() : void demarrer())}
            disabled={sauvegarde}
            aria-label={enCours ? "Arrêter l’enregistrement" : "Démarrer un vocal"}
            className={`relative h-14 w-14 rounded-full flex items-center justify-center shrink-0 transition-colors disabled:opacity-50 ${
              enCours ? "bg-accent-deep text-canvas" : "bg-ink text-canvas hover:opacity-90"
            }`}
          >
            {enCours && <span className="absolute inset-0 rounded-full bg-accent-deep/40 animate-ping" aria-hidden />}
            {enCours ? <span className="relative h-4 w-4 rounded-[3px] bg-canvas" /> : <Glyphe outil="vocal" taille={22} />}
          </button>
          <div className="min-w-0 flex-1">
            {enCours ? (
              <canvas ref={toile} className="block w-full h-10 text-accent-deep" aria-hidden />
            ) : (
              <svg viewBox="0 0 96 20" className="block w-full h-10 text-text-secondary" preserveAspectRatio="none" aria-hidden>
                {Array.from({ length: 48 }, (_, i) => {
                  const h = 2 + Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23)) * 7;
                  return <rect key={i} x={i * 2 + 0.4} y={10 - h / 2} width={1.2} height={h} rx={0.6} fill="currentColor" opacity={0.35} />;
                })}
              </svg>
            )}
            <p className="font-sans text-xs text-text-muted tabular-nums mt-1">
              {enCours
                ? `Enregistrement · ${minutesSecondes(ecoule)}`
                : sauvegarde
                  ? "Enregistrement du vocal…"
                  : "Touchez le micro : une explication à chaud, un résumé, une question."}
            </p>
          </div>
        </div>

        {enCours &&
          (dictee.disponible && !dictee.erreur ? (
            <p className="mt-3 font-sans text-sm text-ink leading-relaxed">
              {transcription}
              {dictee.provisoire && <span className="text-text-muted italic"> {dictee.provisoire}</span>}
              {!transcription && !dictee.provisoire && (
                <span className="text-text-secondary">La transcription s’écrit ici pendant que vous parlez…</span>
              )}
            </p>
          ) : (
            <p className="mt-3 font-sans text-xs text-text-muted">
              Transcription indisponible ici : le vocal est enregistré, sans texte.
            </p>
          ))}
        {dictee.erreur && <p className="mt-2 font-sans text-xs text-accent-deep">{dictee.erreur}</p>}
        {erreur && <p className="mt-2 font-sans text-xs text-accent-deep">{erreur}</p>}
      </div>

      {vocaux.length === 0 ? (
        <p className="font-sans text-sm text-text-muted">Aucun vocal pour cette séance.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {vocaux.map((v) => (
            <LecteurVocal key={v.id} vocal={v} onSupprimer={() => onSupprimer(v.id)} onVersNote={onVersNote} />
          ))}
        </ul>
      )}
    </div>
  );
}

function LecteurVocal({
  vocal,
  onSupprimer,
  onVersNote,
}: {
  vocal: VocalSeance;
  onSupprimer: () => void;
  onVersNote: (texte: string) => void;
}) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const adresse = useRef<string | null>(null);
  const [lecture, setLecture] = useState(false);
  const [position, setPosition] = useState(0);
  const [texteOuvert, setTexteOuvert] = useState(false);
  const [confirmer, setConfirmer] = useState(false);
  const [introuvable, setIntrouvable] = useState(false);
  const [ajoute, setAjoute] = useState(false);

  useEffect(
    () => () => {
      audio.current?.pause();
      if (adresse.current) URL.revokeObjectURL(adresse.current);
    },
    []
  );

  async function preparer() {
    if (audio.current) return audio.current;
    const fichier = await lireMedia(vocal.id).catch(() => undefined);
    if (!fichier) {
      setIntrouvable(true);
      return null;
    }
    adresse.current = URL.createObjectURL(fichier);
    const a = new Audio(adresse.current);
    // Les webm enregistrés par le navigateur n'annoncent pas leur durée : on se fie à la nôtre
    a.ontimeupdate = () => setPosition(Math.min(1, (a.currentTime * 1000) / vocal.dureeMs));
    a.onended = () => {
      setLecture(false);
      setPosition(0);
    };
    audio.current = a;
    return a;
  }

  async function basculer() {
    const a = await preparer();
    if (!a) return;
    if (a.paused) {
      try {
        await a.play();
        setLecture(true);
      } catch {
        setLecture(false);
      }
    } else {
      a.pause();
      setLecture(false);
    }
  }

  async function chercher(e: MouseEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const a = await preparer();
    if (!a) return;
    a.currentTime = (ratio * vocal.dureeMs) / 1000;
    setPosition(ratio);
  }

  return (
    <li className="rounded-md border border-hairline px-3 py-2.5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void basculer()}
          aria-label={lecture ? "Pause" : "Écouter le vocal"}
          className="h-8 w-8 rounded-full bg-surface-secondary text-ink flex items-center justify-center hover:bg-surface-secondary-hover transition-colors shrink-0"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
            {lecture ? (
              <path d="M3 2h2v8H3zM7 2h2v8H7z" fill="currentColor" />
            ) : (
              <path d="M3.5 1.8l6.5 4.2-6.5 4.2z" fill="currentColor" />
            )}
          </svg>
        </button>
        <svg
          viewBox={`0 0 ${vocal.cretes.length * 2} 24`}
          preserveAspectRatio="none"
          className="flex-1 h-7 cursor-pointer"
          onClick={(e) => void chercher(e)}
          aria-hidden
        >
          {vocal.cretes.map((v, i) => {
            const h = Math.max(1.5, v * 22);
            const joue = i / vocal.cretes.length < position;
            return (
              <rect
                key={i}
                x={i * 2 + 0.35}
                y={12 - h / 2}
                width={1.3}
                height={h}
                rx={0.6}
                fill={joue ? "var(--color-brand)" : "var(--color-text-secondary)"}
                opacity={joue ? 1 : 0.5}
              />
            );
          })}
        </svg>
        <span className="font-sans text-[11px] text-text-muted tabular-nums w-10 text-right shrink-0">
          {minutesSecondes(vocal.dureeMs)}
        </span>
      </div>

      <div className="flex items-center gap-3 mt-1.5 font-sans text-[11px] text-text-secondary">
        <span className="tabular-nums">{heureDe(vocal.creeLe)}</span>
        {vocal.transcription ? (
          <button type="button" onClick={() => setTexteOuvert((o) => !o)} className="hover:text-ink transition-colors">
            {texteOuvert ? "Masquer le texte" : "Voir le texte"}
          </button>
        ) : (
          <span>sans transcription</span>
        )}
        {introuvable && <span className="text-accent-deep">fichier introuvable sur cet appareil</span>}
        <span className="ml-auto" />
        {confirmer ? (
          <>
            <button type="button" onClick={onSupprimer} className="text-accent-deep font-medium">
              Supprimer
            </button>
            <button type="button" onClick={() => setConfirmer(false)} className="hover:text-ink">
              Annuler
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setConfirmer(true)} className="hover:text-accent-deep transition-colors">
            Supprimer
          </button>
        )}
      </div>

      {texteOuvert && vocal.transcription && (
        <div className="mt-2 rounded bg-surface-secondary px-3 py-2">
          <p className="font-sans text-sm text-ink leading-relaxed">{vocal.transcription}</p>
          <button
            type="button"
            onClick={() => {
              onVersNote(vocal.transcription);
              setAjoute(true);
            }}
            disabled={ajoute}
            className="mt-1.5 font-sans text-xs text-brand hover:underline disabled:no-underline disabled:text-text-muted"
          >
            {ajoute ? "Ajouté à la note" : "Ajouter à la note"}
          </button>
        </div>
      )}
    </li>
  );
}
