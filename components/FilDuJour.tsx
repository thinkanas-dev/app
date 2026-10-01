"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import type { ModuleId } from "@/content/emploi-du-temps";
import { useSemaines } from "@/lib/semaines";
import { moduleMeta, JOURS_LONGS, MOIS_LONGS, majuscule } from "@/lib/programme";
import { horairesPriere } from "@/lib/horaires-priere";
import { cleJour } from "@/lib/rituel";
import {
  filAutourDe,
  positionDans,
  heureLisible,
  type Moment,
  type NatureMoment,
  type NomPriere,
} from "@/lib/fil-du-jour";
import { jouerSignature } from "@/lib/sons";
import { SceauDuJour } from "./SceauDuJour";

/*
 * Le fil du jour, en direct.
 *
 * Une seule scène : ce qui se passe maintenant, en grand, avec son compte à
 * rebours qui se vide. Quand le moment se termine, la scène se retourne sur le
 * suivant, prend sa couleur et joue sa signature sonore. Chaque nature de
 * moment a son identité : une prière se reconnaît à la place du soleil sur
 * l'horizon, un cours à la couleur de son module, le rituel à son sceau.
 *
 * Le titre de l'onglet porte le compte à rebours : on le suit même la page cachée.
 */

const CLE_SON = "think-anas-fil-son";

const COULEUR_PRIERE: Record<NomPriere, string> = {
  fajr: "#6d74c4",
  dhuhr: "#c98a00",
  asr: "#d97706",
  maghrib: "#e05a47",
  isha: "var(--color-isha)",
};

const COULEUR_NATURE: Record<NatureMoment, string> = {
  priere: "#c98a00",
  seance: "var(--color-brand)",
  rituel: "var(--color-ink)",
  hizb: "var(--color-hizb)",
  revision: "var(--color-brand)",
  formation: "var(--color-formation)",
  libre: "var(--color-neutre)",
  bilan: "var(--color-ink)",
  "a-confirmer": "var(--color-neutre)",
  pause: "var(--color-neutre)",
  repas: "#b45309",
  preparation: "var(--color-neutre-profond)",
  "temps-libre": "var(--color-neutre-profond)",
  nuit: "var(--color-ink-soft)",
};

const LIBELLE_NATURE: Record<NatureMoment, string> = {
  priere: "Prière",
  seance: "Cours",
  rituel: "Rituel",
  hizb: "Coran",
  revision: "Révision",
  formation: "Formation",
  libre: "Créneau libre",
  bilan: "Bilan",
  "a-confirmer": "À confirmer",
  pause: "Pause",
  repas: "Repas",
  preparation: "Préparation",
  "temps-libre": "Temps libre",
  nuit: "Nuit",
};

/** Les moments sans contenu propre restent pâles dans la rivière */
const NEUTRES = new Set<NatureMoment>(["pause", "repas", "preparation", "temps-libre", "nuit", "libre", "a-confirmer"]);

const INITIALES: Record<ModuleId, string> = {
  ia: "IA",
  datamining: "DM",
  sih: "SIH",
  python: "Py",
  bdd: "BD",
  web: "Web",
  eco: "Éco",
  anglais: "EN",
  francais: "FR",
};

const deux = (n: number) => String(n).padStart(2, "0");

function couleurDe(m: Moment): string {
  if (m.nature === "seance" && m.moduleId) return moduleMeta[m.moduleId].couleur;
  if (m.priere) return COULEUR_PRIERE[m.priere];
  return COULEUR_NATURE[m.nature];
}

