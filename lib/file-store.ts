"use client";

/**
 * Stockage des PDF dans IndexedDB plutôt que localStorage : les emplois du
 * temps hebdomadaires dépassent vite le quota de 5 Mo du localStorage.
 */

const DB_NAME = "think-anas-files";
const DB_VERSION = 1;
const STORE = "pdfs";

/** "semaine" = programme hebdomadaire ; "calendrier" = calendrier annuel d'un semestre */
export type PdfCategorie = "semaine" | "calendrier";

export type PdfRecord = {
  id: string;
  semaine: number;
  nom: string;
  taille: number;
  ajouteLe: string;
  blob: Blob;
  /** Absent sur les enregistrements créés avant cette catégorisation */
  categorie?: PdfCategorie;
  /** Étiquette libre, par exemple « S3 » ou « S4 » */
  libelle?: string;
  /** Lundi de la semaine concernée, au format ISO — utilisé pour l'affichage */
  debut?: string;
};

export type PdfMeta = Omit<PdfRecord, "blob">;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB indisponible dans ce navigateur"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Ouverture de la base impossible"));
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const request = run(transaction.objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("Opération échouée"));
        transaction.oncomplete = () => db.close();
      })
  );
}

export async function addPdf(
  file: File,
  semaine: number,
  categorie: PdfCategorie = "semaine",
  libelle = "",
  debut?: string
): Promise<PdfMeta> {
  const record: PdfRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    semaine,
    nom: file.name,
    taille: file.size,
    ajouteLe: new Date().toISOString(),
    blob: file,
    categorie,
    libelle,
    debut,
  };
  await tx("readwrite", (s) => s.put(record));
  const { blob: _blob, ...meta } = record;
  void _blob;
  return meta;
}

export async function listPdfs(categorie: PdfCategorie = "semaine"): Promise<PdfMeta[]> {
  const all = await tx<PdfRecord[]>("readonly", (s) => s.getAll() as IDBRequest<PdfRecord[]>);
  return all
    .filter((r) => (r.categorie ?? "semaine") === categorie)
    .map(({ blob: _blob, ...meta }) => {
      void _blob;
      return meta;
    })
    .sort((a, b) => a.semaine - b.semaine || a.ajouteLe.localeCompare(b.ajouteLe));
}

export async function getPdfUrl(id: string): Promise<string | null> {
  const rec = await tx<PdfRecord | undefined>(
    "readonly",
    (s) => s.get(id) as IDBRequest<PdfRecord | undefined>
  );
  if (!rec) return null;
  return URL.createObjectURL(rec.blob);
}

export async function deletePdf(id: string): Promise<void> {
  await tx("readwrite", (s) => s.delete(id));
}
