"use client";

import type { ObjectifsState } from "./objectifs-store";

type ValeurBlob = { __thinkAnasBlob: true; type: string; data: string };
type EntreeBase = { key: IDBValidKey; value: unknown };
type BaseSauvegardee = { name: string; store: string; entries: EntreeBase[] };

export type SauvegardeThinkAnas = {
  format: "think.anas-backup";
  version: 1;
  exporteLe: string;
  state: ObjectifsState;
  bases: BaseSauvegardee[];
};

function ouvrirBase(name: string, store: string) {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(name);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(store)) {
        request.result.createObjectStore(store);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function blobVersData(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function serialiser(value: unknown): Promise<unknown> {
  if (value instanceof Blob) {
    return { __thinkAnasBlob: true, type: value.type, data: await blobVersData(value) } satisfies ValeurBlob;
  }
  if (Array.isArray(value)) return Promise.all(value.map(serialiser));
  if (value && typeof value === "object") {
    const entries = await Promise.all(
      Object.entries(value).map(async ([key, item]) => [key, await serialiser(item)] as const)
    );
    return Object.fromEntries(entries);
  }
  return value;
}

function deserialiser(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(deserialiser);
  if (value && typeof value === "object") {
    const possible = value as Partial<ValeurBlob>;
    if (possible.__thinkAnasBlob && typeof possible.data === "string") {
      const [header, encoded] = possible.data.split(",");
      const mime = possible.type || header.match(/^data:(.*?);/)?.[1] || "application/octet-stream";
      const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
      return new Blob([bytes], { type: mime });
    }
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, deserialiser(item)]));
  }
  return value;
}

async function exporterBase(name: string, store: string): Promise<BaseSauvegardee> {
  const db = await ouvrirBase(name, store);
  if (!db.objectStoreNames.contains(store)) {
    db.close();
    return { name, store, entries: [] };
  }
  const entries = await new Promise<EntreeBase[]>((resolve, reject) => {
    const transaction = db.transaction(store, "readonly");
    const magasin = transaction.objectStore(store);
    const valuesRequest = magasin.getAll();
    const keysRequest = magasin.getAllKeys();
    transaction.oncomplete = async () => {
      try {
        resolve(
          await Promise.all(
            valuesRequest.result.map(async (value, index) => ({
              key: keysRequest.result[index],
              value: await serialiser(value),
            }))
          )
        );
      } catch (error) {
        reject(error);
      }
    };
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
  return { name, store, entries };
}

async function restaurerBase(base: BaseSauvegardee) {
  const db = await ouvrirBase(base.name, base.store);
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(base.store, "readwrite");
    const magasin = transaction.objectStore(base.store);
    magasin.clear();
    for (const entry of base.entries) {
      const value = deserialiser(entry.value);
      if (magasin.keyPath === null) magasin.put(value, entry.key);
      else magasin.put(value);
    }
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function creerSauvegarde(state: ObjectifsState): Promise<SauvegardeThinkAnas> {
  const bases = await Promise.all([
    exporterBase("think-anas-files", "pdfs"),
    exporterBase("think-anas-medias", "fichiers"),
  ]);
  return {
    format: "think.anas-backup",
    version: 1,
    exporteLe: new Date().toISOString(),
    state,
    bases,
  };
}

export function telechargerSauvegarde(backup: SauvegardeThinkAnas) {
  const blob = new Blob([JSON.stringify(backup)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `think-anas-${backup.exporteLe.slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function lireSauvegarde(file: File): Promise<SauvegardeThinkAnas> {
  const value = JSON.parse(await file.text()) as SauvegardeThinkAnas;
  if (value.format !== "think.anas-backup" || value.version !== 1 || !value.state) {
    throw new Error("Ce fichier n'est pas une sauvegarde think.anas valide.");
  }
  for (const base of value.bases ?? []) await restaurerBase(base);
  return value;
}
