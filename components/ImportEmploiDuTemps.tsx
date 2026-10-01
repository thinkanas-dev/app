"use client";

import { Fragment, useRef, useState } from "react";
import type { ModuleId } from "@/content/emploi-du-temps";
import { useObjectifsState } from "@/lib/objectifs-store";
import { lirePremierePage, type PdfjsMinimal } from "@/lib/lecture-pdf";
import { lireEmploiDuTemps, MODULES_RECONNUS, type EmploiDuTempsLu, type SeanceLue } from "@/lib/import-edt";
import { construireSemaine } from "@/lib/plan-semaine";
import { horairesPriere } from "@/lib/horaires-priere";
import { moduleMeta, numeroDeSemaine, formatHeure, enMinutes } from "@/lib/programme";
import { addPdf } from "@/lib/file-store";
import { libelleSemaine, lundiDe, toISO } from "@/lib/semaine";
import { IconDownload } from "./icons";

/*
 * Import d'un emploi du temps : on dépose le PDF, l'import propose une semaine
 * complète, et rien n'est enregistré sans validation. Les cases douteuses sont
 * montrées en orange ; un module non reconnu doit être choisi avant de pouvoir
 * enregistrer.
 */

const JOURS_COURTS = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];

/** pdf.js n'est chargé qu'au moment de lire un PDF : il pèse lourd et ne sert qu'ici. */
async function chargerPdfjs(): Promise<PdfjsMinimal> {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
  }
  return pdfjs as unknown as PdfjsMinimal;
}

type Etape =
  | { nom: "choix" }
  | { nom: "lecture" }
  | { nom: "erreur"; message: string }
  | { nom: "apercu"; lu: EmploiDuTempsLu; fichier: File };

const cleCase = (s: { jourIndex: number; creneauIndex: number }) => `${s.jourIndex}-${s.creneauIndex}`;

