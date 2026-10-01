/*
 * Le pont exposé par desktop/preload.cjs. Absent (undefined) dans un
 * navigateur ordinaire : seule l'app de bureau le fournit.
 */

export {};

declare global {
  type OngletNavigateur = {
    id: string;
    url: string;
    titre: string;
    chargement: boolean;
    peutReculer: boolean;
    peutAvancer: boolean;
  };

  type BornesZone = { x: number; y: number; width: number; height: number };

  type RegleGardeFou = { actif: boolean; domainesAutorises: string[]; raison: string };

  interface PontNavigateur {
    etat(): Promise<{ onglets: OngletNavigateur[]; actif: string | null; max: number }>;
    ouvrir(url: string): Promise<string>;
    fermer(id: string): Promise<void>;
    activer(id: string): Promise<void>;
    aller(id: string, url: string): Promise<void>;
    reculer(id: string): Promise<void>;
    avancer(id: string): Promise<void>;
    recharger(id: string): Promise<void>;
    /** Où dessiner l'onglet actif ; null le masque */
    zone(bornes: BornesZone | null): Promise<void>;
    lireTexte(id: string): Promise<{ titre: string; url: string; texte: string }>;
    gardeFou(regle: RegleGardeFou): Promise<void>;
    surOnglets(rappel: (onglets: OngletNavigateur[], actif: string | null) => void): () => void;
    surBlocage(rappel: (info: { url: string; raison: string }) => void): () => void;
  }

  interface PontDonnees {
    sauvegarder(etat: unknown): Promise<void>;
    charger(): Promise<unknown | null>;
  }

  interface Window {
    thinkAnas?: { version: string; navigateur: PontNavigateur; donnees: PontDonnees };
  }
}
