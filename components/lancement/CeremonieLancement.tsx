"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  CLE_CELEBRE,
  CLE_VU_SESSION,
  DEBUT_PROGRAMME,
  FENETRE_CELEBRATION,
  decomposer,
  deuxChiffres,
  lireRepetition,
} from "@/lib/lancement";
import { useSemaines } from "@/lib/semaines";
import { seancesChronologiques, formatHeure, enMinutes, moduleMeta } from "@/lib/programme";
import { horairesPriere } from "@/lib/horaires-priere";
import { totalPlanDays } from "@/lib/plan-timeline";
import { Feux, PALETTES, SonFeux, type StyleBouquet } from "./feux";
import { SILHOUETTES } from "./silhouettes";

/*
 * La veille du départ.
 *
 * Pas de compteur de gare : une mèche. Elle s'allume au Maghrib de la veille —
 * la journée musulmane commence au coucher du soleil — et brûle en temps réel,
 * en passant par Isha, l'heure du coucher et Fajr, jusqu'à un sceau de cire.
 * Sous ce sceau, on scelle sa niyya pour le semestre : illisible jusqu'à 6 h.
 *
 * À l'heure dite, rien ne part tout seul. C'est à soi d'allumer : maintenir le
 * bouton, ou souffler sur la mèche dans le micro. Et le spectacle est fait du
 * programme lui-même — une fusée par module, portant son nombre de séances ;
 * les objectifs dessinés en lumière ; « commençons » dans les quatre langues du
 * rituel ; la basmala ; la niyya écrite en or ; puis les jours du plan qui
 * montent du sol pour former l'étoile de zellige.
 */

const CLE_NIYYA = "think-anas-niyya";
type Niyya = { texte: string; scelleLe: string };

const sansAbonnement = () => () => {};
const abonnerHorloge = (rappel: () => void) => {
  const id = window.setInterval(rappel, 250);
  return () => window.clearInterval(id);
};
const seconde = () => Math.floor(Date.now() / 1000);

const CHIFFRES = "٠١٢٣٤٥٦٧٨٩";
const indoArabe = (s: string) => s.replace(/\d/g, (d) => CHIFFRES[Number(d)]);
const borne = (v: number) => Math.min(1, Math.max(0, v));

function lireStockage(genre: "local" | "session", cle: string) {
  try {
    return (genre === "local" ? window.localStorage : window.sessionStorage).getItem(cle);
  } catch {
    return null;
  }
}

function ecrireStockage(genre: "local" | "session", cle: string, valeur: string | null) {
  try {
    const stockage = genre === "local" ? window.localStorage : window.sessionStorage;
    if (valeur === null) stockage.removeItem(cle);
    else stockage.setItem(cle, valeur);
  } catch {
    // sans stockage, la cérémonie se montrera simplement à nouveau
  }
}

const aHeure = (jour: Date, hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(jour.getFullYear(), jour.getMonth(), jour.getDate(), h, m).getTime();
};

const ETOILES = (() => {
  let graine = 20260914;
  const alea = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 140 }, () => ({
    x: alea() * 100,
    y: alea() * 70,
    taille: 0.8 + alea() * 1.7,
    opacite: 0.2 + alea() * 0.6,
    delai: alea() * 4,
  }));
})();

const STYLES = `
@property --charge { syntax: '<number>'; inherits: false; initial-value: 0; }
.veille-scint { animation: veille-scint 3.6s ease-in-out infinite }
@keyframes veille-scint { 50% { opacity: .15 } }
.meche-etincelle { animation: meche-etincelle .55s ease-out infinite; transform-box: view-box; transform-origin: 0 0 }
@keyframes meche-etincelle { from { transform: scale(.15); opacity: 1 } to { transform: scale(1.7); opacity: 0 } }
.meche-coeur { animation: meche-coeur .18s steps(2) infinite }
@keyframes meche-coeur { 50% { opacity: .6 } }
.sceau-lueur { animation: sceau-lueur 1.6s ease-in-out infinite }
@keyframes sceau-lueur { 50% { opacity: .35 } }
.sceau-frappe { animation: sceau-frappe .7s cubic-bezier(.2,.9,.3,1.2) both; transform-box: fill-box; transform-origin: center }
@keyframes sceau-frappe { from { transform: scale(2.2) rotate(-40deg); opacity: 0 } 60% { opacity: 1 } to { transform: scale(1) rotate(0) } }
.veille-seconde { display: inline-block; animation: veille-seconde .45s cubic-bezier(.2,.8,.3,1) both }
@keyframes veille-seconde { from { transform: translateY(-.25em); opacity: 0 } to { transform: none; opacity: 1 } }
.allumeur { position: relative; display: grid; place-items: center; width: 184px; height: 184px; border-radius: 9999px; background: radial-gradient(circle at 50% 40%, #2a1a0e, #0b0706 70%); box-shadow: 0 0 80px rgba(255,150,60,.25), inset 0 0 0 1px rgba(255,210,150,.25); touch-action: none; user-select: none }
.allumeur::before { content: ""; position: absolute; inset: -7px; border-radius: 9999px; background: conic-gradient(#ffb35c calc(var(--charge) * 1turn), rgba(255,255,255,.08) 0); -webkit-mask: radial-gradient(circle, transparent 60%, #000 61%); mask: radial-gradient(circle, transparent 60%, #000 61%) }
.allumeur.charge::before { animation: allumeur-charge 1.4s linear forwards }
@keyframes allumeur-charge { to { --charge: 1 } }
.allumeur.charge { box-shadow: 0 0 140px rgba(255,150,60,.55), inset 0 0 0 1px rgba(255,210,150,.5) }
@media (prefers-reduced-motion: reduce) {
  .veille-scint, .meche-etincelle, .meche-coeur, .sceau-lueur, .sceau-frappe, .veille-seconde { animation: none !important }
}
`;

