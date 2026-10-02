/**
 * Lightweight, zero-dependency IndexedDB wrapper for preserving
 * original 4K photographs locally without consuming sessionStorage/localStorage quota.
 */

const DB_NAME = 'khath_and_co_folio';
const STORE_NAME = 'folio_originals';
const DB_VERSION = 1;

// In-memory fallback if IndexedDB is unavailable
const memoryFallback = new Map<string, Blob>();

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Stores an original uncompressed photograph Blob or File into IndexedDB.
 */
export async function saveOriginalImageBlob(id: string, blob: Blob | File): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch (err) {
    // Fallback to in-memory map
    memoryFallback.set(id, blob);
  }
}

/**
 * Retrieves an original uncompressed photograph Blob from IndexedDB.
 */
export async function getOriginalImageBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => {
        const result = req.result;
        if (result instanceof Blob) {
          resolve(result);
        } else {
          resolve(memoryFallback.get(id) || null);
        }
      };
      req.onerror = () => resolve(memoryFallback.get(id) || null);
    });
  } catch (err) {
    return memoryFallback.get(id) || null;
  }
}

/**
 * Deletes an original photograph Blob from IndexedDB.
 */
export async function deleteOriginalImageBlob(id: string): Promise<void> {
  try {
    memoryFallback.delete(id);
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    // Silent ignore
  }
}
