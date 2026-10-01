"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  IconGrid,
  IconTrendingUp,
  IconFlame,
  IconCalendar,
  IconChecklist,
  IconBook,
  IconClose,
  IconChevronsLeft,
  IconClock,
  IconGlobe,
  IconMosaique,
  IconWallet,
  IconSearch,
} from "./icons";
import { Avatar } from "./Avatar";
import { objectifsContent } from "@/content/objectifs";
import { useObjectifsState } from "@/lib/objectifs-store";
import { daysElapsed, totalPlanDays } from "@/lib/plan-timeline";

const mainNav = [
  { href: "/objectifs/aujourdhui", label: "Aujourd’hui", icon: IconCalendar },
  { href: "/objectifs", label: "Vue d'ensemble", icon: IconGrid },
  { href: "/objectifs/atelier", label: "Atelier", icon: IconChecklist },
  { href: "/objectifs/programme", label: "Programme", icon: IconClock },
  { href: "/objectifs/navigateur", label: "Navigateur", icon: IconGlobe },
  { href: "/objectifs/progression", label: "Progression", icon: IconTrendingUp, badgeKey: "milestones" },
  { href: "/objectifs/coran", label: "Le Coran", icon: IconBook, badgeKey: "hizb" },
  { href: "/objectifs/constance", label: "Constance", icon: IconFlame },
  { href: "/objectifs/tapisserie", label: "Tapisserie", icon: IconMosaique },
  { href: "/objectifs/echeances", label: "Échéances", icon: IconCalendar },
  { href: "/objectifs/statuts", label: "Statuts", icon: IconChecklist, badgeKey: "statuts" },
  { href: "/objectifs/finances", label: "Finances", icon: IconWallet },
  { href: "/objectifs/sante", label: "Santé", icon: IconFlame },
  { href: "/objectifs/recherche", label: "Recherche globale", icon: IconSearch },
];

const shortcuts = [
  { href: "/objectifs/goal/instagram-tiktok", label: "Programme 37 jours" },
  { href: "/objectifs/goal/patrimoine", label: "Patrimoine net" },
  { href: "/objectifs/goal/hajj", label: "Hajj 2028" },
  { href: "/objectifs/parametres", label: "Paramètres" },
];

