import type { SupabaseClient } from "@supabase/supabase-js";

type PasskeyError = { message: string };
type PasskeyResult<T = unknown> = { data: T | null; error: PasskeyError | null };

type JsonCredentialDescriptor = {
  id: string;
  type: PublicKeyCredentialType;
  transports?: AuthenticatorTransport[];
};

type JsonCreationOptions = Omit<
  PublicKeyCredentialCreationOptions,
  "challenge" | "user" | "excludeCredentials"
> & {
  challenge: string;
  user: Omit<PublicKeyCredentialUserEntity, "id"> & { id: string };
  excludeCredentials?: JsonCredentialDescriptor[];
};

type JsonRequestOptions = Omit<
  PublicKeyCredentialRequestOptions,
  "challenge" | "allowCredentials"
> & {
  challenge: string;
  allowCredentials?: JsonCredentialDescriptor[];
};

type RegistrationOptions = {
  challenge_id: string;
  options: JsonCreationOptions;
};

type AuthenticationOptions = {
  challenge_id: string;
  options: JsonRequestOptions;
};

type PasskeyAuthInternals = {
  _startPasskeyRegistration(): Promise<PasskeyResult<RegistrationOptions>>;
  _verifyPasskeyRegistration(params: {
    challengeId: string;
    credential: Record<string, unknown>;
  }): Promise<PasskeyResult>;
  _startPasskeyAuthentication(params: {
    options: { captchaToken?: string };
  }): Promise<PasskeyResult<AuthenticationOptions>>;
  _verifyPasskeyAuthentication(params: {
    challengeId: string;
    credential: Record<string, unknown>;
  }): Promise<PasskeyResult>;
};

type PublicKeyCredentialWithJson = PublicKeyCredential & {
  authenticatorAttachment?: string | null;
  toJSON?: () => Record<string, unknown>;
};

function decodeBase64Url(value: string): ArrayBuffer {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = window.atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}

function encodeBase64Url(value: ArrayBuffer): string {
  const bytes = new Uint8Array(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function windowsHelloDisponible() {
  if (!("PublicKeyCredential" in window) || !("credentials" in navigator)) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

function erreurWindowsHello(cause: unknown): PasskeyResult {
  const nom = cause instanceof DOMException ? cause.name : "";
  if (nom === "NotAllowedError") {
    return { data: null, error: { message: "Validation Windows Hello annulée ou expirée. Touchez le capteur Dell puis réessayez." } };
  }
  return {
    data: null,
    error: { message: cause instanceof Error ? cause.message : "Windows Hello n’a pas pu vérifier votre empreinte." },
  };
}

function optionsCreation(options: JsonCreationOptions): PublicKeyCredentialCreationOptions {
  return {
    ...options,
    challenge: decodeBase64Url(options.challenge),
    user: { ...options.user, id: decodeBase64Url(options.user.id) },
    excludeCredentials: options.excludeCredentials?.map((credential) => ({
      ...credential,
      id: decodeBase64Url(credential.id),
    })),
    authenticatorSelection: {
      ...options.authenticatorSelection,
      authenticatorAttachment: "platform",
      residentKey: "required",
      requireResidentKey: true,
      userVerification: "required",
    },
    attestation: "none",
  };
}

function optionsAuthentification(options: JsonRequestOptions): PublicKeyCredentialRequestOptions {
  return {
    ...options,
    challenge: decodeBase64Url(options.challenge),
    allowCredentials: options.allowCredentials?.map((credential) => ({
      ...credential,
      id: decodeBase64Url(credential.id),
    })),
    userVerification: "required",
  };
}

function serialiserCreation(credential: PublicKeyCredentialWithJson): Record<string, unknown> {
  if (credential.toJSON) return credential.toJSON();
  const response = credential.response as AuthenticatorAttestationResponse;
  return {
    id: credential.id,
    rawId: credential.id,
    type: "public-key",
    response: {
      attestationObject: encodeBase64Url(response.attestationObject),
      clientDataJSON: encodeBase64Url(response.clientDataJSON),
    },
    clientExtensionResults: credential.getClientExtensionResults(),
    authenticatorAttachment: credential.authenticatorAttachment ?? undefined,
  };
}

function serialiserAuthentification(credential: PublicKeyCredentialWithJson): Record<string, unknown> {
  if (credential.toJSON) return credential.toJSON();
  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    id: credential.id,
    rawId: credential.id,
    type: "public-key",
    response: {
      authenticatorData: encodeBase64Url(response.authenticatorData),
      clientDataJSON: encodeBase64Url(response.clientDataJSON),
      signature: encodeBase64Url(response.signature),
      userHandle: response.userHandle ? encodeBase64Url(response.userHandle) : undefined,
    },
    clientExtensionResults: credential.getClientExtensionResults(),
    authenticatorAttachment: credential.authenticatorAttachment ?? undefined,
  };
}

function authInterne(supabase: SupabaseClient) {
  return supabase.auth as unknown as PasskeyAuthInternals;
}

export async function enregistrerWindowsHello(supabase: SupabaseClient): Promise<PasskeyResult> {
  if (!(await windowsHelloDisponible())) {
    return {
      data: null,
      error: { message: "Windows Hello n’est pas configuré pour le compte Windows actif. Ajoutez d’abord une empreinte dans les Options de connexion Windows." },
    };
  }

  const auth = authInterne(supabase);
  const depart = await auth._startPasskeyRegistration();
  if (depart.error || !depart.data) return depart;

  try {
    const credential = (await navigator.credentials.create({
      publicKey: optionsCreation(depart.data.options),
    })) as PublicKeyCredentialWithJson | null;
    if (!credential) return { data: null, error: { message: "Windows Hello n’a renvoyé aucune empreinte." } };
    return auth._verifyPasskeyRegistration({
      challengeId: depart.data.challenge_id,
      credential: serialiserCreation(credential),
    });
  } catch (cause) {
    return erreurWindowsHello(cause);
  }
}

export async function ouvrirAvecWindowsHello(supabase: SupabaseClient): Promise<PasskeyResult> {
  if (!(await windowsHelloDisponible())) {
    return {
      data: null,
      error: { message: "Windows Hello n’est pas disponible pour le compte Windows actif." },
    };
  }

  const auth = authInterne(supabase);
  const depart = await auth._startPasskeyAuthentication({ options: {} });
  if (depart.error || !depart.data) return depart;

  try {
    const credential = (await navigator.credentials.get({
      publicKey: optionsAuthentification(depart.data.options),
    })) as PublicKeyCredentialWithJson | null;
    if (!credential) return { data: null, error: { message: "Windows Hello n’a renvoyé aucune empreinte." } };
    return auth._verifyPasskeyAuthentication({
      challengeId: depart.data.challenge_id,
      credential: serialiserAuthentification(credential),
    });
  } catch (cause) {
    return erreurWindowsHello(cause);
  }
}
