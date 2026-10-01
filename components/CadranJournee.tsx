"use client";

import { useEffect, useState } from "react";
import type { SemaineProgramme } from "@/content/emploi-du-temps";
import {
  moduleMeta,
  couleurPerso,
  enMinutes,
  formatHeure,
  formatDuree,
  dateDe,
  libelleJour,
  dureeSeance,
  majuscule,
  etatEntre,
  agendaDuJour,
  jourParDefaut,
  seancesChronologiques,
  PRIERES_AFFICHEES,
  nomsPrieres,
  type ElementAgenda,
} from "@/lib/programme";
import { cleJour } from "@/lib/rituel";
import { citationDuJour } from "@/lib/citation-du-jour";
import { useObjectifsState, type CarnetSeance } from "@/lib/objectifs-store";
import { DockSeance } from "@/components/seance/DockSeance";
import { TiroirSeance } from "@/components/seance/TiroirSeance";
import type { OutilSeance } from "@/components/seance/outils";

/*
 * Le cadran de la journée.
 *
 * Une horloge de 24 heures — minuit en bas, midi en haut, le matin à gauche,
 * le soir à droite — dont l'anneau central est le ciel du jour : nuit, aube,
 * plein jour et crépuscule, calés sur les vraies heures de prière. Les cours
 * tournent sur l'anneau extérieur, la vie autour sur l'anneau intérieur, et
 * aujourd'hui le soleil (ou la lune) et une aiguille rouge montrent où vous en êtes.
 */

const S = 480;
const C = S / 2;
const R_DISQUE = 92;
const R_CIEL = 120;
const R_PERSO = 134;
const R_COURS = 158;
const R_LABEL = 192;

const CIEL = {
  nuit: "var(--color-ciel-nuit)",
  aube: "var(--color-ciel-aube)",
  jour: "var(--color-ciel-jour)",
  crepuscule: "var(--color-ciel-crepuscule)",
};

function pt(r: number, min: number): [number, number] {
  const t = (min / 1440) * Math.PI * 2;
  return [C - r * Math.sin(t), C + r * Math.cos(t)];
}

const f2 = (n: number) => n.toFixed(2);

function arc(r: number, a: number, b: number) {
  const [x1, y1] = pt(r, a);
  const [x2, y2] = pt(r, b);
  const grand = b - a > 720 ? 1 : 0;
  return `M ${f2(x1)} ${f2(y1)} A ${r} ${r} 0 ${grand} 1 ${f2(x2)} ${f2(y2)}`;
}

function secteur(r: number, a: number, b: number) {
  const [x1, y1] = pt(r, a);
  const [x2, y2] = pt(r, b);
  const grand = b - a > 720 ? 1 : 0;
  return `M ${C} ${C} L ${f2(x1)} ${f2(y1)} A ${r} ${r} 0 ${grand} 1 ${f2(x2)} ${f2(y2)} Z`;
}

function court(e: ElementAgenda) {
  if (e.genre === "seance") return moduleMeta[e.seance.moduleId].court;
  if (e.genre === "perso") return e.bloc.titre;
  return e.nom;
}

function couleurDe(e: ElementAgenda) {
  if (e.genre === "seance") return moduleMeta[e.seance.moduleId].couleur;
  if (e.genre === "perso") return couleurPerso[e.bloc.type];
  return "var(--color-text-secondary)";
}

