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
  const [sessionInitiale, setSessionInitiale] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState("");
  const configure = supabaseConfigure();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    void (async () => {
      const resultat = await supabase.auth.getUser();
      setSessionInitiale(Boolean(resultat.data.user));
    })();
  }, []);

  async function ouvrirAvecEmpreinte() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return setMessage("La sécurité cloud doit d’abord être reliée à Supabase.");
    if (!("PublicKeyCredential" in window)) return setMessage("Cet appareil ne prend pas en charge Windows Hello, Touch ID ou les clés de sécurité.");
    setEnCours(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPasskey();
    if (error) {
      setMessage(error.message);
      setEnCours(false);
      return;
    }
    router.replace(new URLSearchParams(window.location.search).get("retour") || "/objectifs/aujourdhui");
    router.refresh();
  }

  async function enregistrerEmpreinte() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    setEnCours(true);
    setMessage("");
    const { error } = await supabase.auth.registerPasskey();
    if (error) {
      setMessage(error.message);
      setEnCours(false);
      return;
    }
    await supabase.auth.signOut();
    setSessionInitiale(false);
    setMessage("Empreinte enregistrée. Validez-la une fois pour ouvrir votre espace.");
    setEnCours(false);
  }

  async function preparerEmpreinte(e: FormEvent) {
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
      setMessage("Confirmez l’adresse reçue par e-mail, puis revenez ici pour enregistrer votre empreinte.");
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
          <h1 className="mt-8 font-serif text-3xl">Votre empreinte ouvre l’app</h1>
          <p className="mt-2 font-sans text-sm leading-6 text-text-muted">Windows Hello, Touch ID, Face ID, le code de l’appareil ou une clé de sécurité peuvent confirmer votre identité.</p>

          {!configure ? <div className="mt-6 rounded-md border border-amber-400/50 bg-amber-50 p-3 font-sans text-sm text-amber-900">Configuration Supabase requise sur le déploiement Vercel.</div> : sessionInitiale ? (
            <button type="button" disabled={enCours} onClick={enregistrerEmpreinte} className="mt-7 w-full rounded-md bg-brand px-4 py-3 font-sans text-sm font-semibold text-canvas disabled:opacity-50">Enregistrer l’empreinte de cet appareil</button>
          ) : (
            <>
              <button type="button" disabled={enCours} onClick={ouvrirAvecEmpreinte} className="mt-7 w-full rounded-md bg-brand px-4 py-3 font-sans text-sm font-semibold text-canvas disabled:opacity-50">{enCours ? "Vérification…" : "Ouvrir avec mon empreinte"}</button>
              <details className="mt-5 border-t border-hairline pt-5">
                <summary className="cursor-pointer font-sans text-sm text-text-muted">Première configuration sur cet appareil</summary>
                <form onSubmit={preparerEmpreinte} className="mt-4 flex flex-col gap-3">
                  <input required type="email" autoComplete="email" placeholder="Adresse e-mail privée" className={champ} value={email} onChange={(e) => setEmail(e.target.value)} />
                  <input required type="password" minLength={8} autoComplete="current-password" placeholder="Mot de passe de secours" className={champ} value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} />
                  <button disabled={enCours} className="rounded-md border border-brand px-4 py-2.5 font-sans text-sm font-semibold text-brand disabled:opacity-50">Créer ou retrouver mon compte</button>
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
