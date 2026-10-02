"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { IconBook } from "@/components/icons";
import { useObjectifsState } from "@/lib/objectifs-store";

const LIVRE_ID = "histoire-maroc-michel-abitbol";
const TOTAL_PAGES = 605;
const PAGES_PAR_JOUR = 20;
const TOTAL_JOURS = Math.ceil(TOTAL_PAGES / PAGES_PAR_JOUR);
const LECTURE_VIDE = {
  joursTermines: [] as number[],
  morales: {} as Record<string, string>,
  dates: {} as Record<string, string>,
  souverainsTermines: [] as number[],
  notesSouverains: {} as Record<string, string>,
};

const SOUVERAINS = [
  ["Idris Ier", "Idrisside", "789–791", "La fondation du premier État marocain et la construction d’une légitimité."],
  ["Idris II", "Idrisside", "803–828", "Fès devient un centre politique, religieux et urbain majeur."],
  ["Youssef Ibn Tachfine", "Almoravide", "1061–1106", "L’unification du Maroc et l’extension d’un empire jusqu’en al-Andalus."],
  ["Ali ben Youssef", "Almoravide", "1106–1143", "L’administration d’un vaste empire et les signes de son épuisement."],
  ["Abd al-Moumin", "Almohade", "1130–1163", "Le passage d’un mouvement religieux à un empire structuré."],
  ["Abou Yacoub Youssef", "Almohade", "1163–1184", "Le savoir, l’architecture et le rayonnement intellectuel de la cour."],
  ["Yacoub al-Mansour", "Almohade", "1184–1199", "L’apogée almohade, entre puissance militaire et grands chantiers."],
  ["Abou Youssef Yacoub", "Mérinide", "1258–1286", "La consolidation mérinide et le retour d’une ambition maghrébine."],
  ["Abou al-Hassan Ali", "Mérinide", "1331–1348", "La dernière grande tentative d’unification du Maghreb médiéval."],
  ["Abou Inan Faris", "Mérinide", "1348–1358", "Le prestige culturel face aux fragilités politiques internes."],
  ["Mohammed ach-Cheikh", "Wattasside", "1472–1504", "Gouverner un territoire fragmenté sous la pression ibérique."],
  ["Mohammed ech-Cheikh", "Saadien", "1544–1557", "La réunification du pays et la résistance aux puissances étrangères."],
  ["Abdallah al-Ghalib", "Saadien", "1557–1574", "L’équilibre diplomatique entre l’Empire ottoman et l’Europe."],
  ["Ahmed al-Mansour", "Saadien", "1578–1603", "La victoire des Trois Rois, l’or du Soudan et l’État makhzénien."],
  ["Moulay Rachid", "Alaouite", "1666–1672", "La réunification du Maroc et la fondation du pouvoir alaouite."],
  ["Moulay Ismaïl", "Alaouite", "1672–1727", "L’autorité centrale, Meknès et les instruments d’un État durable."],
  ["Moulay Abdallah", "Alaouite", "1729–1757", "La continuité dynastique au milieu de trois décennies d’instabilité."],
  ["Sidi Mohammed ben Abdallah", "Alaouite", "1757–1790", "L’ouverture commerciale et la reconstruction des équilibres du royaume."],
  ["Moulay Yazid", "Alaouite", "1790–1792", "Les conséquences politiques et sociales d’un règne de rupture."],
  ["Moulay Slimane", "Alaouite", "1792–1822", "Réforme religieuse, prudence diplomatique et résistances intérieures."],
  ["Moulay Abderrahmane", "Alaouite", "1822–1859", "Le choc de l’expansion européenne et la défaite de l’Isly."],
  ["Sidi Mohammed IV", "Alaouite", "1859–1873", "Les premières réformes face aux pressions économiques et militaires."],
  ["Moulay Hassan Ier", "Alaouite", "1873–1894", "Les mehallas, la présence de l’État et la défense de l’indépendance."],
  ["Moulay Abdelaziz", "Alaouite", "1894–1908", "Modernisation contrariée, dette et accélération des ingérences étrangères."],
  ["Moulay Abdelhafid", "Alaouite", "1908–1912", "La crise de souveraineté qui mène au traité du Protectorat."],
  ["Moulay Youssef", "Alaouite", "1912–1927", "La monarchie pendant l’installation du Protectorat et la guerre du Rif."],
  ["Mohammed V", "Alaouite", "1927–1961", "Le symbole de l’indépendance, l’exil et le retour du souverain."],
  ["Hassan II", "Alaouite", "1961–1999", "Construction institutionnelle, Marche verte et tensions des années de plomb."],
  ["Mohammed VI", "Alaouite", "Depuis 1999", "Réformes sociales, grands projets et défis du Maroc contemporain."],
] as const;

