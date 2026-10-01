"use client";

import { useEffect, useState } from "react";
import type { SemaineProgramme } from "@/content/emploi-du-temps";
import { PartitionSemaine } from "@/components/PartitionSemaine";
import { CadranJournee } from "@/components/CadranJournee";
import { FilsProgression } from "@/components/FilsProgression";
import { FilDuJour } from "@/components/FilDuJour";
import { ImportEmploiDuTemps } from "@/components/ImportEmploiDuTemps";
import { IconArrowRight, IconDownload } from "@/components/icons";
import { useObjectifsState } from "@/lib/objectifs-store";
import { useSemaines } from "@/lib/semaines";
import { seancesChronologiques, dureeSeance, formatDuree, semaineParDefaut } from "@/lib/programme";

type Vue = "semaine" | "journee" | "progression";

const CLE_VUE = "think-anas-programme-vue";

const vues: { cle: Vue; label: string; question: string }[] = [
  { cle: "semaine", label: "Vue d'ensemble", question: "À quoi ressemble ma semaine, d'un coup d'œil ?" },
  { cle: "journee", label: "Journée", question: "Qu'est-ce qui m'attend aujourd'hui, heure par heure ?" },
  { cle: "progression", label: "Progression", question: "Que se passe-t-il maintenant, et où en suis-je ?" },
];

function estVue(v: string | null): v is Vue {
  return v === "semaine" || v === "journee" || v === "progression";
}

