"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import type { ModuleId } from "@/content/emploi-du-temps";
import { useObjectifsState, type CarteSavoir, type Intention } from "@/lib/objectifs-store";
import { useSemaines } from "@/lib/semaines";
import { moduleMeta, formatDuree } from "@/lib/programme";
import { filAutourDe, positionDans, heureLisible } from "@/lib/fil-du-jour";
import { horairesPriere } from "@/lib/horaires-priere";
import { cleJour } from "@/lib/rituel";
import type { TacheIA } from "@/lib/ia/taches";

/*
 * Le navigateur à intention.
 *
 * Pas d'onglet sans raison : on choisit d'abord pour quoi on ouvre (un module,
 * la formation, une vidéo, ou du temps libre compté), puis la page. L'étagère
 * tient cinq onglets ; pour en ouvrir un sixième, il faut en fermer un — et
 * fermer, c'est d'abord répondre à « qu'est-ce que je retiens ? ».
 *
 * Pendant un cours, le garde-fou ne laisse s'ouvrir que les sites d'étude.
 * L'IA gratuite lit la page ouverte : résumé, idées, explication, quiz, angle
 * vidéo. Ce qui est retenu va dans le carnet, rangé par intention.
 *
 * Les vrais onglets n'existent que dans l'app de bureau ; dans un navigateur
 * ordinaire, la page montre le carnet et le radar de lecture.
 */

const MAX_ONGLETS = 5;
const PAUSE_GARDE_FOU = 15 * 60_000;
const LIBRE_MINUTES = 15;

/** Toujours ouvrables pendant un cours */
const SITES_D_ETUDE = [
  "google.com",
  "wikipedia.org",
  "python.org",
  "stackoverflow.com",
  "github.com",
  "developer.mozilla.org",
  "scikit-learn.org",
  "pandas.pydata.org",
  "numpy.org",
  "kaggle.com",
  "arxiv.org",
  "ncbi.nlm.nih.gov",
  "who.int",
  "openclassrooms.com",
  "coursera.org",
];

const MODULES_S3: ModuleId[] = ["ia", "datamining", "sih", "python", "bdd", "web", "eco", "anglais", "francais"];

const INTENTIONS_FIXES: Intention[] = [
  { type: "formation", libelle: "Formation 37 jours" },
  { type: "video", libelle: "Vidéo think.anas" },
  { type: "libre", libelle: `Libre · ${LIBRE_MINUTES} min` },
];

const ACTIONS: { tache: TacheIA; label: string }[] = [
  { tache: "resumer", label: "Résumer" },
  { tache: "idees", label: "3 idées à retenir" },
  { tache: "expliquer", label: "Expliquer niveau S3" },
  { tache: "quiz", label: "Me tester" },
  { tache: "angle", label: "Angle vidéo" },
];

type EtatIA =
  | { statut: "repos" }
  | { statut: "chargement"; tache: TacheIA }
  | { statut: "ok"; tache: TacheIA; texte: string; source: string }
  | { statut: "erreur"; tache: TacheIA; message: string };

const intentionModule = (id: ModuleId): Intention => ({ type: "module", moduleId: id, libelle: moduleMeta[id].nom });

function couleurIntention(i: Intention | undefined): string {
  if (!i) return "var(--color-neutre-fort)";
  if (i.type === "module" && i.moduleId) return moduleMeta[i.moduleId].couleur;
  if (i.type === "formation") return "var(--color-formation)";
  if (i.type === "video") return "#e05a47";
  return "var(--color-neutre)";
}

const memeIntention = (a: Intention | null | undefined, b: Intention | null | undefined) =>
  Boolean(a && b && a.type === b.type && a.moduleId === b.moduleId && a.libelle === b.libelle);

