/**
 * IndexedDB Promise Wrapper
 *
 * A lightweight promise-based wrapper around IndexedDB for offline data
 * storage. Used by the offline cache layer to persist farm data (fields,
 * weather, satellite) locally so the app works without connectivity.
 */

const DB_NAME = "agrovision-offline";
const DB_VERSION = 1;

export type StoreName =
  | "fields"
  | "weather"
  | "satellite"
  | "settings"
  | "integrations"
  | "sensor_sync_logs";

const STORES: StoreName[] = [
  "fields",
  "weather",
  "satellite",
  "settings",
  "integrations",
  "sensor_sync_logs",
];

let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Open (and create if needed) the IndexedDB database.
 * Returns a cached promise so multiple callers share a single connection.
 */
function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this environment"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: "id" });
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

/**
 * Run a transaction against a store.
 */
async function withStore<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = fn(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => resolve(request.result);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Put a record into a store (upsert by id).
 */
export async function putRecord<T extends { id: string }>(
  storeName: StoreName,
  value: T
): Promise<void> {
  await withStore(storeName, "readwrite", (store) => store.put(value));
}

/**
 * Bulk put multiple records into a store.
 */
export async function putRecords<T extends { id: string }>(
  storeName: StoreName,
  values: T[]
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    for (const value of values) {
      store.put(value);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get a single record by id.
 */
export async function getRecord<T>(
  storeName: StoreName,
  id: string
): Promise<T | undefined> {
  return withStore(storeName, "readonly", (store) => store.get(id));
}

/**
 * Get all records from a store.
 */
export async function getAllRecords<T>(storeName: StoreName): Promise<T[]> {
  return withStore(storeName, "readonly", (store) => store.getAll());
}

/**
 * Delete a record by id.
 */
export async function deleteRecord(
  storeName: StoreName,
  id: string
): Promise<void> {
  await withStore(storeName, "readwrite", (store) => store.delete(id));
}

/**
 * Clear all records from a store.
 */
export async function clearStore(storeName: StoreName): Promise<void> {
  await withStore(storeName, "readwrite", (store) => store.clear());
}

/**
 * Check if IndexedDB is available in this environment.
 * Useful for guarding client-only calls on the server.
 */
export function isIndexedDBAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}
