import type { Fournisseur } from "./routeur";

/*
 * Les fournisseurs gratuits, dans l'ordre où le routeur les essaie.
 *
 * Les clés viennent de .env.local et ne quittent jamais le serveur. Les noms
 * de modèles sont ceux des documentations officielles de septembre 2026 ; ils
 * changent souvent, d'où la possibilité de les remplacer sans toucher au code
 * (GEMINI_MODELES=modele-a,modele-b…). Pour OpenRouter, la liste des modèles
 * gratuits est lue en direct, parce qu'elle bouge d'une semaine à l'autre.
 */

const liste = (valeur: string | undefined, parDefaut: string[]) =>
  valeur
    ? valeur
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : parDefaut;

let cacheOpenRouter: { modeles: string[]; expire: number } | null = null;

type ModeleOpenRouter = { id: string; context_length?: number };

/** Les modèles « :free » d'OpenRouter, relus une fois par jour au plus */
async function modelesGratuitsOpenRouter(): Promise<string[]> {
  if (cacheOpenRouter && cacheOpenRouter.expire > Date.now()) return cacheOpenRouter.modeles;
  try {
    const reponse = await fetch("https://openrouter.ai/api/v1/models", { signal: AbortSignal.timeout(8_000) });
    const corps = (await reponse.json()) as { data?: ModeleOpenRouter[] };
    const modeles = (corps.data ?? [])
      .filter((m) => m.id.endsWith(":free"))
      .sort((a, b) => (b.context_length ?? 0) - (a.context_length ?? 0))
      .slice(0, 3)
      .map((m) => m.id);
    cacheOpenRouter = { modeles, expire: Date.now() + 24 * 3_600_000 };
    return modeles;
  } catch {
    return cacheOpenRouter?.modeles ?? [];
  }
}

export async function fournisseursConfigures(env: NodeJS.ProcessEnv = process.env): Promise<Fournisseur[]> {
  return [
    {
      id: "gemini",
      nom: "Gemini",
      url: "https://generativelanguage.googleapis.com/v1beta/openai",
      cle: env.GEMINI_API_KEY,
      modeles: liste(env.GEMINI_MODELES, ["gemini-3.8-flash", "gemini-3.1-flash-lite"]),
    },
    {
      id: "groq",
      nom: "Groq",
      url: "https://api.groq.com/openai/v1",
      cle: env.GROQ_API_KEY,
      modeles: liste(env.GROQ_MODELES, ["openai/gpt-oss-120b", "openai/gpt-oss-20b"]),
    },
    {
      id: "cerebras",
      nom: "Cerebras",
      url: "https://api.cerebras.ai/v1",
      cle: env.CEREBRAS_API_KEY,
      modeles: liste(env.CEREBRAS_MODELES, ["gpt-oss-120b", "qwen-3.8-27b"]),
    },
    {
      id: "openrouter",
      nom: "OpenRouter",
      url: "https://openrouter.ai/api/v1",
      cle: env.OPENROUTER_API_KEY,
      modeles: env.OPENROUTER_MODELES
        ? liste(env.OPENROUTER_MODELES, [])
        : env.OPENROUTER_API_KEY
          ? await modelesGratuitsOpenRouter()
          : [],
      entetes: { "HTTP-Referer": "http://localhost:3100", "X-Title": "think.anas" },
    },
  ];
}
