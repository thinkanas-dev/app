export const PIN_CONFIG_COOKIE = "think_pin_config";
export const PIN_UNLOCK_COOKIE = "think_pin_unlock";
export const PIN_UNLOCK_SECONDS = 365 * 24 * 60 * 60;

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function digest(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return base64Url(new Uint8Array(bytes));
}

async function signature(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const bytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return base64Url(new Uint8Array(bytes));
}

export async function creerSessionPin(secret: string, configuration: string, expiration: number) {
  const configurationId = await digest(configuration);
  const contenu = `${expiration}.${configurationId}`;
  return `${contenu}.${await signature(secret, contenu)}`;
}

export async function verifierSessionPin(secret: string, configuration?: string, session?: string) {
  if (!secret || !configuration || !session) return false;
  const morceaux = session.split(".");
  if (morceaux.length !== 3) return false;
  const [expirationTexte, configurationId, signatureRecue] = morceaux;
  const expiration = Number(expirationTexte);
  if (!Number.isFinite(expiration) || expiration <= Math.floor(Date.now() / 1000)) return false;
  if (configurationId !== (await digest(configuration))) return false;
  const contenu = `${expirationTexte}.${configurationId}`;
  return signatureRecue === (await signature(secret, contenu));
}
