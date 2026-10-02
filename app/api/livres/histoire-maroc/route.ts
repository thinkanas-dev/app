export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "bibliotheque-privee";
const OBJET = "histoire-du-maroc.pdf";

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return Response.json({ erreur: "Le stockage privé du livre n’est pas configuré." }, { status: 503 });
  }

  const headers = new Headers({
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  });
  const range = request.headers.get("range");
  if (range) headers.set("Range", range);

  const fichier = await fetch(
    `${supabaseUrl}/storage/v1/object/authenticated/${BUCKET}/${OBJET}`,
    { headers, cache: "no-store" }
  );
  if (!fichier.ok && fichier.status !== 206) {
    return Response.json({ erreur: "Le livre privé est momentanément indisponible." }, { status: 503 });
  }

  const reponseHeaders = new Headers({
    "Accept-Ranges": fichier.headers.get("accept-ranges") ?? "bytes",
    "Cache-Control": "private, no-store, max-age=0",
    "Content-Disposition": 'inline; filename="histoire-du-maroc-michel-abitbol.pdf"',
    "Content-Type": "application/pdf",
    "X-Content-Type-Options": "nosniff",
  });
  for (const nom of ["content-length", "content-range"]) {
    const valeur = fichier.headers.get(nom);
    if (valeur) reponseHeaders.set(nom, valeur);
  }

  return new Response(fichier.body, { status: fichier.status, headers: reponseHeaders });
}
