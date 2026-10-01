import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Accès sécurisé · think.anas",
  robots: { index: false, follow: false },
};

export default function AccesLayout({ children }: { children: ReactNode }) {
  return children;
}
