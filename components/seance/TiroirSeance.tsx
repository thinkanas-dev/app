"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  useObjectifsState,
  carnetVide,
  type CarnetSeance,
  type FicheSeanceIA,
  type QuestionProf,
} from "@/lib/objectifs-store";
import {
  moduleMeta,
  formatHeure,
  enMinutes,
  libelleJour,
  etatSeance,
  majuscule,
  JOURS_COURTS,
  MOIS_COURTS,
  type SeanceDatee,
} from "@/lib/programme";
import { nouvelId, supprimerMedia } from "@/lib/medias-seances";
import { useDictee } from "@/lib/dictee";
import { IconClose } from "@/components/icons";
import { COMPREHENSION, Glyphe, OUTILS, comptesCarnet, type OutilSeance } from "./outils";
import { EnregistreurVocal } from "./EnregistreurVocal";
import { GaleriePhotos } from "./GaleriePhotos";

/*
 * Le carnet de séance.
 *
 * Un tiroir qui glisse depuis la droite et réunit tout ce qu'on garde d'un
 * cours : la note, les vocaux transcrits, les photos du tableau, les questions
 * pour le prof — celles qu'on n'a pas posées reviennent à la séance suivante
 * du même module —, le degré de compréhension, et la fiche de révision que
 * l'IA tire de ces traces.
 */

const heureDe = (iso: string) => {
  const d = new Date(iso);
  return `${d.getHours()} h ${String(d.getMinutes()).padStart(2, "0")}`;
};

const dateCourte = (cle: string) => {
  const [a, m, j] = cle.split("-").map(Number);
  const d = new Date(a, m - 1, j);
  return `${majuscule(JOURS_COURTS[d.getDay()])} ${j} ${MOIS_COURTS[m - 1]}`;
};

const compterMots = (texte: string) => (texte.trim() ? texte.trim().split(/\s+/).length : 0);

