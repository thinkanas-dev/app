"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { InstagramIcon, TikTokIcon, LinkedInIcon } from "@/components/brand-icons";
import { useObjectifsState } from "@/lib/objectifs-store";
import { creerSauvegarde, lireSauvegarde, telechargerSauvegarde } from "@/lib/backup";

/** Recadre au centre et compresse la photo avant stockage local */
function resizeImage(file: File, target = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("lecture impossible"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("image invalide"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = target;
        canvas.height = target;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("canvas indisponible"));
          return;
        }
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, target, target);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  prefix,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  prefix?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-sans text-xs text-text-muted block mb-1.5">{label}</span>
      <div className="flex items-center rounded-md border border-hairline bg-canvas focus-within:border-brand transition-colors overflow-hidden">
        {icon && <span className="pl-2.5 shrink-0 flex items-center">{icon}</span>}
        {prefix && (
          <span className="pl-2.5 font-sans text-sm text-text-secondary shrink-0">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-transparent text-ink font-sans text-sm px-2.5 py-2 outline-none placeholder:text-text-secondary"
        />
      </div>
    </label>
  );
}

export default function ParametresPage() {
  const router = useRouter();
  const { state, hydrated, setProfile, remplacerEtat } = useObjectifsState();
  const profile = state.profile;
  const fileRef = useRef<HTMLInputElement>(null);
  const backupRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [nouveauPin, setNouveauPin] = useState("");
  const [confirmationPin, setConfirmationPin] = useState("");

  async function onPickFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Ce fichier n'est pas une image.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await resizeImage(file);
      setProfile({ photo: dataUrl });
    } catch {
      setError("Impossible de traiter cette image.");
    } finally {
      setBusy(false);
    }
  }

  async function exporter() {
    setBusy(true);
    setBackupStatus(null);
    try {
      telechargerSauvegarde(await creerSauvegarde(state));
      setBackupStatus("Sauvegarde complète créée.");
    } catch {
      setBackupStatus("La sauvegarde n’a pas pu être créée.");
    } finally {
      setBusy(false);
    }
  }

  async function importer(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setBackupStatus(null);
    try {
      const backup = await lireSauvegarde(file);
      remplacerEtat(backup.state);
      setBackupStatus(`Sauvegarde du ${backup.exporteLe.slice(0, 10)} restaurée.`);
    } catch (cause) {
      setBackupStatus(cause instanceof Error ? cause.message : "Restauration impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function activerNotifications() {
    if (!("Notification" in window)) {
      setBackupStatus("Les notifications ne sont pas disponibles sur cet appareil.");
      return;
    }
    const permission = await Notification.requestPermission();
    setBackupStatus(permission === "granted" ? "Notifications Windows activées." : "Notifications non autorisées.");
  }

  async function changerPin() {
    if (nouveauPin !== confirmationPin) return setBackupStatus("Les deux PIN ne correspondent pas.");
    setBusy(true);
    const reponse = await fetch("/api/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "configurer", pin: nouveauPin }),
    });
    const resultat = (await reponse.json().catch(() => null)) as { erreur?: string } | null;
    setBackupStatus(reponse.ok ? "PIN secret modifié." : resultat?.erreur || "Le PIN n’a pas pu être modifié.");
    if (reponse.ok) {
      setNouveauPin("");
      setConfirmationPin("");
    }
    setBusy(false);
  }

  async function verrouiller() {
    await fetch("/api/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verrouiller" }),
    });
    router.replace("/acces");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 max-w-[880px]">
      {/* Photo */}
      <div className="rounded-lg border border-hairline bg-canvas p-5">
        <h2 className="font-sans font-semibold text-base text-ink mb-1">Photo de profil</h2>
        <p className="font-sans text-sm text-text-muted mb-5">
          Elle apparaît dans la barre latérale. L&apos;image est recadrée en carré et stockée
          uniquement dans ce navigateur.
        </p>

        <div className="flex items-center gap-5 flex-wrap">
          <Avatar
            photo={hydrated ? profile.photo : ""}
            name={profile.name}
            size={88}
            className="border border-hairline"
          />

          <div className="flex items-center gap-2 flex-wrap">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onPickFile(e.target.files?.[0])}
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="rounded-md bg-brand hover:bg-brand-hover disabled:opacity-60 text-canvas font-sans text-sm font-medium px-4 py-2 transition-colors"
            >
              {busy ? "Traitement…" : profile.photo ? "Changer la photo" : "Choisir une photo"}
            </button>
            {profile.photo && (
              <button
                type="button"
                onClick={() => setProfile({ photo: "" })}
                className="rounded-md border border-hairline text-text-muted hover:text-accent-deep hover:border-accent-deep font-sans text-sm px-4 py-2 transition-colors"
              >
                Retirer
              </button>
            )}
          </div>
        </div>

        {error && <p className="font-sans text-sm text-accent-deep mt-3">{error}</p>}
      </div>

      {/* Identité */}
      <div className="rounded-lg border border-hairline bg-canvas p-5">
        <h2 className="font-sans font-semibold text-base text-ink mb-5">Informations</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Nom complet"
            value={profile.name}
            onChange={(v) => setProfile({ name: v })}
            placeholder="Votre nom"
          />
          <Field
            label="Identifiant public"
            value={profile.handle}
            onChange={(v) => setProfile({ handle: v })}
            placeholder="@votre-compte"
          />
          <Field
            label="Email"
            type="email"
            value={profile.email}
            onChange={(v) => setProfile({ email: v })}
            placeholder="vous@exemple.com"
          />
          <Field
            label="Téléphone"
            type="tel"
            value={profile.phone}
            onChange={(v) => setProfile({ phone: v })}
            placeholder="+212 6 00 00 00 00"
          />
        </div>
      </div>

      {/* Réseaux */}
      <div className="rounded-lg border border-hairline bg-canvas p-5">
        <h2 className="font-sans font-semibold text-base text-ink mb-1">Comptes</h2>
        <p className="font-sans text-sm text-text-muted mb-5">
          Utilisés pour le suivi d&apos;audience et le programme de contenu.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field
            label="Instagram"
            value={profile.instagram}
            onChange={(v) => setProfile({ instagram: v })}
            prefix="@"
            icon={<InstagramIcon size={16} />}
            placeholder="compte"
          />
          <Field
            label="TikTok"
            value={profile.tiktok}
            onChange={(v) => setProfile({ tiktok: v })}
            prefix="@"
            icon={<TikTokIcon size={16} />}
            placeholder="compte"
          />
          <Field
            label="LinkedIn"
            value={profile.linkedin}
            onChange={(v) => setProfile({ linkedin: v })}
            prefix="@"
            icon={<LinkedInIcon size={16} />}
            placeholder="compte"
          />
        </div>
      </div>

      <div className="rounded-lg border border-hairline bg-canvas p-5">
        <h2 className="font-sans font-semibold text-base text-ink mb-1">Rappels système</h2>
        <p className="font-sans text-sm text-text-muted mb-4">
          Autorisez think.anas à signaler les tâches, événements et automatisations arrivés à échéance.
        </p>
        <button type="button" onClick={activerNotifications} className="rounded-md bg-brand hover:bg-brand-hover text-canvas font-sans text-sm font-medium px-4 py-2 transition-colors">
          Activer les notifications
        </button>
      </div>

      <div className="rounded-lg border border-hairline bg-canvas p-5">
        <h2 className="font-sans font-semibold text-base text-ink mb-1">PIN secret</h2>
        <p className="font-sans text-sm text-text-muted mb-4">Changez les six chiffres qui protègent cet appareil. Le PIN n’est jamais affiché ni conservé en clair.</p>
        <div className="grid gap-3 sm:grid-cols-2 mb-3">
          <input required type="password" inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} autoComplete="new-password" placeholder="Nouveau PIN à 6 chiffres" className="rounded-md border border-hairline bg-canvas px-3 py-2 font-sans text-sm outline-none focus:border-brand" value={nouveauPin} onChange={(e) => setNouveauPin(e.target.value.replace(/\D/g, "").slice(0, 6))} />
          <input required type="password" inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} autoComplete="new-password" placeholder="Confirmer le PIN" className="rounded-md border border-hairline bg-canvas px-3 py-2 font-sans text-sm outline-none focus:border-brand" value={confirmationPin} onChange={(e) => setConfirmationPin(e.target.value.replace(/\D/g, "").slice(0, 6))} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button type="button" disabled={busy || nouveauPin.length !== 6 || confirmationPin.length !== 6} onClick={() => void changerPin()} className="rounded-md bg-brand px-4 py-2 font-sans text-sm font-medium text-canvas disabled:opacity-60">Changer le PIN</button>
          <button type="button" onClick={() => void verrouiller()} className="rounded-md border border-hairline px-4 py-2 font-sans text-sm text-text-muted hover:text-ink">Verrouiller maintenant</button>
        </div>
      </div>

      <div className="rounded-lg border border-hairline bg-canvas p-5">
        <h2 className="font-sans font-semibold text-base text-ink mb-1">Sauvegarde et restauration</h2>
        <p className="font-sans text-sm text-text-muted mb-4">
          Le fichier contient les objectifs, l’Atelier, les notes, les PDF, les photos et les vocaux.
        </p>
        <input ref={backupRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => void importer(e.target.files?.[0])} />
        <div className="flex gap-2 flex-wrap">
          <button type="button" disabled={busy} onClick={() => void exporter()} className="rounded-md bg-brand hover:bg-brand-hover disabled:opacity-60 text-canvas font-sans text-sm font-medium px-4 py-2 transition-colors">
            Exporter une sauvegarde
          </button>
          <button type="button" disabled={busy} onClick={() => backupRef.current?.click()} className="rounded-md border border-hairline text-text-muted hover:text-ink hover:border-text-secondary disabled:opacity-60 font-sans text-sm px-4 py-2 transition-colors">
            Restaurer un fichier
          </button>
        </div>
        {backupStatus && <p className="mt-3 font-sans text-sm text-text-muted">{backupStatus}</p>}
      </div>

      <p className="font-sans text-xs text-text-muted">
        Toutes les modifications sont enregistrées automatiquement. Exportez régulièrement une copie complète.
      </p>
    </div>
  );
}
