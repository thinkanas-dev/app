"use client";

/**
 * Visuel propre au dossier contenu : deux rails parallèles — ce qu'on apprend
 * (privé) et ce qu'on publie (public) — traversant les blocs du programme.
 * Sert aussi de navigation : cliquer un bloc le sélectionne.
 */

type Bloc = {
  id: string;
  titre: string;
  jours: string;
  items: unknown[];
};

export function ProgrammeRails({
  blocs,
  activeId,
  onSelect,
}: {
  blocs: Bloc[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-hairline bg-canvas p-4">
      {/* Légende des deux pistes */}
      <div className="flex items-center gap-4 mb-4 pb-3 border-b border-hairline">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand shrink-0" />
          <span className="font-sans text-[11px] text-text-muted">Formation</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-accent-fig shrink-0" />
          <span className="font-sans text-[11px] text-text-muted">Contenu</span>
        </span>
      </div>

      <div className="relative">
        {/* Les deux rails continus */}
        <div className="absolute left-[7px] top-3 bottom-3 w-px bg-brand/25" aria-hidden />
        <div className="absolute left-[19px] top-3 bottom-3 w-px bg-accent-fig/25" aria-hidden />

        <ul className="flex flex-col">
          {blocs.map((bloc) => {
            const active = bloc.id === activeId;
            return (
              <li key={bloc.id}>
                <button
                  type="button"
                  onClick={() => onSelect(bloc.id)}
                  aria-current={active ? "step" : undefined}
                  className={`w-full text-left flex items-start gap-3 rounded-md py-2.5 pr-2 pl-0 transition-colors ${
                    active ? "bg-brand-soft" : "hover:bg-surface-secondary"
                  }`}
                >
                  {/* Les deux points du bloc, alignés sur les rails */}
                  <span className="relative w-[26px] shrink-0 h-5">
                    <span
                      className={`absolute left-[3px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-canvas ${
                        active ? "bg-brand" : "bg-brand/45"
                      }`}
                    />
                    <span
                      className={`absolute left-[15px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-canvas ${
                        active ? "bg-accent-fig" : "bg-accent-fig/45"
                      }`}
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={`font-sans text-[13px] leading-snug block ${
                        active ? "text-ink font-semibold" : "text-ink font-medium"
                      }`}
                    >
                      {bloc.titre}
                    </span>
                    <span className="font-sans text-[11px] text-text-muted tabular-nums">
                      {bloc.jours} · {bloc.items.length} jours
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
