"use client";

// IndexedDB wrapper for visit photos.
// Stores blobs keyed by sno — no size limits beyond device storage.
// Each location can hold multiple photos (max 5).

const DB_NAME    = "philately_images";
const DB_VERSION = 1;
const STORE_NAME = "photos";

export interface StoredPhoto {
  id: string;      // `${sno}-${timestamp}`
  sno: number;
  blob: Blob;
  mimeType: string;
  name: string;
  addedAt: string; // ISO
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("sno", "sno", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

export async function savePhoto(sno: number, file: File): Promise<StoredPhoto> {
  const db    = await openDB();
  const photo: StoredPhoto = {
    id:       `${sno}-${Date.now()}`,
    sno,
    blob:     file,
    mimeType: file.type,
    name:     file.name,
    addedAt:  new Date().toISOString(),
  };
  await new Promise<void>((resolve, reject) => {
    const tx  = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).put(photo);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
  return photo;
}

export async function getPhotos(sno: number): Promise<StoredPhoto[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, "readonly");
    const index = tx.objectStore(STORE_NAME).index("sno");
    const req   = index.getAll(IDBKeyRange.only(sno));
    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror   = () => reject(req.error);
  });
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx  = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

export async function getAllPhotoCounts(): Promise<Record<number, number>> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, "readonly");
    const req   = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => {
      const counts: Record<number, number> = {};
      for (const p of (req.result as StoredPhoto[])) {
        counts[p.sno] = (counts[p.sno] ?? 0) + 1;
      }
      resolve(counts);
    };
    req.onerror = () => reject(req.error);
  });
}

// Convert blob to object URL (call URL.revokeObjectURL when done)
export function blobToUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}
