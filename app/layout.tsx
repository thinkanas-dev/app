import type { Metadata } from "next";
import { anthropicSerif, anthropicSans, anthropicMono, quranArabic } from "./fonts";
import { scriptThemeInitial } from "@/lib/themes";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ouroboros.thinkanas.com"),
  title: "think.anas",
  applicationName: "think.anas",
  description: "Tableau de bord personnel pour les études, les objectifs, les finances et la santé.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${anthropicSerif.variable} ${anthropicSans.variable} ${anthropicMono.variable} ${quranArabic.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#f7f8fa" />
        {/* Pose l'ambiance mémorisée avant le premier affichage : pas d'éclair blanc en mode sombre */}
        <script dangerouslySetInnerHTML={{ __html: scriptThemeInitial }} />
      </head>
      <body className="min-h-full flex flex-col bg-canvas"><ServiceWorkerRegistration />{children}</body>
    </html>
  );
}
