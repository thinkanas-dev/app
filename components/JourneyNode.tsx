import Image from "next/image";
import Link from "next/link";
import type { JourneyNode as JourneyNodeType } from "@/content/journey";
import type { AccentColor, BrandKey } from "@/content/objectifs";
import { InstagramIcon, TikTokIcon, LinkedInIcon } from "./brand-icons";
import { goalArt } from "./goal-art";

const ringColor: Record<AccentColor, string> = {
  clay: "ring-accent-clay/35",
  sky: "ring-accent-sky/35",
  cactus: "ring-accent-olive/35",
  fig: "ring-accent-fig/35",
};

const artColor: Record<AccentColor, string> = {
  clay: "text-accent-clay",
  sky: "text-accent-sky",
  cactus: "text-accent-olive",
  fig: "text-accent-fig",
};

const tintColor: Record<AccentColor, string> = {
  clay: "bg-accent-clay/8",
  sky: "bg-accent-sky/8",
  cactus: "bg-accent-olive/8",
  fig: "bg-accent-fig/8",
};

const brandIcon: Record<BrandKey, (size?: number) => React.ReactNode> = {
  instagram: (size) => <InstagramIcon size={size} />,
  tiktok: (size) => <TikTokIcon size={size} />,
  linkedin: (size) => <LinkedInIcon size={size} />,
};

export function JourneyNode({ node }: { node: JourneyNodeType }) {
  const Art = goalArt[node.id];

  return (
    <Link href={node.href} className="group flex flex-col items-center gap-2 w-20 shrink-0">
      <div
        className={`relative h-16 w-16 rounded-full overflow-hidden ring-2 ring-offset-2 ring-offset-canvas transition-transform group-hover:scale-105 flex items-center justify-center ${
          ringColor[node.accent]
        } ${node.image ? "bg-surface-secondary" : tintColor[node.accent]}`}
      >
        {node.image ? (
          <Image
            src={node.image}
            alt={node.label}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        ) : node.logoKeys ? (
          <div className="flex items-center gap-1">
            {node.logoKeys.map((key) => (
              <div key={key} className="rounded-md overflow-hidden">
                {brandIcon[key](22)}
              </div>
            ))}
          </div>
        ) : Art ? (
          <Art width={32} height={32} className={artColor[node.accent]} />
        ) : null}
      </div>
      <span className="font-sans text-[11px] text-text-muted text-center leading-tight group-hover:text-ink transition-colors">
        {node.label}
      </span>
    </Link>
  );
}
