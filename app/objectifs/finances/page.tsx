"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useObjectifsState } from "@/lib/objectifs-store";
import { dateLocale, nouvelId, type TransactionAtelier } from "@/lib/atelier";

const inputClass = "w-full rounded-md border border-hairline bg-canvas px-3 py-2 font-sans text-sm text-ink outline-none focus:border-brand";

export default function FinancesPage() {
  const { state, ajouterAtelier, archiverAtelier } = useObjectifsState();
  const [form, setForm] = useState({ date: dateLocale(), libelle: "", montant: 0, type: "depense" as TransactionAtelier["type"], categorie: "Quotidien", note: "" });
  const transactions = state.atelier.transactions;
  const revenus = transactions.filter((item) => item.type === "revenu").reduce((s, item) => s + item.montant, 0);
  const depenses = transactions.filter((item) => item.type === "depense").reduce((s, item) => s + item.montant, 0);
  const parCategorie = useMemo(() => {
    const valeurs = new Map<string, number>();
    transactions.filter((item) => item.type === "depense").forEach((item) => valeurs.set(item.categorie, (valeurs.get(item.categorie) ?? 0) + item.montant));
    return [...valeurs.entries()].sort((a, b) => b[1] - a[1]);
  }, [transactions]);

  function envoyer(e: FormEvent) {
    e.preventDefault();
    if (!form.libelle.trim() || form.montant <= 0) return;
    ajouterAtelier("transactions", { id: nouvelId("transaction"), ...form, libelle: form.libelle.trim(), categorie: form.categorie.trim() || "Autre", creeLe: new Date().toISOString() });
    setForm((actuel) => ({ ...actuel, libelle: "", montant: 0, note: "" }));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-hairline bg-canvas p-5"><p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-brand">Pilotage personnel</p><h1 className="mt-1 font-serif text-3xl text-ink">Finances</h1><p className="mt-1 font-sans text-sm text-text-muted">Revenus, dépenses et solde réel alimentent votre objectif financier sans remplacer son suivi historique.</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><Stat label="Revenus" value={revenus} tone="olive" /><Stat label="Dépenses" value={depenses} tone="deep" /><Stat label="Solde" value={revenus - depenses} tone="brand" /></div></div>
      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)] items-start">
        <form onSubmit={envoyer} className="rounded-lg border border-hairline bg-canvas p-5 xl:sticky xl:top-28"><h2 className="font-sans text-base font-semibold text-ink">Nouvelle opération</h2><div className="mt-4 flex flex-col gap-3"><Champ label="Date"><input type="date" className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Champ><Champ label="Libellé"><input className={inputClass} value={form.libelle} onChange={(e) => setForm({ ...form, libelle: e.target.value })} /></Champ><div className="grid grid-cols-2 gap-3"><Champ label="Montant MAD"><input type="number" min="0" step="0.01" className={inputClass} value={form.montant || ""} onChange={(e) => setForm({ ...form, montant: Number(e.target.value) })} /></Champ><Champ label="Type"><select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TransactionAtelier["type"] })}><option value="depense">Dépense</option><option value="revenu">Revenu</option></select></Champ></div><Champ label="Catégorie"><input className={inputClass} value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} /></Champ><button className="rounded-md bg-brand px-4 py-2 font-sans text-sm font-semibold text-canvas">Enregistrer</button></div></form>
        <div className="flex flex-col gap-4"><div className="rounded-lg border border-hairline bg-canvas p-5"><h2 className="font-sans text-base font-semibold text-ink">Dépenses par catégorie</h2>{parCategorie.length === 0 ? <p className="mt-3 font-sans text-sm text-text-muted">Aucune dépense enregistrée.</p> : <div className="mt-4 flex flex-col gap-3">{parCategorie.map(([categorie, montant]) => <div key={categorie}><div className="mb-1 flex justify-between gap-3 font-sans text-xs"><span className="text-ink">{categorie}</span><span className="text-text-muted tabular-nums">{montant.toFixed(2)} MAD</span></div><div className="h-1.5 rounded-full bg-surface-warm overflow-hidden"><div className="h-full rounded-full bg-accent-clay" style={{ width: `${depenses ? Math.max(2, (montant / depenses) * 100) : 0}%` }} /></div></div>)}</div>}</div><div className="rounded-lg border border-hairline bg-canvas"><div className="border-b border-hairline px-5 py-4"><h2 className="font-sans text-base font-semibold text-ink">Historique</h2></div><div className="divide-y divide-hairline">{transactions.length === 0 && <p className="p-5 font-sans text-sm text-text-muted">Aucune opération.</p>}{transactions.map((item) => <div key={item.id} className="flex items-center gap-3 px-5 py-3"><div className="min-w-0 flex-1"><p className="font-sans text-sm font-medium text-ink">{item.libelle}</p><p className="font-sans text-xs text-text-muted">{item.date} · {item.categorie}</p></div><span className={`font-sans text-sm font-semibold tabular-nums ${item.type === "revenu" ? "text-accent-olive" : "text-accent-deep"}`}>{item.type === "revenu" ? "+" : "−"}{item.montant.toFixed(2)} MAD</span><button type="button" onClick={() => archiverAtelier("transactions", item.id)} className="font-sans text-xs text-text-muted hover:text-accent-deep">Retirer</button></div>)}</div></div></div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "olive" | "deep" | "brand" }) { const color = tone === "olive" ? "text-accent-olive" : tone === "deep" ? "text-accent-deep" : "text-brand"; return <div className="rounded-md border border-hairline p-4"><p className="font-sans text-xs text-text-muted">{label}</p><p className={`mt-1 font-sans text-xl font-semibold tabular-nums ${color}`}>{value.toFixed(2)} MAD</p></div>; }
function Champ({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className="mb-1.5 block font-sans text-xs text-text-muted">{label}</span>{children}</label>; }
