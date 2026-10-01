import { Source_Serif_4, Inter, JetBrains_Mono, Amiri } from "next/font/google";

export const anthropicSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const anthropicSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const anthropicMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const quranArabic = Amiri({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});
