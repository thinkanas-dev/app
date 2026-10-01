"use client";

import { useEffect, useRef, useState } from "react";
import { useObjectifsState } from "@/lib/objectifs-store";
import type { ModuleId, SemaineProgramme, TypePerso } from "@/content/emploi-du-temps";
import {
  moduleMeta,
  enMinutes,
  formatHeure,
  formatDuree,
  dateDe,
  libelleJour,
  dureeSeance,
  majuscule,
  etatSeance,
  seancesChronologiques,
  PRIERES_AFFICHEES,
  nomsPrieres,
  JOURS_COURTS,
  MOIS_COURTS,
  type SeanceDatee,
} from "@/lib/programme";
import { cleJour } from "@/lib/rituel";
import type { CarnetSeance } from "@/lib/objectifs-store";
import { DockSeance } from "@/components/seance/DockSeance";
import { TiroirSeance } from "@/components/seance/TiroirSeance";
import { COMPREHENSION, Glyphe, OUTILS, comptesCarnet, type OutilSeance } from "@/components/seance/outils";

/*
 * La partition de la semaine.
 *
 * Chaque jour est une portée posée sur son propre ciel : nuit, aube, plein jour,
 * crépuscule, calés sur Fajr, le lever, Maghrib et Isha. Les cours occupent la
 * ligne haute, la vie autour (rituel, hizb, révision, formation) la ligne basse.
 * Deux lignes pointillées traversent les jours — l'aube et le Maghrib — et
 * montrent à l'œil nu que les journées raccourcissent.
 */

const W = 1000;
const COL = 104;
const MARGE = 14;
const T0 = 5 * 60 + 30;
const T1 = 22 * 60;
const ENTETE = 48;
const RANG = 74;
const ECART = 10;

const CIEL_NUIT = "var(--color-ciel-nuit)";
const CIEL_JOUR = "var(--color-ciel-jour)";

const x = (min: number) => COL + ((min - T0) / (T1 - T0)) * (W - COL - MARGE);
const y = (i: number) => ENTETE + i * (RANG + ECART);

const ligneHaute = new Set<TypePerso>(["libre", "a-confirmer", "bilan"]);

const styleBas: Partial<Record<TypePerso, { fill: string; opacity: number }>> = {
  rituel: { fill: "var(--color-ink)", opacity: 0.85 },
  hizb: { fill: "var(--color-ink)", opacity: 0.32 },
  revision: { fill: "var(--color-brand)", opacity: 0.35 },
  formation: { fill: "var(--color-brand)", opacity: 0.85 },
};

