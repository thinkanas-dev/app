import type { AccentColor, BrandKey } from "./objectifs";

export type JourneyNode = {
  id: string;
  label: string;
  href: string;
  accent: AccentColor;
  image?: string;
  logoKeys?: BrandKey[];
};

export const journeyNodes: JourneyNode[] = [
  { id: "vehicule", label: "Véhicule", href: "/objectifs/goal/vehicule", accent: "clay" },
  { id: "immobilier", label: "Bien immobilier", href: "/objectifs/goal/immobilier", accent: "clay" },
  { id: "patrimoine", label: "Objectif financier", href: "/objectifs/goal/patrimoine", accent: "clay" },
  { id: "moyenne", label: "Moyenne S3–S5", href: "/objectifs/goal/moyenne", accent: "sky" },
  { id: "hizb", label: "Coran — 60 hizb", href: "/objectifs/goal/hizb", accent: "cactus" },
  { id: "specialisation", label: "Spécialisation", href: "/objectifs/goal/specialisation", accent: "sky" },
  { id: "histoire-maroc", label: "Histoire du Maroc", href: "/objectifs/goal/histoire-maroc", accent: "sky" },
  { id: "langues", label: "4 langues certifiées", href: "/objectifs/statuts", accent: "fig" },
  { id: "instagram-tiktok", label: "IG + TikTok", href: "/objectifs/goal/instagram-tiktok", accent: "fig", logoKeys: ["instagram", "tiktok"] },
  { id: "linkedin", label: "LinkedIn", href: "/objectifs/goal/linkedin", accent: "fig", logoKeys: ["linkedin"] },
  { id: "priere", label: "Prière — 237j", href: "/objectifs/constance", accent: "cactus" },
  { id: "hajj", label: "Hajj", href: "/objectifs/goal/hajj", accent: "cactus" },
];
