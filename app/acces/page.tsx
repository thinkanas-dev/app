"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient, supabaseConfigure } from "@/lib/supabase/client";

const champ = "w-full rounded-md border border-hairline bg-canvas px-3 py-2.5 font-sans text-sm text-ink outline-none focus:border-brand";

export default function AccesPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [pin, setPin] = useState("");
  const [confirmationPin, setConfirmationPin] = useState("");
  const [pinConfigure, setPinConfigure] = useState<boolean | null>(null);
  const [sessionInitiale, setSessionInitiale] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState("");
  const configure = supabaseConfigure();

  useEffect(() => {
    void (async () => {
      const statut = await fetch("/api/pin", { cache: "no-store" });
      const donnees = (await statut.json().catch(() => null)) as { configure?: boolean; ouvert?: boolean } | null;
      if (donnees?.ouvert) {
        router.replace(new URLSearchParams(window.location.search).get("retour") || "/objectifs/aujourdhui");
        router.refresh();
        return;
      }
      setPinConfigure(Boolean(donnees?.configure));

      const supabase = createSupabaseBrowserClient();
      if (!supabase) return;
      const resultat = await supabase.auth.getUser();
      setSessionInitiale(Boolean(resultat.data.user));
    })();
  }, [router]);

  async function appelerPin(action: "ouvrir" | "configurer" | "verrouiller", valeur?: string) {
    const reponse = await fetch("/api/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, pin: valeur }),
    });
    const resultat = (await reponse.json().catch(() => null)) as { erreur?: string } | null;
    if (!reponse.ok) throw new Error(resultat?.erreur || "Impossible de sécuriser l’accès.");
  }

  async function ouvrirAvecPin(e: FormEvent) {
    e.preventDefault();
    setEnCours(true);
    setMessage("");
    try {
      await appelerPin("ouvrir", pin);
      setPin("");
      router.replace(new URLSearchParams(window.location.search).get("retour") || "/objectifs/aujourdhui");
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "PIN incorrect.");
      setEnCours(false);
    }
  }

  async function enregistrerPin(e: FormEvent) {
    e.preventDefault();
    if (pin !== confirmationPin) return setMessage("Les deux PIN ne correspondent pas.");
    setEnCours(true);
    setMessage("");
    try {
      await appelerPin("configurer", pin);
      setPin("");
      setConfirmationPin("");
      router.replace(new URLSearchParams(window.location.search).get("retour") || "/objectifs/aujourdhui");
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Le PIN n’a pas pu être enregistré.");
      setEnCours(false);
    }
  }

  async function preparerPin(e: FormEvent) {
    e.preventDefault();
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    setEnCours(true);
    setMessage("");

    let resultat = await supabase.auth.signInWithPassword({ email, password: motDePasse });
    if (resultat.error) {
      resultat = await supabase.auth.signUp({
        email,
        password: motDePasse,
        options: { emailRedirectTo: "https://ouroboros.thinkanas.com/acces" },
      });
    }
    if (resultat.error) {
      setMessage(resultat.error.message);
      setEnCours(false);
      return;
    }
    if (!resultat.data.session) {
      setMessage("Confirmez l’adresse reçue par e-mail, puis revenez ici pour créer votre PIN.");
      setEnCours(false);
      return;
    }
    setSessionInitiale(true);
    setEnCours(false);
  }

  return (
    <main className="min-h-screen bg-[#f3dfb1] px-5 py-12 text-ink">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center">
        <section className="w-full rounded-2xl border border-[#c89a57]/40 bg-canvas/95 p-7 shadow-xl shadow-[#7c4c16]/10">
          <div className="flex items-center gap-3">
            <Image src="/icon.svg" alt="think.anas" width={54} height={54} priority />
            <div><p className="font-serif text-2xl">think.anas</p><p className="font-sans text-xs text-text-muted">Espace personnel chiffré en transit</p></div>
          </div>
          <h1 className="mt-8 font-serif text-3xl">Votre PIN ouvre l’app</h1>
          <p className="mt-2 font-sans text-sm leading-6 text-text-muted">Vous choisissez six chiffres ici. Le PIN reste secret et autorise ce navigateur sur votre réseau.</p>

          {pinConfigure === null ? (
            <p className="mt-7 text-center font-sans text-sm text-text-muted">Préparation de l’accès sécurisé…</p>
          ) : pinConfigure ? (
            <form onSubmit={ouvrirAvecPin} className="mt-7 flex flex-col gap-3">
              <input required type="password" inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} autoComplete="current-password" placeholder="PIN secret à 6 chiffres" className={`${champ} text-center text-xl tracking-[0.4em]`} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} />
              <button disabled={enCours} className="w-full rounded-md bg-brand px-4 py-3 font-sans text-sm font-semibold text-canvas disabled:opacity-50">{enCours ? "Ouverture…" : "Ouvrir l’app"}</button>
            </form>
          ) : !configure ? (
            <div className="mt-6 rounded-md border border-amber-400/50 bg-amber-50 p-3 font-sans text-sm text-amber-900">Configuration Supabase requise sur le déploiement Vercel.</div>
          ) : sessionInitiale ? (
            <form onSubmit={enregistrerPin} className="mt-7 flex flex-col gap-3">
              <input required type="password" inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} autoComplete="new-password" placeholder="Choisissez 6 chiffres" className={`${champ} text-center text-xl tracking-[0.4em]`} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} />
              <input required type="password" inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} autoComplete="new-password" placeholder="Confirmez le PIN" className={`${champ} text-center text-xl tracking-[0.4em]`} value={confirmationPin} onChange={(e) => setConfirmationPin(e.target.value.replace(/\D/g, "").slice(0, 6))} />
              <button disabled={enCours} className="w-full rounded-md bg-brand px-4 py-3 font-sans text-sm font-semibold text-canvas disabled:opacity-50">{enCours ? "Sécurisation…" : "Enregistrer mon PIN secret"}</button>
            </form>
          ) : (
            <>
              <details open className="mt-7 border-t border-hairline pt-5">
                <summary className="cursor-pointer font-sans text-sm text-text-muted">Configuration unique de cet appareil</summary>
                <form onSubmit={preparerPin} className="mt-4 flex flex-col gap-3">
                  <input required type="email" autoComplete="email" placeholder="Adresse e-mail privée" className={champ} value={email} onChange={(e) => setEmail(e.target.value)} />
                  <input required type="password" minLength={8} autoComplete="current-password" placeholder="Mot de passe de secours" className={champ} value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} />
                  <button disabled={enCours} className="rounded-md border border-brand px-4 py-2.5 font-sans text-sm font-semibold text-brand disabled:opacity-50">Continuer vers mon PIN</button>
                </form>
              </details>
            </>
          )}
          {message && <p role="status" className="mt-4 rounded-md bg-panel px-3 py-2 font-sans text-sm text-ink">{message}</p>}
          <p className="mt-6 text-center font-sans text-[11px] text-text-muted">Domaine officiel : ouroboros.thinkanas.com</p>
        </section>
      </div>
    </main>
  );
}
