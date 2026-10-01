"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconGrid,
  IconTrendingUp,
  IconFlame,
  IconCalendar,
  IconChecklist,
  IconSearch,
  IconWallet,
} from "./icons";
import { useObjectifsState } from "@/lib/objectifs-store";

type Command = {
  id: string;
  label: string;
  hint?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  run: () => void;
};

export function CommandPalette({
  open,
  onClose,
  onTogglePrayer,
}: {
  open: boolean;
  onClose: () => void;
  onTogglePrayer: () => void;
}) {
  const router = useRouter();
  const { state } = useObjectifsState();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = useMemo(
    () => [
      {
        id: "today",
        label: "Aujourd’hui",
        hint: "Centre de commande",
        icon: IconCalendar,
        run: () => router.push("/objectifs/aujourdhui"),
      },
      {
        id: "atelier",
        label: "Atelier — créer et configurer",
        hint: "Gérer",
        icon: IconChecklist,
        run: () => router.push("/objectifs/atelier"),
      },
      {
        id: "overview",
        label: "Vue d'ensemble",
        hint: "Aller à",
        icon: IconGrid,
        run: () => router.push("/objectifs"),
      },
      {
        id: "progression",
        label: "Progression",
        hint: "Aller à",
        icon: IconTrendingUp,
        run: () => router.push("/objectifs/progression"),
      },
      {
        id: "constance",
        label: "Constance",
        hint: "Aller à",
        icon: IconFlame,
        run: () => router.push("/objectifs/constance"),
      },
      {
        id: "echeances",
        label: "Échéances",
        hint: "Aller à",
        icon: IconCalendar,
        run: () => router.push("/objectifs/echeances"),
      },
      {
        id: "statuts",
        label: "Statuts",
        hint: "Aller à",
        icon: IconChecklist,
        run: () => router.push("/objectifs/statuts"),
      },
      {
        id: "prayer",
        label: "Marquer la prière d'aujourd'hui",
        hint: "Action",
        icon: IconFlame,
        run: onTogglePrayer,
      },
      {
        id: "finances",
        label: "Finances",
        hint: "Aller à",
        icon: IconWallet,
        run: () => router.push("/objectifs/finances"),
      },
      {
        id: "global-search",
        label: "Recherche globale dans toutes les données",
        hint: "Rechercher",
        icon: IconSearch,
        run: () => router.push("/objectifs/recherche"),
      },
      ...state.atelier.taches.filter((item) => !item.terminee).slice(0, 15).map((item) => ({
        id: `task-${item.id}`,
        label: item.titre,
        hint: "Tâche",
        icon: IconChecklist,
        run: () => router.push("/objectifs/aujourdhui"),
      })),
      ...state.atelier.objectifs.slice(0, 10).map((item) => ({
        id: `custom-goal-${item.id}`,
        label: item.titre,
        hint: "Objectif personnel",
        icon: IconTrendingUp,
        run: () => router.push("/objectifs/atelier"),
      })),
    ],
    [router, onTogglePrayer, state.atelier.taches, state.atelier.objectifs]
  );

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!open) return null;

  function execute(cmd: Command) {
    cmd.run();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Palette de commandes"
        className="w-full max-w-lg bg-canvas rounded-md border border-hairline overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une action ou une page…"
          className="w-full px-4 py-4 font-sans text-base text-ink bg-transparent outline-none border-b border-hairline"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(0, i - 1));
            } else if (e.key === "Enter" && filtered[activeIndex]) {
              e.preventDefault();
              execute(filtered[activeIndex]);
            } else if (e.key === "Escape") {
              onClose();
            }
          }}
        />
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <p className="px-4 py-6 font-sans text-sm text-text-muted">Aucun résultat</p>
          )}
          {filtered.map((cmd, i) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.id}
                type="button"
                onClick={() => execute(cmd)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === activeIndex ? "bg-surface-secondary-hover" : ""
                }`}
              >
                <Icon className="text-text-muted shrink-0" />
                <span className="font-sans text-sm text-ink flex-1">{cmd.label}</span>
                {cmd.hint && (
                  <span className="font-mono uppercase text-[10px] text-text-tertiary">
                    {cmd.hint}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="px-4 py-2 border-t border-hairline flex items-center gap-4">
          <span className="font-mono text-[10px] text-text-tertiary">↑↓ naviguer</span>
          <span className="font-mono text-[10px] text-text-tertiary">↵ sélectionner</span>
          <span className="font-mono text-[10px] text-text-tertiary">esc fermer</span>
        </div>
      </div>
    </div>
  );
}