type Donnees = {
  modules: { court: string; couleur: string; total: number }[];
  niyya: string | null;
  jours: number;
};

/** Le programme du spectacle, fait du programme lui-même */
function jouerSpectacle(feux: Feux, polices: { arabe: string; sans: string; serif: string }, d: Donnees, surFinale: () => void) {
  const minuteurs: number[] = [];
  const a = (ms: number, action: () => void) => minuteurs.push(window.setTimeout(action, ms));
  const P = PALETTES;
  const { largeur } = feux.dimensions;
  let t = 400;

  // Acte I — une fusée par module, une étoile maîtresse par séance
  const modules = d.modules.slice(0, 8);
  modules.forEach((m, i) => {
    a(t + i * 1150, () =>
      feux.tirer(i % 2 ? "pivoine" : "zellige", 0.12 + (0.76 * (i + 0.5)) / modules.length, 0.24 + (i % 2) * 0.09, [m.couleur, "#ffffff", m.couleur], {
        etiquette: `${m.court} · ${m.total} séances`,
        nombre: m.total,
      })
    );
  });
  t += modules.length * 1150 + 1600;

  // Acte II — les objectifs dessinés en lumière
  const taille = Math.min(largeur * 0.32, 340);
  a(t, () => void feux.dessinerSvg(SILHOUETTES.coran, { taille, xr: 0.5, yr: 0.4, palette: P.or, tenue: 2200, legende: "60 hizb" }));
  t += 4200;
  a(t, () => void feux.dessinerSvg(SILHOUETTES.vehicule, { taille, xr: 0.5, yr: 0.4, palette: P.majorelle, tenue: 2200, legende: "La berline" }));
  t += 4200;
  a(t, () => void feux.dessinerSvg(SILHOUETTES.immobilier, { taille, xr: 0.5, yr: 0.4, palette: P.zellige, tenue: 2200, legende: "L’appartement" }));
  t += 4600;

  // Acte III — « commençons » dans les quatre langues du rituel, puis la basmala
  const mots = ["Commençons", "Let’s begin", "Empecemos", "Los geht’s"];
  const palettesMots = [P.majorelle, P.braise, P.zellige, P.argent];
  mots.forEach((mot, i) => {
    a(t + i * 1500, () =>
      feux.ecrire(mot, { police: polices.sans, taille: Math.min(largeur * 0.085, 92), palette: palettesMots[i], xr: i % 2 ? 0.64 : 0.36, yr: 0.28 + (i % 2) * 0.14, tenue: 800 })
    );
  });
  t += mots.length * 1500 + 1400;
  a(t, () => feux.ecrire("بِسْمِ اللّٰه", { police: polices.arabe, taille: Math.min(largeur * 0.15, 150), palette: P.or, xr: 0.5, yr: 0.36, tenue: 3800 }));
  a(t + 1800, () => {
    feux.tirer("saule", 0.18, 0.22, P.or);
    feux.tirer("saule", 0.82, 0.22, P.or);
  });
  t += 6600;

  // Acte IV — la niyya descellée, écrite en or
  if (d.niyya) {
    a(t, () => feux.tirer("croissant", 0.5, 0.18, P.argent));
    a(t + 1100, () =>
      feux.ecrire(d.niyya ?? "", { police: polices.serif, taille: Math.min(largeur * 0.042, 50), largeurMax: largeur * 0.78, palette: P.or, xr: 0.5, yr: 0.42, tenue: 5600, graisse: 600 })
    );
    t += 9000;
  }

  // Finale — les jours du plan montent du sol et forment l'étoile
  a(t, () => feux.rassemblerJours(Math.min(d.jours, 900), P.zellige, 2400));
  t += 4600;
  const styles: StyleBouquet[] = ["pivoine", "zellige", "anneau", "crepitant", "croissant", "pivoine"];
  const palettes = [P.or, P.zellige, P.majorelle, P.braise, P.argent];
  for (let i = 0; i < 16; i++) {
    a(t + i * 320, () => feux.tirer(styles[i % styles.length], 0.14 + Math.random() * 0.72, 0.16 + Math.random() * 0.24, palettes[i % palettes.length]));
  }
  t += 16 * 320 + 900;
  a(t, () => {
    feux.ecrire("Jour 1", { police: polices.serif, taille: Math.min(largeur * 0.12, 130), palette: P.or, xr: 0.5, yr: 0.34, tenue: 5000 });
    surFinale();
  });

  a(t + 7000, () => {
    minuteurs.push(
      window.setInterval(
        () => feux.tirer(Math.random() < 0.5 ? "saule" : "pivoine", 0.15 + Math.random() * 0.7, 0.18 + Math.random() * 0.2, Math.random() < 0.5 ? P.or : P.zellige),
        3600
      )
    );
  });

  return () =>
    minuteurs.forEach((id) => {
      window.clearTimeout(id);
      window.clearInterval(id);
    });
}

