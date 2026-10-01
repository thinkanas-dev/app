import type { ReactNode } from "react";
import type { AccentColor } from "@/content/objectifs";

const accentBg: Record<AccentColor, string> = {
  clay: "bg-accent-clay/15 text-accent-clay",
  sky: "bg-accent-sky/15 text-accent-sky",
  cactus: "bg-accent-cactus/25 text-accent-olive",
  fig: "bg-accent-fig/15 text-accent-fig",
};

export function IconChip({ accent, children }: { accent: AccentColor; children: ReactNode }) {
  return (
    <div
      className={`h-10 w-10 rounded-md flex items-center justify-center shrink-0 ${accentBg[accent]}`}
    >
      {children}
    </div>
  );
}
