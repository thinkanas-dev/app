import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "think.anas",
    short_name: "think.anas",
    description: "Tableau de bord personnel pour les études, les objectifs, les finances et la santé.",
    start_url: "/objectifs/aujourdhui",
    display: "standalone",
    background_color: "#f3dfb1",
    theme_color: "#c58b42",
    lang: "fr",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" }],
  };
}