function domaineDe(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** Electron préfixe les erreurs de son pont : on ne garde que le message utile */
const messageClair = (e: unknown) =>
  e instanceof Error ? e.message.replace(/^Error invoking remote method '[^']+': (Error: )?/, "") : "Opération impossible.";

const heureDe = (t: number) => {
  const d = new Date(t);
  return heureLisible(d.getHours() * 60 + d.getMinutes());
};

/** Le cours en cours d'après le fil du jour, relu toutes les 30 secondes */
function useCoursEnCours() {
  const semaines = useSemaines();
  const [maintenant, setMaintenant] = useState<Date | null>(null);

  useEffect(() => {
    setMaintenant(new Date());
    const minuterie = window.setInterval(() => setMaintenant(new Date()), 30_000);
    return () => window.clearInterval(minuterie);
  }, []);

  const cle = maintenant ? cleJour(maintenant) : null;
  const fil = useMemo(() => {
    if (!cle) return null;
    const [a, m, j] = cle.split("-").map(Number);
    return filAutourDe(new Date(a, m - 1, j, 12), {
      jourDe: (date) => {
        const k = cleJour(date);
        for (const s of semaines) {
          const jour = s.jours.find((x) => x.date === k);
          if (jour) return jour;
        }
        return null;
      },
      prieresDe: horairesPriere,
      nomModule: (id) => moduleMeta[id].court,
    });
  }, [cle, semaines]);

  const position = fil && maintenant ? positionDans(fil, maintenant) : null;
  return { maintenant, cours: position?.courant.nature === "seance" ? position.courant : null };
}

function PuceIntention({
  intention,
  choisie,
  onChoisir,
  court,
}: {
  intention: Intention;
  choisie: Intention | null;
  onChoisir: (i: Intention) => void;
  court?: string;
}) {
  const c = couleurIntention(intention);
  const active = memeIntention(intention, choisie);
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      title={intention.libelle}
      onClick={() => onChoisir(intention)}
      className={`shrink-0 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-sans text-xs whitespace-nowrap transition-colors ${
        active ? "text-ink font-medium" : "border-hairline text-text-muted hover:text-ink hover:border-text-secondary"
      }`}
      style={active ? { borderColor: c, background: `color-mix(in srgb, ${c} 12%, var(--color-canvas))` } : undefined}
    >
      <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: c }} aria-hidden />
      {court ?? intention.libelle}
    </button>
  );
}

function StatutIA({ statut }: { statut: { configures: number; total: number } | null }) {
  if (!statut) return null;
  const pret = statut.configures > 0;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-sans text-[11px] ${
        pret ? "border-accent-olive/40 text-accent-olive bg-accent-cactus/40" : "border-accent-clay/40 text-accent-clay bg-accent-clay/5"
      }`}
      title={pret ? "Le routeur passe d'un fournisseur à l'autre quand un quota est atteint" : "Copiez .env.local.example en .env.local et collez vos clés"}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${pret ? "bg-accent-olive" : "bg-accent-clay"}`} aria-hidden />
      {pret
        ? `IA gratuite · ${statut.configures}/${statut.total} fournisseurs`
        : "IA gratuite : ajoutez vos clés dans .env.local"}
    </span>
  );
}

