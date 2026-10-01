"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SemaineProgramme } from "@/content/emploi-du-temps";
import {
  moduleMeta,
  enMinutes,
  formatHeure,
  formatDuree,
  formatRelatif,
  libelleJour,
  dureeSeance,
  seancesChronologiques,
  seanceActuelleOuProchaine,
  semaineParDefaut,
} from "@/lib/programme";
import { useSemaines } from "@/lib/semaines";
import { cleJour } from "@/lib/rituel";
import { IconArrowRight } from "./icons";

/*
 * L'entrée du programme sur la vue d'ensemble : la miniature de la semaine en
 * cours, le prochain cours, et un accès direct à chacune des trois vues.
 */

const TA = 7 * 60 + 30;
const TB = 18 * 60 + 30;
const WM = 184;
const HAUT_RANG = 7;
const PAS_RANG = 10;

function Miniature({ semaine, maintenant }: { semaine: SemaineProgramme; maintenant: Date | null }) {
  const jours = semaine.jours;
  const hm = jours.length * PAS_RANG;
  const xm = (min: number) => ((min - TA) / (TB - TA)) * WM;
  const aujourdhui = maintenant ? cleJour(maintenant) : null;
  const mNow = maintenant ? maintenant.getHours() * 60 + maintenant.getMinutes() : null;

  return (
    <svg viewBox={`0 0 ${WM} ${hm}`} width={WM} height={hm} role="img" aria-label="Miniature de la semaine" className="shrink-0">
      {jours.map((j, i) => {
        const top = i * PAS_RANG + 1;
        return (
          <g key={j.date}>
            <rect x={0} y={top} width={WM} height={HAUT_RANG} rx={2} fill="var(--color-surface-secondary)" />
            {j.blocs
              .filter((b) => b.type === "libre" || b.type === "a-confirmer" || b.type === "bilan")
              .map((b) => (
                <rect
                  key={b.id}
                  x={xm(enMinutes(b.debut)) + 0.5}
                  y={top + 0.5}
                  width={Math.max(1, xm(enMinutes(b.fin)) - xm(enMinutes(b.debut)) - 1)}
                  height={HAUT_RANG - 1}
                  rx={1.5}
                  fill="none"
                  stroke="var(--color-neutre-fort)"
                  strokeDasharray="1.5 1.5"
                />
              ))}
            {j.seances.map((s) => (
              <rect
                key={s.id}
                x={xm(enMinutes(s.debut)) + 0.5}
                y={top}
                width={xm(enMinutes(s.fin)) - xm(enMinutes(s.debut)) - 1}
                height={HAUT_RANG}
                rx={1.5}
                fill={moduleMeta[s.moduleId].couleur}
              />
            ))}
            {aujourdhui === j.date && mNow !== null && mNow >= TA && mNow <= TB && (
              <line x1={xm(mNow)} x2={xm(mNow)} y1={top - 1} y2={top + HAUT_RANG + 1} stroke="var(--color-accent-deep)" strokeWidth={1.4} />
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function ProgrammeApercu() {
  const [maintenant, setMaintenant] = useState<Date | null>(null);
  const semaines = useSemaines();

  useEffect(() => {
    setMaintenant(new Date());
    const minuterie = window.setInterval(() => setMaintenant(new Date()), 60_000);
    return () => window.clearInterval(minuterie);
  }, []);

  const semaine = semaineParDefaut(semaines, maintenant);
  const seances = seancesChronologiques(semaine);
  const minutes = seances.reduce((n, s) => n + dureeSeance(s.seance), 0);
  const suivante = maintenant ? seanceActuelleOuProchaine(semaine, maintenant) : undefined;

  const vues = [
    { cle: "semaine", label: "Vue d'ensemble" },
    { cle: "journee", label: "Journée" },
    { cle: "progression", label: "Progression" },
  ];

  return (
    <section
      className="rounded-lg border border-hairline bg-canvas p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center gap-4 xl:gap-6"
      aria-label="Programme de la semaine"
    >
      <div className="min-w-0 xl:w-52 shrink-0">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
          Programme · Semaine {semaine.numero}
        </p>
        <p className="font-serif text-lg text-ink leading-tight mt-0.5">{semaine.libelle}</p>
        <p className="font-sans text-xs text-text-muted mt-0.5 tabular-nums">
          {seances.length} séances · {formatDuree(minutes)} · salle {semaine.salle}
        </p>
      </div>

      <Miniature semaine={semaine} maintenant={maintenant} />

      <div className="flex-1 min-w-0 min-h-[46px] flex items-center">
        {!maintenant ? null : suivante ? (
          <div className="flex items-stretch gap-3 min-w-0">
            <span
              className="w-1 rounded-full shrink-0"
              style={{ background: moduleMeta[suivante.item.seance.moduleId].couleur }}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="font-sans text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                {suivante.etat === "en-cours" ? "En cours" : "Prochain cours"}
              </p>
              <p className="font-sans text-sm font-medium text-ink truncate">{suivante.item.seance.intitule}</p>
              <p className="font-sans text-xs text-text-muted tabular-nums truncate">
                {libelleJour(suivante.item.jour)} · {formatHeure(enMinutes(suivante.item.seance.debut))} –{" "}
                {formatHeure(enMinutes(suivante.item.seance.fin))} · {suivante.item.seance.salle} ·{" "}
                {suivante.etat === "en-cours" ? "maintenant" : formatRelatif(maintenant, suivante.item.debut)}
              </p>
            </div>
          </div>
        ) : (
          <p className="font-sans text-sm text-text-muted">
            Semaine {semaine.numero} bouclée —{" "}
            <Link href="/objectifs/programme?importer=1" className="text-brand hover:underline">
              importer l&apos;emploi du temps suivant
            </Link>
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
        {vues.map((v, i) => (
          <Link
            key={v.cle}
            href={`/objectifs/programme?vue=${v.cle}`}
            className={`flex items-center gap-1.5 rounded-md px-3 py-2 font-sans text-xs font-medium transition-colors ${
              i === 0
                ? "bg-brand text-canvas hover:bg-brand-hover"
                : "border border-hairline text-ink hover:border-text-secondary"
            }`}
          >
            {v.label}
            {i === 0 && <IconArrowRight width={12} height={12} />}
          </Link>
        ))}
      </div>
    </section>
  );
}