function plagePages(jour: number) {
  const debut = (jour - 1) * PAGES_PAR_JOUR + 1;
  const fin = Math.min(jour * PAGES_PAR_JOUR, TOTAL_PAGES);
  return { debut, fin, total: fin - debut + 1 };
}

function dateCourte(iso?: string) {
  return iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "";
}

export function HistoireMarocBook() {
  const {
    state,
    hydrated,
    setMoraleLivre,
    basculerJourLivre,
    setNoteSouverain,
    basculerSouverain,
  } = useObjectifsState();
  const lecture = state.lecturesLivres?.[LIVRE_ID] ?? LECTURE_VIDE;
  const premierJourOuvert = useMemo(
    () => Array.from({ length: TOTAL_JOURS }, (_, index) => index + 1).find((jour) => !lecture.joursTermines.includes(jour)) ?? TOTAL_JOURS,
    [lecture.joursTermines]
  );
  const premiereSemaineOuverte = useMemo(
    () => SOUVERAINS.findIndex((_, index) => !lecture.souverainsTermines.includes(index + 1)) + 1 || SOUVERAINS.length,
    [lecture.souverainsTermines]
  );
  const [jourActif, setJourActif] = useState(1);
  const [semaineActive, setSemaineActive] = useState(1);
  const [lecteurOuvert, setLecteurOuvert] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    setJourActif(premierJourOuvert);
    setSemaineActive(premiereSemaineOuverte);
  }, [hydrated, premierJourOuvert, premiereSemaineOuverte]);

  const plage = plagePages(jourActif);
  const termine = lecture.joursTermines.includes(jourActif);
  const morale = lecture.morales[jourActif] ?? "";
  const pagesLues = lecture.joursTermines.reduce((total, jour) => total + plagePages(jour).total, 0);
  const progression = Math.round((pagesLues / TOTAL_PAGES) * 100);
  const souverain = SOUVERAINS[semaineActive - 1];
  const souverainTermine = lecture.souverainsTermines.includes(semaineActive);
  const noteSouverain = lecture.notesSouverains[semaineActive] ?? "";

  function choisirJour(jour: number) {
    setJourActif(jour);
    setLecteurOuvert(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="overflow-hidden rounded-xl border border-hairline bg-canvas">
        <div className="grid md:grid-cols-[180px_minmax(0,1fr)]">
          <div className="relative min-h-64 bg-[#151515]">
            <Image src="/books/histoire-du-maroc-michel-abitbol.jpg" alt="Couverture de Histoire du Maroc de Michel Abitbol" fill sizes="(min-width: 768px) 180px, 100vw" className="object-cover object-top" priority />
          </div>
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-sky">Bibliothèque personnelle · Parcours guidé</p>
                <h2 className="font-serif text-3xl leading-tight text-ink">Histoire du Maroc</h2>
                <p className="mt-1 font-sans text-sm text-text-muted">Michel Abitbol · Éditions Perrin, 2014</p>
              </div>
              <span className="rounded-full bg-brand-soft p-2.5 text-brand" aria-hidden="true"><IconBook width={22} height={22} /></span>
            </div>
            <p className="mt-5 max-w-3xl font-sans text-sm leading-6 text-text-secondary">Un parcours de l’Antiquité au Maroc indépendant. Chaque séance associe 20 pages à une morale personnelle pour transformer la lecture en mémoire durable.</p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[['605', 'pages'], ['20', 'pages / jour'], ['31', 'séances']].map(([valeur, label]) => <div key={label} className="rounded-lg bg-surface-secondary px-3 py-3"><p className="font-sans text-lg font-semibold tabular-nums text-ink">{valeur}</p><p className="font-sans text-[11px] text-text-muted">{label}</p></div>)}
            </div>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3 font-sans text-xs"><span className="text-text-muted">{pagesLues} / {TOTAL_PAGES} pages lues</span><span className="font-semibold tabular-nums text-brand">{hydrated ? progression : 0} %</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-warm">{hydrated && progression > 0 && <div className="h-full rounded-full bg-brand transition-[width] duration-300" style={{ width: `${progression}%` }} />}</div>
            </div>
          </div>
        </div>

        <div className="grid border-t border-hairline lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="font-sans text-xs font-medium text-text-muted">Séance {jourActif} sur {TOTAL_JOURS}</p><h3 className="mt-1 font-serif text-2xl text-ink">Pages {plage.debut} à {plage.fin}</h3><p className="mt-1 font-sans text-xs text-text-muted">Environ 30 à 40 minutes de lecture attentive</p></div>
              <button type="button" onClick={() => setLecteurOuvert((ouvert) => !ouvert)} className="rounded-md bg-brand px-4 py-2.5 font-sans text-sm font-semibold text-canvas transition-colors hover:bg-brand-hover">{lecteurOuvert ? "Fermer le lecteur" : "Lire maintenant"}</button>
            </div>
            {lecteurOuvert && <div className="mt-5 overflow-hidden rounded-lg border border-hairline bg-surface-secondary"><iframe title={`Histoire du Maroc — pages ${plage.debut} à ${plage.fin}`} src={`/api/livres/histoire-maroc#page=${plage.debut}&zoom=page-width`} className="h-[72vh] min-h-[560px] w-full" /><div className="flex flex-wrap items-center justify-between gap-2 border-t border-hairline px-3 py-2"><p className="font-sans text-xs text-text-muted">Document privé, déchiffré uniquement pour cette lecture.</p><a href={`/api/livres/histoire-maroc#page=${plage.debut}`} target="_blank" rel="noreferrer" className="font-sans text-xs font-semibold text-brand hover:underline">Plein écran ↗</a></div></div>}
            <div className="mt-5 rounded-lg border border-hairline bg-surface-secondary p-4">
              <label htmlFor="morale-histoire-maroc" className="font-sans text-sm font-semibold text-ink">Morale ou leçon retenue</label>
              <p className="mt-1 font-sans text-xs leading-5 text-text-muted">Qu’est-ce que cette période vous apprend sur le pouvoir, la société ou les choix collectifs ?</p>
              <textarea id="morale-histoire-maroc" rows={4} value={morale} onChange={(event) => setMoraleLivre(LIVRE_ID, jourActif, event.target.value)} placeholder="Écrivez avec vos mots la leçon que vous voulez garder…" className="mt-3 w-full resize-y rounded-md border border-hairline bg-canvas px-3 py-2.5 font-sans text-sm leading-6 text-ink outline-none transition-colors placeholder:text-text-muted focus:border-brand" />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="font-sans text-xs text-text-muted">{termine ? `Validée${lecture.dates[jourActif] ? ` le ${dateCourte(lecture.dates[jourActif])}` : ""}` : morale.trim() ? "Prêt à valider" : "Une morale est requise pour valider la séance."}</p><button type="button" disabled={!termine && !morale.trim()} onClick={() => basculerJourLivre(LIVRE_ID, jourActif)} className={`rounded-md px-4 py-2 font-sans text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${termine ? "border border-hairline text-text-muted hover:border-brand hover:text-brand" : "bg-brand text-canvas hover:bg-brand-hover"}`}>{termine ? "Réouvrir la séance" : "Valider lecture + morale"}</button></div>
            </div>
          </div>
          <aside className="border-t border-hairline bg-surface-secondary/55 p-5 lg:border-l lg:border-t-0">
            <div className="flex items-center justify-between gap-3"><h3 className="font-sans text-sm font-semibold text-ink">Calendrier de lecture</h3><span className="font-sans text-xs tabular-nums text-text-muted">{lecture.joursTermines.length}/{TOTAL_JOURS}</span></div>
            <div className="mt-4 grid grid-cols-5 gap-2 lg:grid-cols-4">{Array.from({ length: TOTAL_JOURS }, (_, index) => index + 1).map((jour) => { const fait = lecture.joursTermines.includes(jour); const actif = jour === jourActif; return <button key={jour} type="button" onClick={() => choisirJour(jour)} aria-label={`Séance ${jour}, pages ${plagePages(jour).debut} à ${plagePages(jour).fin}${fait ? ", terminée" : ""}`} className={`aspect-square rounded-md border font-sans text-xs font-semibold tabular-nums transition-colors ${actif ? "border-brand bg-brand text-canvas" : fait ? "border-accent-olive/30 bg-accent-olive/15 text-accent-olive" : "border-hairline bg-canvas text-text-muted hover:border-brand hover:text-brand"}`}>{fait ? "✓" : jour}</button>; })}</div>
            <p className="mt-4 font-sans text-[11px] leading-5 text-text-muted">Le jour 31 couvre les pages 601 à 605. Sélectionnez une séance pour relire sa morale ou reprendre sa lecture.</p>
          </aside>
        </div>
      </section>

      <section className="rounded-xl border border-hairline bg-canvas">
        <div className="border-b border-hairline px-5 py-5 sm:px-6">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-fig">Une figure par semaine · Depuis 789</p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-serif text-2xl text-ink">Les souverains du Maroc</h2><p className="mt-1 font-sans text-sm text-text-muted">29 semaines pour relier les dynasties, les décisions et leurs conséquences.</p></div><span className="font-sans text-xs tabular-nums text-text-muted">{lecture.souverainsTermines.length}/{SOUVERAINS.length} découvertes</span></div>
        </div>
        <div className="grid lg:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="max-h-[560px] overflow-y-auto border-b border-hairline p-3 lg:border-b-0 lg:border-r">
            {SOUVERAINS.map(([nom, dynastie, regne], index) => { const semaine = index + 1; const fait = lecture.souverainsTermines.includes(semaine); const actif = semaine === semaineActive; return <button key={`${nom}-${regne}`} type="button" onClick={() => setSemaineActive(semaine)} className={`mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${actif ? "bg-brand-soft" : "hover:bg-surface-secondary"}`}><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-sans text-[11px] font-semibold ${fait ? "bg-accent-olive text-canvas" : actif ? "bg-brand text-canvas" : "bg-surface-warm text-text-muted"}`}>{fait ? "✓" : semaine}</span><span className="min-w-0"><span className="block truncate font-sans text-sm font-medium text-ink">{nom}</span><span className="block font-sans text-[11px] text-text-muted">{dynastie} · {regne}</span></span></button>; })}
          </aside>
          <div className="p-5 sm:p-6">
            <p className="font-sans text-xs font-semibold uppercase tracking-wide text-brand">Semaine {semaineActive} · {souverain[1]}</p>
            <h3 className="mt-2 font-serif text-3xl text-ink">{souverain[0]}</h3>
            <p className="mt-1 font-sans text-sm text-text-muted">Règne : {souverain[2]}</p>
            <div className="mt-5 rounded-lg bg-surface-secondary p-4"><p className="font-sans text-xs font-semibold uppercase tracking-wide text-text-muted">Angle de découverte</p><p className="mt-2 font-serif text-lg leading-7 text-ink">{souverain[3]}</p></div>
            <label htmlFor="note-souverain" className="mt-5 block font-sans text-sm font-semibold text-ink">Ce que je retiens de ce souverain</label>
            <textarea id="note-souverain" rows={4} value={noteSouverain} onChange={(event) => setNoteSouverain(LIVRE_ID, semaineActive, event.target.value)} placeholder="Une décision, une qualité, une erreur et la leçon pour aujourd’hui…" className="mt-2 w-full resize-y rounded-md border border-hairline bg-canvas px-3 py-2.5 font-sans text-sm leading-6 text-ink outline-none placeholder:text-text-muted focus:border-brand" />
            <div className="mt-3 flex justify-end"><button type="button" disabled={!souverainTermine && !noteSouverain.trim()} onClick={() => basculerSouverain(LIVRE_ID, semaineActive)} className={`rounded-md px-4 py-2 font-sans text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${souverainTermine ? "border border-hairline text-text-muted hover:border-brand hover:text-brand" : "bg-brand text-canvas hover:bg-brand-hover"}`}>{souverainTermine ? "Réouvrir cette semaine" : "Valider la découverte"}</button></div>
          </div>
        </div>
      </section>
    </div>
  );
}