export function CeremonieLancement() {
  const monte = useSyncExternalStore(sansAbonnement, () => true, () => false);
  const sec = useSyncExternalStore(abonnerHorloge, seconde, () => 0);
  const maintenant = sec * 1000;

  const [repetition] = useState(() => (typeof window === "undefined" ? null : lireRepetition(window.location.search, Date.now())));
  const [ouvert, setOuvert] = useState(() => {
    if (typeof window === "undefined") return false;
    if (lireRepetition(window.location.search, Date.now())) return true;
    const t = Date.now();
    if (t < DEBUT_PROGRAMME) return lireStockage("session", CLE_VU_SESSION) !== "1";
    if (t < DEBUT_PROGRAMME + FENETRE_CELEBRATION) return lireStockage("local", CLE_CELEBRE) !== "1";
    return false;
  });
  const [niyya, setNiyya] = useState<Niyya | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const brut = lireStockage("local", CLE_NIYYA);
      return brut ? (JSON.parse(brut) as Niyya) : null;
    } catch {
      return null;
    }
  });
  const [brouillon, setBrouillon] = useState("");
  const [manuel, setManuel] = useState(false);
  const [allume, setAllume] = useState(false);
  const [tir, setTir] = useState(0);
  const [finale, setFinale] = useState(false);
  const [sonActif, setSonActif] = useState(false);
  const [muet, setMuet] = useState(false);
  const [micro, setMicro] = useState<"repos" | "ecoute" | "refuse">("repos");
  const toile = useRef<HTMLCanvasElement>(null);
  const son = useRef<SonFeux | null>(null);
  const arretMicro = useRef<(() => void) | null>(null);
  const donnees = useRef<Donnees>({ modules: [], niyya: null, jours: 0 });
  const semaines = useSemaines();

  const cible = repetition?.cible ?? DEBUT_PROGRAMME;
  const restant = cible - maintenant;
  const phase: "veille" | "allumage" | "spectacle" = allume ? "spectacle" : !manuel && (sec === 0 || restant > 0) ? "veille" : "allumage";
  const simule = manuel || repetition !== null;

  // Le vrai programme : la semaine du départ et ses modules
  const d0 = new Date(DEBUT_PROGRAMME);
  const cleDepart = `${d0.getFullYear()}-${deuxChiffres(d0.getMonth() + 1)}-${deuxChiffres(d0.getDate())}`;
  const semaine = semaines.find((s) => s.jours.some((j) => j.date === cleDepart)) ?? semaines[0];
  const seances = semaine ? seancesChronologiques(semaine) : [];
  const premiere = seances.find((s) => s.jour.date === cleDepart);
  const modules = [...new Map(seances.map((s) => [s.seance.moduleId, s.seance.total])).entries()].map(([id, total]) => ({
    court: moduleMeta[id].court,
    couleur: moduleMeta[id].couleur,
    total,
  }));

  useEffect(() => {
    donnees.current = { modules, niyya: niyya?.texte ?? null, jours: totalPlanDays() };
  });

  // À l'heure pile, l'app s'ouvre d'elle-même et attend qu'on allume
  useEffect(() => {
    const id = window.setInterval(() => {
      const t = Date.now();
      if (t >= cible && t < cible + 10_000 && lireStockage("local", CLE_CELEBRE) !== "1") setOuvert(true);
    }, 500);
    return () => window.clearInterval(id);
  }, [cible]);

  useEffect(() => {
    if (!ouvert) return;
    let s = son.current;
    if (!s) {
      try {
        s = new SonFeux();
        son.current = s;
      } catch {
        return;
      }
    }
    const moteur = s;
    const maj = () => setSonActif(moteur.etat === "running");
    const retirer = moteur.surChangement(maj);
    void moteur.reprendre().then(maj).catch(() => undefined);
    return retirer;
  }, [ouvert]);

  useEffect(
    () => () => {
      son.current?.fermer();
      son.current = null;
      arretMicro.current?.();
    },
    []
  );

  useEffect(() => {
    son.current?.couper(muet);
  }, [muet]);

  useEffect(() => {
    if (!ouvert) return;
    const debordement = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const echap = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      ecrireStockage("session", CLE_VU_SESSION, "1");
      arretMicro.current?.();
      setOuvert(false);
      setManuel(false);
      setAllume(false);
      setFinale(false);
    };
    window.addEventListener("keydown", echap);
    return () => {
      document.body.style.overflow = debordement;
      window.removeEventListener("keydown", echap);
    };
  }, [ouvert]);

  // La mèche s'entend dans la dernière minute, et les dix dernières secondes battent
  useEffect(() => {
    if (!ouvert || phase !== "veille" || restant <= 0) return;
    if (restant <= 10_000) son.current?.tic(restant <= 3000);
    else if (restant <= 60_000) son.current?.meche();
  }, [ouvert, phase, restant]);

  useEffect(() => {
    if (!ouvert || phase !== "veille" || restant > 3_600_000) return;
    const avant = document.title;
    const d = decomposer(restant);
    document.title = `${deuxChiffres(d.minutes)}:${deuxChiffres(d.secondes)} · la mèche brûle`;
    return () => {
      document.title = avant;
    };
  }, [ouvert, phase, restant]);

  // Le spectacle
  useEffect(() => {
    if (!monte || !ouvert || phase !== "spectacle" || !toile.current) return;
    if (!simule) ecrireStockage("local", CLE_CELEBRE, "1");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = window.setTimeout(() => setFinale(true), 300);
      return () => window.clearTimeout(id);
    }
    const styles = getComputedStyle(document.documentElement);
    const polices = {
      arabe: styles.getPropertyValue("--font-arabic").trim() || "serif",
      sans: styles.getPropertyValue("--font-sans").trim() || "sans-serif",
      serif: styles.getPropertyValue("--font-serif").trim() || "serif",
    };
    let feux: Feux;
    try {
      feux = new Feux(toile.current, son.current, polices.sans);
    } catch {
      const id = window.setTimeout(() => setFinale(true), 0);
      return () => window.clearTimeout(id);
    }
    void document.fonts?.load(`700 120px ${polices.arabe}`, "بسم الله").catch(() => undefined);
    const arreter = jouerSpectacle(feux, polices, donnees.current, () => setFinale(true));
    return () => {
      arreter();
      feux.detruire();
    };
  }, [monte, ouvert, phase, simule, tir]);

  function fermer() {
    ecrireStockage("session", CLE_VU_SESSION, "1");
    arretMicro.current?.();
    setOuvert(false);
    setManuel(false);
    setAllume(false);
    setFinale(false);
  }

  function allumer() {
    arretMicro.current?.();
    void son.current?.reprendre().catch(() => undefined);
    setFinale(false);
    setAllume(true);
    setTir((n) => n + 1);
  }

  function repeter() {
    void son.current?.reprendre().catch(() => undefined);
    setAllume(false);
    setFinale(false);
    setManuel(true);
  }

  function sceller() {
    const texte = brouillon.trim();
    if (!texte) return;
    const scellee = { texte, scelleLe: new Date().toISOString() };
    ecrireStockage("local", CLE_NIYYA, JSON.stringify(scellee));
    setNiyya(scellee);
  }

  function desceller() {
    setBrouillon(niyya?.texte ?? "");
    ecrireStockage("local", CLE_NIYYA, null);
    setNiyya(null);
  }

  /** Souffler sur la mèche : le micro écoute un souffle d'un quart de seconde */
  async function souffler() {
    void son.current?.reprendre().catch(() => undefined);
    if (micro === "ecoute") return;
    let flux: MediaStream;
    try {
      flux = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch {
      setMicro("refuse");
      return;
    }
    setMicro("ecoute");
    const contexte = new AudioContext();
    const analyseur = contexte.createAnalyser();
    analyseur.fftSize = 1024;
    contexte.createMediaStreamSource(flux).connect(analyseur);
    const tampon = new Float32Array(analyseur.fftSize);
    let debutSouffle = 0;
    let image = 0;
    const fin = () => {
      cancelAnimationFrame(image);
      flux.getTracks().forEach((piste) => piste.stop());
      void contexte.close().catch(() => undefined);
      arretMicro.current = null;
      setMicro("repos");
    };
    const ecouter = () => {
      analyseur.getFloatTimeDomainData(tampon);
      let somme = 0;
      for (const v of tampon) somme += v * v;
      const niveau = Math.sqrt(somme / tampon.length);
      if (niveau > 0.12) {
        debutSouffle ||= performance.now();
        if (performance.now() - debutSouffle > 250) {
          fin();
          allumer();
          return;
        }
      } else debutSouffle = 0;
      image = requestAnimationFrame(ecouter);
    };
    arretMicro.current = fin;
    ecouter();
  }

  // ——— La pastille de la barre du haut ———
  const restantReel = DEBUT_PROGRAMME - maintenant;
  const lance = restantReel <= 0;
  const dReel = decomposer(restantReel);
  const pastille =
    monte && sec > 0 && maintenant < DEBUT_PROGRAMME + FENETRE_CELEBRATION ? (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        title={lance ? "Revoir le départ du programme" : "Voir la mèche"}
        className="inline-flex items-center gap-2 h-8 rounded-full border border-hairline pl-2.5 pr-3 font-sans text-xs text-text-muted hover:text-ink hover:bg-surface-secondary transition-colors whitespace-nowrap"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path d="M6 1.2c.6 1.6 2.6 2.7 2.6 5a2.6 2.6 0 0 1-5.2 0c0-1 .5-1.7 1-2.3.1.8.5 1.3 1 1.5C5 4.2 5.4 2.6 6 1.2z" fill={lance ? "var(--color-accent-olive)" : "#ff8a3c"} />
        </svg>
        {lance ? (
          "Programme lancé"
        ) : (
          <span className="tabular-nums font-semibold text-ink">
            {dReel.jours > 0 ? `J-${dReel.jours} · ` : ""}
            {deuxChiffres(dReel.heures)}:{deuxChiffres(dReel.minutes)}:{deuxChiffres(dReel.secondes)}
          </span>
        )}
      </button>
    ) : null;

  if (!monte || !ouvert) return pastille;

  // ——— La mèche : du Maghrib de la veille jusqu'à 6 h ———
  const dCible = new Date(cible);
  const veilleDate = new Date(dCible.getFullYear(), dCible.getMonth(), dCible.getDate() - 1);
  const horairesVeille = horairesPriere(veilleDate);
  const horairesJour = horairesPriere(dCible);
  const debutMeche = repetition ? cible - 90_000 : aHeure(veilleDate, horairesVeille.maghrib);
  const dureeMeche = cible - debutMeche;
  const brule = phase === "veille" ? borne((maintenant - debutMeche) / dureeMeche) : 1;
  const mecheAllumee = maintenant >= debutMeche;
  const jalons = repetition
    ? []
    : [
        { nom: "Isha", heure: horairesVeille.isha, t: aHeure(veilleDate, horairesVeille.isha) },
        { nom: "Dormir", heure: "22:30", t: aHeure(veilleDate, "22:30") },
        { nom: "Fajr", heure: horairesJour.fajr, t: aHeure(dCible, horairesJour.fajr) },
      ].map((j) => ({ ...j, fraction: borne((j.t - debutMeche) / dureeMeche), passe: maintenant >= j.t }));

  const fajr = aHeure(dCible, horairesJour.fajr);
  const aube = phase === "spectacle" ? 0.15 : borne((maintenant - (fajr - 45 * 60_000)) / (cible - (fajr - 45 * 60_000)));
  const d = decomposer(restant);
  const chrono = `${d.jours > 0 ? `${d.jours} j ` : ""}${deuxChiffres(d.heures)}:${deuxChiffres(d.minutes)}`;
  const etiquetteMeche = !mecheAllumee
    ? `s’allume au Maghrib · ${horairesVeille.maghrib.replace(":", " h ")}`
    : `encore ${d.heures ? `${d.heures} h ` : ""}${deuxChiffres(d.minutes)} min`;

  const bouton = "rounded-full border border-white/20 px-3.5 py-1.5 font-sans text-xs text-[#dfe6ff] hover:bg-white/10 transition-colors whitespace-nowrap";

  const scene = (
    <div className="fixed inset-0 z-[90] overflow-hidden bg-[#03050d] text-[#f3f5ff]" role="dialog" aria-modal="true" aria-label="La veille du départ du programme">
      <style>{STYLES}</style>
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 50% 120%, rgba(255,150,80,${(0.55 * aube).toFixed(3)}), rgba(90,60,140,${(0.25 * aube).toFixed(3)}) 45%, transparent 70%)` }}
        aria-hidden
      />
      <div className="absolute inset-0" style={{ opacity: 1 - aube * 0.8 }} aria-hidden>
        {ETOILES.map((e, i) => (
          <span
            key={i}
            className="veille-scint absolute rounded-full bg-white"
            style={{ left: `${e.x}%`, top: `${e.y}%`, width: e.taille, height: e.taille, opacity: e.opacite, animationDelay: `${-e.delai}s` }}
          />
        ))}
      </div>

      {phase === "spectacle" && <canvas ref={toile} className="absolute inset-0 h-full w-full" aria-hidden />}

      <div className="relative z-10 flex h-full flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-8">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8e9ac2]">
            think.anas · {phase === "veille" ? "la veille du départ" : phase === "allumage" ? "l’heure est venue" : "jour 1"}
            {simule ? " · répétition" : ""}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {sonActif ? (
              <button type="button" onClick={() => setMuet((m) => !m)} className={bouton} aria-pressed={!muet}>
                {muet ? "Son coupé" : "Son actif"}
              </button>
            ) : (
              <button type="button" onClick={() => void son.current?.reprendre().catch(() => undefined)} className={bouton}>
                Activer le son
              </button>
            )}
            {phase === "veille" && (
              <button type="button" onClick={repeter} className={bouton}>
                Répéter l’allumage
              </button>
            )}
            <button
              type="button"
              onClick={fermer}
              className="rounded-full bg-[#ffe9b8] px-4 py-1.5 font-sans text-xs font-semibold text-[#0b1026] hover:bg-white transition-colors whitespace-nowrap"
            >
              {phase === "veille" ? "Entrer dans l’app" : "Fermer"}
            </button>
          </div>
        </header>

        {phase !== "spectacle" && (
          <main className="flex flex-1 flex-col items-center justify-center gap-6 px-5 pb-6">
            {phase === "veille" ? (
              <div className="text-center">
                <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#ffd9a0]/80">
                  Départ du programme · {dCible.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} · {dCible.getHours()} h{dCible.getMinutes() > 0 ? ` ${deuxChiffres(dCible.getMinutes())}` : ""}
                </p>
                <p className="mt-3 font-serif leading-none text-[#fff1d6] tabular-nums" style={{ fontSize: "clamp(64px, 12vw, 164px)" }}>
                  {chrono}
                  <span className="text-[#ffb35c]" style={{ fontSize: "0.42em" }}>
                    :<span key={d.secondes} className="veille-seconde">{deuxChiffres(d.secondes)}</span>
                  </span>
                </p>
                <p dir="ltr" lang="ar" className="mt-2 text-lg text-[#ffd9a0]/55" style={{ fontFamily: "var(--font-arabic)" }}>
                  {indoArabe(`${chrono}:${deuxChiffres(d.secondes)}`)}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5 text-center">
                <p className="font-serif text-4xl text-[#fff1d6] sm:text-6xl">C’est l’heure.</p>
                <p className="max-w-md font-sans text-sm text-[#c3cbe8]">
                  La mèche a brûlé jusqu’au sceau. Personne n’allumera à ta place.
                </p>
                <button
                  type="button"
                  className="allumeur"
                  onPointerDown={(e) => e.currentTarget.classList.add("charge")}
                  onPointerUp={(e) => e.currentTarget.classList.remove("charge")}
                  onPointerLeave={(e) => e.currentTarget.classList.remove("charge")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.currentTarget.classList.add("charge");
                    }
                  }}
                  onKeyUp={(e) => e.currentTarget.classList.remove("charge")}
                  onAnimationEnd={(e) => {
                    if (e.animationName === "allumeur-charge") {
                      e.currentTarget.classList.remove("charge");
                      allumer();
                    }
                  }}
                  aria-label="Maintenir pour allumer le feu d’artifice"
                >
                  <span className="flex flex-col items-center gap-2">
                    <svg width="34" height="34" viewBox="0 0 12 12" aria-hidden>
                      <path d="M6 1.2c.6 1.6 2.6 2.7 2.6 5a2.6 2.6 0 0 1-5.2 0c0-1 .5-1.7 1-2.3.1.8.5 1.3 1 1.5C5 4.2 5.4 2.6 6 1.2z" fill="#ffb35c" />
                    </svg>
                    <span className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#ffe9b8]">Maintiens</span>
                    <span className="font-sans text-[10px] text-[#c3a47e]">pour allumer</span>
                  </span>
                </button>
                <button type="button" onClick={() => void souffler()} className={bouton}>
                  {micro === "ecoute" ? "Souffle sur la mèche…" : micro === "refuse" ? "Micro refusé : maintiens le bouton" : "Ou souffle sur la mèche (micro)"}
                </button>
              </div>
            )}

            <Meche
              brule={brule}
              allumee={phase === "veille" ? mecheAllumee : true}
              jalons={jalons}
              etiquette={phase === "veille" ? etiquetteMeche : ""}
              scellee={Boolean(niyya)}
              arrivee={phase === "allumage"}
              heureCible={`${dCible.getHours()} h${dCible.getMinutes() > 0 ? ` ${deuxChiffres(dCible.getMinutes())}` : ""}`}
            />

            {phase === "veille" && (
              <div className="w-full max-w-lg">
                {niyya ? (
                  <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <svg width="46" height="46" viewBox="0 0 46 46" className="sceau-frappe shrink-0" aria-hidden>
                      <circle cx="23" cy="23" r="21" fill="#8b1e2d" />
                      <circle cx="23" cy="23" r="16" fill="none" stroke="#b8414f" strokeWidth="1.2" />
                      <path d="M23 9l3.2 7.7L34 14l-2.7 7.8L39 25l-7.7 3.2L34 36l-7.8-2.7L23 41l-3.2-7.7L12 36l2.7-7.8L7 25l7.7-3.2L12 14l7.8 2.7z" fill="#a8323f" transform="translate(23 25) scale(.5) translate(-23 -25)" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-xs text-[#ffd9a0]">
                        Niyya scellée à {formatHeure(enMinutes(`${new Date(niyya.scelleLe).getHours()}:${new Date(niyya.scelleLe).getMinutes()}`))}
                      </p>
                      <p className="mt-0.5 truncate font-serif text-sm text-[#f3f5ff] blur-[5px] select-none" aria-hidden>
                        {niyya.texte}
                      </p>
                      <p className="font-sans text-[11px] text-[#8e9ac2]">
                        Illisible jusqu’à {dCible.getHours()} h{dCible.getMinutes() > 0 ? ` ${deuxChiffres(dCible.getMinutes())}` : ""} : c’est le ciel qui l’écrira.
                      </p>
                    </div>
                    <button type="button" onClick={desceller} className="font-sans text-[11px] text-[#aab4d6] hover:text-white">
                      La réécrire
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sceller();
                    }}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <label htmlFor="niyya" className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#ffd9a0]/80">
                      Ta niyya pour ce semestre
                    </label>
                    <textarea
                      id="niyya"
                      value={brouillon}
                      onChange={(e) => setBrouillon(e.target.value)}
                      maxLength={120}
                      rows={2}
                      placeholder="Ce que tu veux devenir d’ici janvier, en une phrase."
                      className="mt-2 w-full resize-none bg-transparent font-serif text-lg text-[#fff1d6] placeholder:text-[#5d6688] focus:outline-none"
                    />
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-sans text-[11px] text-[#5d6688] tabular-nums">{brouillon.length}/120</span>
                      <button
                        type="submit"
                        disabled={!brouillon.trim()}
                        className="rounded-full bg-[#8b1e2d] px-4 py-1.5 font-sans text-xs font-semibold text-[#ffe9e0] disabled:opacity-35 hover:bg-[#a52537] transition-colors"
                      >
                        Sceller jusqu’à {dCible.getHours()} h{dCible.getMinutes() > 0 ? ` ${deuxChiffres(dCible.getMinutes())}` : ""}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </main>
        )}

        {phase === "spectacle" && finale && (
          <div className="absolute inset-x-0 bottom-[8vh] flex flex-col items-center gap-3 px-6 text-center animate-fade-in-up">
            <p className="font-sans text-sm text-[#c9d2f0]">
              {premiere ? `Première séance à ${formatHeure(enMinutes(premiere.seance.debut))} : ${premiere.seance.intitule}.` : "Semaine 1, jour 1."}
              {niyya ? " Ta niyya est gardée ; tu la reliras en janvier." : ""}
            </p>
            <div className="mt-1 flex flex-wrap justify-center gap-3">
              <Link
                href="/objectifs/programme?vue=progression"
                onClick={fermer}
                className="rounded-full bg-[#ffe9b8] px-5 py-2.5 font-sans text-sm font-semibold text-[#0b1026] hover:bg-white transition-colors"
              >
                Ouvrir ma journée
              </Link>
              <button
                type="button"
                onClick={() => {
                  setFinale(false);
                  setTir((n) => n + 1);
                }}
                className={bouton}
              >
                Revoir le spectacle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {pastille}
      {createPortal(scene, document.body)}
    </>
  );
}

// ——— La mèche ———

const TRACE_MECHE = "M 30 170 C 150 40, 290 40, 390 130 S 610 230, 730 110 S 870 30, 915 105";

function Meche({
  brule,
  allumee,
  jalons,
  etiquette,
  scellee,
  arrivee,
  heureCible = "6 h",
}: {
  brule: number;
  allumee: boolean;
  jalons: { nom: string; heure: string; fraction: number; passe: boolean }[];
  etiquette: string;
  scellee: boolean;
  arrivee: boolean;
  heureCible?: string;
}) {
  const trace = useRef<SVGPathElement>(null);
  const tete = useRef<SVGGElement>(null);
  const reperes = useRef<SVGGElement>(null);

  // Les positions le long de la courbe ne se lisent qu'une fois le tracé dans la page
  useLayoutEffect(() => {
    const chemin = trace.current;
    if (!chemin) return;
    const longueur = chemin.getTotalLength();
    const point = chemin.getPointAtLength(longueur * brule);
    tete.current?.setAttribute("transform", `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`);
    reperes.current?.querySelectorAll<SVGGElement>("[data-fraction]").forEach((g) => {
      const p = chemin.getPointAtLength(longueur * Number(g.dataset.fraction));
      g.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
    });
  }, [brule, jalons]);

  return (
    <svg viewBox="0 0 1000 220" className="w-full max-w-5xl" role="img" aria-label={`La mèche : ${Math.round(brule * 100)} % consumée`}>
      <defs>
        <radialGradient id="meche-halo">
          <stop offset="0" stopColor="#ffd27a" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="#ff8a3c" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ff8a3c" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* La corde, puis la cendre sur la part consumée */}
      <path ref={trace} d={TRACE_MECHE} fill="none" stroke="#5b4331" strokeWidth={6} strokeLinecap="round" />
      <path d={TRACE_MECHE} fill="none" stroke="#9a7650" strokeWidth={6} strokeDasharray="2 5" strokeLinecap="round" opacity={0.7} />
      <path d={TRACE_MECHE} pathLength={1} fill="none" stroke="#17161b" strokeWidth={7} strokeLinecap="round" strokeDasharray={`${brule} 2`} />
      <path d={TRACE_MECHE} pathLength={1} fill="none" stroke="#ff7a2e" strokeWidth={1.2} strokeDasharray={`${brule} 2`} opacity={0.25} />

      {/* Les jalons de la nuit */}
      <g ref={reperes}>
        {jalons.map((j, i) => (
          <g key={j.nom} data-fraction={j.fraction}>
            <circle r={4.5} fill={j.passe ? "#34303a" : "#ffd27a"} stroke="#03050d" strokeWidth={2} />
            <text y={i % 2 ? 30 : -16} textAnchor="middle" fontSize={13} fill={j.passe ? "#5d6688" : "#ffe9b8"} style={{ fontFamily: "var(--font-sans)" }}>
              {j.nom}
            </text>
            <text y={i % 2 ? 45 : -31} textAnchor="middle" fontSize={11} fill="#8e9ac2" style={{ fontFamily: "var(--font-sans)" }}>
              {j.heure.replace(/^0/, "").replace(":", " h ")}
            </text>
          </g>
        ))}
      </g>

      {/* Le sceau, au bout de la mèche */}
      <g transform="translate(948 112)">
        {arrivee && <circle r={46} fill="url(#meche-halo)" className="sceau-lueur" />}
        {scellee ? (
          <>
            <circle r={24} fill="#8b1e2d" />
            <circle r={18} fill="none" stroke="#b8414f" strokeWidth={1.2} />
            <text y={6} textAnchor="middle" fontSize={16} fill="#f5c9c9" style={{ fontFamily: "var(--font-arabic)" }}>
              نِيَّة
            </text>
          </>
        ) : (
          <>
            <circle r={24} fill="none" stroke="#ffe9b8" strokeOpacity={0.35} strokeDasharray="3 4" />
            <text y={5} textAnchor="middle" fontSize={14} fill="#ffe9b8" opacity={0.5} style={{ fontFamily: "var(--font-sans)" }}>
              {heureCible}
            </text>
          </>
        )}
      </g>

      {/* La flamme */}
      <g ref={tete}>
        {allumee ? (
          <>
            <circle r={30} fill="url(#meche-halo)" />
            {Array.from({ length: 10 }, (_, i) => (
              <line
                key={i}
                x1={0}
                y1={0}
                x2={Math.cos(i * 0.628) * 15}
                y2={Math.sin(i * 0.628) * 15 - 4}
                stroke={i % 3 ? "#ffd27a" : "#ffffff"}
                strokeWidth={1.3}
                strokeLinecap="round"
                className="meche-etincelle"
                style={{ animationDelay: `${-(i * 0.11)}s`, animationDuration: `${0.4 + (i % 4) * 0.08}s` }}
              />
            ))}
            <circle r={4} fill="#fff6d8" className="meche-coeur" />
            {etiquette && (
              <text y={-40} textAnchor="middle" fontSize={14} fill="#ffe9b8" style={{ fontFamily: "var(--font-sans)" }}>
                {etiquette}
              </text>
            )}
          </>
        ) : (
          <>
            <circle r={5} fill="#3a2a1f" stroke="#ff8a3c" strokeOpacity={0.4} />
            {etiquette && (
              <text y={-18} textAnchor="start" x={-6} fontSize={13} fill="#aab4d6" style={{ fontFamily: "var(--font-sans)" }}>
                {etiquette}
              </text>
            )}
          </>
        )}
      </g>
    </svg>
  );
}