export function ImportEmploiDuTemps({
  lundisExistants,
  onFermer,
  onImportee,
}: {
  lundisExistants: string[];
  onFermer: () => void;
  onImportee: (lundi: string) => void;
}) {
  const { enregistrerSemaine } = useObjectifsState();
  const [etape, setEtape] = useState<Etape>({ nom: "choix" });
  const [choixModules, setChoixModules] = useState<Record<string, ModuleId>>({});
  const [lundi, setLundi] = useState("");
  const [survolDepot, setSurvolDepot] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);
  const fichierRef = useRef<HTMLInputElement>(null);

  async function lire(fichier: File | undefined) {
    if (!fichier) return;
    if (fichier.type !== "application/pdf" && !fichier.name.toLowerCase().endsWith(".pdf")) {
      setEtape({ nom: "erreur", message: "Seuls les fichiers PDF sont acceptés." });
      return;
    }
    setEtape({ nom: "lecture" });
    try {
      const pdfjs = await chargerPdfjs();
      const page = await lirePremierePage(pdfjs, new Uint8Array(await fichier.arrayBuffer()));
      const lu = lireEmploiDuTemps(page);
      if (lu.erreur) {
        setEtape({ nom: "erreur", message: lu.erreur });
        return;
      }
      setChoixModules({});
      setLundi(lu.lundi ?? "");
      setEtape({ nom: "apercu", lu, fichier });
    } catch {
      setEtape({
        nom: "erreur",
        message: "Lecture impossible : le fichier est peut-être protégé ou endommagé.",
      });
    } finally {
      if (fichierRef.current) fichierRef.current.value = "";
    }
  }

  const moduleDe = (s: SeanceLue): ModuleId | null => s.moduleId ?? choixModules[cleCase(s)] ?? null;

  async function enregistrer(lu: EmploiDuTempsLu, fichier: File) {
    if (!lundi) return;
    setEnregistrement(true);

    const utilite = Object.fromEntries(
      Object.entries(moduleMeta).map(([id, m]) => [id, m.utilite])
    ) as Record<ModuleId, number>;
    const nomsCourts = Object.fromEntries(
      Object.entries(moduleMeta).map(([id, m]) => [id, m.court])
    ) as Record<ModuleId, string>;

    const seances = lu.seances.map((s) => {
      const moduleId = moduleDe(s) as ModuleId;
      const intitule = s.moduleId
        ? s.intitule
        : MODULES_RECONNUS.find((m) => m.id === moduleId)?.intitule ?? s.intitule;
      return {
        jourIndex: s.jourIndex,
        creneauIndex: s.creneauIndex,
        moduleId,
        intitule,
        prof: s.prof,
        format: s.format,
        numero: s.numero,
        total: s.total,
        salle: s.salle,
        debut: s.debut,
        fin: s.fin,
      };
    });

    const aVerifier = [
      ...lu.avertissements.filter((a) => !a.includes("module non reconnu")),
      ...(lu.lundi && lu.lundi !== lundi
        ? [`Dates corrigées à la main : semaine ${libelleSemaine(lundi)} au lieu de ${libelleSemaine(lu.lundi)}.`]
        : []),
      "Horaires de prière calculés pour Casablanca, vérifiés à ±1 min sur septembre 2026.",
    ];

    const semaine = construireSemaine({
      numero: numeroDeSemaine(lundi),
      lundi,
      salle: lu.salle || "—",
      groupe: lu.groupe || "—",
      creneaux: lu.creneaux,
      seances,
      casesSansTexte: lu.casesSansTexte,
      aVerifier,
      prieres: horairesPriere,
      utilite,
      nomsCourts,
    });

    enregistrerSemaine(semaine);
    try {
      await addPdf(fichier, semaine.numero, "semaine", libelleSemaine(lundi), lundi);
    } catch {
      // La semaine est enregistrée même si la copie du PDF est refusée par le navigateur
    }
    setEnregistrement(false);
    onImportee(lundi);
  }

  return (
    <section className="rounded-lg border border-hairline bg-canvas animate-fade-in-up" aria-label="Importer un emploi du temps">
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-hairline">
        <div>
          <h2 className="font-sans font-semibold text-base text-ink">Importer un emploi du temps</h2>
          <p className="font-sans text-xs text-text-muted mt-0.5">
            Le PDF est lu dans ce navigateur : il n&apos;est envoyé nulle part.
          </p>
        </div>
        <button
          type="button"
          onClick={onFermer}
          className="font-sans text-xs text-text-muted hover:text-ink transition-colors shrink-0"
        >
          Refermer
        </button>
      </div>

      <input
        ref={fichierRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => lire(e.target.files?.[0])}
        aria-label="Choisir le PDF de l'emploi du temps"
      />

      {(etape.nom === "choix" || etape.nom === "erreur") && (
        <div className="p-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setSurvolDepot(true);
            }}
            onDragLeave={() => setSurvolDepot(false)}
            onDrop={(e) => {
              e.preventDefault();
              setSurvolDepot(false);
              lire(e.dataTransfer.files?.[0]);
            }}
            className={`rounded-lg border-2 border-dashed px-6 py-9 flex flex-col items-center text-center gap-3 transition-colors ${
              survolDepot ? "border-brand bg-brand-soft/50" : "border-hairline"
            }`}
          >
            <span className="h-10 w-10 rounded-full bg-brand-soft text-brand flex items-center justify-center">
              <IconDownload width={18} height={18} />
            </span>
            <p className="font-sans text-sm font-medium text-ink">Déposez le PDF de l&apos;emploi du temps</p>
            <p className="font-sans text-xs text-text-muted max-w-md leading-relaxed">
              Jours, créneaux, modules, professeurs, salles et numéros de séance sont lus automatiquement.
              Le rituel, le hizb, les révisions et les horaires de prière sont posés autour. Vous validez avant
              d&apos;enregistrer.
            </p>
            <button
              type="button"
              onClick={() => fichierRef.current?.click()}
              className="rounded-md bg-brand hover:bg-brand-hover text-canvas font-sans text-sm font-medium px-4 py-2 transition-colors"
            >
              Choisir un fichier
            </button>
          </div>
          {etape.nom === "erreur" && (
            <p className="font-sans text-sm text-accent-deep mt-3" role="alert">
              {etape.message}
            </p>
          )}
        </div>
      )}

      {etape.nom === "lecture" && (
        <p className="px-5 py-10 font-sans text-sm text-text-muted text-center" role="status">
          Lecture du PDF…
        </p>
      )}

      {etape.nom === "apercu" && (
        <Apercu
          lu={etape.lu}
          lundi={lundi}
          onLundi={(v) => setLundi(toISO(lundiDe(new Date(v + "T00:00:00"))))}
          remplace={lundisExistants.includes(lundi)}
          choixModules={choixModules}
          onChoix={(cle, id) => setChoixModules((prec) => ({ ...prec, [cle]: id }))}
          nonResolues={etape.lu.seances.filter((s) => !moduleDe(s)).length}
          enregistrement={enregistrement}
          onEnregistrer={() => enregistrer(etape.lu, etape.fichier)}
          onAutre={() => fichierRef.current?.click()}
          onAnnuler={onFermer}
        />
      )}
    </section>
  );
}