export function DashboardSidebar({
  onOpenPalette,
  open = false,
  onClose,
  collapsed = false,
  onCollapse,
}: {
  onOpenPalette: () => void;
  open?: boolean;
  onClose?: () => void;
  /** Replie la barre sur grand écran */
  collapsed?: boolean;
  onCollapse?: () => void;
}) {
  const pathname = usePathname();
  const { state, hydrated } = useObjectifsState();

  const doneStatuts = objectifsContent.checklist.filter(
    (c) => (state.checklistStatus[c.id] ?? "not-started") === "done"
  ).length;

  const badges: Record<string, string> = {
    milestones: String(objectifsContent.milestones.length),
    hizb: hydrated ? `${state.hizbDone.length}/60` : "",
    statuts: hydrated ? `${doneStatuts}/${objectifsContent.checklist.length}` : "",
  };

  const planPct = Math.round((daysElapsed() / totalPlanDays()) * 100);

  return (
    <>
      {/* Fond sombre derrière le tiroir, mobile uniquement */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-ink/40 z-40"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`w-[264px] shrink-0 border-r border-hairline bg-canvas flex flex-col fixed lg:sticky top-0 h-screen z-50 lg:z-auto transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${collapsed ? "lg:hidden" : ""}`}
      >
      {/* Fermeture du tiroir, mobile uniquement */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer le menu"
        className="lg:hidden absolute top-3 right-3 h-8 w-8 rounded-md border border-hairline text-text-muted hover:text-ink hover:bg-surface-secondary flex items-center justify-center transition-colors"
      >
        <IconClose />
      </button>

      {/* Repli de la barre, grand écran */}
      <button
        type="button"
        onClick={onCollapse}
        aria-label="Replier le menu latéral"
        title="Replier le menu"
        className="group hidden lg:flex absolute top-3.5 right-3 h-7 w-7 rounded-md text-text-secondary hover:text-brand hover:bg-brand-soft items-center justify-center transition-colors"
      >
        <IconChevronsLeft
          width={15}
          height={15}
          className="transition-transform duration-200 group-hover:-translate-x-0.5"
        />
      </button>

      {/* Profile */}
      <div className="px-4 pt-4 pb-3">
        <Link
          href="/objectifs/parametres"
          className="flex items-center gap-2 rounded-md border border-hairline px-2.5 py-2.5 hover:border-text-secondary transition-colors"
        >
          <Avatar
            photo={hydrated ? state.profile.photo : ""}
            name={state.profile.name}
            size={32}
          />
          <div className="min-w-0 flex-1">
            <p className="font-sans font-semibold text-[13px] text-ink truncate leading-tight">
              {state.profile.name}
            </p>
            <p className="font-sans text-[11px] text-text-muted truncate">
              {state.profile.handle}
            </p>
          </div>
          <Image
            src="/logo.png"
            alt="think.anas"
            width={2172}
            height={724}
            className="logo-adaptatif h-6 w-auto shrink-0"
            priority
          />
        </Link>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <button
          type="button"
          onClick={onOpenPalette}
          className="w-full flex items-center gap-2 rounded-md border border-hairline bg-surface-secondary px-3 py-2 text-text-muted hover:border-text-secondary transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <span className="font-sans text-sm flex-1 text-left">Rechercher</span>
          <span className="font-sans text-[11px] text-text-secondary border border-hairline rounded px-1.5 py-0.5 bg-canvas">
            ⌘K
          </span>
        </button>
      </div>

      {/* Main nav */}
      <nav className="px-3 flex flex-col gap-0.5 overflow-y-auto flex-1 min-h-0">
        {mainNav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          const badge = item.badgeKey ? badges[item.badgeKey] : "";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 font-sans text-sm transition-colors ${
                active
                  ? "bg-brand-soft text-brand font-semibold"
                  : "text-ink hover:bg-surface-secondary"
              }`}
            >
              <Icon className={active ? "text-brand" : "text-text-secondary"} />
              <span className="flex-1">{item.label}</span>
              {badge && (
                <span
                  className={`font-sans text-[11px] tabular-nums rounded px-1.5 py-0.5 ${
                    active ? "bg-brand text-canvas" : "bg-surface-secondary text-text-muted"
                  }`}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="h-px bg-hairline my-3 mx-1" />

        <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary px-3 pb-1.5">
          Raccourcis
        </p>
        {shortcuts.map((s) => {
          const active = pathname === s.href;
          return (
            <Link
              key={s.href}
              href={s.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 font-sans text-sm transition-colors ${
                active ? "bg-brand-soft text-brand font-medium" : "text-text-muted hover:bg-surface-secondary hover:text-ink"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-text-secondary shrink-0" />
              {s.label}
            </Link>
          );
        })}
      </nav>

      {/* Plan progress card */}
      <div className="p-4">
        <div className="rounded-lg bg-brand-soft border border-hairline p-4">
          <p className="font-sans font-semibold text-sm text-ink mb-1">Plan 2026 – 2028</p>
          <p className="font-sans text-xs text-text-muted mb-3">
            Jour {daysElapsed()} sur {totalPlanDays()} — {planPct}% du temps écoulé
          </p>
          <div className="h-1.5 w-full rounded-full bg-canvas overflow-hidden mb-3">
            <div className="h-full rounded-full bg-brand" style={{ width: `${planPct}%` }} />
          </div>
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center rounded-md bg-brand hover:bg-brand-hover text-canvas font-sans text-sm font-medium py-2 transition-colors"
          >
            Retour au site
          </Link>
        </div>
      </div>
      </aside>
    </>
  );
}
