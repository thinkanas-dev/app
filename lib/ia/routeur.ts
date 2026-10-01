/*
 * Le routeur d'IA gratuite.
 *
 * Aucune API cloud n'est gratuite et illimitée : chacune a son quota. Le
 * routeur les enchaîne — Gemini, puis Groq, Cerebras, OpenRouter — et quand un
 * modèle atteint son quota, il le met en pause le temps indiqué et passe au
 * suivant. Pour un usage personnel, la capacité cumulée dépasse largement ce
 * qu'on consomme en une journée.
 *
 * Tous ces fournisseurs parlent le même format (celui d'OpenAI) : un seul
 * appel, des adresses différentes. Aucune dépendance d'exécution — `fetch` et
 * l'horloge sont injectables, ce fichier se teste sans réseau.
 */

export type MessageIA = { role: "system" | "user" | "assistant"; content: string };

export type Fournisseur = {
  id: string;
  nom: string;
  /** Adresse de base compatible OpenAI, sans « / » final */
  url: string;
  cle: string | undefined;
  /** Dans l'ordre de préférence */
  modeles: string[];
  entetes?: Record<string, string>;
};

export type DemandeIA = { messages: MessageIA[]; temperature?: number; maxTokens?: number };

export type StatutEssai =
  | "ok"
  | "sans-cle"
  | "en-pause"
  | "quota"
  | "cle-invalide"
  | "modele-inconnu"
  | "indisponible"
  | "erreur";

export type EssaiIA = { fournisseur: string; modele: string; statut: StatutEssai; detail?: string };

export type ReponseIA = {
  texte: string;
  fournisseur: string;
  modele: string;
  dureeMs: number;
  essais: EssaiIA[];
};

export class IAIndisponible extends Error {
  essais: EssaiIA[];

  constructor(essais: EssaiIA[]) {
    super("Aucun fournisseur d'IA n'a pu répondre.");
    this.name = "IAIndisponible";
    this.essais = essais;
  }
}

/** Pauses en cours, par « fournisseur|modèle » : horodatage de reprise */
export type EtatRouteur = { pauses: Map<string, number> };

export function creerEtatRouteur(): EtatRouteur {
  return { pauses: new Map() };
}

const MINUTE = 60_000;

type OptionsRouteur = {
  fetch?: typeof fetch;
  maintenant?: () => number;
  delaiMs?: number;
};

type CorpsReponse = { choices?: { message?: { content?: string | null } }[] };

export async function demanderIA(
  demande: DemandeIA,
  fournisseurs: Fournisseur[],
  etat: EtatRouteur,
  options: OptionsRouteur = {}
): Promise<ReponseIA> {
  const appeler = options.fetch ?? fetch;
  const maintenant = options.maintenant ?? Date.now;
  const debut = maintenant();
  const essais: EssaiIA[] = [];

  for (const fournisseur of fournisseurs) {
    if (!fournisseur.cle) {
      essais.push({ fournisseur: fournisseur.id, modele: "—", statut: "sans-cle" });
      continue;
    }

    for (const modele of fournisseur.modeles) {
      const cle = `${fournisseur.id}|${modele}`;
      const essai = (statut: StatutEssai, detail?: string) =>
        essais.push({ fournisseur: fournisseur.id, modele, statut, ...(detail ? { detail } : {}) });

      const reprise = etat.pauses.get(cle);
      if (reprise !== undefined && reprise > maintenant()) {
        essai("en-pause", `reprise dans ${Math.ceil((reprise - maintenant()) / 1000)} s`);
        continue;
      }

      let reponse: Response;
      try {
        reponse = await appeler(`${fournisseur.url}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${fournisseur.cle}`,
            ...fournisseur.entetes,
          },
          body: JSON.stringify({
            model: modele,
            messages: demande.messages,
            temperature: demande.temperature ?? 0.4,
            max_tokens: demande.maxTokens ?? 1500,
          }),
          signal: AbortSignal.timeout(options.delaiMs ?? 45_000),
        });
      } catch (e) {
        etat.pauses.set(cle, maintenant() + MINUTE);
        essai("indisponible", e instanceof Error ? e.name : "réseau");
        continue;
      }

      if (reponse.ok) {
        const corps = (await reponse.json().catch(() => null)) as CorpsReponse | null;
        const texte = corps?.choices?.[0]?.message?.content?.trim();
        if (texte) {
          essai("ok");
          return { texte, fournisseur: fournisseur.nom, modele, dureeMs: maintenant() - debut, essais };
        }
        essai("erreur", "réponse vide");
        continue;
      }

      const statut = reponse.status;
      const detail = (await reponse.text().catch(() => "")).slice(0, 160);

      if (statut === 429) {
        // Quota atteint : on respecte le délai annoncé, une minute sinon
        const secondes = Number(reponse.headers.get("retry-after"));
        const duree = Number.isFinite(secondes) && secondes > 0 ? secondes * 1000 : MINUTE;
        etat.pauses.set(cle, maintenant() + duree);
        essai("quota", detail);
        continue;
      }
      if (statut === 401 || statut === 403) {
        // Clé refusée : inutile d'essayer les autres modèles du même fournisseur
        essai("cle-invalide", detail);
        break;
      }
      if (statut === 404 || (statut === 400 && /model/i.test(detail))) {
        // Modèle retiré ou renommé : écarté pour six heures
        etat.pauses.set(cle, maintenant() + 360 * MINUTE);
        essai("modele-inconnu", detail);
        continue;
      }
      if (statut >= 500) {
        etat.pauses.set(cle, maintenant() + MINUTE / 2);
        essai("indisponible", `${statut} ${detail}`);
        continue;
      }
      essai("erreur", `${statut} ${detail}`);
    }
  }

  throw new IAIndisponible(essais);
}