function Apercu({
  lu,
  lundi,
  onLundi,
  remplace,
  choixModules,
  onChoix,
  nonResolues,
  enregistrement,
  onEnregistrer,
  onAutre,
  onAnnuler,
}: {
  lu: EmploiDuTempsLu;
  lundi: string;
  onLundi: (valeur: string) => void;
  remplace: boolean;
  choixModules: Record<string, ModuleId>;
  onChoix: (cle: string, id: ModuleId) => void;
  nonResolues: number;
  enregistrement: boolean;
  onEnregistrer: () => void;
  onAutre: () => void;
  onAnnuler: () => void;
}) {
  const numero = lundi ? numeroDeSemaine(lundi) : null;
  const peutEnregistrer = Boolean(lundi) && nonResolues === 0 && !enregistrement;

  return (
    <div className="flex flex-col">
      {/* Ce qui a été compris */}
      <div className="flex items-end justify-between gap-4 flex-wrap px-5 py-4 border-b border-hairline">
        <div className="min-w-0">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
            Semaine lue
          </p>
          <p className="font-serif text-xl text-ink leading-tight mt-0.5">
            {numero !== null ? `Semaine ${numero}` : "Semaine à dater"}
            {lundi && <span className="text-text-muted"> · {libelleSemaine(lundi)}</span>}
          </p>
          <p className="font-sans text-xs text-text-muted mt-1 tabular-nums">
            {lu.seances.length} séances · salle {lu.salle || "—"} · {lu.groupe || "groupe —"}
            {lu.semestre !== null && ` · semestre ${lu.semestre}`}
          </p>
        </div>
        <label className="flex flex-col gap-1">
          <span className="font-sans text-xs text-text-muted">Semaine du</span>
          <input
            type="date"
            value={lundi}
            onChange={(e) => e.target.value && onLundi(e.target.value)}
            className="bg-canvas text-ink font-sans text-sm rounded-md border border-hairline px-2.5 py-1.5 outline-none focus:border-brand transition-colors"
          />
        </label>
      </div>

      {remplace && (
        <p className="px-5 py-2.5 border-b border-hairline bg-brand-soft/40 font-sans text-xs text-ink">
          Une semaine commençant ce lundi existe déjà : l&apos;import la remplacera. Les séances déjà cochées
          « révisées » restent cochées.
        </p>
      )}

      {/* La grille telle que lue */}
      <div className="overflow-x-auto px-5 py-4">
        <div className="grid min-w-[640px]" style={{ gridTemplateColumns: "64px repeat(6, minmax(0, 1fr))" }}>
          <div />
          {JOURS_COURTS.map((j) => (
            <div key={j} className="pb-2 font-sans text-[11px] font-semibold text-text-secondary text-center">
              {j}
            </div>
          ))}

          {lu.creneaux.map((c, k) => (
            <Fragment key={c.debut}>
              <div className="pr-2 py-1 font-sans text-[10px] text-text-muted tabular-nums text-right leading-tight">
                {formatHeure(enMinutes(c.debut))}
                <br />
                {formatHeure(enMinutes(c.fin))}
              </div>
              {JOURS_COURTS.map((_, j) => {
                const s = lu.seances.find((x) => x.jourIndex === j && x.creneauIndex === k);
                const sansTexte = lu.casesSansTexte.find(
                  (x) => x.jourIndex === j && enMinutes(x.debut) <= enMinutes(c.debut) && enMinutes(c.fin) <= enMinutes(x.fin)
                );

                if (s) {
                  const id = s.moduleId ?? choixModules[cleCase(s)] ?? null;
                  if (!s.moduleId) {
                    return (
                      <div key={j} className="p-1">
                        <div className="h-full rounded-md px-2 py-1.5 border border-dashed border-accent-clay bg-accent-clay/5">
                          <p className="font-sans text-[10px] text-accent-clay leading-tight line-clamp-2" title={s.brut}>
                            {s.brut}
                          </p>
                          <select
                            value={id ?? ""}
                            onChange={(e) => e.target.value && onChoix(cleCase(s), e.target.value as ModuleId)}
                            aria-label={`Module de la case ${JOURS_COURTS[j]} ${s.debut}`}
                            className="mt-1 w-full rounded border border-hairline bg-canvas font-sans text-[11px] text-ink px-1 py-0.5"
                          >
                            <option value="">Quel module ?</option>
                            {MODULES_RECONNUS.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.court}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  }
                  const couleur = moduleMeta[s.moduleId].couleur;
                  return (
                    <div key={j} className="p-1">
                      <div
                        className="h-full rounded-md px-2 py-1.5 border-l-[3px]"
                        style={{ borderColor: couleur, background: `color-mix(in srgb, ${couleur} 14%, var(--color-canvas))` }}
                        title={s.brut}
                      >
                        <p className="font-sans text-[11px] font-semibold text-ink leading-tight truncate">
                          {moduleMeta[s.moduleId].court}
                        </p>
                        <p className="font-sans text-[10px] text-text-muted leading-tight truncate tabular-nums">
                          {s.numero}/{s.total}
                          {s.salle !== lu.salle ? ` · ${s.salle}` : ""}
                        </p>
                        <p className="font-sans text-[10px] text-text-secondary leading-tight truncate">
                          {s.prof.replace(/^Pr /, "")}
                        </p>
                      </div>
                    </div>
                  );
                }

                if (sansTexte) {
                  return (
                    <div key={j} className="p-1">
                      <div
                        className="h-full min-h-[54px] rounded-md border border-dashed border-text-secondary flex items-center justify-center"
                        style={{ backgroundImage: "repeating-linear-gradient(45deg, var(--color-hairline) 0 1px, transparent 1px 6px)" }}
                      >
                        <span className="font-sans text-[10px] font-medium text-text-muted bg-canvas/90 rounded px-1">
                          À confirmer
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={j} className="p-1">
                    <div className="h-full min-h-[54px] rounded-md bg-surface-secondary/60" />
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Ce qui mérite un coup d'œil */}
      {lu.avertissements.length > 0 && (
        <div className="px-5 py-3.5 border-t border-hairline">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary mb-2">
            À vérifier · {lu.avertissements.length}
          </p>
          <ul className="flex flex-col gap-1.5">
            {lu.avertissements.map((a) => (
              <li key={a} className="flex gap-2.5 font-sans text-xs text-text-muted leading-snug">
                <span className="mt-[6px] h-1 w-1 rounded-full bg-accent-clay shrink-0" aria-hidden />
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap px-5 py-3.5 border-t border-hairline">
        <p className="font-sans text-xs text-text-muted">
          {!lundi
            ? "Indiquez la semaine concernée pour enregistrer."
            : nonResolues > 0
              ? `Choisissez le module des ${nonResolues} case${nonResolues > 1 ? "s" : ""} en orange pour enregistrer.`
              : "Tout est lisible : vérifiez la grille, puis enregistrez."}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAnnuler}
            className="rounded-md px-3 py-2 font-sans text-sm text-text-muted hover:text-ink transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onAutre}
            className="rounded-md border border-hairline px-3 py-2 font-sans text-sm text-ink hover:border-text-secondary transition-colors"
          >
            Autre PDF
          </button>
          <button
            type="button"
            onClick={onEnregistrer}
            disabled={!peutEnregistrer}
            className="rounded-md bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-canvas font-sans text-sm font-medium px-4 py-2 transition-colors"
          >
            {enregistrement ? "Enregistrement…" : numero !== null ? `Enregistrer la semaine ${numero}` : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
