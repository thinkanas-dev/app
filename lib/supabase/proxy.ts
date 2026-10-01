import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PRIVE = "/objectifs";
const ACCES = "/acces";
const DOMAINE_PUBLIC = "thinkanas.com";

export async function updateSession(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";

  if (process.env.VERCEL_ENV === "production" && host !== DOMAINE_PUBLIC) {
    const destination = request.nextUrl.clone();
    destination.protocol = "https:";
    destination.host = DOMAINE_PUBLIC;
    return NextResponse.redirect(destination, 308);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    if (process.env.NODE_ENV === "production" && request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ erreur: "Configuration de sécurité requise." }, { status: 503 });
    }
    if (process.env.NODE_ENV === "production" && request.nextUrl.pathname.startsWith(PRIVE)) {
      return NextResponse.redirect(new URL(`${ACCES}?configuration=requise`, request.url));
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headersToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headersToSet).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as { sub?: string; amr?: Array<{ method?: string }> } | undefined;
  const methodeForte = claims?.amr?.some(({ method }) => method === "passkey" || method === "webauthn") ?? false;
  const connecte = Boolean(claims?.sub && methodeForte);
  const chemin = request.nextUrl.pathname;

  if (!connecte && chemin.startsWith("/api/")) {
    const refus = NextResponse.json({ erreur: "Vérification biométrique requise." }, { status: 401 });
    response.cookies.getAll().forEach((cookie) => refus.cookies.set(cookie));
    return refus;
  }

  if (!connecte && chemin.startsWith(PRIVE)) {
    const destination = new URL(ACCES, request.url);
    destination.searchParams.set("retour", `${chemin}${request.nextUrl.search}`);
    const redirection = NextResponse.redirect(destination);
    response.cookies.getAll().forEach((cookie) => redirection.cookies.set(cookie));
    return redirection;
  }

  if (connecte && chemin === ACCES) {
    const redirection = NextResponse.redirect(new URL("/objectifs/aujourdhui", request.url));
    response.cookies.getAll().forEach((cookie) => redirection.cookies.set(cookie));
    return redirection;
  }

  return response;
}
