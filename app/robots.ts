import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/", "/about", "/blog", "/contact"], disallow: ["/objectifs/", "/acces", "/api/"] }],
    sitemap: "https://ouroboros.thinkanas.com/sitemap.xml",
    host: "https://ouroboros.thinkanas.com",
  };
}
