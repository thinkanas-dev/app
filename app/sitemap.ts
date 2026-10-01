import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://thinkanas.com";
  return ["", "/about", "/blog", "/contact"].map((route) => ({ url: `${base}${route}`, changeFrequency: "monthly" as const, priority: route ? 0.6 : 1 }));
}
