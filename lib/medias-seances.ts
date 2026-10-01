"use client";

import { useEffect, useState } from "react";

/*
 * Les fichiers des carnets de séance : vocaux et photos du tableau.
 *
 * Trop lourds pour le stockage local (quelques Mo à peine), ils vivent dans
 * IndexedDB, rangés par identifiant. Le store n'en garde que la trace — durée,
 * transcription, dimensions — pour s'afficher sans ouvrir un seul fichier.
 */

const BASE = "think-anas-medias";
const MAGASIN = "fichiers";

let ouverture: Promise<IDBDatabase> | null = null;

function base(): Promise<IDBDatabase> {
  if (!ouverture) {
    ouverture = new Promise((resoudre, rejeter) => {
      const requete = indexedDB.open(BASE, 1);
      requete.onupgradeneeded = () => requete.result.createObjectStore(MAGASIN);
      requete.onsuccess = () => resoudre(requete.result);
      requete.onerror = () => {
        ouverture = null;
        rejeter(requete.error);
      };
    });
  }
  return ouverture;
}

async function operation<T>(mode: IDBTransactionMode, action: (magasin: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await base();
  return new Promise((resoudre, rejeter) => {
    const transaction = db.transaction(MAGASIN, mode);
    const requete = action(transaction.objectStore(MAGASIN));
    transaction.oncomplete = () => resoudre(requete.result);
    transaction.onerror = () => rejeter(transaction.error);
    transaction.onabort = () => rejeter(transaction.error);
  });
}

export async function enregistrerMedia(id: string, fichier: Blob) {
  await operation("readwrite", (m) => m.put(fichier, id));
}

export function lireMedia(id: string) {
  return operation("readonly", (m) => m.get(id) as IDBRequest<Blob | undefined>);
}

export async function supprimerMedia(id: string) {
  await operation("readwrite", (m) => m.delete(id));
}

export const nouvelId = (prefixe: string) => `${prefixe}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/** Réduit une photo à 1 600 px de côté, en JPEG : le tableau reste lisible, le stockage respire */
export async function compresserPhoto(fichier: Blob): Promise<{ blob: Blob; largeur: number; hauteur: number }> {
  const image = await createImageBitmap(fichier);
  const echelle = Math.min(1, 1600 / Math.max(image.width, image.height));
  const largeur = Math.round(image.width * echelle);
  const hauteur = Math.round(image.height * echelle);
  const toile = document.createElement("canvas");
  toile.width = largeur;
  toile.height = hauteur;
  toile.getContext("2d")?.drawImage(image, 0, 0, largeur, hauteur);
  image.close();
  const blob = await new Promise<Blob>((ok, echec) =>
    toile.toBlob((b) => (b ? ok(b) : echec(new Error("compression"))), "image/jpeg", 0.85)
  );
  return { blob, largeur, hauteur };
}

/** L'adresse locale d'un média stocké, libérée quand on n'en a plus besoin */
export function useUrlMedia(id: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!id) return;
    let annule = false;
    let adresse: string | null = null;
    lireMedia(id)
      .then((fichier) => {
        if (annule || !fichier) return;
        adresse = URL.createObjectURL(fichier);
        setUrl(adresse);
      })
      .catch(() => setUrl(null));
    return () => {
      annule = true;
      if (adresse) URL.revokeObjectURL(adresse);
      setUrl(null);
    };
  }, [id]);
  return url;
}
