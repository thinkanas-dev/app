import { NextResponse } from "next/server";
import { demanderIA, creerEtatRouteur, IAIndisponible } from "@/lib/ia/routeur";
import { fournisseursConfigures } from "@/lib/ia/fournisseurs";
import { messagesPour, TACHES_IA, type TacheIA } from "@/lib/ia/taches";

/*
 * POST /api/ia : une tâche (résumer, idées, quiz…) sur le texte d'une page.
 * GET  /api/ia : quels fournisseurs sont configurés, lesquels sont en pause.
 *
 * Les clés restent sur le serveur. L'état des pauses vit en mémoire : il
 * survit d'une requête à l'autre tant que le serveur tourne.
 */

export const runtime = "nodejs";

const etat = creerEtatRouteur();

export async function GET() {
  const fournisseurs = await fournisseursConfigures();
  const maintenant = Date.now();
  return NextResponse.json({
    fournisseurs: fournisseurs.map((f) => ({
      id: f.id,
      nom: f.nom,
      configure: Boolean(f.cle),
      modeles: f.modeles,
    })),
    pauses: [...etat.pauses.entries()]
      .filter(([, reprise]) => reprise > maintenant)
      .map(([cle, reprise]) => ({ cle, repriseDansSecondes: Math.ceil((reprise - maintenant) / 1000) })),
  });
}

type Corps = {
  tache?: unknown;
  texte?: unknown;
  titre?: unknown;
  url?: unknown;
  intention?: unknown;
  question?: unknown;
};

const chaine = (valeur: unknown, max: number) => (typeof valeur === "string" ? valeur.slice(0, max) : undefined);

export async function POST(requete: Request) {
  // Réservé à l'app : une page d'un autre site ne peut pas consommer vos quotas
  const origine = requete.headers.get("origin");
  if (origine && new URL(origine).host !== new URL(requete.url).host) {
    return NextResponse.json({ erreur: "Origine refusée." }, { status: 403 });
  }

  let corps: Corps;
  try {
    corps = (await requete.json()) as Corps;
  } catch {
    return NextResponse.json({ erreur: "Requête illisible." }, { status: 400 });
  }

  if (typeof corps.tache !== "string" || !(TACHES_IA as readonly string[]).includes(corps.tache)) {
    return NextResponse.json({ erreur: "Tâche inconnue." }, { status: 400 });
  }
  const tache = corps.tache as TacheIA;
  const texte = chaine(corps.texte, 60_000) ?? "";
  if (!texte.trim()) {
    return NextResponse.json({ erreur: "Le texte de la page est vide." }, { status: 400 });
  }
  const question = chaine(corps.question, 2_000);
  if (tache === "question" && !question?.trim()) {
    return NextResponse.json({ erreur: "La question est vide." }, { status: 400 });
  }

  const messages = messagesPour(tache, {
    texte,
    titre: chaine(corps.titre, 300),
    url: chaine(corps.url, 2_000),
    intention: chaine(corps.intention, 200),
    question,
  });

  try {
    const reponse = await demanderIA({ messages, maxTokens: 1500 }, await fournisseursConfigures(), etat);
    return NextResponse.json({
      texte: reponse.texte,
      fournisseur: reponse.fournisseur,
      modele: reponse.modele,
      dureeMs: reponse.dureeMs,
    });
  } catch (e) {
    if (e instanceof IAIndisponible) {
      const aucuneCle = e.essais.every((x) => x.statut === "sans-cle");
      return NextResponse.json(
        {
          erreur: aucuneCle
            ? "Aucune clé d'IA configurée : ajoutez-les dans le fichier .env.local."
            : "Tous les fournisseurs gratuits sont saturés ou indisponibles pour le moment.",
          essais: e.essais,
        },
        { status: aucuneCle ? 503 : 429 }
      );
    }
    return NextResponse.json({ erreur: "Erreur inattendue du serveur d'IA." }, { status: 500 });
  }
}
