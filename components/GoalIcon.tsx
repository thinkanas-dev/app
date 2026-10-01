import { goalArt } from "./goal-art";
import type { AccentColor } from "@/content/objectifs";

const tint: Record<AccentColor, string> = {
  clay: "bg-accent-clay/10 text-accent-clay",
  sky: "bg-accent-sky/10 text-accent-sky",
  cactus: "bg-accent-olive/10 text-accent-olive",
  fig: "bg-accent-fig/10 text-accent-fig",
};

const sizes = {
  sm: { box: "h-9 w-9 rounded-md", art: 20 },
  md: { box: "h-11 w-11 rounded-lg", art: 26 },
  lg: { box: "h-14 w-14 rounded-lg", art: 34 },
};

export function GoalIcon({
  id,
  accent = "sky",
  size = "md",
}: {
  id: string;
  accent?: AccentColor;
  size?: keyof typeof sizes;
}) {
  const Art = goalArt[id];
  const s = sizes[size];

  return (
    <span
      className={`${s.box} ${tint[accent]} flex items-center justify-center shrink-0`}
      aria-hidden
    >
      {Art ? <Art width={s.art} height={s.art} /> : null}
    </span>
  );
}