export function PartitionSemaine({
  semaine,
  maintenant,
}: {
  semaine: SemaineProgramme;
  maintenant: Date | null;
}) {
  const { state, hydrated, basculerSeanceRevisee } = useObjectifsState();
  const [selection, setSelection] = useState<string | null>(null);
  const [survol, setSurvol] = useState<{ id: string; ancre: DOMRect } | null>(null);
  const [tiroir, setTiroir] = useState<{ id: string; outil: OutilSeance } | null>(null);
  const minuterieDock = useRef<number | null>(null);

  const jours = semaine.jours;
  const hauteur = y(jours.length - 1) + RANG + 40;
  const aujourdhui = maintenant ? cleJour(maintenant) : null;
  const minuteNow = maintenant ? maintenant.getHours() * 60 + maintenant.getMinutes() : null;

  const lumiere = jours.map((j) => enMinutes(j.prieres.maghrib) - enMinutes(j.prieres.shuruq));
  const perteLumiere = lumiere[0] - lumiere[lumiere.length - 1];
  const premierMaghrib = enMinutes(jours[0].prieres.maghrib);
  const dernierMaghrib = enMinutes(jours[jours.length - 1].prieres.maghrib);

  const chronologie = seancesChronologiques(semaine);
  const choisie = selection ? chronologie.find((s) => s.seance.id === selection) : undefined;
  const survolee = survol ? chronologie.find((s) => s.seance.id === survol.id) : undefined;
  const tiroirItem = tiroir ? chronologie.find((s) => s.seance.id === tiroir.id) : undefined;
  const carnets: Record<string, CarnetSeance> = hydrated ? state.carnetsSeances : {};

  // Heures de la semaine par module, dans l'ordre d'apparition
  const heures = new Map<ModuleId, number>();
  for (const s of chronologie) {
    heures.set(s.seance.moduleId, (heures.get(s.seance.moduleId) ?? 0) + dureeSeance(s.seance));
  }

  const ligneSoleil = (cle: "fajr" | "maghrib") =>
    jours.map((j, i) => `${x(enMinutes(j.prieres[cle])).toFixed(1)},${y(i) + RANG / 2}`).join(" ");

  function basculer(id: string) {
    setSelection((prec) => (prec === id ? null : id));
  }

  // La barre d'outils suit le survol, avec un court délai pour laisser la souris la rejoindre
  function garderDock() {
    if (minuterieDock.current) window.clearTimeout(minuterieDock.current);
  }
  function montrerDock(id: string, cible: Element) {
    garderDock();
    setSurvol({ id, ancre: cible.getBoundingClientRect() });
  }
  function cacherDockBientot() {
    garderDock();
    minuterieDock.current = window.setTimeout(() => setSurvol(null), 220);
  }
  function ouvrirOutil(id: string, outil: OutilSeance) {
    garderDock();
    setSurvol(null);
    setTiroir({ id, outil });
  }

  // Au défilement, la barre flottante perdrait sa séance : on la retire
  useEffect(() => {
    if (!survol) return;
    const retirer = () => setSurvol(null);
    window.addEventListener("scroll", retirer, true);
    window.addEventListener("resize", retirer);
    return () => {
      window.removeEventListener("scroll", retirer, true);
      window.removeEventListener("resize", retirer);
    };
  }, [survol]);

  useEffect(
    () => () => {
      if (minuterieDock.current) window.clearTimeout(minuterieDock.current);
    },
    []
  );

  return (
    <div className="rounded-lg border border-hairline bg-canvas">
      <div className="overflow-x-auto px-3 pt-4 pb-2">
        <svg
          viewBox={`0 0 ${W} ${hauteur}`}
          className="w-full min-w-[680px]"
          role="img"
          aria-label="Partition de la semaine : cours, prières et blocs personnels jour par jour"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          <defs>
            <linearGradient id="partition-aube" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor={CIEL_NUIT} />
              <stop offset="1" stopColor={CIEL_JOUR} />
            </linearGradient>
            <linearGradient id="partition-crepuscule" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor={CIEL_JOUR} />
              <stop offset="0.45" stopColor="var(--color-ciel-braise)" />
              <stop offset="1" stopColor={CIEL_NUIT} />
            </linearGradient>
            <pattern id="partition-hachures" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" fill="var(--color-canvas)" fillOpacity="0.75" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="var(--color-neutre)" strokeOpacity="0.4" strokeWidth="1.2" />
            </pattern>
            <pattern id="partition-croisillons" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="7" height="7" fill="var(--color-canvas)" fillOpacity="0.75" />
              <path d="M0 0V7M0 0H7" stroke="var(--color-neutre)" strokeOpacity="0.45" strokeWidth="1.1" />
            </pattern>
          </defs>

          {/* Échelle des heures */}
          {Array.from({ length: 17 }, (_, k) => 6 + k).map((h) => (
            <g key={h}>
              <line
                x1={x(h * 60)}
                x2={x(h * 60)}
                y1={ENTETE - 6}
                y2={hauteur - 34}
                stroke="var(--color-hairline)"
                strokeOpacity={h % 2 === 0 ? 1 : 0.5}
              />
              {h % 2 === 0 && (
                <text x={x(h * 60)} y={16} textAnchor="middle" fontSize={10} fill="var(--color-text-secondary)">
                  {h} h
                </text>
              )}
            </g>
          ))}

          {/* Prières de lundi, en repère */}
          {PRIERES_AFFICHEES.map((cle) => (
            <text
              key={cle}
              x={x(enMinutes(jours[0].prieres[cle]))}
              y={36}
              textAnchor="middle"
              fontSize={9}
              fill="var(--color-text-muted)"
            >
              {nomsPrieres[cle]}
            </text>
          ))}

          {jours.map((jour, i) => {
            const top = y(i);
            const p = jour.prieres;
            const fajr = enMinutes(p.fajr);
            const shuruq = enMinutes(p.shuruq);
            const maghrib = enMinutes(p.maghrib);
            const isha = enMinutes(p.isha);
            const d = dateDe(jour);
            const estAujourdhui = aujourdhui === jour.date;
            const n = jour.seances.length;

            return (
              <g key={jour.date}>
                {estAujourdhui && <rect x={0} y={top + 12} width={3} height={RANG - 24} rx={1.5} fill="var(--color-accent-deep)" />}
                <text x={12} y={top + 28} fontSize={13} fontWeight={600} fill="var(--color-ink)">
                  {majuscule(JOURS_COURTS[d.getDay()])}
                </text>
                <text x={12} y={top + 44} fontSize={10.5} fill="var(--color-text-muted)">
                  {d.getDate()} {MOIS_COURTS[d.getMonth()]}
                </text>
                <text x={12} y={top + 60} fontSize={9.5} fill="var(--color-text-secondary)">
                  {n === 0 ? "sans cours" : `${n} séance${n > 1 ? "s" : ""}`}
                </text>

                {/* Le ciel du jour */}
                <rect x={COL} y={top} width={W - COL - MARGE} height={RANG} rx={10} fill={CIEL_NUIT} />
                <rect x={x(fajr)} y={top} width={x(shuruq) - x(fajr)} height={RANG} fill="url(#partition-aube)" />
                <rect x={x(shuruq)} y={top} width={x(maghrib) - x(shuruq)} height={RANG} fill={CIEL_JOUR} />
                <rect x={x(maghrib)} y={top} width={x(isha) - x(maghrib)} height={RANG} fill="url(#partition-crepuscule)" />

                {/* Prières */}
                {PRIERES_AFFICHEES.map((cle) => (
                  <line
                    key={cle}
                    x1={x(enMinutes(p[cle]))}
                    x2={x(enMinutes(p[cle]))}
                    y1={top + 3}
                    y2={top + RANG - 3}
                    stroke="var(--color-ink)"
                    strokeOpacity={0.2}
                    strokeDasharray="1.5 2.5"
                  >
                    <title>{`${nomsPrieres[cle]} · ${p[cle]}`}</title>
                  </line>
                ))}

                {/* Ligne haute : créneaux libres, bilan, case à confirmer */}
                {jour.blocs
                  .filter((b) => ligneHaute.has(b.type))
                  .map((b) => {
                    const a = enMinutes(b.debut);
                    const f = enMinutes(b.fin);
                    const libelle = b.type === "libre" ? "Libre" : b.type === "bilan" ? "Bilan" : "À confirmer";
                    return (
                      <g key={b.id}>
                        <title>{`${b.titre} · ${formatHeure(a)} – ${formatHeure(f)}${b.detail ? ` — ${b.detail}` : ""}`}</title>
                        <rect
                          x={x(a) + 1}
                          y={top + 8}
                          width={x(f) - x(a) - 2}
                          height={40}
                          rx={6}
                          fill={b.type === "a-confirmer" ? "url(#partition-croisillons)" : "url(#partition-hachures)"}
                          stroke="var(--color-neutre)"
                          strokeOpacity={0.7}
                          strokeDasharray="3 3"
                        />
                        <text x={x(a) + 8} y={top + 24} fontSize={10} fontWeight={600} fill="var(--color-text-muted)">
                          {libelle}
                        </text>
                        <text x={x(a) + 8} y={top + 38} fontSize={9} fill="var(--color-text-secondary)">
                          {formatDuree(f - a)}
                        </text>
                      </g>
                    );
                  })}

                {/* Cours */}
                {jour.seances.map((s) => {
                  const a = enMinutes(s.debut);
                  const f = enMinutes(s.fin);
                  const meta = moduleMeta[s.moduleId];
                  const item = chronologie.find((c) => c.seance.id === s.id);
                  const passee = item ? etatSeance(item, maintenant) === "passee" : false;
                  const choisi = selection === s.id;
                  return (
                    <g
                      key={s.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={choisi}
                      aria-label={`${s.intitule}, ${libelleJour(jour, "long")}, ${formatHeure(a)} à ${formatHeure(f)}`}
                      onClick={() => basculer(s.id)}
                      onMouseEnter={(ev) => montrerDock(s.id, ev.currentTarget)}
                      onMouseLeave={cacherDockBientot}
                      onFocus={(ev) => montrerDock(s.id, ev.currentTarget)}
                      onBlur={cacherDockBientot}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          basculer(s.id);
                        }
                      }}
                      style={{ cursor: "pointer", outline: "none" }}
                    >
                      <title>{`${s.intitule} — ${s.prof} · ${formatHeure(a)} – ${formatHeure(f)}`}</title>
                      <rect
                        x={x(a) + 1}
                        y={top + 8}
                        width={x(f) - x(a) - 2}
                        height={40}
                        rx={6}
                        fill={meta.couleur}
                        fillOpacity={passee ? 0.1 : 0.2}
                        stroke={choisi ? meta.couleur : "none"}
                        strokeWidth={1.8}
                      />
                      <rect x={x(a) + 1} y={top + 8} width={3.5} height={40} rx={1.5} fill={meta.couleur} />
                      <text x={x(a) + 10} y={top + 24} fontSize={10.5} fontWeight={600} fill="var(--color-ink)" pointerEvents="none">
                        {meta.court}
                      </text>
                      <text x={x(a) + 10} y={top + 38} fontSize={9} fill="var(--color-text-muted)" pointerEvents="none">
                        {`${s.numero}/${s.total}${s.salle !== semaine.salle ? ` · ${s.salle}` : ""}`}
                      </text>
                      <IndicesCarnet carnet={carnets[s.id]} xDroite={x(f) - 8} yHaut={top + 15} yBas={top + 40} />
                    </g>
                  );
                })}

                {/* Ligne basse : la vie autour des cours */}
                {jour.blocs
                  .filter((b) => !ligneHaute.has(b.type))
                  .map((b) => {
                    const a = enMinutes(b.debut);
                    const f = enMinutes(b.fin);
                    const style = styleBas[b.type] ?? { fill: "var(--color-ink)", opacity: 0.3 };
                    return (
                      <g key={b.id}>
                        <title>{`${b.titre} · ${formatHeure(a)} – ${formatHeure(f)}${b.detail ? ` — ${b.detail}` : ""}`}</title>
                        <rect
                          x={x(a)}
                          y={top + 54}
                          width={Math.max(3, x(f) - x(a))}
                          height={10}
                          rx={3}
                          fill={style.fill}
                          fillOpacity={style.opacity}
                        />
                        {b.type === "rituel" && (
                          <circle
                            cx={x(a) + (x(f) - x(a)) / 2}
                            cy={top + 59}
                            r={4.5}
                            fill="var(--color-canvas)"
                            stroke="var(--color-ink)"
                            strokeWidth={1.6}
                          />
                        )}
                      </g>
                    );
                  })}

                {/* Maintenant */}
                {estAujourdhui && minuteNow !== null && minuteNow >= T0 && minuteNow <= T1 && (
                  <g pointerEvents="none">
                    <line x1={x(minuteNow)} x2={x(minuteNow)} y1={top - 3} y2={top + RANG + 3} stroke="var(--color-accent-deep)" strokeWidth={1.6} />
                    <circle cx={x(minuteNow)} cy={top - 3} r={3} fill="var(--color-accent-deep)" />
                  </g>
                )}
              </g>
            );
          })}

          {/* Lignes de l'aube et du soleil couchant, d'un jour à l'autre */}
          <polyline points={ligneSoleil("fajr")} fill="none" stroke="var(--color-neutre-profond)" strokeWidth={1.4} strokeDasharray="4 4" pointerEvents="none" />
          <polyline points={ligneSoleil("maghrib")} fill="none" stroke="var(--color-soleil)" strokeWidth={1.6} strokeDasharray="5 4" pointerEvents="none" />
          {jours.map((j, i) => (
            <g key={j.date} pointerEvents="none">
              <circle cx={x(enMinutes(j.prieres.fajr))} cy={y(i) + RANG / 2} r={2.4} fill="var(--color-neutre-profond)" />
              <circle cx={x(enMinutes(j.prieres.maghrib))} cy={y(i) + RANG / 2} r={2.8} fill="var(--color-soleil)" />
            </g>
          ))}

          <text x={W - MARGE} y={hauteur - 12} textAnchor="end" fontSize={10} fill="var(--color-soleil-encre)">
            {`Maghrib ${formatHeure(premierMaghrib)} → ${formatHeure(dernierMaghrib)} · la lumière du jour raccourcit de ${perteLumiere} min entre lundi et samedi`}
          </text>
        </svg>
      </div>

      {survol && survolee && (
        <DockSeance
          ancre={survol.ancre}
          carnet={carnets[survol.id]}
          couleur={moduleMeta[survolee.seance.moduleId].couleur}
          etiquette={`${moduleMeta[survolee.seance.moduleId].court} · ${survolee.seance.numero}/${survolee.seance.total}`}
          onOutil={(o) => ouvrirOutil(survol.id, o)}
          onEntrer={garderDock}
          onSortir={cacherDockBientot}
        />
      )}
      {tiroir && tiroirItem && (
        <TiroirSeance
          item={tiroirItem}
          outil={tiroir.outil}
          maintenant={maintenant}
          onOutil={(o) => setTiroir({ id: tiroir.id, outil: o })}
          onFermer={() => setTiroir(null)}
        />
      )}

      {/* Fiche de la séance choisie */}
      <div className="border-t border-hairline px-5 py-4 min-h-[88px]">
        {choisie ? (
          <FicheSeance
            item={choisie}
            maintenant={maintenant}
            revisee={hydrated && state.seancesRevisees.includes(choisie.seance.id)}
            onRevisee={() => basculerSeanceRevisee(choisie.seance.id)}
            onFermer={() => setSelection(null)}
            onOutil={(o) => ouvrirOutil(choisie.seance.id, o)}
          />
        ) : (
          <p className="font-sans text-sm text-text-muted">
            Touchez un cours pour ouvrir sa fiche, ou survolez-le pour noter, enregistrer un vocal, photographier le tableau.
          </p>
        )}
      </div>

      {/* Légende */}
      <div className="border-t border-hairline px-5 py-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {[...heures.entries()].map(([id, minutes]) => (
            <span key={id} className="flex items-center gap-1.5 font-sans text-xs text-text-muted">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: moduleMeta[id].couleur }} />
              <span className="text-ink">{moduleMeta[id].court}</span>
              <span className="tabular-nums">{formatDuree(minutes)}</span>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-[11px] text-text-secondary">
          <span>Ligne basse : rituel (cercle), hizb, révision, formation</span>
          <span className="flex items-center gap-1.5">
            <svg width="20" height="6" aria-hidden>
              <line x1="0" y1="3" x2="20" y2="3" stroke="var(--color-soleil)" strokeWidth="1.6" strokeDasharray="5 4" />
            </svg>
            Maghrib
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="20" height="6" aria-hidden>
              <line x1="0" y1="3" x2="20" y2="3" stroke="var(--color-neutre-profond)" strokeWidth="1.4" strokeDasharray="4 4" />
            </svg>
            Fajr
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded-sm border border-dashed border-text-secondary" />
            créneau libre
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-[2px] bg-accent-deep" />
            maintenant
          </span>
        </div>
      </div>
    </div>
  );
}

