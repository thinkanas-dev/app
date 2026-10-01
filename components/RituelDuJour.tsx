"use client";

import { useCallback, useEffect, useState } from "react";
import { useObjectifsState } from "@/lib/objectifs-store";
import { themeMeta } from "@/content/citations";
import { langues, type LangueCible } from "@/content/lexique";
import {
  contenuDuJour,
  jourDuRituel,
  cleJour,
  msAvantBascule,
  serieDeJours,
} from "@/lib/rituel";
import { SceauDuJour } from "./SceauDuJour";
import { IconBell, IconArrowRight } from "./icons";

const CLE_NOTIF = "think-anas-rappel-citation";
const HEURES = [4, 5, 6, 7, 8, 9, 10];

/**
 * Le rituel du jour, en trois mouvements : la citation, sa morale, ses dix mots.
 *
 * La journée bascule à l'heure choisie, pas à minuit : avant 6 h, c'est encore
 * la citation d'hier qui est affichée, et elle se retourne toute seule si la
 * page reste ouverte.
 */
export function RituelDuJour() {
  const {
    state,
    hydrated,
    setLangueRituel,
    setHeureRituel,
    basculerMotAcquis,
    marquerJourRituel,
  } = useObjectifsState();

  const { langue, heure, motsAcquis, jours } = state.rituel;
  const acquis = motsAcquis[langue] ?? [];

  const [maintenant, setMaintenant] = useState<Date | null>(null);
  const [ouvert, setOuvert] = useState(false);
  const [retournees, setRetournees] = useState<string[]>([]);
  const [notif, setNotif] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // L'heure n'est lue qu'après le montage : le fuseau du serveur n'est pas
  // forcément le vôtre, et l'écart casserait l'hydratation.
  useEffect(() => {
    setMaintenant(new Date());
    try {
      setNotif(window.localStorage.getItem(CLE_NOTIF) === "1");
    } catch {
      // stockage indisponible : le rappel reste éteint
    }
  }, []);

  const jour = maintenant ? jourDuRituel(maintenant, heure) : null;
  const cle = jour ? cleJour(jour) : null;

  // Retourne la carte toute seule au passage de l'heure.
  useEffect(() => {
    if (!maintenant) return;
    const minuterie = window.setTimeout(
      () => setMaintenant(new Date()),
      msAvantBascule(maintenant, heure) + 1_000
    );
    return () => window.clearTimeout(minuterie);
  }, [maintenant, heure]);

  const contenu = jour ? contenuDuJour(jour, langue, acquis) : null;
  const meta = contenu ? themeMeta[contenu.citation.theme] : null;
  const teinte = meta?.couleur ?? "var(--color-hairline)";
  const serie = jour && hydrated ? serieDeJours(jours, jour) : 0;
  const acquisDuJour = contenu
    ? contenu.mots.filter((m) => acquis.includes(m.cle)).length
    : 0;

  // Le rituel arrive toujours replié : la citation seule, le reste d'un clic.
  const ouvrir = useCallback(() => {
    // L'enregistrement du jour doit rester hors de l'updater : appelé dedans,
    // il déclencherait une mise à jour du store pendant le rendu, et React
    // refuse (« Cannot update a component while rendering a different one »).
    const suivant = !ouvert;
    setOuvert(suivant);
    if (suivant && cle) marquerJourRituel(cle);
  }, [ouvert, cle, marquerJourRituel]);

  // Notification à l'heure du rituel — tant qu'un onglet reste ouvert.
  useEffect(() => {
    if (!notif || !maintenant) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const minuterie = window.setTimeout(() => {
      const duJour = contenuDuJour(new Date(), langue, []);
      new Notification("Le rituel du jour — think.anas", {
        body: `« ${duJour.citation.fr} »\n— ${duJour.citation.auteur}\n\n${duJour.morale}`,
        tag: "rituel-du-jour",
      });
    }, msAvantBascule(maintenant, heure));

    return () => window.clearTimeout(minuterie);
  }, [notif, maintenant, heure, langue]);

  const basculerNotif = useCallback(async () => {
    setMessage(null);

    if (notif) {
      try {
        window.localStorage.removeItem(CLE_NOTIF);
      } catch {
        // l'état en mémoire suffit pour cette session
      }
      setNotif(false);
      return;
    }

    if (!("Notification" in window)) {
      setMessage("Ce navigateur ne gère pas les notifications.");
      return;
    }

    const permission =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();

    if (permission !== "granted") {
      setMessage("Notifications refusées : autorisez-les dans les réglages du navigateur.");
      return;
    }

    try {
      window.localStorage.setItem(CLE_NOTIF, "1");
    } catch {
      // on active quand même pour la session en cours
    }
    setNotif(true);
  }, [notif]);

  function toucherPuce(cleMot: string) {
    if (retournees.includes(cleMot)) {
      // Deuxième geste : la traduction a été lue, le mot bascule en acquis.
      basculerMotAcquis(langue, cleMot);
      setRetournees((prec) => prec.filter((c) => c !== cleMot));
    } else {
      setRetournees((prec) => [...prec, cleMot]);
    }
  }

  const indexLangue = langues.find((l) => l.cle === langue)?.index ?? 1;

  return (
    <section
      className="rounded-lg border border-hairline bg-canvas overflow-hidden"
      style={{ ["--teinte" as string]: teinte }}
      aria-label="Le rituel du jour"
    >
      {/* Mouvement 1 — la citation */}
      <div
        className="relative overflow-hidden"
        style={{ background: "color-mix(in srgb, var(--teinte) 5%, var(--color-canvas))" }}
      >
        {/* Le quantième du jour, en filigrane */}
        <span
          aria-hidden
          className="absolute right-4 top-1/2 -translate-y-1/2 font-serif leading-none select-none pointer-events-none"
          style={{ fontSize: 190, color: "var(--teinte)", opacity: 0.05 }}
        >
          {jour ? jour.getDate() : ""}
        </span>

        <div className="relative flex items-start gap-5 p-5 sm:p-6">
          {jour && meta && (
            <SceauDuJour
              jour={jour.getDate()}
              mois={jour.toLocaleDateString("fr-FR", { month: "long" })}
              annee={jour.getFullYear()}
              couleur={teinte}
            />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span
                className="font-sans text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: "var(--teinte)" }}
              >
                {meta?.label ?? "Rituel"}
              </span>
              {serie > 1 && (
                <span className="font-sans text-[11px] text-text-muted tabular-nums">
                  {serie} jours d&apos;affilée
                </span>
              )}
            </div>

            <blockquote className="font-serif text-lg sm:text-2xl leading-snug text-ink">
              {contenu ? `« ${contenu.citation.fr} »` : " "}
            </blockquote>

            {contenu?.citation.ar && (
              <p
                dir="rtl"
                lang="ar"
                className="text-[17px] leading-loose text-text-muted mt-2"
                style={{ fontFamily: "var(--font-arabic)" }}
              >
                {contenu.citation.ar}
              </p>
            )}

            <p className="font-sans text-xs text-text-muted mt-3">
              {contenu && (
                <>
                  <span className="text-ink font-medium">{contenu.citation.auteur}</span>
                  {contenu.citation.source && <span> · {contenu.citation.source}</span>}
                </>
              )}
            </p>
          </div>

          {/* Réglages : l'heure de parution et le rappel */}
          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={heure}
              onChange={(e) => setHeureRituel(Number(e.target.value))}
              aria-label="Heure de parution de la citation"
              title="La citation du jour paraît à cette heure"
              className="rounded-md border border-hairline bg-canvas text-text-muted hover:text-ink font-sans text-[11px] px-1.5 py-1 outline-none focus:border-brand transition-colors tabular-nums"
            >
              {HEURES.map((h) => (
                <option key={h} value={h}>
                  {h} h
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={basculerNotif}
              aria-pressed={notif}
              title={
                notif ? "Désactiver le rappel" : `Recevoir le rituel en notification à ${heure} h`
              }
              className={`h-[26px] w-[26px] rounded-md border flex items-center justify-center transition-colors ${
                notif
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-hairline text-text-muted hover:text-ink hover:border-text-secondary"
              }`}
            >
              <IconBell width={13} height={13} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={ouvrir}
          aria-expanded={ouvert}
          className="relative w-full flex items-center justify-between gap-3 px-5 sm:px-6 py-2.5 border-t border-hairline font-sans text-xs text-text-muted hover:text-ink transition-colors"
        >
          <span>
            {ouvert ? "Replier le rituel" : "Lire la morale et les dix mots du jour"}
          </span>
          <span
            className={`transition-transform duration-300 ${ouvert ? "rotate-90" : ""}`}
            aria-hidden
          >
            <IconArrowRight width={13} height={13} />
          </span>
        </button>
      </div>

      {ouvert && contenu && (
        <div className="animate-fade-in-up">
          {/* Mouvement 2 — la morale */}
          <div className="flex gap-4 px-5 sm:px-6 py-5 border-t border-hairline">
            <span
              className="w-[3px] rounded-full shrink-0"
              style={{ background: "var(--teinte)" }}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary mb-1.5">
                Ce que ça demande aujourd&apos;hui
              </p>
              <p className="font-sans text-sm leading-relaxed text-ink">{contenu.morale}</p>
            </div>
          </div>

          {/* Mouvement 3 — les dix mots */}
          <div className="px-5 sm:px-6 py-5 border-t border-hairline bg-surface-secondary/40">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
              <div>
                <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                  Les dix mots du jour
                </p>
                <p className="font-sans text-xs text-text-muted mt-0.5">
                  Un clic retourne le mot, un second le marque acquis.
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-md bg-canvas border border-hairline">
                {langues.map((l) => (
                  <button
                    key={l.cle}
                    type="button"
                    onClick={() => setLangueRituel(l.cle)}
                    title={`${l.label} — ${l.certificat}`}
                    className={`rounded px-2.5 py-1 font-sans text-xs transition-colors ${
                      langue === l.cle
                        ? "bg-surface-secondary text-ink font-medium"
                        : "text-text-muted hover:text-ink"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ruban : un segment par mot acquis */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1 flex-1">
                {contenu.mots.map((m) => (
                  <span
                    key={m.cle}
                    className="h-1 flex-1 rounded-full transition-colors"
                    style={{
                      background: acquis.includes(m.cle)
                        ? "var(--teinte)"
                        : "var(--color-surface-warm)",
                    }}
                    aria-hidden
                  />
                ))}
              </div>
              <span className="font-sans text-[11px] text-text-muted tabular-nums shrink-0">
                {acquisDuJour}/{contenu.mots.length}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {contenu.mots.map((m) => {
                const estRetournee = retournees.includes(m.cle);
                const estAcquis = acquis.includes(m.cle);
                return (
                  <div key={m.cle} className="puce h-[64px]">
                    <button
                      type="button"
                      onClick={() => toucherPuce(m.cle)}
                      aria-pressed={estAcquis}
                      aria-label={`${m.entree[0]} — ${estRetournee ? "marquer acquis" : "voir la traduction"}`}
                      className="puce-inner block w-full h-full text-left"
                      data-retourne={estRetournee}
                    >
                      <span
                        className={`puce-face flex flex-col justify-center h-full rounded-md border px-2.5 ${
                          estAcquis
                            ? "border-transparent"
                            : "border-hairline bg-canvas hover:border-text-secondary"
                        }`}
                        style={
                          estAcquis
                            ? { background: "color-mix(in srgb, var(--teinte) 12%, var(--color-canvas))" }
                            : undefined
                        }
                      >
                        <span className="font-sans text-[13px] text-ink leading-tight">
                          {m.entree[0]}
                        </span>
                        {estAcquis && (
                          <span
                            className="font-sans text-[10px] mt-0.5"
                            style={{ color: "var(--teinte)" }}
                          >
                            acquis · {m.entree[indexLangue]}
                          </span>
                        )}
                      </span>

                      <span
                        className="puce-face puce-dos flex flex-col justify-center rounded-md border border-transparent px-2.5"
                        style={{ background: "color-mix(in srgb, var(--teinte) 14%, var(--color-canvas))" }}
                      >
                        <span className="font-sans text-[13px] font-medium text-ink leading-tight">
                          {m.entree[indexLangue]}
                        </span>
                        <span className="font-sans text-[10px] text-text-muted mt-0.5">
                          cliquer pour valider
                        </span>
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {contenu.rappels.length > 0 && (
              <div className="mt-4 pt-4 border-t border-hairline">
                <p className="font-sans text-[11px] text-text-secondary mb-2">
                  Restés en suspens hier
                </p>
                <div className="flex flex-wrap gap-2">
                  {contenu.rappels.map((m) => (
                    <button
                      key={m.cle}
                      type="button"
                      onClick={() => basculerMotAcquis(langue, m.cle)}
                      className="rounded-md border border-dashed border-text-secondary px-2.5 py-1.5 font-sans text-xs text-text-muted hover:text-ink hover:border-brand transition-colors"
                    >
                      {m.entree[0]}
                      <span className="text-text-secondary"> → </span>
                      {m.entree[indexLangue]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {notif && (
        <p className="font-sans text-[11px] text-text-secondary px-5 sm:px-6 py-2 border-t border-hairline">
          Rappel actif à {heure} h — tant qu&apos;un onglet de l&apos;app reste ouvert.
        </p>
      )}
      {message && (
        <p className="font-sans text-[11px] text-accent-deep px-5 sm:px-6 py-2 border-t border-hairline">
          {message}
        </p>
      )}
    </section>
  );
}
