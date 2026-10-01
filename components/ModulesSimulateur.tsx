"use client";

type Module = { id: string; nom: string };

/**
 * Répond à la seule question vraiment actionnable : compte tenu des notes
 * déjà obtenues, que faut-il décrocher sur les modules restants ?
 */
export function ModulesSimulateur({
  modules,
  grades,
  cible,
}: {
  modules: Module[];
  grades: Record<string, number>;
  cible: number;
}) {
  const total = modules.length;
  const saisies = modules.filter((m) => typeof grades[m.id] === "number");
  const restants = total - saisies.length;
  const somme = saisies.reduce((s, m) => s + grades[m.id], 0);

  const requis = restants > 0 ? (cible * total - somme) / restants : null;
  const moyenneActuelle = saisies.length > 0 ? somme / saisies.length : 0;

  // Lecture honnête de la difficulté
  let verdict: { ton: "ok" | "exigeant" | "impossible" | "attente"; titre: string; detail: string };

  if (saisies.length === 0) {
    verdict = {
      ton: "attente",
      titre: "En attente de vos premières notes",
      detail: `Saisissez au moins une note pour savoir ce qu'il vous reste à décrocher sur les ${total} modules.`,
    };
  } else if (restants === 0) {
    const atteint = moyenneActuelle >= cible;
    verdict = {
      ton: atteint ? "ok" : "impossible",
      titre: atteint ? "Cible atteinte" : "Cible manquée pour ce semestre",
      detail: atteint
        ? `Moyenne finale de ${moyenneActuelle.toFixed(2)} / 20, au-dessus des ${cible.toFixed(1)} visés.`
        : `Moyenne finale de ${moyenneActuelle.toFixed(2)} / 20, soit ${(cible - moyenneActuelle).toFixed(2)} point sous la cible. Le rattrapage se jouera sur S4 et S5.`,
    };
  } else if (requis! > 20) {
    verdict = {
      ton: "impossible",
      titre: "Hors d'atteinte sur ce semestre",
      detail: `Il faudrait ${requis!.toFixed(2)} / 20 sur les ${restants} modules restants, ce qui dépasse le maximum possible. La cible de ${cible.toFixed(1)} devra se rattraper sur S4 et S5.`,
    };
  } else if (requis! <= 0) {
    verdict = {
      ton: "ok",
      titre: "Cible déjà sécurisée",
      detail: `Même avec 0 aux ${restants} modules restants, la moyenne reste au-dessus de ${cible.toFixed(1)}.`,
    };
  } else if (requis! >= 17) {
    verdict = {
      ton: "exigeant",
      titre: "Exigeant mais possible",
      detail: `Il vous faut ${requis!.toFixed(2)} / 20 de moyenne sur les ${restants} modules restants. Ça ne laisse aucune marge.`,
    };
  } else {
    verdict = {
      ton: "ok",
      titre: "Atteignable",
      detail: `Il vous faut ${requis!.toFixed(2)} / 20 de moyenne sur les ${restants} modules restants.`,
    };
  }

  const tonClasses = {
    ok: "bg-accent-cactus text-accent-olive",
    exigeant: "bg-surface-manilla text-accent-clay",
    impossible: "bg-accent-coral text-accent-deep",
    attente: "bg-surface-secondary text-text-muted",
  }[verdict.ton];

  // Scénarios : et si j'obtiens X partout sur le reste ?
  const scenarios = [12, 14, 16, 18].map((note) => ({
    note,
    finale: restants > 0 ? (somme + note * restants) / total : moyenneActuelle,
  }));

  return (
    <div className="flex flex-col gap-5">
      {/* Verdict */}
      <div className={`rounded-md px-4 py-3 ${tonClasses}`}>
        <p className="font-sans font-semibold text-sm mb-0.5">{verdict.titre}</p>
        <p className="font-sans text-sm leading-snug opacity-90">{verdict.detail}</p>
      </div>

      {/* Échelle du requis */}
      {requis !== null && requis > 0 && requis <= 20 && (
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-sans text-xs text-text-muted">
              Moyenne nécessaire sur les {restants} modules restants
            </span>
            <span className="font-sans font-semibold text-lg text-ink tabular-nums">
              {requis.toFixed(2)} / 20
            </span>
          </div>

          <div className="relative h-8">
            {/* Zones de difficulté */}
            <div className="absolute inset-x-0 top-2.5 h-3 rounded-full overflow-hidden flex">
              <div className="w-[60%] bg-accent-cactus" title="Confortable" />
              <div className="w-[20%] bg-surface-manilla" title="Exigeant" />
              <div className="w-[20%] bg-accent-coral" title="Très exigeant" />
            </div>
            {/* Aiguille */}
            <div
              className="absolute top-0 h-8 w-0.5 bg-ink rounded-full"
              style={{ left: `${(requis / 20) * 100}%` }}
            />
          </div>
          <div className="flex justify-between font-sans text-[10px] text-text-secondary mt-0.5">
            <span>0</span>
            <span>12</span>
            <span>16</span>
            <span>20</span>
          </div>
        </div>
      )}

      {/* Scénarios */}
      {restants > 0 && saisies.length > 0 && (
        <div>
          <p className="font-sans text-xs text-text-muted mb-2">
            Et si vous obtenez la même note sur tous les modules restants ?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {scenarios.map((s) => {
              const atteint = s.finale >= cible;
              return (
                <div
                  key={s.note}
                  className={`rounded-md border px-3 py-2.5 ${
                    atteint ? "border-accent-olive/40 bg-accent-cactus/40" : "border-hairline"
                  }`}
                >
                  <p className="font-sans text-[11px] text-text-muted mb-0.5 tabular-nums">
                    {s.note} / 20 partout
                  </p>
                  <p
                    className={`font-sans font-semibold text-base tabular-nums ${
                      atteint ? "text-accent-olive" : "text-ink"
                    }`}
                  >
                    {s.finale.toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