export function CadranJournee({
  semaine,
  maintenant,
}: {
  semaine: SemaineProgramme;
  maintenant: Date | null;
}) {
  const [date, setDate] = useState<string | null>(null);
  const [survol, setSurvol] = useState<string | null>(null);
  const [tiroir, setTiroir] = useState<{ id: string; outil: OutilSeance } | null>(null);
  const { state, hydrated } = useObjectifsState();
  const carnets: Record<string, CarnetSeance> = hydrated ? state.carnetsSeances : {};
  const tiroirItem = tiroir ? seancesChronologiques(semaine).find((s) => s.seance.id === tiroir.id) : undefined;

  // Le jour affiché par défaut dépend de l'heure locale : lu après le montage.
  // Quand on change de semaine, un jour qui n'en fait pas partie est remplacé.
  useEffect(() => {
    if (!maintenant) return;
    setDate((prec) =>
      prec && semaine.jours.some((j) => j.date === prec) ? prec : jourParDefaut(semaine, maintenant).date
    );
  }, [maintenant, semaine]);

  const jour = semaine.jours.find((j) => j.date === date) ?? jourParDefaut(semaine, maintenant);
  const p = jour.prieres;
  const fajr = enMinutes(p.fajr);
  const shuruq = enMinutes(p.shuruq);
  const maghrib = enMinutes(p.maghrib);
  const isha = enMinutes(p.isha);

  const estAujourdhui = maintenant ? cleJour(maintenant) === jour.date : false;
  const mNow = maintenant ? maintenant.getHours() * 60 + maintenant.getMinutes() : 0;

  const agenda = agendaDuJour(jour);
  const actifs = agenda.filter((e) => e.genre !== "priere");
  const courant = estAujourdhui
    ? actifs.find((e) => e.genre === "seance" && mNow >= e.debut && mNow < e.fin) ??
      actifs.find((e) => mNow >= e.debut && mNow < e.fin)
    : undefined;
  const prochain = estAujourdhui ? actifs.find((e) => e.debut > mNow) : undefined;

  const minutesCours = jour.seances.reduce((t, s) => t + dureeSeance(s), 0);
  const nSeances = jour.seances.length;
  const citation = citationDuJour(dateDe(jour));

  // Ce qu'annonce le centre du cadran
  let surtitre: string;
  let titre: string;
  let sous: string;
  let couleurSurtitre = "var(--color-text-secondary)";

  if (estAujourdhui && courant) {
    surtitre = "En cours";
    titre = court(courant);
    sous = `reste ${formatDuree(courant.fin - mNow)}`;
    couleurSurtitre = couleurDe(courant);
  } else if (estAujourdhui && prochain) {
    surtitre = "Prochain";
    titre = court(prochain);
    sous = `à ${formatHeure(prochain.debut)} · dans ${formatDuree(prochain.debut - mNow)}`;
  } else if (estAujourdhui) {
    surtitre = "Journée terminée";
    titre = nSeances > 0 ? `${nSeances} séance${nSeances > 1 ? "s" : ""}` : "Sans cours";
    sous = nSeances > 0 ? `${formatDuree(minutesCours)} de cours` : "Révision et formation";
  } else {
    surtitre = majuscule(libelleJour(jour, "long"));
    titre = nSeances > 0 ? `${nSeances} séance${nSeances > 1 ? "s" : ""}` : "Sans cours";
    sous =
      nSeances > 0
        ? `${formatDuree(minutesCours)} · dès ${formatHeure(enMinutes(jour.seances[0].debut))}`
        : "Révision et formation";
  }

  const lanceHaute = (type: string) => type === "libre" || type === "a-confirmer" || type === "bilan";
  const estSoleil = mNow >= shuruq && mNow < maghrib;
  const attenue = (id: string) => (survol && survol !== id ? 0.25 : 1);

  return (
    <div className="rounded-lg border border-hairline bg-canvas">
      {/* Choix du jour — chaque bouton montre la charge de la journée */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 pt-4 pb-3 border-b border-hairline">
        {semaine.jours.map((j) => {
          const actif = j.date === jour.date;
          const auj = maintenant ? cleJour(maintenant) === j.date : false;
          return (
            <button
              key={j.date}
              type="button"
              onClick={() => setDate(j.date)}
              aria-pressed={actif}
              className={`shrink-0 rounded-md border px-3 py-2 text-left transition-colors ${
                actif ? "border-ink bg-surface-secondary" : "border-hairline hover:border-text-secondary"
              }`}
            >
              <span className="flex items-center gap-1.5 font-sans text-xs font-medium text-ink whitespace-nowrap">
                {libelleJour(j)}
                {auj && <span className="h-1.5 w-1.5 rounded-full bg-accent-deep" aria-label="aujourd'hui" />}
              </span>
              <span className="flex gap-1 mt-1.5 h-1.5" aria-hidden>
                {j.seances.length > 0 ? (
                  j.seances.map((s) => (
                    <span key={s.id} className="h-1.5 w-3 rounded-full" style={{ background: moduleMeta[s.moduleId].couleur }} />
                  ))
                ) : (
                  <span className="h-1.5 w-3 rounded-full bg-surface-warm" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] gap-6 p-5 items-start">
        {/* Le cadran */}
        <div>
          <div className="relative w-full max-w-[460px] mx-auto aspect-square">
            <svg
              viewBox={`0 0 ${S} ${S}`}
              className="absolute inset-0 w-full h-full"
              role="img"
              aria-label={`Cadran de la journée du ${libelleJour(jour, "long")}`}
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {/* Le ciel */}
              <path d={secteur(R_CIEL, 0, fajr)} fill={CIEL.nuit} />
              <path d={secteur(R_CIEL, fajr, shuruq)} fill={CIEL.aube} />
              <path d={secteur(R_CIEL, shuruq, maghrib)} fill={CIEL.jour} />
              <path d={secteur(R_CIEL, maghrib, isha)} fill={CIEL.crepuscule} />
              <path d={secteur(R_CIEL, isha, 1440)} fill={CIEL.nuit} />
              <circle cx={C} cy={C} r={R_DISQUE} fill="var(--color-canvas)" />
              <circle cx={C} cy={C} r={R_CIEL} fill="none" stroke="var(--color-hairline)" />

              {/* Graduations */}
              {Array.from({ length: 24 }, (_, h) => {
                const [x1, y1] = pt(172, h * 60);
                const [x2, y2] = pt(h % 6 === 0 ? 183 : 177, h * 60);
                return (
                  <line
                    key={h}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="var(--color-text-secondary)"
                    strokeOpacity={h % 6 === 0 ? 0.9 : 0.45}
                    strokeWidth={h % 6 === 0 ? 1.4 : 1}
                  />
                );
              })}
              <text x={C} y={C - 198} textAnchor="middle" fontSize={10} fill="var(--color-text-secondary)">
                midi
              </text>
              <text x={C} y={C + 208} textAnchor="middle" fontSize={10} fill="var(--color-text-secondary)">
                minuit
              </text>

              {/* Prières */}
              {PRIERES_AFFICHEES.map((cle) => {
                const m = enMinutes(p[cle]);
                const [x1, y1] = pt(R_DISQUE, m);
                const [x2, y2] = pt(172, m);
                const [lx, ly] = pt(R_LABEL, m);
                const ancre = lx < C - 12 ? "end" : lx > C + 12 ? "start" : "middle";
                return (
                  <g key={cle}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-ink)" strokeOpacity={0.25} strokeDasharray="2 2" />
                    <circle cx={x2} cy={y2} r={2.2} fill="var(--color-ink)" fillOpacity={0.5} />
                    <text x={lx} y={ly + 3.5} textAnchor={ancre} fontSize={10} fill="var(--color-text-muted)">
                      {nomsPrieres[cle]}
                    </text>
                    <title>{`${nomsPrieres[cle]} · ${p[cle]}`}</title>
                  </g>
                );
              })}

              {/* Anneau intérieur : la vie autour des cours */}
              {jour.blocs
                .filter((b) => !lanceHaute(b.type))
                .map((b) => {
                  const a = enMinutes(b.debut);
                  const f = enMinutes(b.fin);
                  return (
                    <path
                      key={b.id}
                      d={arc(R_PERSO, a, f)}
                      fill="none"
                      stroke={couleurPerso[b.type]}
                      strokeOpacity={(b.type === "hizb" || b.type === "revision" ? 0.45 : 0.9) * attenue(b.id)}
                      strokeWidth={8}
                      strokeLinecap="round"
                      onMouseEnter={() => setSurvol(b.id)}
                      onMouseLeave={() => setSurvol(null)}
                    >
                      <title>{`${b.titre} · ${formatHeure(a)} – ${formatHeure(f)}`}</title>
                    </path>
                  );
                })}
              {(() => {
                const [rx, ry] = pt(R_PERSO, 6 * 60 + 7);
                return <circle cx={rx} cy={ry} r={5.5} fill="var(--color-canvas)" stroke="var(--color-ink)" strokeWidth={1.8} pointerEvents="none" />;
              })()}

              {/* Anneau extérieur : créneaux libres, puis cours */}
              {jour.blocs
                .filter((b) => lanceHaute(b.type))
                .map((b) => (
                  <path
                    key={b.id}
                    d={arc(R_COURS, enMinutes(b.debut) + 1.2, enMinutes(b.fin) - 1.2)}
                    fill="none"
                    stroke="var(--color-neutre)"
                    strokeOpacity={0.55 * attenue(b.id)}
                    strokeWidth={22}
                    strokeDasharray="2 3"
                    onMouseEnter={() => setSurvol(b.id)}
                    onMouseLeave={() => setSurvol(null)}
                  >
                    <title>{`${b.titre} · ${b.debut} – ${b.fin}`}</title>
                  </path>
                ))}
              {jour.seances.map((s) => {
                const a = enMinutes(s.debut);
                const f = enMinutes(s.fin);
                const etat = etatEntre(jour, a, f, maintenant);
                return (
                  <path
                    key={s.id}
                    d={arc(R_COURS, a + 1.2, f - 1.2)}
                    fill="none"
                    stroke={moduleMeta[s.moduleId].couleur}
                    strokeOpacity={(etat === "passee" ? 0.45 : 0.92) * attenue(s.id)}
                    strokeWidth={etat === "en-cours" || survol === s.id ? 27 : 22}
                    onMouseEnter={() => setSurvol(s.id)}
                    onMouseLeave={() => setSurvol(null)}
                    style={{ transition: "stroke-width 0.2s, stroke-opacity 0.2s" }}
                  >
                    <title>{`${s.intitule} · ${s.debut} – ${s.fin} · ${s.salle}`}</title>
                  </path>
                );
              })}

              {/* Aujourd'hui : l'astre et l'aiguille */}
              {estAujourdhui && (
                <g pointerEvents="none">
                  {(() => {
                    const [ax, ay] = pt(106, mNow);
                    return estSoleil ? (
                      <>
                        <circle cx={ax} cy={ay} r={13} fill="var(--color-soleil)" fillOpacity={0.18} />
                        <circle cx={ax} cy={ay} r={7.5} fill="var(--color-soleil)" />
                      </>
                    ) : (
                      <>
                        <circle cx={ax} cy={ay} r={7} fill="var(--color-neutre)" />
                        <circle cx={ax + 3} cy={ay - 2.5} r={6} fill={CIEL.nuit} />
                      </>
                    );
                  })()}
                  {(() => {
                    const [x1, y1] = pt(R_DISQUE, mNow);
                    const [x2, y2] = pt(178, mNow);
                    return (
                      <>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-accent-deep)" strokeWidth={2} strokeLinecap="round" />
                        <circle cx={x2} cy={y2} r={3.5} fill="var(--color-accent-deep)" />
                      </>
                    );
                  })()}
                </g>
              )}
            </svg>

            {/* Le centre du cadran */}
            <div className="absolute inset-[31%] flex flex-col items-center justify-center text-center pointer-events-none">
              <span
                className="font-sans text-[10px] font-semibold uppercase tracking-wide leading-tight"
                style={{ color: couleurSurtitre }}
              >
                {surtitre}
              </span>
              <span className="font-serif text-base sm:text-xl leading-tight text-ink mt-1 line-clamp-2">
                {titre}
              </span>
              <span className="font-sans text-[11px] text-text-muted mt-1 tabular-nums leading-snug">{sous}</span>
            </div>
          </div>

          <p className="font-sans text-[11px] text-text-secondary text-center mt-3 leading-relaxed">
            Anneau extérieur : les cours · anneau intérieur : rituel, hizb, révision, formation.
            <br />
            Le ciel suit Fajr, le lever du soleil, Maghrib et Isha.
          </p>
        </div>

        {/* L'agenda, dans l'ordre */}
        <ol className="flex flex-col" aria-label={`Agenda du ${libelleJour(jour, "long")}`}>
          {agenda.map((e) => {
            if (e.genre === "priere") {
              return (
                <li key={e.id} className="flex items-center gap-3 py-1">
                  <span className="w-11 shrink-0" />
                  <span className="h-px w-3 bg-text-secondary shrink-0" aria-hidden />
                  <span className="font-sans text-[11px] text-text-secondary tabular-nums">
                    {e.nom} · {formatHeure(e.debut)}
                  </span>
                </li>
              );
            }

            const etat = etatEntre(jour, e.debut, e.fin, maintenant);
            const titre = e.genre === "seance" ? e.seance.intitule : e.bloc.titre;
            const detail =
              e.genre === "seance"
                ? `${e.seance.prof} · ${e.seance.format} · séance ${e.seance.numero}/${e.seance.total} · ${e.seance.salle}`
                : e.bloc.type === "rituel"
                  ? `« ${citation.fr} » — ${citation.auteur}`
                  : e.bloc.detail ?? "";
            const idSeance: string = e.genre === "seance" ? e.seance.id : "";

            return (
              <li
                key={e.id}
                onMouseEnter={() => setSurvol(e.id)}
                onMouseLeave={() => setSurvol(null)}
                onClick={idSeance ? () => setTiroir({ id: idSeance, outil: "note" }) : undefined}
                className={`group relative flex gap-3 py-2 px-1 -mx-1 rounded-md transition-colors ${
                  survol === e.id ? "bg-surface-secondary" : ""
                } ${idSeance ? "cursor-pointer" : ""}`}
              >
                <span className="w-11 shrink-0 font-sans text-xs text-text-muted tabular-nums pt-0.5 text-right">
                  {formatHeure(e.debut)}
                </span>
                <span
                  className="w-[3px] rounded-full shrink-0"
                  style={{ background: couleurDe(e), opacity: etat === "passee" ? 0.4 : 1 }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`font-sans text-[13px] leading-snug ${
                        etat === "passee" ? "text-text-muted" : "text-ink"
                      } ${e.genre === "seance" ? "font-medium" : ""}`}
                    >
                      {titre}
                    </span>
                    {etat === "en-cours" && (
                      <span className="font-sans text-[10px] font-medium rounded px-1.5 py-0.5 bg-accent-coral text-accent-deep">
                        En cours
                      </span>
                    )}
                  </div>
                  {detail && (
                    <p className="font-sans text-[11px] text-text-muted leading-snug mt-0.5 line-clamp-2">{detail}</p>
                  )}
                </div>
                <span className="font-sans text-[11px] text-text-secondary tabular-nums shrink-0 pt-0.5">
                  {formatDuree(e.fin - e.debut)}
                </span>
                {e.genre === "seance" && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
                    <DockSeance
                      carnet={carnets[idSeance]}
                      couleur={moduleMeta[e.seance.moduleId].couleur}
                      etiquette={moduleMeta[e.seance.moduleId].court}
                      onOutil={(o) => setTiroir({ id: idSeance, outil: o })}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        {tiroir && tiroirItem && (
          <TiroirSeance
            item={tiroirItem}
            outil={tiroir.outil}
            maintenant={maintenant}
            onOutil={(o) => setTiroir({ id: tiroir.id, outil: o })}
            onFermer={() => setTiroir(null)}
          />
        )}
      </div>
    </div>
  );
}