export default function ProgrammePage() {
  const { supprimerSemaine } = useObjectifsState();
  const semaines = useSemaines();

  const [vue, setVue] = useState<Vue>("semaine");
  const [maintenant, setMaintenant] = useState<Date | null>(null);
  const [lundiChoisi, setLundiChoisi] = useState<string | null>(null);
  const [importOuvert, setImportOuvert] = useState(false);
  const [confirmerSuppression, setConfirmerSuppression] = useState(false);

  // Vue demandée par le lien (?vue=…), sinon la dernière consultée ;
  // ?importer=1 ouvre directement l'import. L'heure n'est lue qu'une fois la
  // page montée, puis toutes les 30 secondes.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const demandee = params.get("vue");
    let memorisee: string | null = null;
    try {
      memorisee = window.localStorage.getItem(CLE_VUE);
    } catch {
      // stockage indisponible : on garde la vue par défaut
    }
    if (estVue(demandee)) setVue(demandee);
    else if (estVue(memorisee)) setVue(memorisee);
    if (params.get("importer") === "1") setImportOuvert(true);

    setMaintenant(new Date());
    const minuterie = window.setInterval(() => setMaintenant(new Date()), 30_000);
    return () => window.clearInterval(minuterie);
  }, []);

  function choisir(v: Vue) {
    setVue(v);
    try {
      window.localStorage.setItem(CLE_VUE, v);
    } catch {
      // la vue ne sera simplement pas mémorisée
    }
    window.history.replaceState(null, "", `?vue=${v}`);
  }

  const semaine = semaines.find((s) => s.lundi === lundiChoisi) ?? semaineParDefaut(semaines, maintenant);
  const index = semaines.indexOf(semaine);
  const precedente = index > 0 ? semaines[index - 1] : null;
  const suivante = index >= 0 && index < semaines.length - 1 ? semaines[index + 1] : null;

  function allerA(s: SemaineProgramme) {
    setLundiChoisi(s.lundi);
    setConfirmerSuppression(false);
  }

  const seances = seancesChronologiques(semaine);
  const minutes = seances.reduce((n, s) => n + dureeSeance(s.seance), 0);
  const active = vues.find((v) => v.cle === vue) ?? vues[0];

  const boutonSemaine =
    "h-8 w-8 rounded-md border border-hairline text-text-muted flex items-center justify-center transition-colors hover:text-ink hover:border-text-secondary disabled:opacity-35 disabled:hover:text-text-muted disabled:hover:border-hairline shrink-0";

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-hairline bg-canvas">
        <div className="flex items-end justify-between gap-4 flex-wrap px-5 py-4 border-b border-hairline">
          <div className="min-w-0">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary mb-1">
              Programme de la semaine
            </p>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => precedente && allerA(precedente)}
                disabled={!precedente}
                aria-label="Semaine précédente"
                className={boutonSemaine}
              >
                <span className="inline-flex rotate-180">
                  <IconArrowRight width={13} height={13} />
                </span>
              </button>
              <h1 className="font-serif text-2xl text-ink leading-tight">
                Semaine {semaine.numero}
                <span className="text-text-muted"> · {semaine.libelle}</span>
              </h1>
              <button
                type="button"
                onClick={() => suivante && allerA(suivante)}
                disabled={!suivante}
                aria-label="Semaine suivante"
                className={boutonSemaine}
              >
                <IconArrowRight width={13} height={13} />
              </button>
            </div>
            <p className="font-sans text-xs text-text-muted mt-1.5 tabular-nums">
              {semaine.groupe} · Salle {semaine.salle} · {seances.length} séances · {formatDuree(minutes)} de cours ·{" "}
              <span className={semaine.source === "import" ? "text-brand" : ""}>
                {semaine.source === "import" ? "importée du PDF" : "relevée à la main"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div
              role="tablist"
              aria-label="Vues du programme"
              className="flex items-center gap-1 p-1 rounded-md bg-surface-secondary max-w-full overflow-x-auto no-scrollbar"
            >
              {vues.map((v) => (
                <button
                  key={v.cle}
                  type="button"
                  role="tab"
                  aria-selected={vue === v.cle}
                  onClick={() => choisir(v.cle)}
                  className={`rounded px-3 py-1.5 font-sans text-sm whitespace-nowrap transition-colors ${
                    vue === v.cle
                      ? "bg-canvas text-ink font-medium shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                      : "text-text-muted hover:text-ink"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setImportOuvert((ouvert) => !ouvert)}
              aria-expanded={importOuvert}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand hover:bg-brand-hover text-canvas font-sans text-sm font-medium px-3.5 py-2 transition-colors"
            >
              <IconDownload width={13} height={13} />
              Importer un emploi du temps
            </button>
          </div>
        </div>
        <p className="px-5 py-2.5 font-sans text-xs text-text-muted">{active.question}</p>
      </div>

      {importOuvert && (
        <ImportEmploiDuTemps
          lundisExistants={semaines.map((s) => s.lundi)}
          onFermer={() => setImportOuvert(false)}
          onImportee={(lundi) => {
            setLundiChoisi(lundi);
            setImportOuvert(false);
            setConfirmerSuppression(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {!semaines.some((s) => s.lundi === "2026-09-28") && !importOuvert && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-brand/20 bg-brand-soft">
          <div>
            <p className="font-sans font-medium text-sm text-ink">
              Semaine 3 en cours (du 28 septembre au 2 octobre)
            </p>
            <p className="font-sans text-xs text-text-secondary mt-0.5">
              Les semaines 1 et 2 sont bouclées. Importez votre PDF de la 3ᵉ semaine pour suivre les cours en temps réel.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setImportOuvert(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand hover:bg-brand-hover text-canvas font-sans text-xs font-semibold px-3.5 py-2 transition-colors whitespace-nowrap"
          >
            <IconDownload width={12} height={12} />
            Ajouter la semaine 3
          </button>
        </div>
      )}

      <div key={`${vue}-${semaine.lundi}`} className="animate-fade-in-up">
        {vue === "semaine" && <PartitionSemaine semaine={semaine} maintenant={maintenant} />}
        {vue === "journee" && <CadranJournee semaine={semaine} maintenant={maintenant} />}
        {vue === "progression" && (
          <div className="flex flex-col gap-4">
            <FilDuJour />
            <FilsProgression semaine={semaine} maintenant={maintenant} />
          </div>
        )}
      </div>

      <details className="group rounded-lg border border-hairline bg-canvas">
        <summary className="flex items-center justify-between gap-3 px-5 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <span className="font-sans text-sm text-ink">
            À vérifier dans l&apos;emploi du temps
            <span className="text-text-muted"> · {semaine.aVerifier.length} points</span>
          </span>
          <span className="text-text-muted transition-transform duration-200 group-open:rotate-90" aria-hidden>
            <IconArrowRight width={13} height={13} />
          </span>
        </summary>
        <ul className="flex flex-col gap-2 px-5 pb-4">
          {semaine.aVerifier.map((point) => (
            <li key={point} className="flex gap-2.5 font-sans text-sm text-text-muted leading-snug">
              <span className="mt-[7px] h-1 w-1 rounded-full bg-text-secondary shrink-0" aria-hidden />
              {point}
            </li>
          ))}
        </ul>

        {semaine.source === "import" && (
          <div className="flex items-center gap-3 flex-wrap px-5 py-3 border-t border-hairline">
            {confirmerSuppression ? (
              <>
                <span className="font-sans text-sm text-ink">
                  Supprimer la semaine {semaine.numero} importée ? Le PDF reste dans vos fichiers.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    supprimerSemaine(semaine.lundi);
                    setLundiChoisi(null);
                    setConfirmerSuppression(false);
                  }}
                  className="rounded-md bg-accent-deep text-canvas font-sans text-xs font-medium px-3 py-1.5"
                >
                  Supprimer
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmerSuppression(false)}
                  className="font-sans text-xs text-text-muted hover:text-ink transition-colors"
                >
                  Annuler
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmerSuppression(true)}
                className="font-sans text-xs text-text-muted hover:text-accent-deep transition-colors"
              >
                Supprimer cette semaine importée
              </button>
            )}
          </div>
        )}
      </details>
    </div>
  );
}
