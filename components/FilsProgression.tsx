"use client";

import { useObjectifsState } from "@/lib/objectifs-store";
import type { ModuleId, SemaineProgramme } from "@/content/emploi-du-temps";
import {
  moduleMeta,
  formatDuree,
  formatHeure,
  formatRelatif,
  enMinutes,
  libelleJour,
  dureeSeance,
  etatSeance,
  seancesChronologiques,
  seanceActuelleOuProchaine,
  type SeanceDatee,
} from "@/lib/programme";

/*
 * Les fils de la progression.
 *
 * Chaque module est un fil tendu, chaque séance une perle : creuse tant qu'elle
 * est à venir, pleine quand elle est passée, cochée quand vous l'avez révisée
 * le soir même. Au-dessus, le ruban de la semaine se remplit au rythme réel des
 * heures de cours — c'est le temps qui avance, pas une case que l'on coche.
 */

const ORDRE: ModuleId[] = ["ia", "datamining", "sih", "python", "bdd", "web", "eco", "anglais", "francais"];

function Poids({ n }: { n: number }) {
  return (
    <span className="flex items-end gap-[2px]" aria-label={`Poids ${n} sur 3`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-sm"
          style={{ height: 3 + i * 2, background: i <= n ? "var(--color-ink)" : "var(--color-surface-warm)" }}
        />
      ))}
    </span>
  );
}

function Tuile({ label, valeur, sous }: { label: string; valeur: string; sous: string }) {
  return (
    <div className="rounded-md border border-hairline px-4 py-3">
      <p className="font-sans text-[11px] text-text-secondary">{label}</p>
      <p className="font-sans text-xl font-semibold text-ink tabular-nums leading-tight mt-0.5">{valeur}</p>
      <p className="font-sans text-[11px] text-text-muted mt-0.5 leading-snug">{sous}</p>
    </div>
  );
}

