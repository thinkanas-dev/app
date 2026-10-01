"use client";

import { useEffect, useState } from "react";
import { ArtCoran } from "@/components/goal-art";
import { RosaceZellige } from "@/components/RosaceZellige";
import { fetchHizb, type Ayah } from "@/lib/quran";
import { useObjectifsState } from "@/lib/objectifs-store";

export default function CoranPage() {
  const { state, hydrated, toggleHizb } = useObjectifsState();
  const [selected, setSelected] = useState(1);
  const [ayahs, setAyahs] = useState<Ayah[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchHizb(selected)
      .then((data) => {
        if (!cancelled) setAyahs(data);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger ce hizb pour le moment.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const done = state.hizbDone.includes(selected);
  const doneCount = state.hizbDone.length;
  const pct = (doneCount / 60) * 100;
  const juzComplets = Array.from({ length: 30 }, (_, j) => j + 1).filter(
    (j) => state.hizbDone.includes(2 * j - 1) && state.hizbDone.includes(2 * j)
  ).length;

  const groups: { surahNumber: number; surahName: string; ayahs: Ayah[] }[] = [];
  for (const ayah of ayahs ?? []) {
    const last = groups[groups.length - 1];
    if (last && last.surahNumber === ayah.surahNumber) last.ayahs.push(ayah);
    else
      groups.push({
        surahNumber: ayah.surahNumber,
        surahName: ayah.surahName,
        ayahs: [ayah],
      });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Synthèse */}
      <div className="rounded-lg border border-hairline bg-canvas p-5">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-8 w-8 rounded-md bg-accent-olive/10 text-accent-olive flex items-center justify-center">
                <ArtCoran width={18} height={18} />
              </span>
              <h2 className="font-sans font-semibold text-base text-ink">
                Mémorisation du Coran
              </h2>
            </div>
            <p className="font-sans text-sm text-text-muted mb-3 tabular-nums">
              {hydrated ? doneCount : "—"} hizb mémorisés ·{" "}
              {hydrated ? 60 - doneCount : "—"} restants sur 60 ·{" "}
              {hydrated ? juzComplets : "—"} juz complets sur 30
            </p>
            <div className="h-2 w-full rounded-full bg-surface-warm overflow-hidden">
              <div
                className="h-full rounded-full bg-accent-olive transition-[width] duration-500"
                style={{ width: `${hydrated ? pct : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[300px_minmax(0,1fr)] gap-4 items-start">
        {/* Sélecteur : la rosace de zellige */}
        <div className="rounded-lg border border-hairline bg-canvas p-4 lg:sticky lg:top-4">
          <div className="flex items-center justify-between mb-2">
            <p dir="rtl" lang="ar" className="text-lg leading-none text-ink" style={{ fontFamily: "var(--font-arabic)" }}>
              الخَتْمَة
            </p>
            <span className="font-sans text-xs text-text-muted tabular-nums">
              Hizb {selected} · juz {Math.ceil(selected / 2)}
            </span>
          </div>
          <RosaceZellige faits={state.hizbDone} selection={selected} onChoisir={setSelected} pret={hydrated} />
          <p className="font-sans text-[11px] text-text-secondary text-center mt-2 leading-snug">
            Chaque hizb mémorisé passe de la terre cuite à l’émail ; un juz complet émaille son créneau.
          </p>
        </div>

        {/* Lecture */}
        <div className="rounded-lg border border-hairline bg-canvas">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-hairline flex-wrap">
            <div>
              <h2 className="font-sans font-semibold text-base text-ink">Hizb {selected}</h2>
              <p className="font-sans text-xs text-text-muted">
                {loading ? "Chargement…" : `${ayahs?.length ?? 0} versets`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleHizb(selected)}
              className={`rounded-md font-sans text-sm font-medium px-4 py-2 transition-colors ${
                done
                  ? "bg-accent-olive text-canvas hover:opacity-90"
                  : "bg-brand text-canvas hover:bg-brand-hover"
              }`}
            >
              {done ? "Mémorisé" : "Marquer comme mémorisé"}
            </button>
          </div>

          <div className="px-6 py-6 md:px-10 md:py-8">
            {loading && (
              <div className="flex flex-col gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-4 rounded bg-surface-secondary animate-pulse" />
                ))}
              </div>
            )}
            {error && <p className="font-sans text-sm text-accent-deep">{error}</p>}

            {!loading && !error && (
              <div className="flex flex-col gap-8">
                {groups.map((g) => (
                  <div key={g.surahNumber}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="h-px flex-1 bg-hairline" />
                      <p
                        dir="rtl"
                        lang="ar"
                        className="text-center text-xl text-ink"
                        style={{ fontFamily: "var(--font-arabic)" }}
                      >
                        {g.surahName}
                      </p>
                      <span className="h-px flex-1 bg-hairline" />
                    </div>
                    <p
                      dir="rtl"
                      lang="ar"
                      className="leading-[2.4] text-right text-ink"
                      style={{ fontFamily: "var(--font-arabic)", fontSize: "26px" }}
                    >
                      {g.ayahs.map((a) => (
                        <span key={`${g.surahNumber}-${a.numberInSurah}`}>
                          {a.text}
                          <span className="inline-flex items-center justify-center h-6 w-6 mx-1.5 rounded-full bg-accent-olive/12 text-accent-olive text-[11px] align-middle font-sans tabular-nums">
                            {a.numberInSurah}
                          </span>{" "}
                        </span>
                      ))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