function compteARebours(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${deux(m)}:${deux(sec)}` : `${deux(m)}:${deux(sec)}`;
}

function relatif(ms: number): string {
  const min = Math.round(ms / 60_000);
  if (min < 1) return "dans un instant";
  if (min < 60) return `dans ${min} min`;
  const h = Math.floor(min / 60);
  const r = min % 60;
  return r > 0 ? `dans ${h} h ${deux(r)}` : `dans ${h} h`;
}

const heureDe = (t: number) => {
  const d = new Date(t);
  return heureLisible(d.getHours() * 60 + d.getMinutes());
};

/** La prière se lit à la place du soleil : sous l'horizon à Fajr, au zénith à Dhuhr… */
function SoleilDePriere({ priere, couleur, idClip }: { priere: NomPriere; couleur: string; idClip: string }) {
  const clip = `ciel-${idClip}`;
  const horizon = <path d="M8 44h48" stroke={couleur} strokeWidth={2.4} strokeLinecap="round" />;
  const sol = (
    <path d="M14 51h8M28 51h12M46 51h4" stroke={couleur} strokeOpacity={0.4} strokeWidth={1.8} strokeLinecap="round" />
  );
  const decoupe = (
    <defs>
      <clipPath id={clip}>
        <rect x="0" y="0" width="64" height="44" />
      </clipPath>
    </defs>
  );

  if (priere === "fajr") {
    return (
      <>
        {decoupe}
        <circle cx="32" cy="50" r="17" fill={couleur} fillOpacity={0.14} clipPath={`url(#${clip})`} />
        <circle cx="32" cy="50" r="10" fill={couleur} fillOpacity={0.4} clipPath={`url(#${clip})`} />
        {horizon}
        {sol}
        <path
          d="M32 18v6M19 24l3.5 3.5M45 24l-3.5 3.5"
          stroke={couleur}
          strokeOpacity={0.55}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </>
    );
  }
  if (priere === "dhuhr") {
    return (
      <>
        <circle cx="32" cy="20" r="8" fill={couleur} />
        <path
          d="M32 5v4M32 31v4M17 20h4M43 20h4M21.4 9.4l2.8 2.8M39.8 27.8l2.8 2.8M42.6 9.4l-2.8 2.8M24.2 27.8l-2.8 2.8"
          stroke={couleur}
          strokeWidth={2}
          strokeLinecap="round"
        />
        {horizon}
        {sol}
      </>
    );
  }
  if (priere === "asr") {
    return (
      <>
        <circle cx="47" cy="22" r="7" fill={couleur} />
        <path d="M22 44V30" stroke={couleur} strokeWidth={2.6} strokeLinecap="round" />
        {/* L'ombre s'allonge : c'est l'heure de Asr */}
        <path d="M22 44H8" stroke={couleur} strokeOpacity={0.45} strokeWidth={3.2} strokeLinecap="round" />
        {horizon}
      </>
    );
  }
  if (priere === "maghrib") {
    return (
      <>
        {decoupe}
        <circle cx="32" cy="44" r="18" fill={couleur} fillOpacity={0.14} clipPath={`url(#${clip})`} />
        <circle cx="32" cy="44" r="11" fill={couleur} clipPath={`url(#${clip})`} />
        {horizon}
        <path d="M22 50h20M26 55h12" stroke={couleur} strokeOpacity={0.45} strokeWidth={2} strokeLinecap="round" />
      </>
    );
  }
  return (
    <>
      <path d="M38 12a17 17 0 1 0 12 27A14 14 0 0 1 38 12z" fill={couleur} fillOpacity={0.85} />
      <path d="M16 14v6M13 17h6M50 46v4M48 48h4" stroke={couleur} strokeWidth={1.8} strokeLinecap="round" />
      <path d="M8 56h48" stroke={couleur} strokeOpacity={0.3} strokeWidth={2} strokeLinecap="round" />
    </>
  );
}

function GlyphePriere({ priere, couleur, taille }: { priere: NomPriere; couleur: string; taille: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={taille} height={taille} viewBox="0 0 64 64" aria-hidden className="shrink-0">
      <SoleilDePriere priere={priere} couleur={couleur} idClip={id} />
    </svg>
  );
}