export function TiroirSeance({
  item,
  outil,
  onOutil,
  onFermer,
  maintenant,
}: {
  item: SeanceDatee;
  outil: OutilSeance;
  onOutil: (outil: OutilSeance) => void;
  onFermer: () => void;
  maintenant: Date | null;
}) {
  const { state, hydrated, modifierCarnetSeance, basculerSeanceRevisee } = useObjectifsState();
  const s = item.seance;
  const meta = moduleMeta[s.moduleId];
  const base = { moduleId: s.moduleId, date: item.jour.date };
  const carnet = (hydrated && state.carnetsSeances[s.id]) || carnetVide(base);
  const modifier = (f: (c: CarnetSeance) => CarnetSeance) => modifierCarnetSeance(s.id, base, f);
  const comptes = comptesCarnet(carnet);
  const etat = etatSeance(item, maintenant);
  const revisee = hydrated && state.seancesRevisees.includes(s.id);

  const panneau = useRef<HTMLDivElement>(null);
  const fermer = useRef(onFermer);

  useEffect(() => {
    fermer.current = onFermer;
  });

  // Ouverture : focus dans le tiroir, Échap pour fermer, la page derrière ne défile plus
  useEffect(() => {
    panneau.current?.focus();
    const echap = (e: KeyboardEvent) => {
      if (e.key === "Escape") fermer.current();
    };
    document.addEventListener("keydown", echap);
    const debordement = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", echap);
      document.body.style.overflow = debordement;
    };
  }, []);

  const contenu = {
    note: <OngletNote note={carnet.note} onChange={(note) => modifier((c) => ({ ...c, note }))} />,
    vocal: (
      <EnregistreurVocal
        vocaux={carnet.vocaux}
        onAjouter={(v) => modifier((c) => ({ ...c, vocaux: [v, ...c.vocaux] }))}
        onSupprimer={(id) => {
          void supprimerMedia(id).catch(() => undefined);
          modifier((c) => ({ ...c, vocaux: c.vocaux.filter((v) => v.id !== id) }));
        }}
        onVersNote={(texte) => modifier((c) => ({ ...c, note: c.note.trim() ? `${c.note.trimEnd()}\n\n${texte}` : texte }))}
      />
    ),
    photos: (
      <GaleriePhotos
        photos={carnet.photos}
        onAjouter={(p) => modifier((c) => ({ ...c, photos: [...c.photos, p] }))}
        onSupprimer={(id) => {
          void supprimerMedia(id).catch(() => undefined);
          modifier((c) => ({ ...c, photos: c.photos.filter((p) => p.id !== id) }));
        }}
      />
    ),
    questions: (
      <OngletQuestions
        seanceId={s.id}
        carnet={carnet}
        carnets={hydrated ? state.carnetsSeances : {}}
        nomModule={meta.court}
        modifier={modifier}
        modifierAutre={(id, autre, f) => modifierCarnetSeance(id, { moduleId: autre.moduleId, date: autre.date }, f)}
      />
    ),
    fiche: (
      <OngletFiche
        carnet={carnet}
        titre={s.intitule}
        module={meta.nom}
        onFiche={(fiche) => modifier((c) => ({ ...c, fiche }))}
        onOutil={onOutil}
      />
    ),
  }[outil];

  return createPortal(
    <div className="fixed inset-0 z-[70]">
      <style>{`
        @keyframes tiroir-entree { from { transform: translateX(28px); opacity: 0 } to { transform: none; opacity: 1 } }
        @keyframes tiroir-voile { from { opacity: 0 } to { opacity: 1 } }
        @media (prefers-reduced-motion: reduce) { .tiroir-anim { animation: none !important } }
      `}</style>
      <div
        className="tiroir-anim absolute inset-0 bg-[rgba(8,10,20,0.32)]"
        style={{ animation: "tiroir-voile 0.2s ease-out" }}
        onClick={onFermer}
        aria-hidden
      />
      <div
        ref={panneau}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Carnet de séance : ${s.intitule}`}
        className="tiroir-anim absolute right-0 top-0 h-full w-[min(460px,100vw)] bg-canvas border-l border-hairline shadow-[-24px_0_60px_-30px_rgba(15,23,42,0.45)] flex flex-col outline-none"
        style={{ animation: "tiroir-entree 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)" }}
      >
        {/* En-tête */}
        <div className="px-5 pt-4 pb-3 border-b border-hairline">
          <div className="flex items-start gap-3">
            <span className="w-1 self-stretch rounded-full shrink-0" style={{ background: meta.couleur }} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                Carnet de séance · {meta.court} · {s.numero}/{s.total}
              </p>
              <h2 className="font-serif text-lg text-ink leading-snug mt-0.5">{s.intitule}</h2>
              <p className="font-sans text-xs text-text-muted mt-1">
                {majuscule(libelleJour(item.jour, "long"))} · {formatHeure(enMinutes(s.debut))} – {formatHeure(enMinutes(s.fin))} ·{" "}
                {s.prof} · salle {s.salle}
              </p>
            </div>
            <button
              type="button"
              onClick={onFermer}
              aria-label="Fermer le carnet"
              className="h-8 w-8 rounded-md text-text-muted hover:text-ink hover:bg-surface-secondary flex items-center justify-center shrink-0 transition-colors"
            >
              <IconClose width={16} height={16} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            <span className="font-sans text-[11px] text-text-secondary mr-1 inline-flex items-center gap-1">
              <Glyphe outil="comprehension" taille={13} />
              Compris ?
            </span>
            {COMPREHENSION.map((c) => {
              const actif = carnet.comprehension === c.cle;
              return (
                <button
                  key={c.cle}
                  type="button"
                  aria-pressed={actif}
                  onClick={() => modifier((x) => ({ ...x, comprehension: actif ? null : c.cle }))}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-sans text-xs transition-colors ${
                    actif ? "border-transparent text-ink" : "border-hairline text-text-muted hover:text-ink"
                  }`}
                  style={
                    actif
                      ? { background: `color-mix(in srgb, ${c.couleur} 20%, var(--color-canvas))`, boxShadow: `inset 0 0 0 1.5px ${c.couleur}` }
                      : undefined
                  }
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.couleur }} aria-hidden />
                  {c.nom}
                </button>
              );
            })}
          </div>
        </div>

        {/* Onglets */}
        <div role="tablist" aria-label="Outils de la séance" className="flex gap-0.5 px-3 border-b border-hairline overflow-x-auto no-scrollbar">
          {OUTILS.map((o) => {
            const actif = o.cle === outil;
            const compte = comptes[o.cle];
            return (
              <button
                key={o.cle}
                type="button"
                role="tab"
                aria-selected={actif}
                onClick={() => onOutil(o.cle)}
                className={`relative inline-flex items-center gap-1.5 px-2.5 pt-2.5 pb-2.5 font-sans text-[13px] whitespace-nowrap transition-colors ${
                  actif ? "text-ink" : "text-text-muted hover:text-ink"
                }`}
              >
                <Glyphe outil={o.cle} taille={14} />
                {o.nom}
                {compte > 0 &&
                  (o.cle === "note" || o.cle === "fiche" ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-label="rempli" />
                  ) : (
                    <span className="rounded-full bg-surface-secondary px-1.5 font-sans text-[10px] tabular-nums text-text-muted">
                      {compte}
                    </span>
                  ))}
                {actif && <span className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-brand" aria-hidden />}
              </button>
            );
          })}
        </div>

        <div role="tabpanel" className="flex-1 overflow-y-auto px-5 py-4">
          {contenu}
        </div>

        {/* Pied */}
        <div className="px-5 py-3 border-t border-hairline flex items-center justify-between gap-3">
          <span className="font-sans text-[11px] text-text-secondary tabular-nums">
            {carnet.majLe ? `Modifié à ${heureDe(carnet.majLe)}` : "Rien de noté pour l’instant"}
          </span>
          {etat === "passee" ? (
            <button
              type="button"
              onClick={() => basculerSeanceRevisee(s.id)}
              aria-pressed={revisee}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-sans text-xs transition-colors ${
                revisee ? "border-transparent text-canvas" : "border-hairline text-text-muted hover:text-ink hover:border-text-secondary"
              }`}
              style={revisee ? { background: meta.couleur } : undefined}
            >
              <Glyphe outil="revisee" taille={13} />
              {revisee ? "Révisée à chaud" : "Marquer révisée à chaud"}
            </button>
          ) : (
            <span
              className={`font-sans text-[11px] font-medium rounded px-1.5 py-0.5 ${
                etat === "en-cours" ? "bg-accent-coral text-accent-deep" : "bg-brand-soft text-brand"
              }`}
            >
              {etat === "en-cours" ? "En cours" : "À venir"}
            </span>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ——— Note ———

const REPERES = ["À retenir", "Définition", "Formule", "Exemple", "Doute"];

// Un seul onglet est monté à la fois : la note relit toujours la dernière version en s'ouvrant
function OngletNote({ note, onChange }: { note: string; onChange: (note: string) => void }) {
  const [texte, setTexte] = useState(note);
  const zone = useRef<HTMLTextAreaElement>(null);
  const texteRef = useRef(note);
  const minuterie = useRef<number | null>(null);
  const enAttente = useRef<string | null>(null);
  const rappel = useRef(onChange);

  useEffect(() => {
    rappel.current = onChange;
  });

  const enregistrer = useCallback(() => {
    if (minuterie.current) window.clearTimeout(minuterie.current);
    minuterie.current = null;
    if (enAttente.current !== null) {
      rappel.current(enAttente.current);
      enAttente.current = null;
    }
  }, []);

  useEffect(() => enregistrer, [enregistrer]);

  function ecrire(valeur: string) {
    setTexte(valeur);
    texteRef.current = valeur;
    enAttente.current = valeur;
    if (minuterie.current) window.clearTimeout(minuterie.current);
    minuterie.current = window.setTimeout(enregistrer, 400);
  }

  function inserer(repere: string) {
    const el = zone.current;
    const actuel = texteRef.current;
    const debut = el?.selectionStart ?? actuel.length;
    const avant = actuel.slice(0, debut);
    const apres = actuel.slice(el?.selectionEnd ?? debut);
    const ajout = `${avant && !avant.endsWith("\n") ? "\n" : ""}${repere} : `;
    ecrire(avant + ajout + apres);
    requestAnimationFrame(() => {
      el?.focus();
      const position = (avant + ajout).length;
      el?.setSelectionRange(position, position);
    });
  }

  const dictee = useDictee((phrase) => {
    const actuel = texteRef.current;
    ecrire(actuel.trim() ? `${actuel.trimEnd()} ${phrase}.` : `${phrase}.`);
  });

  const mots = compterMots(texte);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5 flex-wrap">
        {REPERES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => inserer(r)}
            className="rounded-md border border-hairline px-2 py-0.5 font-sans text-xs text-text-muted hover:text-ink hover:border-text-secondary transition-colors"
          >
            {r}
          </button>
        ))}
        <button
          type="button"
          onClick={() => (dictee.actif ? dictee.arreter() : dictee.demarrer())}
          disabled={!dictee.disponible}
          title={dictee.disponible ? undefined : "La dictée n’est pas disponible dans ce navigateur"}
          aria-pressed={dictee.actif}
          className={`ml-auto inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-sans text-xs font-medium transition-colors disabled:opacity-40 ${
            dictee.actif ? "bg-accent-deep text-canvas" : "bg-surface-secondary text-ink hover:bg-surface-secondary-hover"
          }`}
        >
          {dictee.actif ? <span className="h-1.5 w-1.5 rounded-full bg-canvas animate-pulse" aria-hidden /> : <Glyphe outil="vocal" taille={13} />}
          {dictee.actif ? "Arrêter la dictée" : "Dicter"}
        </button>
      </div>

      <textarea
        ref={zone}
        value={texte}
        onChange={(e) => ecrire(e.target.value)}
        onBlur={enregistrer}
        placeholder="Ce qu’il faut retenir : les définitions, les formules, les exemples donnés en cours…"
        className="min-h-[300px] w-full resize-y rounded-md border border-hairline bg-canvas px-3 py-2.5 font-sans text-sm leading-relaxed text-ink placeholder:text-text-secondary focus:outline-none focus:border-text-secondary"
      />

      {dictee.actif && dictee.provisoire && <p className="font-sans text-xs italic text-text-muted">{dictee.provisoire}</p>}
      {dictee.erreur && <p className="font-sans text-xs text-accent-deep">{dictee.erreur}</p>}
      <p className="font-sans text-[11px] text-text-secondary tabular-nums">
        {mots} mot{mots > 1 ? "s" : ""} · enregistré automatiquement
      </p>
    </div>
  );
}

// ——— Questions ———

function OngletQuestions({
  seanceId,
  carnet,
  carnets,
  nomModule,
  modifier,
  modifierAutre,
}: {
  seanceId: string;
  carnet: CarnetSeance;
  carnets: Record<string, CarnetSeance>;
  nomModule: string;
  modifier: (f: (c: CarnetSeance) => CarnetSeance) => void;
  modifierAutre: (id: string, autre: CarnetSeance, f: (c: CarnetSeance) => CarnetSeance) => void;
}) {
  const [saisie, setSaisie] = useState("");

  // Les questions restées sans réponse aux séances précédentes du même module
  const heritees = Object.entries(carnets)
    .filter(
      ([id, c]) => id !== seanceId && c.moduleId === carnet.moduleId && c.date <= carnet.date && c.questions.some((q) => !q.posee)
    )
    .sort(([, a], [, b]) => b.date.localeCompare(a.date));

  const basculer = (q: QuestionProf) => (c: CarnetSeance) => ({
    ...c,
    questions: c.questions.map((x) => (x.id === q.id ? { ...x, posee: !x.posee } : x)),
  });

  function ajouter() {
    const texte = saisie.trim();
    if (!texte) return;
    modifier((c) => ({
      ...c,
      questions: [...c.questions, { id: nouvelId("question"), texte, posee: false, creeLe: new Date().toISOString() }],
    }));
    setSaisie("");
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ajouter();
        }}
        className="flex gap-2"
      >
        <input
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          placeholder="Une question à poser au prof…"
          className="flex-1 min-w-0 rounded-md border border-hairline bg-canvas px-3 py-2 font-sans text-sm text-ink placeholder:text-text-secondary focus:outline-none focus:border-text-secondary"
        />
        <button
          type="submit"
          disabled={!saisie.trim()}
          className="rounded-md bg-ink text-canvas px-3 py-2 font-sans text-sm font-medium disabled:opacity-40 transition-opacity"
        >
          Ajouter
        </button>
      </form>

      {carnet.questions.length === 0 ? (
        <p className="font-sans text-sm text-text-muted">
          Rien à demander pour l’instant. Une question non posée reviendra d’elle-même à la prochaine séance de {nomModule}.
        </p>
      ) : (
        <ListeQuestions
          questions={carnet.questions}
          onBasculer={(q) => modifier(basculer(q))}
          onSupprimer={(q) => modifier((c) => ({ ...c, questions: c.questions.filter((x) => x.id !== q.id) }))}
        />
      )}

      {heritees.length > 0 && (
        <section className="rounded-lg bg-surface-secondary px-4 py-3">
          <h3 className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
            Restées sans réponse en {nomModule}
          </h3>
          {heritees.map(([id, autre]) => (
            <div key={id} className="mt-2.5">
              <p className="font-sans text-[11px] text-text-muted mb-1">{dateCourte(autre.date)}</p>
              <ListeQuestions
                questions={autre.questions.filter((q) => !q.posee)}
                onBasculer={(q) => modifierAutre(id, autre, basculer(q))}
              />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function ListeQuestions({
  questions,
  onBasculer,
  onSupprimer,
}: {
  questions: QuestionProf[];
  onBasculer: (q: QuestionProf) => void;
  onSupprimer?: (q: QuestionProf) => void;
}) {
  return (
    <ul className="flex flex-col">
      {questions.map((q) => (
        <li key={q.id} className="group flex items-start gap-2.5 py-1.5">
          <button
            type="button"
            role="checkbox"
            aria-checked={q.posee}
            aria-label={q.posee ? "Marquer comme non posée" : "Marquer comme posée"}
            onClick={() => onBasculer(q)}
            className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
              q.posee ? "bg-accent-olive border-accent-olive text-canvas" : "border-text-secondary hover:border-ink"
            }`}
          >
            {q.posee && (
              <svg width="9" height="9" viewBox="0 0 12 12" aria-hidden>
                <path d="M2.5 6.2l2.2 2.3 4.8-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <span className={`flex-1 font-sans text-sm leading-snug ${q.posee ? "text-text-secondary line-through" : "text-ink"}`}>
            {q.texte}
          </span>
          {onSupprimer && (
            <button
              type="button"
              onClick={() => onSupprimer(q)}
              aria-label="Supprimer la question"
              className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-text-secondary hover:text-accent-deep transition-opacity"
            >
              <IconClose width={13} height={13} />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

// ——— Fiche ———

function OngletFiche({
  carnet,
  titre,
  module,
  onFiche,
  onOutil,
}: {
  carnet: CarnetSeance;
  titre: string;
  module: string;
  onFiche: (fiche: FicheSeanceIA) => void;
  onOutil: (outil: OutilSeance) => void;
}) {
  const [attente, setAttente] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);

  const transcrits = carnet.vocaux.filter((v) => v.transcription.trim());
  const sources = [
    carnet.note.trim() ? `Notes :\n${carnet.note.trim()}` : "",
    ...transcrits.map((v, i) => `Vocal ${i + 1} (transcription) :\n${v.transcription.trim()}`),
    carnet.questions.length ? `Questions notées :\n${carnet.questions.map((q) => `- ${q.texte}`).join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  const mots = compterMots(sources);
  const assez = mots >= 25;

  async function generer() {
    setAttente(true);
    setErreur(null);
    try {
      const reponse = await fetch("/api/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tache: "fiche", texte: sources, titre, intention: module }),
      });
      const corps = (await reponse.json()) as { texte?: string; erreur?: string; fournisseur?: string };
      if (!reponse.ok || !corps.texte) throw new Error(corps.erreur ?? "La réponse de l’IA est vide.");
      onFiche({ texte: corps.texte, creeLe: new Date().toISOString(), fournisseur: corps.fournisseur });
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "La fiche n’a pas pu être générée.");
    } finally {
      setAttente(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg bg-surface-secondary px-4 py-3">
        <p className="font-sans text-xs text-text-muted">
          La fiche se construit uniquement à partir de vos traces :{" "}
          <span className="text-ink">
            {carnet.note.trim() ? `note de ${compterMots(carnet.note)} mots` : "pas de note"} · {transcrits.length} vocal
            {transcrits.length > 1 ? "aux" : ""} transcrit{transcrits.length > 1 ? "s" : ""} · {carnet.questions.length} question
            {carnet.questions.length > 1 ? "s" : ""}
          </span>
        </p>
        {!assez && (
          <p className="font-sans text-xs text-text-muted mt-1.5">
            Il faut au moins 25 mots pour une fiche utile.{" "}
            <button type="button" onClick={() => onOutil("note")} className="text-brand hover:underline">
              Écrire une note
            </button>{" "}
            ou{" "}
            <button type="button" onClick={() => onOutil("vocal")} className="text-brand hover:underline">
              enregistrer un vocal
            </button>
            .
          </p>
        )}
        <button
          type="button"
          onClick={() => void generer()}
          disabled={!assez || attente}
          className="mt-3 inline-flex items-center gap-2 rounded-md bg-brand hover:bg-brand-hover text-canvas px-3.5 py-2 font-sans text-sm font-medium disabled:opacity-40 transition-colors"
        >
          <Glyphe outil="fiche" taille={14} />
          {attente ? "Rédaction de la fiche…" : carnet.fiche ? "Régénérer la fiche" : "Générer la fiche de révision"}
        </button>
        {erreur && <p className="font-sans text-xs text-accent-deep mt-2">{erreur}</p>}
      </div>

      {carnet.fiche && (
        <article className="rounded-lg border border-hairline px-4 py-4">
          <RenduFiche texte={carnet.fiche.texte} />
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-hairline font-sans text-[11px] text-text-secondary">
            <span>
              {heureDe(carnet.fiche.creeLe)}
              {carnet.fiche.fournisseur ? ` · ${carnet.fiche.fournisseur}` : ""}
            </span>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(carnet.fiche?.texte ?? "").then(() => {
                  setCopie(true);
                  window.setTimeout(() => setCopie(false), 1500);
                });
              }}
              className="ml-auto hover:text-ink transition-colors"
            >
              {copie ? "Copiée" : "Copier la fiche"}
            </button>
          </div>
        </article>
      )}
    </div>
  );
}

const TITRES_FICHE = /^(l[’']essentiel|notions|à vérifier|quiz)\s*:?$/i;

function RenduFiche({ texte }: { texte: string }) {
  const lignes = texte.replace(/\*\*/g, "").split("\n");
  return (
    <div className="flex flex-col gap-1">
      {lignes.map((ligne, i) => {
        const propre = ligne.replace(/^#+\s*/, "").replace(/^«\s*|\s*»$/g, "").trim();
        if (!propre) return <span key={i} className="h-1" aria-hidden />;
        if (TITRES_FICHE.test(propre)) {
          return (
            <h4 key={i} className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary mt-3 first:mt-0">
              {propre.replace(/\s*:$/, "")}
            </h4>
          );
        }
        if (/^Q\s*:/.test(propre)) {
          return (
            <p key={i} className="font-sans text-sm font-medium text-ink mt-1.5">
              {propre}
            </p>
          );
        }
        if (/^R\s*:/.test(propre)) {
          return (
            <p key={i} className="font-sans text-sm text-text-muted">
              {propre}
            </p>
          );
        }
        return (
          <p key={i} className="font-sans text-sm text-ink leading-relaxed">
            {propre.replace(/^[-•]\s*/, "")}
          </p>
        );
      })}
    </div>
  );
}