function Carnet({ cartes, onRetirer, titre }: { cartes: CarteSavoir[]; onRetirer: (id: string) => void; titre: string }) {
  return (
    <section className="rounded-lg border border-hairline bg-canvas">
      <div className="flex items-baseline justify-between px-4 py-3 border-b border-hairline">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary">{titre}</p>
        <p className="font-sans text-[11px] text-text-muted tabular-nums">{cartes.length}</p>
      </div>
      {cartes.length === 0 ? (
        <p className="px-4 py-4 font-sans text-xs text-text-muted leading-relaxed">
          Rien encore. Chaque page fermée laisse ici ce que vous en avez retenu, rangé par intention.
        </p>
      ) : (
        <ul className="divide-y divide-hairline">
          {cartes.map((c) => (
            <li key={c.id} className="flex gap-3 px-4 py-3">
              <span className="w-[3px] rounded-full shrink-0" style={{ background: couleurIntention(c.intention) }} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-sans text-xs font-medium text-ink truncate" title={c.titre}>
                  {c.titre || domaineDe(c.url)}
                </p>
                <p className="font-sans text-[10px] text-text-secondary truncate">
                  {c.intention.libelle} · {domaineDe(c.url)} · {new Date(c.creeLe).toLocaleDateString("fr-FR")}
                </p>
                {c.idees.length > 0 && (
                  <ul className="mt-1.5 flex flex-col gap-1">
                    {c.idees.map((idee, k) => (
                      <li key={k} className="font-sans text-xs text-ink leading-snug">
                        {idee}
                      </li>
                    ))}
                  </ul>
                )}
                {c.note && <p className="font-sans text-xs text-text-muted mt-1 italic leading-snug">{c.note}</p>}
              </div>
              <button
                type="button"
                onClick={() => onRetirer(c.id)}
                className="self-start font-sans text-[10px] text-text-secondary hover:text-accent-deep transition-colors"
              >
                Retirer
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Radar({ lignes }: { lignes: { intention: Intention; ms: number }[] }) {
  const total = lignes.reduce((n, l) => n + l.ms, 0);
  const libre = lignes.filter((l) => l.intention.type === "libre").reduce((n, l) => n + l.ms, 0);
  const derive = total > 10 * 60_000 && libre / total > 0.3;
  return (
    <section className="rounded-lg border border-hairline bg-canvas px-4 py-3">
      <div className="flex items-baseline justify-between mb-2">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
          Radar de lecture · aujourd&apos;hui
        </p>
        <p className="font-sans text-[11px] text-text-muted tabular-nums">{formatDuree(Math.round(total / 60_000))}</p>
      </div>
      {lignes.length === 0 ? (
        <p className="font-sans text-xs text-text-muted">Aucune lecture aujourd&apos;hui.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {lignes.map((l) => (
            <li key={l.intention.libelle}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-sans text-xs text-ink truncate">{l.intention.libelle}</span>
                <span className="font-sans text-[11px] text-text-muted tabular-nums shrink-0">
                  {formatDuree(Math.max(1, Math.round(l.ms / 60_000)))}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-warm mt-1 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(l.ms / total) * 100}%`, background: couleurIntention(l.intention) }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      {derive && (
        <p className="font-sans text-xs text-accent-clay mt-3 leading-snug">
          Plus d&apos;un tiers de votre lecture du jour est « libre ». Choisissez une intention pour la suite.
        </p>
      )}
    </section>
  );
}

export default function NavigateurPage() {
  const { state, hydrated, ajouterCarte, supprimerCarte, ouvrirLecture, fermerLecture } = useObjectifsState();
  const { maintenant, cours } = useCoursEnCours();

  const [pont, setPont] = useState<PontNavigateur | null>(null);
  const [pret, setPret] = useState(false);
  const [onglets, setOnglets] = useState<OngletNavigateur[]>([]);
  const [actif, setActif] = useState<string | null>(null);
  const [intentions, setIntentions] = useState<Record<string, Intention>>({});
  const [ouvertLe, setOuvertLe] = useState<Record<string, number>>({});
  const [intention, setIntention] = useState<Intention | null>(null);
  const [saisie, setSaisie] = useState("");
  const [alerte, setAlerte] = useState<string | null>(null);
  const [ia, setIa] = useState<EtatIA>({ statut: "repos" });
  const [question, setQuestion] = useState("");
  const [idees, setIdees] = useState<string[]>(["", "", ""]);
  const [note, setNote] = useState("");
  const [aFermer, setAFermer] = useState<string | null>(null);
  const [pauseJusqua, setPauseJusqua] = useState<number | null>(null);
  const [statutIA, setStatutIA] = useState<{ configures: number; total: number } | null>(null);

  const zoneRef = useRef<HTMLDivElement>(null);
  const sessionsRef = useRef<Record<string, { id: string; domaine: string }>>({});

  // Le pont n'existe que dans l'app de bureau : lu après le montage
  useEffect(() => {
    setPont(window.thinkAnas?.navigateur ?? null);
    setPret(true);
    fetch("/api/ia")
      .then((r) => r.json())
      .then((j: { fournisseurs: { configure: boolean }[] }) =>
        setStatutIA({ configures: j.fournisseurs.filter((f) => f.configure).length, total: j.fournisseurs.length })
      )
      .catch(() => setStatutIA(null));
  }, []);

  // Les onglets vivent dans le processus principal : on écoute leurs changements
  useEffect(() => {
    if (!pont) return;
    void pont.etat().then((e) => {
      setOnglets(e.onglets);
      setActif(e.actif);
    });
    const arreterOnglets = pont.surOnglets((liste, a) => {
      setOnglets(liste);
      setActif(a);
    });
    const arreterBlocages = pont.surBlocage((info) =>
      setAlerte(`${domaineDe(info.url) || info.url} n'a pas été ouvert. ${info.raison}`)
    );
    return () => {
      arreterOnglets();
      arreterBlocages();
    };
  }, [pont]);

  // L'onglet actif se dessine exactement dans la zone réservée, et disparaît en quittant la page
  useEffect(() => {
    if (!pont) return;
    const element = zoneRef.current;
    if (!element) return;
    let cadre = 0;
    const envoyer = () => {
      cancelAnimationFrame(cadre);
      cadre = requestAnimationFrame(() => {
        const r = element.getBoundingClientRect();
        void pont.zone({ x: r.left, y: r.top, width: r.width, height: r.height });
      });
    };
    envoyer();
    const observateur = new ResizeObserver(envoyer);
    observateur.observe(element);
    window.addEventListener("scroll", envoyer, true);
    window.addEventListener("resize", envoyer);
    return () => {
      cancelAnimationFrame(cadre);
      observateur.disconnect();
      window.removeEventListener("scroll", envoyer, true);
      window.removeEventListener("resize", envoyer);
      void pont.zone(null);
    };
  }, [pont]);

  // Un onglet ouvert par un lien hérite de l'intention de celui d'où il vient
  useEffect(() => {
    setIntentions((prec) => {
      const suivant = { ...prec };
      let change = false;
      for (const o of onglets) {
        if (suivant[o.id]) continue;
        const heritee = (actif && prec[actif]) || intention;
        if (heritee) {
          suivant[o.id] = heritee;
          change = true;
        }
      }
      for (const id of Object.keys(suivant)) {
        if (!onglets.some((o) => o.id === id)) {
          delete suivant[id];
          change = true;
        }
      }
      return change ? suivant : prec;
    });
  }, [onglets, actif, intention]);

  // Le journal de lecture : une session par domaine visité, avec son intention
  useEffect(() => {
    if (!hydrated) return;
    const sessions = sessionsRef.current;
    for (const o of onglets) {
      const domaine = domaineDe(o.url);
      const i = intentions[o.id];
      if (!domaine || !i) continue;
      const enCours = sessions[o.id];
      if (enCours && enCours.domaine === domaine) continue;
      if (enCours) fermerLecture(enCours.id);
      const id = `lecture-${Date.now().toString(36)}-${o.id}`;
      ouvrirLecture({ id, url: o.url, domaine, intention: i, debut: new Date().toISOString() });
      sessions[o.id] = { id, domaine };
    }
    for (const [ongletId, s] of Object.entries(sessions)) {
      if (!onglets.some((o) => o.id === ongletId)) {
        fermerLecture(s.id);
        delete sessions[ongletId];
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onglets, intentions, hydrated]);

  useEffect(
    () => () => {
      for (const s of Object.values(sessionsRef.current)) fermerLecture(s.id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Le garde-fou : pendant un cours, seuls les sites d'étude et ceux du module du cours
  const enPause = pauseJusqua !== null && maintenant !== null && pauseJusqua > maintenant.getTime();
  const regle: RegleGardeFou = useMemo(() => {
    if (!cours || enPause) return { actif: false, domainesAutorises: [], raison: "" };
    const duCours = onglets
      .filter((o) => intentions[o.id]?.moduleId && intentions[o.id]?.moduleId === cours.moduleId)
      .map((o) => domaineDe(o.url))
      .filter(Boolean);
    const nom = cours.moduleId ? moduleMeta[cours.moduleId].court : "le cours";
    return {
      actif: true,
      domainesAutorises: [...new Set([...SITES_D_ETUDE, ...duCours])],
      raison: `Pendant ${nom} (jusqu'à ${heureDe(cours.fin)}), seuls les sites d'étude s'ouvrent.`,
    };
  }, [cours, enPause, onglets, intentions]);
  const cleRegle = JSON.stringify(regle);

  useEffect(() => {
    if (pont) void pont.gardeFou(regle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pont, cleRegle]);

  const ongletActif = onglets.find((o) => o.id === actif) ?? null;
  const intentionActive = ongletActif ? intentions[ongletActif.id] : undefined;

  async function ouvrir(e?: FormEvent) {
    e?.preventDefault();
    if (!pont || !intention || !saisie.trim()) return;
    setAlerte(null);
    try {
      const id = await pont.ouvrir(saisie.trim());
      setIntentions((prec) => ({ ...prec, [id]: intention }));
      setOuvertLe((prec) => ({ ...prec, [id]: Date.now() }));
      setSaisie("");
    } catch (erreur) {
      setAlerte(messageClair(erreur));
    }
  }

  function demanderFermeture(id: string) {
    setAFermer(id);
    setIdees(["", "", ""]);
    setNote("");
    setIa({ statut: "repos" });
    void pont?.activer(id);
  }

  async function ranger(fermer: boolean) {
    const id = aFermer ?? actif;
    if (!pont || !id) return;
    const onglet = onglets.find((o) => o.id === id);
    const i = intentions[id];
    const retenues = idees.map((s) => s.trim()).filter(Boolean);
    if (onglet && i && (retenues.length > 0 || note.trim())) {
      ajouterCarte({ url: onglet.url, titre: onglet.titre, intention: i, idees: retenues, note: note.trim() });
    }
    if (fermer) {
      await pont.fermer(id);
      setAFermer(null);
    }
    setIdees(["", "", ""]);
    setNote("");
  }

  async function lancer(tache: TacheIA) {
    if (!pont || !ongletActif) return;
    setIa({ statut: "chargement", tache });
    try {
      const page = await pont.lireTexte(ongletActif.id);
      const reponse = await fetch("/api/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tache,
          texte: page.texte,
          titre: page.titre,
          url: page.url,
          intention: intentionActive?.libelle,
          question: tache === "question" ? question : undefined,
        }),
      });
      const corps = (await reponse.json()) as { texte?: string; erreur?: string; fournisseur?: string; modele?: string; dureeMs?: number };
      if (!reponse.ok || !corps.texte) {
        setIa({ statut: "erreur", tache, message: corps.erreur ?? "L'IA n'a pas répondu." });
        return;
      }
      setIa({
        statut: "ok",
        tache,
        texte: corps.texte,
        source: `${corps.fournisseur} · ${corps.modele} · ${((corps.dureeMs ?? 0) / 1000).toFixed(1)} s`,
      });
      if (tache === "idees") {
        const lignes = corps.texte
          .split("\n")
          .map((l) => l.replace(/^[\s\-•*\d.)]+/, "").trim())
          .filter(Boolean)
          .slice(0, 3);
        setIdees([...lignes, "", "", ""].slice(0, 3));
      }
    } catch (erreur) {
      setIa({ statut: "erreur", tache, message: messageClair(erreur) });
    }
  }

  const radar = useMemo(() => {
    if (!maintenant) return [];
    const debutJour = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate()).getTime();
    const parIntention = new Map<string, { intention: Intention; ms: number }>();
    for (const l of state.lectures) {
      const fin = l.fin ? Date.parse(l.fin) : maintenant.getTime();
      if (fin < debutJour) continue;
      const ms = Math.max(0, fin - Math.max(Date.parse(l.debut), debutJour));
      const entree = parIntention.get(l.intention.libelle) ?? { intention: l.intention, ms: 0 };
      entree.ms += ms;
      parIntention.set(l.intention.libelle, entree);
    }
    return [...parIntention.values()].filter((l) => l.ms > 0).sort((a, b) => b.ms - a.ms);
  }, [state.lectures, maintenant]);

  const cartesVisibles = (
    intentionActive ? state.carnet.filter((c) => memeIntention(c.intention, intentionActive)) : state.carnet
  ).slice(0, 8);

  const puces = (
    <div role="radiogroup" aria-label="Intention du prochain onglet" className="flex items-center gap-1.5 flex-wrap">
      {MODULES_S3.map((id) => (
        <PuceIntention
          key={id}
          intention={intentionModule(id)}
          choisie={intention}
          onChoisir={setIntention}
          court={moduleMeta[id].court}
        />
      ))}
      <span className="h-5 w-px bg-hairline shrink-0 mx-1" aria-hidden />
      {INTENTIONS_FIXES.map((i) => (
        <PuceIntention key={i.libelle} intention={i} choisie={intention} onChoisir={setIntention} />
      ))}
    </div>
  );

  if (!pret) return <div className="min-h-[60vh]" />;

  // ——— Hors de l'app de bureau : le carnet et le radar restent consultables ———
  if (!pont) {
    return (
      <div className="flex flex-col gap-4">
        <section className="rounded-lg border border-hairline bg-canvas px-5 py-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="max-w-2xl">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                Navigateur à intention
              </p>
              <h1 className="font-serif text-2xl text-ink leading-tight mt-1">Le navigateur vit dans l&apos;app de bureau</h1>
              <p className="font-sans text-sm text-text-muted mt-2 leading-relaxed">
                YouTube, Google ou Instagram refusent de s&apos;afficher à l&apos;intérieur d&apos;une page web ordinaire.
                Lancez think.anas en version bureau pour ouvrir de vrais onglets : l&apos;étagère de cinq, le garde-fou
                des heures de cours et l&apos;IA sur chaque page.
              </p>
              <pre className="mt-3 inline-block rounded-md bg-surface-secondary px-3 py-2 font-mono text-sm text-ink">
                npm run desktop
              </pre>
            </div>
            <StatutIA statut={statutIA} />
          </div>
        </section>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-4 items-start">
          <Carnet cartes={state.carnet} onRetirer={supprimerCarte} titre="Carnet de savoirs" />
          <Radar lignes={radar} />
        </div>
      </div>
    );
  }

  // ——— Dans l'app de bureau ———
  const libreEcoule = (id: string) =>
    intentions[id]?.type === "libre" && ouvertLe[id] !== undefined && Date.now() - ouvertLe[id] > LIBRE_MINUTES * 60_000;

  return (
    <div className="flex flex-col gap-3">
      {/* 1. D'abord l'intention, ensuite la page */}
      <section className="rounded-lg border border-hairline bg-canvas px-4 py-3 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
              Navigateur à intention
            </p>
            <p className="font-sans text-sm text-ink">Chaque onglet a une raison. Chaque page laisse une trace.</p>
          </div>
          <StatutIA statut={statutIA} />
        </div>

        {puces}

        <form onSubmit={ouvrir} className="flex items-center gap-2">
          <input
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            disabled={!intention}
            placeholder={intention ? `Adresse ou recherche — ${intention.libelle}` : "Choisissez d'abord une intention"}
            aria-label="Adresse ou recherche"
            className="flex-1 min-w-0 rounded-md border border-hairline bg-canvas px-3 py-2 font-sans text-sm text-ink outline-none focus:border-brand disabled:bg-surface-secondary disabled:cursor-not-allowed transition-colors"
          />
          <button
            type="submit"
            disabled={!intention || !saisie.trim() || onglets.length >= MAX_ONGLETS}
            className="rounded-md bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-canvas font-sans text-sm font-medium px-4 py-2 transition-colors"
          >
            Ouvrir
          </button>
        </form>

        {regle.actif && (
          <div className="flex items-center justify-between gap-3 flex-wrap rounded-md border border-brand/30 bg-brand-soft/60 px-3 py-2">
            <p className="font-sans text-xs text-ink">
              <span className="font-semibold">Garde-fou actif.</span> {regle.raison}
            </p>
            <button
              type="button"
              onClick={() => setPauseJusqua(Date.now() + PAUSE_GARDE_FOU)}
              className="font-sans text-xs text-brand hover:underline shrink-0"
            >
              Pause de 15 min
            </button>
          </div>
        )}
        {alerte && (
          <div role="alert" className="flex items-center justify-between gap-3 rounded-md border border-accent-clay/40 bg-accent-clay/5 px-3 py-2">
            <p className="font-sans text-xs text-ink">{alerte}</p>
            <button type="button" onClick={() => setAlerte(null)} className="font-sans text-xs text-text-muted hover:text-ink shrink-0">
              Compris
            </button>
          </div>
        )}
      </section>

      {/* 2. L'étagère : cinq places, pas une de plus */}
      <section aria-label="Étagère des onglets" className="grid grid-cols-5 gap-2">
        {Array.from({ length: MAX_ONGLETS }, (_, k) => {
          const o = onglets[k];
          if (!o) {
            return (
              <div key={`libre-${k}`} className="rounded-md border border-dashed border-hairline px-3 py-2.5 font-sans text-[11px] text-text-secondary flex items-center">
                Place libre
              </div>
            );
          }
          const i = intentions[o.id];
          const ecoule = libreEcoule(o.id);
          return (
            <div
              key={o.id}
              role="button"
              tabIndex={0}
              aria-pressed={o.id === actif}
              onClick={() => void pont.activer(o.id)}
              onKeyDown={(e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  void pont.activer(o.id);
                }
              }}
              className={`relative rounded-md border bg-canvas pl-4 pr-2.5 py-2 min-w-0 cursor-pointer transition-colors ${
                ecoule ? "border-accent-deep" : o.id === actif ? "border-ink" : "border-hairline hover:border-text-secondary"
              }`}
            >
              <span className="absolute left-1.5 top-2 bottom-2 w-[3px] rounded-full" style={{ background: couleurIntention(i) }} aria-hidden />
              <p className="font-sans text-xs font-medium text-ink truncate" title={o.titre}>
                {o.titre}
              </p>
              <p className={`font-sans text-[10px] truncate ${ecoule ? "text-accent-deep" : "text-text-muted"}`}>
                {ecoule ? `${LIBRE_MINUTES} min de temps libre écoulées` : `${i?.libelle ?? "Sans intention"} · ${domaineDe(o.url)}`}
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  demanderFermeture(o.id);
                }}
                className="mt-1 font-sans text-[10px] text-text-secondary hover:text-ink transition-colors"
              >
                Retenir et fermer
              </button>
              {o.chargement && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand animate-pulse" aria-label="Chargement" />}
            </div>
          );
        })}
      </section>

      {/* 3. La page, et à côté ce qu'on en fait */}
      <div className="grid grid-cols-[minmax(0,1fr)_340px] gap-3 items-start">
        <div className="rounded-lg border border-hairline bg-canvas overflow-hidden">
          <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-hairline">
            {(
              [
                ["Reculer", "M15 18l-6-6 6-6", () => ongletActif && pont.reculer(ongletActif.id), ongletActif?.peutReculer],
                ["Avancer", "M9 18l6-6-6-6", () => ongletActif && pont.avancer(ongletActif.id), ongletActif?.peutAvancer],
                ["Recharger", "M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5", () => ongletActif && pont.recharger(ongletActif.id), Boolean(ongletActif)],
              ] as const
            ).map(([label, trace, action, possible]) => (
              <button
                key={label}
                type="button"
                title={label}
                aria-label={label}
                disabled={!possible}
                onClick={() => void action()}
                className="h-7 w-7 rounded-md flex items-center justify-center text-text-muted hover:text-ink hover:bg-surface-secondary disabled:opacity-35 disabled:hover:bg-transparent transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={trace} />
                </svg>
              </button>
            ))}
            <p className="flex-1 min-w-0 font-mono text-[11px] text-text-muted truncate px-2" title={ongletActif?.url}>
              {ongletActif?.url ?? "—"}
            </p>
          </div>
          {/* L'onglet actif est dessiné par-dessus cette zone par l'app de bureau */}
          <div ref={zoneRef} className="relative h-[calc(100vh-360px)] min-h-[440px] bg-surface-secondary/40">
            {onglets.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                <svg width="56" height="56" viewBox="0 0 64 64" aria-hidden>
                  <rect x="8" y="14" width="10" height="36" rx="2" fill="#8b5cf6" fillOpacity="0.25" stroke="#8b5cf6" strokeWidth="2" />
                  <rect x="21" y="10" width="10" height="40" rx="2" fill="#10b981" fillOpacity="0.25" stroke="#10b981" strokeWidth="2" />
                  <rect x="34" y="18" width="10" height="32" rx="2" fill="none" stroke="var(--color-neutre-fort)" strokeWidth="2" strokeDasharray="3 3" />
                  <rect x="47" y="18" width="10" height="32" rx="2" fill="none" stroke="var(--color-neutre-fort)" strokeWidth="2" strokeDasharray="3 3" />
                  <path d="M4 52h56" stroke="var(--color-ink)" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
                <p className="font-serif text-xl text-ink mt-3">L&apos;étagère est vide</p>
                <p className="font-sans text-sm text-text-muted mt-1 max-w-sm leading-relaxed">
                  Choisissez pour quoi vous ouvrez une page, puis tapez son adresse ou votre recherche.
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-3 max-h-[calc(100vh-250px)] overflow-y-auto no-scrollbar">
          {/* L'IA sur la page ouverte */}
          <section className="rounded-lg border border-hairline bg-canvas px-4 py-3">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary">Cette page</p>
            {!ongletActif ? (
              <p className="font-sans text-xs text-text-muted mt-2">Ouvrez un onglet pour le lire avec l&apos;IA.</p>
            ) : (
              <>
                <p className="font-sans text-sm font-medium text-ink mt-1 truncate" title={ongletActif.titre}>
                  {ongletActif.titre}
                </p>
                <p className="font-sans text-[11px] text-text-muted truncate">
                  {intentionActive?.libelle ?? "Sans intention"} · {domaineDe(ongletActif.url)}
                </p>
                <div className="grid grid-cols-2 gap-1.5 mt-3">
                  {ACTIONS.map((a) => (
                    <button
                      key={a.tache}
                      type="button"
                      onClick={() => void lancer(a.tache)}
                      disabled={ia.statut === "chargement"}
                      className={`rounded-md border px-2 py-1.5 font-sans text-xs text-left transition-colors disabled:opacity-50 ${
                        ia.statut !== "repos" && ia.tache === a.tache ? "border-ink text-ink" : "border-hairline text-text-muted hover:text-ink hover:border-text-secondary"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (question.trim()) void lancer("question");
                  }}
                  className="flex gap-1.5 mt-1.5"
                >
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Poser une question sur la page"
                    aria-label="Question sur la page"
                    className="flex-1 min-w-0 rounded-md border border-hairline px-2 py-1.5 font-sans text-xs outline-none focus:border-brand"
                  />
                  <button type="submit" disabled={!question.trim() || ia.statut === "chargement"} className="rounded-md border border-hairline px-2 font-sans text-xs text-ink disabled:opacity-50">
                    Demander
                  </button>
                </form>

                {ia.statut === "chargement" && (
                  <p className="font-sans text-xs text-text-muted mt-3 animate-pulse" role="status">
                    Lecture de la page et appel de l&apos;IA…
                  </p>
                )}
                {ia.statut === "erreur" && (
                  <p className="font-sans text-xs text-accent-deep mt-3 leading-snug" role="alert">
                    {ia.message}
                  </p>
                )}
                {ia.statut === "ok" && (
                  <div className="mt-3 rounded-md bg-surface-secondary/70 px-3 py-2.5">
                    <p className="font-sans text-xs text-ink leading-relaxed whitespace-pre-wrap">{ia.texte}</p>
                    <p className="font-sans text-[10px] text-text-secondary mt-2">{ia.source}</p>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Retenir, avant de fermer */}
          {ongletActif && (
            <section
              className={`rounded-lg border bg-canvas px-4 py-3 ${aFermer === ongletActif.id ? "border-ink" : "border-hairline"}`}
            >
              <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                {aFermer === ongletActif.id ? "Avant de fermer" : "Retenir"}
              </p>
              <p className="font-sans text-sm text-ink mt-1">Qu&apos;est-ce que je retiens de cette page ?</p>
              <div className="flex flex-col gap-1.5 mt-2">
                {idees.map((idee, k) => (
                  <input
                    key={k}
                    value={idee}
                    onChange={(e) => setIdees((prec) => prec.map((x, n) => (n === k ? e.target.value : x)))}
                    placeholder={`Idée ${k + 1}`}
                    aria-label={`Idée ${k + 1}`}
                    className="rounded-md border border-hairline px-2 py-1.5 font-sans text-xs outline-none focus:border-brand"
                  />
                ))}
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Note libre (facultatif)"
                  aria-label="Note"
                  rows={2}
                  className="rounded-md border border-hairline px-2 py-1.5 font-sans text-xs outline-none focus:border-brand resize-none"
                />
              </div>
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => void ranger(aFermer === ongletActif.id)}
                  disabled={!idees.some((x) => x.trim()) && !note.trim()}
                  className="rounded-md bg-ink text-canvas font-sans text-xs font-medium px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {aFermer === ongletActif.id ? "Ranger et fermer" : "Ranger dans le carnet"}
                </button>
                {aFermer === ongletActif.id && (
                  <>
                    <button
                      type="button"
                      onClick={async () => {
                        await pont.fermer(ongletActif.id);
                        setAFermer(null);
                      }}
                      className="font-sans text-[11px] text-text-secondary hover:text-accent-deep transition-colors"
                    >
                      Fermer sans rien retenir
                    </button>
                    <button type="button" onClick={() => setAFermer(null)} className="font-sans text-[11px] text-text-secondary hover:text-ink transition-colors">
                      Garder ouvert
                    </button>
                  </>
                )}
              </div>
            </section>
          )}

          <Carnet
            cartes={cartesVisibles}
            onRetirer={supprimerCarte}
            titre={intentionActive ? `Carnet · ${intentionActive.libelle}` : "Carnet de savoirs"}
          />
          <Radar lignes={radar} />
        </aside>
      </div>
    </div>
  );
}