/** Chaque nature de moment a son propre dessin */
function Glyphe({ moment, couleur, taille }: { moment: Moment; couleur: string; taille: number }) {
  const id = useId().replace(/:/g, "");

  if (moment.nature === "rituel") {
    const d = new Date(moment.debut);
    return (
      <SceauDuJour jour={d.getDate()} mois={MOIS_LONGS[d.getMonth()]} annee={d.getFullYear()} couleur={couleur} taille={taille} />
    );
  }

  const trait = {
    stroke: couleur,
    strokeWidth: 2.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  const aplat = { fill: couleur, fillOpacity: 0.16 };
  const vapeur = { stroke: couleur, strokeWidth: 1.8, strokeLinecap: "round" as const, fill: "none", strokeOpacity: 0.6 };

  let dessin: ReactNode;
  switch (moment.nature) {
    case "priere":
      dessin = <SoleilDePriere priere={moment.priere ?? "dhuhr"} couleur={couleur} idClip={id} />;
      break;
    case "seance": {
      const initiales = moment.moduleId ? INITIALES[moment.moduleId] : "?";
      dessin = (
        <>
          <rect x="9" y="9" width="46" height="46" rx="13" {...aplat} />
          <rect x="9" y="9" width="46" height="46" rx="13" {...trait} />
          <text
            x="32"
            y="38.5"
            textAnchor="middle"
            fontSize={initiales.length > 2 ? 14 : 18}
            fontWeight={700}
            fill={couleur}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {initiales}
          </text>
        </>
      );
      break;
    }
    case "hizb":
      dessin = (
        <>
          <path d="M32 18c-6-4-14-5-20-3v30c6-2 14-1 20 3 6-4 14-5 20-3V15c-6-2-14-1-20 3z" {...aplat} />
          <path d="M32 18c-6-4-14-5-20-3v30c6-2 14-1 20 3 6-4 14-5 20-3V15c-6-2-14-1-20 3zM32 18v30" {...trait} />
          <path d="M17 24h9M17 30h9M38 24h9M38 30h9" {...trait} strokeWidth={1.6} strokeOpacity={0.6} />
        </>
      );
      break;
    case "revision":
      dessin = (
        <>
          <circle cx="32" cy="32" r="20" {...aplat} />
          <path d="M46 26a15 15 0 0 0-27-5M19 13v8h8M18 38a15 15 0 0 0 27 5M45 51v-8h-8" {...trait} />
        </>
      );
      break;
    case "formation":
      dessin = (
        <>
          <rect x="10" y="13" width="44" height="30" rx="6" {...aplat} />
          <rect x="10" y="13" width="44" height="30" rx="6" {...trait} />
          <path d="M28 22l10 6-10 6z" fill={couleur} />
          <path d="M24 52h16M32 43v9" {...trait} />
        </>
      );
      break;
    case "bilan":
      dessin = (
        <>
          <rect x="14" y="9" width="36" height="46" rx="6" {...aplat} />
          <rect x="14" y="9" width="36" height="46" rx="6" {...trait} />
          <path d="M21 23l3 3 5-6M33 23h10M21 35l3 3 5-6M33 35h10M21 46h22" {...trait} />
        </>
      );
      break;
    case "pause":
      dessin = (
        <>
          <path d="M14 28h26v10a13 13 0 0 1-26 0z" {...aplat} />
          <path d="M14 28h26v10a13 13 0 0 1-26 0zM40 31h4a5 5 0 0 1 0 10h-4" {...trait} />
          <path d="M22 14c-2 3 2 5 0 8M30 14c-2 3 2 5 0 8" {...vapeur} />
        </>
      );
      break;
    case "repas":
      dessin = (
        <>
          <path d="M11 32h42a21 21 0 0 1-42 0z" {...aplat} />
          <path d="M11 32h42a21 21 0 0 1-42 0zM25 53h14" {...trait} />
          <path d="M24 13c-2 3 2 5 0 8M32 11c-2 3 2 5 0 8M40 13c-2 3 2 5 0 8" {...vapeur} />
        </>
      );
      break;
    case "preparation":
      dessin = (
        <>
          <rect x="13" y="22" width="38" height="31" rx="7" {...aplat} />
          <rect x="13" y="22" width="38" height="31" rx="7" {...trait} />
          <path d="M25 22v-4a7 7 0 0 1 14 0v4M13 35h38" {...trait} />
        </>
      );
      break;
    case "temps-libre":
      dessin = (
        <>
          <path d="M20 12h24M20 52h24M22 12c0 12 20 14 20 20s-20 8-20 20M42 12c0 12-20 14-20 20s20 8 20 20" {...trait} />
          <path d="M26 48c2-5 10-5 12 0z" fill={couleur} fillOpacity={0.5} />
        </>
      );
      break;
    case "nuit":
      dessin = (
        <>
          <path d="M40 12a20 20 0 1 0 12 30A16 16 0 0 1 40 12z" {...aplat} />
          <path d="M40 12a20 20 0 1 0 12 30A16 16 0 0 1 40 12z" {...trait} />
          <path d="M15 15v6M12 18h6M20 45v4M18 47h4" {...trait} strokeWidth={1.6} />
        </>
      );
      break;
    default:
      dessin = (
        <>
          <rect x="12" y="12" width="40" height="40" rx="10" {...trait} strokeDasharray="4 4" />
          <path d="M20 44L44 20M28 48L48 28M16 36L36 16" stroke={couleur} strokeOpacity={0.45} strokeWidth={1.8} strokeLinecap="round" />
        </>
      );
  }

  return (
    <svg width={taille} height={taille} viewBox="0 0 64 64" aria-hidden className="shrink-0">
      {dessin}
    </svg>
  );
}

/** Le compte à rebours : l'anneau se vide à mesure que le moment s'écoule */
function Anneau({
  fraction,
  couleur,
  taille,
  children,
}: {
  fraction: number;
  couleur: string;
  taille: number;
  children: ReactNode;
}) {
  const r = 44;
  const circonference = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0 mx-auto sm:mx-0" style={{ width: taille, height: taille }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-hairline)" strokeWidth={6} />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={couleur}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circonference}
          strokeDashoffset={circonference * (1 - fraction)}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

function BoutonOutil({
  actif,
  onClick,
  label,
  children,
}: {
  actif: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      title={label}
      className={`inline-flex items-center gap-1.5 h-8 rounded-md border px-2.5 font-sans text-xs transition-colors ${
        actif
          ? "border-ink bg-ink text-canvas"
          : "border-hairline text-text-muted hover:text-ink hover:border-text-secondary"
      }`}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

const iconeProps = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function FilDuJour() {
  const semaines = useSemaines();
  const [maintenant, setMaintenant] = useState<Date | null>(null);
  const [son, setSon] = useState(false);
  const [ecranVoulu, setEcranVoulu] = useState(false);
  const [peutGarderEcran, setPeutGarderEcran] = useState(false);
  const [pleinEcran, setPleinEcran] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const verrouRef = useRef<WakeLockSentinel | null>(null);
  const precedentRef = useRef<string | null>(null);
  const alertesVuesRef = useRef<Set<string>>(new Set());
  const titreOriginalRef = useRef<string | null>(null);

  // L'heure et les capacités du navigateur ne se lisent qu'après le montage
  useEffect(() => {
    setMaintenant(new Date());
    setPeutGarderEcran("wakeLock" in navigator);
    try {
      setSon(window.localStorage.getItem(CLE_SON) === "1");
    } catch {
      // stockage indisponible : le son reste coupé
    }
    const minuterie = window.setInterval(() => setMaintenant(new Date()), 1000);
    return () => window.clearInterval(minuterie);
  }, []);

  const cleDuJour = maintenant ? cleJour(maintenant) : null;

  // Le fil ne se reconstruit qu'au changement de jour, pas à chaque seconde
  const fil = useMemo(() => {
    if (!cleDuJour) return null;
    const [a, m, j] = cleDuJour.split("-").map(Number);
    return filAutourDe(new Date(a, m - 1, j, 12), {
      jourDe: (date) => {
        const cle = cleJour(date);
        for (const s of semaines) {
          const jour = s.jours.find((x) => x.date === cle);
          if (jour) return jour;
        }
        return null;
      },
      prieresDe: horairesPriere,
      nomModule: (id) => moduleMeta[id].court,
    });
  }, [cleDuJour, semaines]);

  const position = fil && maintenant ? positionDans(fil, maintenant) : null;
  const courant = position?.courant ?? null;
  const alertes = position?.alertes ?? [];

  // Un navigateur n'autorise le son qu'après un geste : on l'arme au premier clic
  useEffect(() => {
    if (!son || audioRef.current) return;
    const deverrouiller = () => {
      audioRef.current = new AudioContext();
    };
    window.addEventListener("pointerdown", deverrouiller, { once: true });
    return () => window.removeEventListener("pointerdown", deverrouiller);
  }, [son]);

  // Le passage d'un moment au suivant : signature sonore, et notification si la page est cachée
  const idCourant = courant?.id ?? null;
  const natureCourante = courant?.nature ?? null;
  const titreCourant = courant?.titre ?? "";
  const consigneCourante = courant?.consigne ?? "";
  useEffect(() => {
    if (!idCourant || !natureCourante) return;
    const precedent = precedentRef.current;
    precedentRef.current = idCourant;
    if (precedent === null || precedent === idCourant) return;

    if (son && audioRef.current) jouerSignature(audioRef.current, natureCourante);
    if (document.hidden && "Notification" in window && Notification.permission === "granted") {
      new Notification(titreCourant, { body: consigneCourante, tag: "fil-du-jour" });
    }
  }, [idCourant, natureCourante, titreCourant, consigneCourante, son]);

  // Une prière qui entre pendant un cours sonne une fois, à son heure
  useEffect(() => {
    if (!maintenant) return;
    for (const a of alertes) {
      if (alertesVuesRef.current.has(a.id)) continue;
      alertesVuesRef.current.add(a.id);
      // Déjà entrée au moment où la page s'ouvre : on l'affiche sans la faire sonner
      if (maintenant.getTime() - a.instant < 5_000 && son && audioRef.current) {
        jouerSignature(audioRef.current, "priere");
      }
    }
  }, [alertes, maintenant, son]);

  // Le compte à rebours dans le titre de l'onglet, rendu intact en quittant la page
  useEffect(() => {
    titreOriginalRef.current = document.title;
    return () => {
      if (titreOriginalRef.current !== null) document.title = titreOriginalRef.current;
    };
  }, []);
  useEffect(() => {
    if (!courant || !maintenant) return;
    const nom = courant.nature === "seance" && courant.moduleId ? moduleMeta[courant.moduleId].court : courant.titre;
    document.title = `${compteARebours(courant.fin - maintenant.getTime())} · ${nom}`;
  }, [courant, maintenant]);

  // Garder l'écran allumé : le verrou saute quand l'onglet est caché, on le reprend au retour
  async function demanderVerrou() {
    try {
      const verrou = await navigator.wakeLock.request("screen");
      verrouRef.current = verrou;
      verrou.addEventListener("release", () => {
        verrouRef.current = null;
      });
    } catch {
      // refusé (économie d'énergie, onglet caché) : nouvel essai au retour sur la page
    }
  }

  async function basculerEcran() {
    if (ecranVoulu) {
      setEcranVoulu(false);
      await verrouRef.current?.release();
      verrouRef.current = null;
      return;
    }
    setEcranVoulu(true);
    await demanderVerrou();
  }

  useEffect(() => {
    if (!ecranVoulu) return;
    const auRetour = () => {
      if (document.visibilityState === "visible" && !verrouRef.current) void demanderVerrou();
    };
    document.addEventListener("visibilitychange", auRetour);
    return () => document.removeEventListener("visibilitychange", auRetour);
  }, [ecranVoulu]);

  useEffect(
    () => () => {
      void verrouRef.current?.release();
    },
    []
  );

  useEffect(() => {
    const suivre = () => setPleinEcran(document.fullscreenElement === sectionRef.current);
    document.addEventListener("fullscreenchange", suivre);
    return () => document.removeEventListener("fullscreenchange", suivre);
  }, []);

  function basculerPleinEcran() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void sectionRef.current?.requestFullscreen();
  }

  function basculerSon() {
    const suivant = !son;
    setSon(suivant);
    try {
      window.localStorage.setItem(CLE_SON, suivant ? "1" : "0");
    } catch {
      // préférence non mémorisée
    }
    if (!suivant) return;
    if (!audioRef.current) audioRef.current = new AudioContext();
    void audioRef.current.resume();
    if (courant) jouerSignature(audioRef.current, courant.nature);
  }

  if (!maintenant || !fil || !position || !courant) {
    return <section aria-label="Le fil du jour" className="rounded-lg border border-hairline bg-canvas min-h-[360px]" />;
  }

  const t = maintenant.getTime();
  const couleur = couleurDe(courant);
  const reste = courant.fin - t;
  const fraction = Math.max(0, Math.min(1, reste / (courant.fin - courant.debut)));
  // Les pauses de quelques minutes ne méritent pas une place dans « Ensuite »
  const suivants = position.suivants.filter((m) => m.fin - m.debut >= 6 * 60_000).slice(0, 4);

  const baseJour = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate()).getTime();
  const debutFenetre = baseJour + 5 * 3_600_000;
  const finFenetre = baseJour + (23 * 60 + 30) * 60_000;
  const largeurFenetre = finFenetre - debutFenetre;
  const riviere = fil.moments.filter((m) => m.fin > debutFenetre && m.debut < finFenetre);
  const curseur = ((t - debutFenetre) / largeurFenetre) * 100;

  return (
    <section
      ref={sectionRef}
      aria-label="Le fil du jour"
      className={`rounded-lg border border-hairline bg-canvas overflow-hidden ${
        pleinEcran ? "flex flex-col justify-center overflow-y-auto" : ""
      }`}
    >
      <div className={pleinEcran ? "w-full max-w-5xl mx-auto" : ""}>
        {/* En-tête */}
        <div className="flex items-center justify-between gap-3 flex-wrap px-5 sm:px-7 py-3 border-b border-hairline">
          <div className="min-w-0">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
              Le fil du jour
            </p>
            <p className="font-sans text-sm text-ink">
              {majuscule(JOURS_LONGS[maintenant.getDay()])} {maintenant.getDate()} {MOIS_LONGS[maintenant.getMonth()]}
              <span className="text-text-muted tabular-nums">
                {" "}
                · {deux(maintenant.getHours())}:{deux(maintenant.getMinutes())}:{deux(maintenant.getSeconds())}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <BoutonOutil actif={son} onClick={basculerSon} label={son ? "Son activé" : "Son coupé"}>
              <svg {...iconeProps}>
                <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" fillOpacity={0.25} />
                {son ? <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /> : <path d="M17 9l5 6M22 9l-5 6" />}
              </svg>
            </BoutonOutil>
            {peutGarderEcran && (
              <BoutonOutil actif={ecranVoulu} onClick={basculerEcran} label="Écran allumé">
                <svg {...iconeProps}>
                  <rect x="3" y="4" width="18" height="12" rx="2" fill="currentColor" fillOpacity={0.2} />
                  <path d="M9 20h6M12 16v4" />
                </svg>
              </BoutonOutil>
            )}
            <BoutonOutil actif={pleinEcran} onClick={basculerPleinEcran} label={pleinEcran ? "Quitter" : "Plein écran"}>
              <svg {...iconeProps}>
                <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
              </svg>
            </BoutonOutil>
          </div>
        </div>

        {/* La scène : elle se retourne à chaque changement de moment */}
        <div
          key={courant.id}
          className="relative overflow-hidden animate-fade-in-up"
          style={{ background: `color-mix(in srgb, ${couleur} 6%, var(--color-canvas))` }}
        >
          <span aria-hidden className="absolute inset-0 pointer-events-none animate-lavis" style={{ background: couleur }} />

          <div
            className={`relative grid items-center gap-5 px-5 sm:px-7 sm:grid-cols-[auto_minmax(0,1fr)_auto] ${
              pleinEcran ? "py-14" : "py-6"
            }`}
          >
            <Glyphe moment={courant} couleur={couleur} taille={pleinEcran ? 124 : 80} />

            <div className="min-w-0">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-wide" style={{ color: couleur }}>
                {courant.nature === "priere" ? "C'est l'heure" : "En cours"} · {LIBELLE_NATURE[courant.nature]}
              </p>
              <h2
                className={`font-serif leading-tight text-ink mt-1 line-clamp-2 ${
                  pleinEcran ? "text-5xl" : "text-2xl sm:text-[32px]"
                }`}
              >
                {courant.titre}
              </h2>
              {courant.detail && <p className="font-sans text-sm text-text-muted mt-1.5">{courant.detail}</p>}
              <p className="flex gap-2.5 font-sans text-sm text-ink mt-3 leading-snug">
                <span className="w-[3px] rounded-full shrink-0" style={{ background: couleur }} aria-hidden />
                {courant.consigne}
              </p>
            </div>

            <Anneau fraction={fraction} couleur={couleur} taille={pleinEcran ? 260 : 156}>
              <span
                className="font-sans font-semibold tabular-nums text-ink leading-none"
                style={{ fontSize: pleinEcran ? 54 : 30 }}
              >
                {compteARebours(reste)}
              </span>
              <span className="font-sans text-[11px] text-text-muted mt-1.5">jusqu&apos;à {heureDe(courant.fin)}</span>
            </Anneau>
          </div>

          {alertes.map((a) => {
            const c = COULEUR_PRIERE[a.priere];
            return (
              <div
                key={a.id}
                role="status"
                className="relative mx-5 sm:mx-7 mb-5 flex items-center gap-3 rounded-md border px-3 py-2.5"
                style={{ borderColor: c, background: `color-mix(in srgb, ${c} 9%, var(--color-canvas))` }}
              >
                <GlyphePriere priere={a.priere} couleur={c} taille={34} />
                <div className="min-w-0">
                  <p className="font-sans text-sm font-medium text-ink">{a.titre}</p>
                  <p className="font-sans text-xs text-text-muted">{a.consigne}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ensuite */}
        <div className="border-t border-hairline px-5 sm:px-7 py-4">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary">Ensuite</p>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
            {suivants.map((m) => {
              const c = couleurDe(m);
              const demain = cleJour(new Date(m.debut)) !== cleDuJour;
              return (
                <li key={m.id} className="flex items-center gap-2.5 rounded-md border border-hairline px-2.5 py-2 min-w-0">
                  <Glyphe moment={m} couleur={c} taille={30} />
                  <div className="min-w-0">
                    <p className="font-sans text-xs font-medium text-ink truncate">{m.titre}</p>
                    <p className="font-sans text-[11px] text-text-muted tabular-nums truncate">
                      {demain ? "demain · " : ""}
                      {heureDe(m.debut)} · {relatif(m.debut - t)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* La rivière du jour, de 5 h à 23 h 30 */}
        <div className="px-5 sm:px-7 pb-5">
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
              La rivière du jour
            </p>
            <p className="font-sans text-[11px] text-text-muted tabular-nums">
              {Math.round(Math.max(0, Math.min(100, curseur)))} % de la journée
            </p>
          </div>
          <div className="relative h-6 rounded-md overflow-hidden bg-surface-secondary">
            {riviere.map((m) => {
              const d = Math.max(m.debut, debutFenetre);
              const f = Math.min(m.fin, finFenetre);
              const c = couleurDe(m);
              return (
                <div
                  key={m.id}
                  title={`${m.titre} · ${heureDe(m.debut)} – ${heureDe(m.fin)}`}
                  className="absolute inset-y-0 border-r border-canvas/70"
                  style={{
                    left: `${((d - debutFenetre) / largeurFenetre) * 100}%`,
                    width: `${((f - d) / largeurFenetre) * 100}%`,
                    background: NEUTRES.has(m.nature) ? `color-mix(in srgb, ${c} 20%, var(--color-canvas))` : c,
                    opacity: m.fin <= t ? 0.4 : 1,
                    boxShadow: m.id === courant.id ? "inset 0 0 0 2px var(--color-ink)" : undefined,
                  }}
                />
              );
            })}
            {curseur >= 0 && curseur <= 100 && (
              <div className="absolute -inset-y-0.5 w-[2px] bg-accent-deep" style={{ left: `${curseur}%` }} aria-hidden />
            )}
          </div>
          <div className="relative h-4 mt-1" aria-hidden>
            {[6, 9, 12, 15, 18, 21].map((hh) => (
              <span
                key={hh}
                className="absolute -translate-x-1/2 font-sans text-[10px] text-text-secondary tabular-nums"
                style={{ left: `${((hh * 60 - 5 * 60) / (18.5 * 60)) * 100}%` }}
              >
                {hh} h
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
