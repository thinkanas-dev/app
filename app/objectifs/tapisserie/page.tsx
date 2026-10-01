"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useObjectifsState } from "@/lib/objectifs-store";
import { construireTapisserie, SIGNAUX, type Signal, type Tuile } from "@/lib/tapisserie";
import { PLAN_START } from "@/lib/plan-timeline";

/*
 * La tapisserie des 734 jours : le plan entier dessiné comme un zellige.
 * Une tuile par jour, colonnes par semaine. Toucher une tuile ouvre sa journée.
 */

const TAILLE = 15;
const ECART = 3;
const PAS = TAILLE + ECART;
const MARGE_GAUCHE = 30;
const MARGE_HAUT = 18;
const JOURS = ["L", "", "M", "", "V", "", "D"];

const JOURS_LONGS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MOIS_LONGS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

const couleurDe = (s: Signal) => SIGNAUX.find((x) => x.cle === s)!.couleur;

function dateLongue(cle: string) {
  const [a, m, j] = cle.split("-").map(Number);
  const d = new Date(a, m - 1, j);
  return `${JOURS_LONGS[d.getDay()]} ${j} ${MOIS_LONGS[m - 1]} ${a}`;
}

/** Une tuile : quatre triangles (prière, rituel, révision, savoir) et un losange au cœur (hizb) */
function TuileZellige({ tuile, x, y, choisie }: { tuile: Tuile; x: number; y: number; choisie: boolean }) {
  const s = TAILLE;
  const cx = x + s / 2;
  const cy = y + s / 2;
  const vide = "var(--color-surface-warm)";
  const joint = { stroke: "var(--color-canvas)", strokeWidth: 0.9, strokeLinejoin: "round" as const };
  const opacite = tuile.futur ? 0.35 : 1;
  const r = s * 0.2;

  return (
    <g opacity={opacite}>
      <path d={`M${x} ${y}H${x + s}L${cx} ${cy}Z`} fill={tuile.signaux.priere ? couleurDe("priere") : vide} {...joint} />
      <path d={`M${x + s} ${y}V${y + s}L${cx} ${cy}Z`} fill={tuile.signaux.rituel ? couleurDe("rituel") : vide} {...joint} />
      <path d={`M${x + s} ${y + s}H${x}L${cx} ${cy}Z`} fill={tuile.signaux.revision ? couleurDe("revision") : vide} {...joint} />
      <path d={`M${x} ${y + s}V${y}L${cx} ${cy}Z`} fill={tuile.signaux.savoir ? couleurDe("savoir") : vide} {...joint} />
      {tuile.signaux.hizb && (
        <path d={`M${cx} ${cy - r}L${cx + r} ${cy}L${cx} ${cy + r}L${cx - r} ${cy}Z`} fill={couleurDe("hizb")} {...joint} />
      )}
      {(tuile.aujourdhui || choisie) && (
        <rect
          x={x - 1.5}
          y={y - 1.5}
          width={s + 3}
          height={s + 3}
          rx={2}
          fill="none"
          stroke={choisie ? "var(--color-brand)" : "var(--color-ink)"}
          strokeWidth={1.5}
        />
      )}
    </g>
  );
}

