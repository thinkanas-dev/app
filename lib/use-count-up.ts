"use client";

import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number | null, durationMs = 500): number | null {
  const [value, setValue] = useState<number | null>(target);
  const prevTarget = useRef<number | null>(target);

  useEffect(() => {
    if (target === null) {
      setValue(null);
      return;
    }
    const from = prevTarget.current ?? 0;
    const to = target;
    prevTarget.current = target;

    if (from === to) {
      setValue(to);
      return;
    }

    let raf: number;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(from + (to - from) * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}
