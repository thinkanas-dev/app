import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { PIN_CONFIG_COOKIE, PIN_UNLOCK_COOKIE, verifierSessionPin } from "@/lib/pin-session";

const PRIVE = "/objectifs";
const ACCES = "/acces";
const DOMAINE_PUBLIC = "ouroboros.thinkanas.com";

function adresseIp(request: NextRequest) {
  const transmise = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (transmise || request.headers.get("x-real-ip") || "").replace(/^::ffff:/, "");
}

export async function updateSession(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";

  if (process.env.VERCEL_ENV === "production" && host !== DOMAINE_PUBLIC) {
    const destination = request.nextUrl.clone();
    destination.protocol = "https:";
    destination.host = DOMAINE_PUBLIC;
    return NextResponse.redirect(destination, 308);
  }

  const ipAutorisee = process.env.APP_ALLOWED_IP?.trim();
  if (process.env.VERCEL_ENV === "production" && ipAutorisee && adresseIp(request) !== ipAutorisee) {
    return new NextResponse(null, {
      status: 404,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
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

  await supabase.auth.getClaims();
  const chemin = request.nextUrl.pathname;
  const configurationPin = request.cookies.get(PIN_CONFIG_COOKIE)?.value;
  const sessionPin = request.cookies.get(PIN_UNLOCK_COOKIE)?.value;
  const connecte = await verifierSessionPin(process.env.APP_PIN_SECRET ?? "", configurationPin, sessionPin);
  const endpointPin = chemin === "/api/pin";

  if (chemin === "/") {
    const destination = connecte
      ? new URL("/objectifs/aujourdhui", request.url)
      : new URL("/acces?retour=%2Fobjectifs", request.url);
    const redirection = NextResponse.redirect(destination);
    redirection.headers.set("Cache-Control", "no-store, max-age=0");
    response.cookies.getAll().forEach((cookie) => redirection.cookies.set(cookie));
    return redirection;
  }

  if (!connecte && chemin.startsWith("/api/") && !endpointPin) {
    const refus = NextResponse.json({ erreur: "PIN secret requis." }, { status: 401 });
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