export default function TapisseriePage() {
  const { state, hydrated } = useObjectifsState();
  const [maintenant, setMaintenant] = useState<Date | null>(null);
  const [choisie, setChoisie] = useState<Tuile | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const svgRefs = useRef<(SVGSVGElement | null)[]>([]);

  useEffect(() => setMaintenant(new Date()), []);

  const tapisserie = useMemo(() => {
    if (!maintenant) return null;
    return construireTapisserie(
      {
        prayerDates: hydrated ? state.prayerDates : [],
        rituelJours: hydrated ? state.rituel.jours : [],
        seancesRevisees: hydrated ? state.seancesRevisees : [],
        carnet: hydrated ? state.carnet : [],
        hizbDates: hydrated ? state.hizbDates : {},
      },
      maintenant
    );
  }, [maintenant, hydrated, state.prayerDates, state.rituel.jours, state.seancesRevisees, state.carnet, state.hizbDates]);

  /** L'image se fige dans l'ambiance du moment : les jetons de couleur sont remplacés par leur valeur */
  async function exporter(index: number) {
    const svg = svgRefs.current[index];
    if (!svg || !tapisserie) return;
    setMessage(null);
    try {
      const styles = getComputedStyle(document.documentElement);
      const fond = styles.getPropertyValue("--color-canvas").trim();
      const texte = new XMLSerializer()
        .serializeToString(svg)
        .replace(/var\((--color-[a-z-]+)\)/g, (_, nom: string) => styles.getPropertyValue(nom).trim() || "#000");
      const largeur = svg.viewBox.baseVal.width;
      const hauteur = svg.viewBox.baseVal.height;
      const echelle = 3;
      const image = new Image();
      const url = URL.createObjectURL(new Blob([texte], { type: "image/svg+xml" }));
      await new Promise<void>((resoudre, rejeter) => {
        image.onload = () => resoudre();
        image.onerror = () => rejeter(new Error("image"));
        image.src = url;
      });
      const toile = document.createElement("canvas");
      toile.width = largeur * echelle;
      toile.height = hauteur * echelle;
      const ctx = toile.getContext("2d")!;
      ctx.fillStyle = fond;
      ctx.fillRect(0, 0, toile.width, toile.height);
      ctx.drawImage(image, 0, 0, toile.width, toile.height);
      URL.revokeObjectURL(url);
      const lien = document.createElement("a");
      lien.download = `tapisserie-think-anas-annee-${index + 1}.png`;
      lien.href = toile.toDataURL("image/png");
      lien.click();
    } catch {
      setMessage("L'export de l'image a échoué dans ce navigateur.");
    }
  }

  if (!tapisserie) return <div className="min-h-[60vh]" />;
  const { annees, stats } = tapisserie;
  const commence = stats.joursVecus > 0;

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg border border-hairline bg-canvas px-5 py-4">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="max-w-2xl">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
              La tapisserie des {stats.joursTotal} jours
            </p>
            <h1 className="font-serif text-2xl text-ink leading-tight mt-1">Le plan, tuile après tuile</h1>
            <p className="font-sans text-sm text-text-muted mt-1.5 leading-relaxed">
              Chaque jour est une tuile de zellige. Elle se colore toute seule avec ce que la journée a vraiment contenu :
              rien à saisir, et les jours vides restent vides.
            </p>
          </div>
          <ul className="flex flex-col gap-1.5">
            {SIGNAUX.map((s) => (
              <li key={s.cle} className="flex items-center gap-2 font-sans text-xs text-text-muted">
                <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: s.couleur }} aria-hidden />
                <span className="text-ink font-medium">{s.nom}</span> {s.detail}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { label: "Jours vécus du plan", valeur: `${stats.joursVecus}`, sous: `sur ${stats.joursTotal}` },
            { label: "Jours touchés", valeur: `${stats.joursTouches}`, sous: "au moins une trace" },
            { label: "Jours pleins", valeur: `${stats.joursPleins}`, sous: "quatre traces ou plus" },
            { label: "Série en cours", valeur: `${stats.serie} j`, sous: `meilleure : ${stats.meilleureSerie} j` },
          ].map((t) => (
            <div key={t.label} className="rounded-md border border-hairline px-3 py-2.5">
              <p className="font-sans text-[11px] text-text-secondary">{t.label}</p>
              <p className="font-sans text-xl font-semibold text-ink tabular-nums leading-tight">{t.valeur}</p>
              <p className="font-sans text-[11px] text-text-muted">{t.sous}</p>
            </div>
          ))}
        </div>

        {!commence && (
          <p className="font-sans text-xs text-text-muted mt-3">
            Le plan commence le {dateLongue(PLAN_START)} : la première tuile se colorera ce jour-là.
          </p>
        )}
      </section>

      {annees.map((annee, index) => {
        const largeur = MARGE_GAUCHE + annee.semaines.length * PAS;
        const hauteur = MARGE_HAUT + 7 * PAS;
        return (
          <section key={annee.titre} className="rounded-lg border border-hairline bg-canvas">
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-hairline">
              <p className="font-sans text-sm font-semibold text-ink">{annee.titre}</p>
              <button
                type="button"
                onClick={() => void exporter(index)}
                className="font-sans text-xs text-text-muted hover:text-ink border border-hairline hover:border-text-secondary rounded-md px-2.5 py-1 transition-colors"
              >
                Exporter en image
              </button>
            </div>
            <div className="motif-theme overflow-x-auto px-5 py-4">
              <svg
                ref={(el) => {
                  svgRefs.current[index] = el;
                }}
                viewBox={`0 0 ${largeur} ${hauteur}`}
                width={largeur}
                height={hauteur}
                role="img"
                aria-label={`${annee.titre} : une tuile par jour`}
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {annee.mois.map((m) => (
                  <text key={`${m.colonne}-${m.nom}`} x={MARGE_GAUCHE + m.colonne * PAS} y={11} fontSize={9} fill="var(--color-text-secondary)">
                    {m.nom}
                  </text>
                ))}
                {JOURS.map((j, k) =>
                  j ? (
                    <text key={k} x={0} y={MARGE_HAUT + k * PAS + 11} fontSize={9} fill="var(--color-text-secondary)">
                      {j}
                    </text>
                  ) : null
                )}
                {annee.semaines.map((semaine, colonne) =>
                  semaine.map((t, ligne) =>
                    t ? (
                      <g
                        key={t.date}
                        role="button"
                        tabIndex={-1}
                        onClick={() => setChoisie(t)}
                        style={{ cursor: "pointer" }}
                      >
                        <title>{`${dateLongue(t.date)} — ${t.nombre} trace${t.nombre > 1 ? "s" : ""}`}</title>
                        <TuileZellige
                          tuile={t}
                          x={MARGE_GAUCHE + colonne * PAS}
                          y={MARGE_HAUT + ligne * PAS}
                          choisie={choisie?.date === t.date}
                        />
                      </g>
                    ) : null
                  )
                )}
              </svg>
            </div>
          </section>
        );
      })}

      <section className="rounded-lg border border-hairline bg-canvas px-5 py-4 min-h-[96px]">
        {choisie ? (
          <div className="flex items-start gap-5 flex-wrap animate-fade-in-up">
            <svg width="64" height="64" viewBox={`-2 -2 ${TAILLE + 4} ${TAILLE + 4}`} aria-hidden>
              <TuileZellige tuile={{ ...choisie, futur: false, aujourdhui: false }} x={0} y={0} choisie={false} />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-lg text-ink first-letter:uppercase">{dateLongue(choisie.date)}</p>
              <p className="font-sans text-xs text-text-muted">
                {choisie.futur
                  ? "Journée à venir."
                  : choisie.nombre === 0
                    ? "Aucune trace ce jour-là."
                    : `${choisie.nombre} trace${choisie.nombre > 1 ? "s" : ""} sur 5.`}
              </p>
              <ul className="flex flex-wrap gap-2 mt-2">
                {SIGNAUX.map((s) => (
                  <li
                    key={s.cle}
                    className={`flex items-center gap-1.5 rounded-md border px-2 py-1 font-sans text-xs ${
                      choisie.signaux[s.cle] ? "border-transparent text-ink" : "border-hairline text-text-secondary"
                    }`}
                    style={choisie.signaux[s.cle] ? { background: `color-mix(in srgb, ${s.couleur} 18%, var(--color-canvas))` } : undefined}
                  >
                    <span
                      className="h-2 w-2 rounded-sm"
                      style={{ background: choisie.signaux[s.cle] ? s.couleur : "var(--color-surface-warm)" }}
                      aria-hidden
                    />
                    {s.nom}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="font-sans text-sm text-text-muted">Touchez une tuile pour ouvrir sa journée.</p>
        )}
        {message && <p className="font-sans text-xs text-accent-deep mt-2">{message}</p>}
      </section>
    </div>
  );
}