export function FilsProgression({
  semaine,
  maintenant,
}: {
  semaine: SemaineProgramme;
  maintenant: Date | null;
}) {
  const { state, hydrated, basculerSeanceRevisee } = useObjectifsState();
  const revisees = hydrated ? state.seancesRevisees : [];

  const toutes = seancesChronologiques(semaine);
  const t = maintenant?.getTime() ?? 0;
  const etat = (s: SeanceDatee) => etatSeance(s, maintenant);

  const totalMin = toutes.reduce((n, s) => n + dureeSeance(s.seance), 0);
  const ecoule = toutes.reduce((n, s) => {
    const e = etat(s);
    if (e === "passee") return n + dureeSeance(s.seance);
    if (e === "en-cours") return n + Math.floor((t - s.debut.getTime()) / 60_000);
    return n;
  }, 0);
  const passees = toutes.filter((s) => etat(s) === "passee");
  const nbRevisees = passees.filter((s) => revisees.includes(s.seance.id)).length;
  const suivante = maintenant ? seanceActuelleOuProchaine(semaine, maintenant) : undefined;
  const premiere = toutes[0];

  const parJour = semaine.jours
    .filter((j) => j.seances.length > 0)
    .map((jour) => ({ jour, items: toutes.filter((s) => s.jour.date === jour.date) }));

  function basculerGroupe(groupe: SeanceDatee[], toutesRevisees: boolean) {
    for (const s of groupe) {
      const estRevisee = revisees.includes(s.seance.id);
      if (toutesRevisees ? estRevisee : !estRevisee) basculerSeanceRevisee(s.seance.id);
    }
  }

  return (
    <div className="rounded-lg border border-hairline bg-canvas">
      {/* Le ruban de la semaine */}
      <div className="px-5 pt-5 pb-4 border-b border-hairline">
        <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
            Le ruban de la semaine
          </p>
          <p className="font-sans text-xs text-text-muted tabular-nums">
            {formatDuree(ecoule)} écoulées sur {formatDuree(totalMin)}
          </p>
        </div>

        <div className="flex gap-2">
          {parJour.map(({ jour, items }) => {
            const minutesJour = items.reduce((n, s) => n + dureeSeance(s.seance), 0);
            return (
              <div key={jour.date} className="min-w-0" style={{ flexGrow: minutesJour, flexBasis: 0 }}>
                <div className="flex gap-[2px] h-4">
                  {items.map((s) => {
                    const d = dureeSeance(s.seance);
                    const e = etat(s);
                    const part =
                      e === "passee"
                        ? 1
                        : e === "en-cours"
                          ? Math.min(1, (t - s.debut.getTime()) / (s.fin.getTime() - s.debut.getTime()))
                          : 0;
                    const c = moduleMeta[s.seance.moduleId].couleur;
                    return (
                      <div
                        key={s.seance.id}
                        className="relative rounded-[3px] overflow-hidden"
                        style={{ flexGrow: d, flexBasis: 0, background: `color-mix(in srgb, ${c} 22%, var(--color-canvas))` }}
                        title={`${s.seance.intitule} — ${libelleJour(s.jour)} ${formatHeure(enMinutes(s.seance.debut))}`}
                      >
                        <div
                          className="absolute inset-y-0 left-0 transition-[width] duration-700"
                          style={{ width: `${part * 100}%`, background: c }}
                        />
                      </div>
                    );
                  })}
                </div>
                <p className="font-sans text-[10px] text-text-secondary mt-1.5 truncate">{libelleJour(jour)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Les chiffres qui comptent */}
      <div className="grid sm:grid-cols-3 gap-3 px-5 py-4 border-b border-hairline">
        <Tuile
          label="Séances passées"
          valeur={`${passees.length}/${toutes.length}`}
          sous={
            passees.length > 0
              ? `${nbRevisees} révisée${nbRevisees > 1 ? "s" : ""} à chaud`
              : `La première : ${libelleJour(premiere.jour).toLowerCase()} à ${formatHeure(enMinutes(premiere.seance.debut))}`
          }
        />
        <Tuile
          label="Révision à chaud"
          valeur={passees.length > 0 ? `${Math.round((nbRevisees / passees.length) * 100)} %` : "—"}
          sous="des séances passées, révisées le soir même"
        />
        <Tuile
          label={suivante?.etat === "en-cours" ? "En cours" : "Prochaine séance"}
          valeur={suivante ? moduleMeta[suivante.item.seance.moduleId].court : "Semaine bouclée"}
          sous={
            suivante && maintenant
              ? suivante.etat === "en-cours"
                ? `jusqu'à ${formatHeure(enMinutes(suivante.item.seance.fin))} · ${suivante.item.seance.salle}`
                : `${libelleJour(suivante.item.jour)} · ${formatHeure(enMinutes(suivante.item.seance.debut))} · ${formatRelatif(maintenant, suivante.item.debut)}`
              : "Semaine terminée : importez la suivante"
          }
        />
      </div>

      {/* Un fil par module */}
      <ul className="divide-y divide-hairline px-5">
        {ORDRE.map((id) => {
          const meta = moduleMeta[id];
          const items = toutes.filter((s) => s.seance.moduleId === id);

          if (items.length === 0) {
            return (
              <li key={id} className="flex items-center gap-3 py-3.5">
                <span className="h-2.5 w-2.5 rounded-full shrink-0 opacity-40" style={{ background: meta.couleur }} />
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-sm text-text-muted truncate">{meta.nom}</p>
                  <p className="flex items-center gap-2 font-sans text-[11px] text-text-secondary">
                    <Poids n={meta.utilite} /> Pas au programme de la semaine {semaine.numero}
                  </p>
                </div>
              </li>
            );
          }

          const total = items[0].seance.total;
          const parNumero = new Map<number, SeanceDatee[]>();
          for (const s of items) {
            parNumero.set(s.seance.numero, [...(parNumero.get(s.seance.numero) ?? []), s]);
          }
          const doublon = [...parNumero.values()].some((g) => g.length > 1);
          const minutes = items.reduce((n, s) => n + dureeSeance(s.seance), 0);
          const nbPassees = items.filter((s) => etat(s) === "passee").length;
          const prochaine = items.find((s) => etat(s) !== "passee");
          const largeur = total * 15 + 6;

          return (
            <li
              key={id}
              className="grid md:grid-cols-[230px_minmax(0,1fr)_170px] items-center gap-x-5 gap-y-2 py-3.5"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: meta.couleur }} />
                <div className="min-w-0">
                  <p className="font-sans text-sm font-medium text-ink truncate">{meta.nom}</p>
                  <p className="flex items-center gap-2 font-sans text-[11px] text-text-muted">
                    <Poids n={meta.utilite} /> {formatDuree(minutes)} cette semaine
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto no-scrollbar">
                <svg width={largeur} height={22} role="img" aria-label={`${meta.nom} : ${nbPassees} séance(s) passée(s) sur ${total}`}>
                  <line x1={6} x2={largeur - 6} y1={11} y2={11} stroke="var(--color-hairline)" strokeWidth={1.5} />
                  {Array.from({ length: total }, (_, i) => {
                    const k = i + 1;
                    const cx = 8 + i * 15;
                    const groupe = parNumero.get(k) ?? [];

                    if (groupe.length === 0) {
                      return (
                        <circle key={k} cx={cx} cy={11} r={4} fill="var(--color-canvas)" stroke="var(--color-neutre-fort)" strokeWidth={1.2}>
                          <title>{`Séance ${k} — semaines suivantes`}</title>
                        </circle>
                      );
                    }

                    const etats = groupe.map(etat);
                    const passe = etats.every((e) => e === "passee");
                    const enCours = etats.includes("en-cours");
                    const rev = groupe.every((s) => revisees.includes(s.seance.id));
                    const quand = groupe
                      .map((s) => `${libelleJour(s.jour)} ${formatHeure(enMinutes(s.seance.debut))}`)
                      .join(" et ");

                    return (
                      <g
                        key={k}
                        role={passe ? "button" : undefined}
                        tabIndex={passe ? 0 : undefined}
                        aria-pressed={passe ? rev : undefined}
                        onClick={passe ? () => basculerGroupe(groupe, rev) : undefined}
                        onKeyDown={
                          passe
                            ? (e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  basculerGroupe(groupe, rev);
                                }
                              }
                            : undefined
                        }
                        style={{ cursor: passe ? "pointer" : "default", outline: "none" }}
                      >
                        <title>
                          {`Séance ${k} · ${quand}${groupe.length > 1 ? " · numéro en double dans l'EDT" : ""}${
                            passe ? (rev ? " · révisée à chaud" : " · toucher pour marquer révisée") : ""
                          }`}
                        </title>
                        {groupe.length > 1 && (
                          <circle cx={cx} cy={11} r={8} fill="none" stroke={meta.couleur} strokeOpacity={0.45} />
                        )}
                        {passe ? (
                          <circle cx={cx} cy={11} r={5.5} fill={meta.couleur} fillOpacity={rev ? 1 : 0.45} />
                        ) : (
                          <circle
                            cx={cx}
                            cy={11}
                            r={enCours ? 5.2 : 4.6}
                            fill="var(--color-canvas)"
                            stroke={meta.couleur}
                            strokeWidth={enCours ? 2.8 : 1.7}
                            className={enCours ? "animate-pulse" : undefined}
                          />
                        )}
                        {passe && rev && (
                          <path
                            d={`M ${cx - 2.5} 11.2 l 1.7 1.8 l 3.3 -3.5`}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth={1.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="font-sans md:text-right">
                <p className="text-xs text-ink tabular-nums">
                  {nbPassees}/{items.length} passée{nbPassees > 1 ? "s" : ""}
                  <span className="text-text-muted"> · {total} au total</span>
                </p>
                <p className="text-[11px] text-text-muted">
                  {prochaine
                    ? `${etat(prochaine) === "en-cours" ? "en cours" : "prochaine"} : ${libelleJour(prochaine.jour).toLowerCase()} à ${formatHeure(enMinutes(prochaine.seance.debut))}`
                    : "semaine bouclée"}
                </p>
                {doublon && <p className="text-[11px] text-accent-clay">Numéro de séance en double dans l&apos;EDT</p>}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Légende des perles */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 border-t border-hairline font-sans text-[11px] text-text-secondary">
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" aria-hidden><circle cx="6" cy="6" r="4" fill="var(--color-canvas)" stroke="var(--color-neutre-fort)" strokeWidth="1.2" /></svg>
          semaines suivantes
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" aria-hidden><circle cx="6" cy="6" r="4.3" fill="var(--color-canvas)" stroke="var(--color-ink)" strokeWidth="1.6" /></svg>
          à venir cette semaine
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" aria-hidden><circle cx="6" cy="6" r="5" fill="var(--color-ink)" fillOpacity="0.45" /></svg>
          passée
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" aria-hidden>
            <circle cx="6" cy="6" r="5" fill="var(--color-ink)" />
            <path d="M3.6 6.2l1.6 1.7 3.1-3.3" fill="none" stroke="var(--color-canvas)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          révisée à chaud (toucher une perle passée)
        </span>
      </div>
    </div>
  );
}
