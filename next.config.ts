import { setDefaultResultOrder } from "dns";
import type { NextConfig } from "next";

// This sandbox's network blackholes IPv6 connections instead of rejecting them,
// which makes Node's fetch (used by next/font/google) hang until timeout.
// Forcing IPv4-first DNS resolution avoids that.
setDefaultResultOrder("ipv4first");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  async headers() {
    const securite = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(), payment=()" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    ];
    return [
      { source: "/:path*", headers: securite },
      { source: "/objectifs/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/acces", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
    ];
  },
};

export default nextConfig;