function FicheSeance({
  item,
  maintenant,
  revisee,
  onRevisee,
  onFermer,
  onOutil,
}: {
  item: SeanceDatee;
  maintenant: Date | null;
  revisee: boolean;
  onRevisee: () => void;
  onFermer: () => void;
  onOutil: (outil: OutilSeance) => void;
}) {
  const s = item.seance;
  const meta = moduleMeta[s.moduleId];
  const etat = etatSeance(item, maintenant);
  const a = enMinutes(s.debut);
  const f = enMinutes(s.fin);

  const infos = [
    { label: "Quand", valeur: `${libelleJour(item.jour)} · ${formatHeure(a)} – ${formatHeure(f)}` },
    { label: "Durée", valeur: formatDuree(dureeSeance(s)) },
    { label: "Salle", valeur: s.salle },
    { label: "Séance", valeur: `${s.numero} sur ${s.total}` },
  ];

  return (
    <div className="flex gap-4 animate-fade-in-up">
      <span className="w-1 rounded-full shrink-0" style={{ background: meta.couleur }} aria-hidden />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <p className="font-serif text-lg text-ink leading-snug">{s.intitule}</p>
            <p className="font-sans text-xs text-text-muted mt-0.5">
              {s.prof} · {s.format}
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

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          {infos.map((i) => (
            <div key={i.label}>
              <dt className="font-sans text-[11px] text-text-secondary">{i.label}</dt>
              <dd className="font-sans text-sm text-ink tabular-nums">{i.valeur}</dd>
            </div>
          ))}
        </dl>

        {/* Où tombe cette séance dans le module */}
        <div className="flex gap-[3px] mt-3" aria-hidden>
          {Array.from({ length: s.total }, (_, k) => (
            <span
              key={k}
              className="h-1.5 flex-1 max-w-[18px] rounded-full"
              style={{
                background: k + 1 <= s.numero ? meta.couleur : "var(--color-surface-warm)",
                opacity: k + 1 === s.numero ? 1 : k + 1 < s.numero ? 0.45 : 1,
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <span
            className={`font-sans text-[11px] font-medium rounded px-1.5 py-0.5 ${
              etat === "en-cours"
                ? "bg-accent-coral text-accent-deep"
                : etat === "passee"
                  ? "bg-surface-secondary text-text-muted"
                  : "bg-brand-soft text-brand"
            }`}
          >
            {etat === "en-cours" ? "En cours" : etat === "passee" ? "Passée" : "À venir"}
          </span>
          {etat === "passee" && (
            <button
              type="button"
              onClick={onRevisee}
              aria-pressed={revisee}
              className={`font-sans text-xs rounded-md border px-2.5 py-1 transition-colors ${
                revisee
                  ? "border-transparent text-canvas"
                  : "border-hairline text-text-muted hover:text-ink hover:border-text-secondary"
              }`}
              style={revisee ? { background: meta.couleur } : undefined}
            >
              {revisee ? "Révisée à chaud" : "Marquer révisée à chaud"}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          <span className="font-sans text-[11px] text-text-secondary mr-1">Carnet de séance</span>
          {OUTILS.map((o) => (
            <button
              key={o.cle}
              type="button"
              onClick={() => onOutil(o.cle)}
              className="inline-flex items-center gap-1.5 rounded-md border border-hairline px-2 py-1 font-sans text-xs text-text-muted hover:text-ink hover:border-text-secondary transition-colors"
            >
              <Glyphe outil={o.cle} taille={13} />
              {o.nom}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Les traces d'une séance sur la partition : un point par outil utilisé, la couleur de la compréhension */
function IndicesCarnet({ carnet, xDroite, yHaut, yBas }: { carnet?: CarnetSeance; xDroite: number; yHaut: number; yBas: number }) {
  if (!carnet) return null;
  const traces = Object.values(comptesCarnet(carnet)).filter((n) => n > 0).length;
  const comprehension = COMPREHENSION.find((c) => c.cle === carnet.comprehension);
  return (
    <g pointerEvents="none" aria-hidden>
      {Array.from({ length: traces }, (_, k) => (
        <circle key={k} cx={xDroite - k * 5.5} cy={yHaut} r={1.9} fill="var(--color-ink)" fillOpacity={0.5} />
      ))}
      {comprehension && <circle cx={xDroite} cy={yBas} r={3.2} fill={comprehension.couleur} />}
    </g>
  );
}
