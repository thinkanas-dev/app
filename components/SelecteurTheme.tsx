"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import {
  THEMES,
  EVENEMENT_THEME,
  appliquerTheme,
  demarrerCiel,
  etatCielMaintenant,
  lireChoix,
  paletteResolue,
  type ChoixTheme,
  type IdTheme,
} from "@/lib/themes";
import { PALETTES, type IdPalette } from "@/lib/palettes";
import { basculesDuJour, NOMS_PHASES, PALETTE_DE_PHASE, type PhaseCiel } from "@/lib/ciel";
import { horairesPriere } from "@/lib/horaires-priere";

/*
 * L'atelier des ambiances.
 *
 * Chaque carte n'est pas une image : c'est une vraie miniature de l'app, rendue
 * dans sa propre ambiance (data-theme posé sur la carte). La carte « Ciel »
 * montre la journée entière : les cinq phases fondues l'une dans l'autre et
 * l'instant présent. En choisissant, la nouvelle ambiance se révèle en cercle
 * depuis la carte cliquée.
 */

const COULEURS_MODULES = ["#8b5cf6", "#10b981", "#f97316", "#ec4899", "#3b82f6"];

function Miniature({ id, large }: { id: IdPalette; large: boolean }) {
  return (
    <div
      data-theme={id}
      aria-hidden
      className="motif-theme relative h-[88px] rounded-md overflow-hidden bg-surface-secondary border border-hairline flex gap-1.5 p-1.5"
    >
      <div className="w-7 shrink-0 rounded-[5px] bg-canvas flex flex-col items-center gap-1.5 py-2">
        <span className="h-2 w-2 rounded-[3px] bg-brand" />
        <span className="h-1 w-3 rounded-full bg-text-secondary/60" />
        <span className="h-1 w-3 rounded-full bg-text-secondary/60" />
        <span className="h-1 w-3 rounded-full bg-text-secondary/60" />
      </div>
      <div className="flex-1 min-w-0 rounded-[5px] bg-canvas p-2 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="h-1.5 w-14 rounded-full bg-ink" />
          <span className="h-3 w-8 rounded-[3px] bg-brand" />
        </div>
        <span className="h-1 w-20 rounded-full bg-text-muted/70" />
        <div className="flex items-end gap-2 mt-auto">
          <svg width="28" height="28" viewBox="0 0 30 30">
            <circle cx="15" cy="15" r="11" fill="none" stroke="var(--color-surface-warm)" strokeWidth="4" />
            <circle
              cx="15"
              cy="15"
              r="11"
              fill="none"
              stroke="var(--color-brand)"
              strokeWidth="4"
              strokeDasharray="69"
              strokeDashoffset="24"
              strokeLinecap="round"
              transform="rotate(-90 15 15)"
            />
          </svg>
          <div className="flex items-end gap-[3px] h-6">
            {COULEURS_MODULES.map((c, k) => (
              <span key={c} className="w-1.5 rounded-sm" style={{ height: `${36 + k * 14}%`, background: c }} />
            ))}
          </div>
          {large && (
            <svg width="90" height="22" viewBox="0 0 90 22" className="ml-2">
              <path
                d="M0 18 L12 14 L24 16 L36 9 L48 11 L60 5 L72 8 L90 2"
                fill="none"
                stroke="var(--color-brand)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <span className="ml-auto h-4 w-10 rounded-[3px] bg-accent-cactus flex items-center justify-center">
            <span className="h-1 w-5 rounded-full bg-accent-olive" />
          </span>
        </div>
      </div>
    </div>
  );
}

/** La journée en une frise : chaque phase dans ses couleurs, fondues aux bascules */
function FriseDuCiel({ maintenant }: { maintenant: Date }) {
  const bascules = basculesDuJour(horairesPriere(maintenant));
  const segments: { phase: PhaseCiel; de: number; a: number }[] = [
    { phase: "nuit", de: 0, a: bascules[0].minute },
    ...bascules.map((b, i) => ({ phase: b.phase, de: b.minute, a: i + 1 < bascules.length ? bascules[i + 1].minute : 1440 })),
  ];
  const pc = (m: number) => (m / 1440) * 100;
  const arrets = segments
    .map((s) => {
      const c = PALETTES[PALETTE_DE_PHASE[s.phase]].couleurs;
      return `${c["ciel-jour"]} ${pc(s.de + (s.a - s.de) * 0.2).toFixed(2)}%, ${c["ciel-jour"]} ${pc(s.a - (s.a - s.de) * 0.2).toFixed(2)}%`;
    })
    .join(", ");
  const arretsMarque = segments
    .map((s) => {
      const c = PALETTES[PALETTE_DE_PHASE[s.phase]].couleurs;
      return `${c.brand} ${pc(s.de + (s.a - s.de) * 0.2).toFixed(2)}%, ${c.brand} ${pc(s.a - (s.a - s.de) * 0.2).toFixed(2)}%`;
    })
    .join(", ");
  const minute = maintenant.getHours() * 60 + maintenant.getMinutes();

  return (
    <div
      aria-hidden
      className="relative h-[88px] rounded-md overflow-hidden border border-hairline"
      style={{ background: `linear-gradient(90deg, ${arrets})` }}
    >
      <span className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: `linear-gradient(90deg, ${arretsMarque})` }} />
      {segments
        .filter((s) => s.a - s.de > 110)
        .map((s) => (
          <span
            key={`${s.phase}-${s.de}`}
            className="absolute top-2 -translate-x-1/2 font-sans text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap"
            style={{ left: `${pc((s.de + s.a) / 2)}%`, color: PALETTES[PALETTE_DE_PHASE[s.phase]].couleurs.ink }}
          >
            {NOMS_PHASES[s.phase]}
          </span>
        ))}
      <span className="absolute top-0 bottom-0 w-[2px] bg-accent-deep" style={{ left: `${pc(minute)}%` }} />
      <span
        className="absolute top-[38px] h-3 w-3 -translate-x-1/2 rounded-full border-2 border-canvas bg-accent-deep"
        style={{ left: `${pc(minute)}%` }}
      />
    </div>
  );
}

