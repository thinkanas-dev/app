"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "./DashboardSidebar";
import { CommandPalette } from "./CommandPalette";
import { IconMenu, IconSearch, IconChevronsRight } from "./icons";
import { FlagFR, FlagMA } from "./flags";
import { SelecteurTheme } from "./SelecteurTheme";
import { CeremonieLancement } from "./lancement/CeremonieLancement";
import { useObjectifsState } from "@/lib/objectifs-store";
import { NotificationScheduler } from "./NotificationScheduler";

const tabs = [
  { href: "/objectifs/aujourdhui", label: "Aujourd’hui" },
  { href: "/objectifs", label: "Vue d'ensemble" },
  { href: "/objectifs/atelier", label: "Atelier" },
  { href: "/objectifs/progression", label: "Progression" },
  { href: "/objectifs/statuts", label: "Statuts" },
];

const monthShort = [
  "JAN", "FÉV", "MAR", "AVR", "MAI", "JUIN",
  "JUIL", "AOÛT", "SEP", "OCT", "NOV", "DÉC",
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [lang, setLang] = useState<"fr" | "ar">("fr");
  const [today, setToday] = useState<Date | null>(null);
  const { togglePrayerToday } = useObjectifsState();
  const pathname = usePathname();

  useEffect(() => {
    setToday(new Date());
    try {
      if (window.localStorage.getItem("think-anas-menu") === "ferme") setCollapsed(true);
    } catch {
      // préférence non lisible : on garde le menu ouvert
    }
  }, []);

  function basculerMenu() {
    setCollapsed((v) => {
      const suivant = !v;
      try {
        window.localStorage.setItem("think-anas-menu", suivant ? "ferme" : "ouvert");
      } catch {
        // préférence non enregistrable, sans conséquence
      }
      return suivant;
    });
  }

  // Le tiroir mobile se referme dès qu'on change de page
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  // Escape ferme le tiroir
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setNavOpen(false);
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-canvas flex">
      <NotificationScheduler />
      <DashboardSidebar
        onOpenPalette={() => setPaletteOpen(true)}
        open={navOpen}
        onClose={() => setNavOpen(false)}
        collapsed={collapsed}
        onCollapse={basculerMenu}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Barre mobile */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 h-14 px-4 border-b border-hairline bg-canvas">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Ouvrir le menu"
            className="h-9 w-9 rounded-md border border-hairline text-ink flex items-center justify-center hover:bg-surface-secondary transition-colors"
          >
            <IconMenu />
          </button>
          <Image
            src="/logo.png"
            alt="think.anas"
            width={2172}
            height={724}
            className="logo-adaptatif h-5 w-auto"
          />
          <div className="ml-auto">
            <SelecteurTheme />
          </div>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Rechercher"
            className="h-9 w-9 rounded-md border border-hairline text-text-muted flex items-center justify-center hover:bg-surface-secondary transition-colors"
          >
            <IconSearch width={16} height={16} />
          </button>
        </div>

        {/* Top bar */}
        <div className="lg:sticky lg:top-0 z-20 bg-canvas px-4 lg:px-8 pt-5 lg:pt-6 pb-0 border-b border-hairline">
            <div className="flex items-start justify-between gap-6 flex-wrap mb-5">
              <div className="flex items-center gap-3">
                {collapsed && (
                  <button
                    type="button"
                    onClick={basculerMenu}
                    aria-label="Rouvrir le menu latéral"
                    title="Rouvrir le menu"
                    className="group hidden lg:flex h-9 w-9 rounded-md border border-hairline text-text-muted items-center justify-center hover:text-brand hover:border-brand hover:bg-brand-soft transition-colors shrink-0"
                  >
                    <IconChevronsRight
                      width={16}
                      height={16}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </button>
                )}
                <div className="h-11 w-11 rounded-md border border-hairline flex flex-col items-center justify-center shrink-0">
                  <span className="font-sans text-[9px] font-semibold text-brand leading-none">
                    {today ? monthShort[today.getMonth()] : "—"}
                  </span>
                  <span className="font-sans text-base font-semibold text-ink leading-tight tabular-nums">
                    {today ? today.getDate() : "—"}
                  </span>
                </div>
                <div>
                  <h1 className="font-sans font-semibold text-xl text-ink">
                    Bonjour, Anas 👋
                  </h1>
                  <p className="font-sans text-sm text-text-muted">
                    Prêt à avancer sur ton plan d&apos;aujourd&apos;hui ?
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-md border border-hairline overflow-hidden">
                  {(
                    [
                      { code: "fr", label: "Fr", Flag: FlagFR },
                      { code: "ar", label: "Ar", Flag: FlagMA },
                    ] as const
                  ).map(({ code, label, Flag }) => {
                    const active = lang === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setLang(code)}
                        aria-pressed={active}
                        className={`flex items-center gap-1.5 font-sans text-xs px-2.5 py-1.5 transition-colors ${
                          active
                            ? "bg-surface-secondary text-ink font-medium"
                            : "text-text-muted hover:bg-surface-secondary/60"
                        }`}
                      >
                        <Flag width={18} height={12} />
                        {label}
                      </button>
                    );
                  })}
                </div>
                <CeremonieLancement />
                <SelecteurTheme />
                <button
                  type="button"
                  onClick={() => setPaletteOpen(true)}
                  aria-label="Rechercher"
                  className="h-8 w-8 rounded-full border border-hairline flex items-center justify-center text-text-muted hover:text-ink hover:bg-surface-secondary transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Notifications"
                  className="h-8 w-8 rounded-full border border-hairline flex items-center justify-center text-text-muted hover:text-ink hover:bg-surface-secondary transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => {
                const active = pathname === tab.href;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`font-sans text-sm pb-3 border-b-2 transition-colors ${
                      active
                        ? "border-brand text-ink font-semibold"
                        : "border-transparent text-text-muted hover:text-ink"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </div>

        {/* Page content */}
        <div className="motif-theme p-4 lg:p-6 bg-surface-secondary flex-1 min-w-0">{children}</div>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onTogglePrayer={togglePrayerToday}
      />
    </div>
  );
}
