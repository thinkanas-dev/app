function isoOf(d: Date) {
  return d.toISOString().slice(0, 10);
}

function computeStreak(dates: string[]): number {
  const set = new Set(dates);
  const cursor = new Date();
  if (!set.has(isoOf(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (set.has(isoOf(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function lastNDays(n: number): string[] {
  const days: string[] = [];
  const cursor = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(cursor);
    d.setDate(cursor.getDate() - i);
    days.push(isoOf(d));
  }
  return days;
}

export function StreakTracker({
  markedDates,
  recordTarget,
  onToggleToday,
}: {
  markedDates: string[];
  recordTarget: number;
  onToggleToday: () => void;
}) {
  const today = isoOf(new Date());
  const doneToday = markedDates.includes(today);
  const streak = computeStreak(markedDates);
  const days = lastNDays(35);
  const set = new Set(markedDates);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4 gap-4 flex-wrap">
        <p className="font-sans text-sm font-medium text-ink">Prière quotidienne</p>
        <p className="font-sans text-sm text-text-muted tabular-nums">
          Streak actuel : <span className="text-ink font-semibold">{streak}</span> — record visé :{" "}
          {recordTarget} jours
        </p>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4 max-w-[280px]">
        {days.map((day) => (
          <div
            key={day}
            title={day}
            className={`h-6 w-6 rounded-md ${
              set.has(day) ? "bg-accent-olive" : "bg-surface-warm"
            }`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onToggleToday}
        className={`inline-flex items-center justify-center h-10 px-5 rounded-md font-sans font-semibold text-sm transition-colors ${
          doneToday
            ? "bg-accent-olive text-canvas hover:opacity-90"
            : "bg-brand text-canvas hover:bg-brand-hover"
        }`}
      >
        {doneToday ? "Prié aujourd'hui ✓" : "J'ai prié aujourd'hui"}
      </button>
    </div>
  );
}
