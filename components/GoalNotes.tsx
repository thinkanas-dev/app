"use client";

import { useEffect, useState } from "react";

export function GoalNotes({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (local !== value) onChange(local);
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <textarea
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      placeholder="Notes, réflexions, mises à jour…"
      className="w-full min-h-32 bg-canvas text-ink font-sans text-sm rounded-sm border border-text-secondary px-3 py-2 outline-none focus:border-ink resize-y"
    />
  );
}