export function SelecteurTheme({ alignement = "droite" }: { alignement?: "droite" | "gauche" }) {
  const [ouvert, setOuvert] = useState(false);
  const [choix, setChoix] = useState<ChoixTheme>("systeme");
  const [resolu, setResolu] = useState<IdPalette>("clair");
  const [maintenant, setMaintenant] = useState<Date | null>(null);
  const racineRef = useRef<HTMLDivElement>(null);
  const boutonRef = useRef<HTMLButtonElement>(null);
  const titreId = useId();

  // Plusieurs sélecteurs vivent dans la page : ils restent d'accord entre eux, relancent
  // le suivi du ciel s'il est choisi, et suivent le système quand c'est le choix fait
  useEffect(() => {
    const synchroniser = () => {
      const c = lireChoix();
      setChoix(c);
      setResolu(paletteResolue(c));
      setMaintenant(new Date());
    };
    if (lireChoix() === "ciel") demarrerCiel();
    synchroniser();
    window.addEventListener(EVENEMENT_THEME, synchroniser);

    const systeme = window.matchMedia("(prefers-color-scheme: dark)");
    const suivreSysteme = () => {
      if (lireChoix() === "systeme") appliquerTheme("systeme");
    };
    systeme.addEventListener("change", suivreSysteme);

    return () => {
      window.removeEventListener(EVENEMENT_THEME, synchroniser);
      systeme.removeEventListener("change", suivreSysteme);
    };
  }, []);

  useEffect(() => {
    if (!ouvert) return;
    setMaintenant(new Date());
    setResolu(paletteResolue(lireChoix()));
    const clicDehors = (e: PointerEvent) => {
      if (!racineRef.current?.contains(e.target as Node)) setOuvert(false);
    };
    const echap = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOuvert(false);
        boutonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", clicDehors);
    document.addEventListener("keydown", echap);
    return () => {
      document.removeEventListener("pointerdown", clicDehors);
      document.removeEventListener("keydown", echap);
    };
  }, [ouvert]);

  function choisir(c: ChoixTheme, e: MouseEvent<HTMLElement>) {
    // Au clavier, le clic n'a pas de coordonnées : on part du centre de l'élément
    const r = e.currentTarget.getBoundingClientRect();
    appliquerTheme(c, { x: e.clientX || r.left + r.width / 2, y: e.clientY || r.top + r.height / 2 });
  }

  const etatCiel = maintenant ? etatCielMaintenant(maintenant) : null;
  const nomActif =
    choix === "ciel"
      ? `Ciel de Casablanca · ${etatCiel ? NOMS_PHASES[etatCiel.phase].toLowerCase() : ""}`
      : THEMES.find((t) => t.id === resolu)?.nom ?? "Clair";
  const heureProchaine = etatCiel
    ? `${Math.floor((etatCiel.prochaine.minute % 1440) / 60)} h ${String(Math.round(etatCiel.prochaine.minute % 60)).padStart(2, "0")}`
    : "";

  return (
    <div ref={racineRef} className="relative">
      <button
        ref={boutonRef}
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        aria-haspopup="dialog"
        aria-label={`Ambiance : ${nomActif}. Changer d'ambiance`}
        title="Ambiance"
        className="relative h-8 w-8 rounded-full border border-hairline flex items-center justify-center text-text-muted hover:text-ink hover:bg-surface-secondary transition-colors"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
          <path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" />
        </svg>
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-canvas bg-brand" aria-hidden />
      </button>

      {ouvert && (
        <div
          role="dialog"
          aria-labelledby={titreId}
          className={`absolute top-10 z-50 w-[min(440px,calc(100vw-24px))] max-h-[calc(100vh-90px)] overflow-y-auto rounded-lg border border-hairline bg-canvas shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] animate-fade-in-up ${
            alignement === "droite" ? "right-0" : "left-0"
          }`}
        >
          <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-3 border-b border-hairline">
            <div className="min-w-0">
              <p id={titreId} className="font-sans text-sm font-semibold text-ink">
                Ambiance
              </p>
              <p className="font-sans text-[11px] text-text-muted truncate">
                {nomActif}
                {choix === "systeme" ? " · suit le réglage de votre appareil" : ""}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={choix === "systeme"}
              onClick={(e) => choisir(choix === "systeme" ? (THEMES.some((t) => t.id === resolu) ? (resolu as IdTheme) : "clair") : "systeme", e)}
              className="flex items-center gap-2 font-sans text-[11px] text-text-muted hover:text-ink shrink-0"
            >
              Suivre l&apos;appareil
              <span
                className={`relative h-4 w-7 rounded-full transition-colors ${choix === "systeme" ? "bg-brand" : "bg-surface-warm"}`}
                aria-hidden
              >
                <span
                  className={`absolute top-0.5 h-3 w-3 rounded-full bg-canvas shadow transition-[left] ${
                    choix === "systeme" ? "left-3.5" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          </div>

          <div role="radiogroup" aria-label="Ambiances" className="grid grid-cols-2 gap-2 p-3">
            {/* L'ambiance vivante, en tête */}
            <button
              type="button"
              role="radio"
              aria-checked={choix === "ciel"}
              onClick={(e) => choisir("ciel", e)}
              className={`col-span-2 text-left rounded-lg p-1.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                choix === "ciel" ? "bg-surface-secondary ring-2 ring-brand" : "hover:bg-surface-secondary"
              }`}
            >
              {maintenant ? <FriseDuCiel maintenant={maintenant} /> : <div className="h-[88px] rounded-md bg-surface-secondary" />}
              <div className="flex items-start justify-between gap-2 px-1 pt-2 pb-0.5">
                <div className="min-w-0">
                  <p className="font-sans text-xs font-semibold text-ink">
                    Ciel de Casablanca
                    <span className="ml-1.5 font-normal text-[9px] uppercase tracking-wider text-accent-deep">Vivante</span>
                  </p>
                  <p className="font-sans text-[11px] text-text-muted leading-snug">
                    L&apos;interface suit la lumière du jour, calée sur les horaires de prière : aube, jour, fin de journée,
                    crépuscule, nuit.
                    {etatCiel && (
                      <span className="text-ink">
                        {" "}
                        Maintenant : {NOMS_PHASES[etatCiel.phase].toLowerCase()}, puis {NOMS_PHASES[etatCiel.prochaine.phase].toLowerCase()} à{" "}
                        {heureProchaine}.
                      </span>
                    )}
                  </p>
                </div>
                {choix === "ciel" && <Coche />}
              </div>
            </button>

            {THEMES.map((t, k) => {
              const selectionne = choix !== "ciel" && resolu === t.id;
              const large = k === THEMES.length - 1;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={selectionne}
                  onClick={(e) => choisir(t.id, e)}
                  className={`text-left rounded-lg p-1.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    large ? "col-span-2" : ""
                  } ${selectionne ? "bg-surface-secondary ring-2 ring-brand" : "hover:bg-surface-secondary"}`}
                >
                  <Miniature id={t.id} large={large} />
                  <div className="flex items-start justify-between gap-2 px-1 pt-2 pb-0.5">
                    <div className="min-w-0">
                      <p className="font-sans text-xs font-semibold text-ink">
                        {t.nom}
                        {t.signature && (
                          <span className="ml-1.5 font-normal text-[9px] uppercase tracking-wider text-text-secondary">
                            Signature
                          </span>
                        )}
                      </p>
                      <p className="font-sans text-[11px] text-text-muted leading-snug">{t.ambiance}</p>
                    </div>
                    {selectionne && <Coche />}
                  </div>
                </button>
              );
            })}
          </div>

          <p className="px-4 pb-3 font-sans text-[10px] text-text-secondary">
            Les couleurs des modules gardent leur sens dans toutes les ambiances.
          </p>
        </div>
      )}
    </div>
  );
}

function Coche() {
  return (
    <span className="h-4 w-4 rounded-full bg-brand flex items-center justify-center shrink-0 mt-0.5" aria-hidden>
      <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 6.2l2.2 2.3 4.8-5" stroke="var(--color-canvas)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
