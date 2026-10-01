import type { ReactNode } from "react";
import { TopNav } from "@/components/TopNav";
import { FooterBand } from "@/components/FooterBand";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TopNav />
      <main className="flex-1">{children}</main>
      <FooterBand />
    </>
  );
}
