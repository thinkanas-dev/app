import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  creerSessionPin,
  PIN_CONFIG_COOKIE,
  PIN_UNLOCK_COOKIE,
  PIN_UNLOCK_SECONDS,
  verifierSessionPin,
} from "@/lib/pin-session";

export const runtime = "nodejs";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

function secretApplication() {
  return process.env.APP_PIN_SECRET ?? "";
}

function versBase64Url(value: Buffer) {
  return value.toString("base64url");
}

function depuisBase64Url(value: string) {
  return Buffer.from(value, "base64url");
}

function chiffrerPin(pin: string, secret: string) {
  const sel = randomBytes(16);
  const empreinte = scryptSync(pin, sel, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  const cle = createHash("sha256").update(secret).digest();
  const iv = randomBytes(12);
  const chiffreur = createCipheriv("aes-256-gcm", cle, iv);
  const contenu = Buffer.from(`${versBase64Url(sel)}.${versBase64Url(empreinte)}`);
  const chiffre = Buffer.concat([chiffreur.update(contenu), chiffreur.final()]);
  return `${versBase64Url(iv)}.${versBase64Url(chiffre)}.${versBase64Url(chiffreur.getAuthTag())}`;
}

function verifierPin(pin: string, configuration: string, secret: string) {
  try {
    const [ivTexte, chiffreTexte, tagTexte] = configuration.split(".");
    if (!ivTexte || !chiffreTexte || !tagTexte) return false;
    const cle = createHash("sha256").update(secret).digest();
    const dechiffreur = createDecipheriv("aes-256-gcm", cle, depuisBase64Url(ivTexte));
    dechiffreur.setAuthTag(depuisBase64Url(tagTexte));
    const contenu = Buffer.concat([
      dechiffreur.update(depuisBase64Url(chiffreTexte)),
      dechiffreur.final(),
    ]).toString();
    const [selTexte, empreinteTexte] = contenu.split(".");
    const attendue = depuisBase64Url(empreinteTexte);
    const recue = scryptSync(pin, depuisBase64Url(selTexte), attendue.length, {
      N: 32768,
      r: 8,
      p: 1,
      maxmem: 64 * 1024 * 1024,
    });
    return attendue.length === recue.length && timingSafeEqual(attendue, recue);
  } catch {
    return false;
  }
}

async function creerDeverrouillage(secret: string, configuration: string) {
  const expiration = Math.floor(Date.now() / 1000) + PIN_UNLOCK_SECONDS;
  return creerSessionPin(secret, configuration, expiration);
}

export async function GET() {
  const secret = secretApplication();
  if (!secret) return NextResponse.json({ configure: false, ouvert: false }, { status: 503 });
  const cookieStore = await cookies();
  const configuration = cookieStore.get(PIN_CONFIG_COOKIE)?.value;
  const session = cookieStore.get(PIN_UNLOCK_COOKIE)?.value;
  return NextResponse.json({
    configure: Boolean(configuration),
    ouvert: await verifierSessionPin(secret, configuration, session),
  });
}

export async function POST(request: Request) {
  const secret = secretApplication();
  if (!secret) return NextResponse.json({ erreur: "La sécurité par PIN doit être activée sur le serveur." }, { status: 503 });

  const body = (await request.json().catch(() => null)) as { action?: string; pin?: string } | null;
  const cookieStore = await cookies();

  if (body?.action === "verrouiller") {
    cookieStore.set(PIN_UNLOCK_COOKIE, "", { ...cookieOptions, maxAge: 0 });
    return NextResponse.json({ ok: true });
  }

  const pin = body?.pin ?? "";
  if (!/^\d{6}$/.test(pin)) {
    return NextResponse.json({ erreur: "Le PIN doit contenir exactement 6 chiffres." }, { status: 400 });
  }

  if (body?.action === "configurer") {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return NextResponse.json({ erreur: "Reconnectez votre compte privé avant de créer le PIN." }, { status: 401 });

    const configuration = chiffrerPin(pin, secret);
    cookieStore.set(PIN_CONFIG_COOKIE, configuration, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 });
    cookieStore.set(PIN_UNLOCK_COOKIE, await creerDeverrouillage(secret, configuration), {
      ...cookieOptions,
      maxAge: PIN_UNLOCK_SECONDS,
    });
    return NextResponse.json({ ok: true });
  }

  if (body?.action === "ouvrir") {
    const configuration = cookieStore.get(PIN_CONFIG_COOKIE)?.value;
    if (!configuration) return NextResponse.json({ erreur: "Aucun PIN n’est configuré sur cet appareil." }, { status: 400 });
    if (!verifierPin(pin, configuration, secret)) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return NextResponse.json({ erreur: "PIN incorrect." }, { status: 401 });
    }
    cookieStore.set(PIN_UNLOCK_COOKIE, await creerDeverrouillage(secret, configuration), {
      ...cookieOptions,
      maxAge: PIN_UNLOCK_SECONDS,
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ erreur: "Action inconnue." }, { status: 400 });
}
