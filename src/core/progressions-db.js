// https://github.com/pleabargain/piano-app
/**
 * Shared IndexedDB schema for progression-related data.
 *
 * Important: both ProgressionStorage and KeyProgressionStorage share the same DB.
 * If only one store is created at version 1, attempts to use the other store will
 * fail with "object store not found". We bump the version and create both stores
 * together to keep the schema consistent.
 */
export const PROGRESSIONS_DB_NAME = 'piano-progressions';
export const PROGRESSIONS_DB_VERSION = 2;

export const STORE_PROGRESSIONS = 'progressions';
export const STORE_KEY_PROGRESSIONS = 'key_progressions';

function ensureStore(db, upgradeTx, storeName) {
  const objectStore = db.objectStoreNames.contains(storeName)
    ? upgradeTx.objectStore(storeName)
    : db.createObjectStore(storeName, { keyPath: 'id' });

  // Ensure indexes exist (safe no-op if already there)
  if (!objectStore.indexNames.contains('createdAt')) {
    objectStore.createIndex('createdAt', 'createdAt', { unique: false });
  }
  if (!objectStore.indexNames.contains('name')) {
    objectStore.createIndex('name', 'name', { unique: false });
  }
}

/**
 * Open the shared progressions database with the latest schema.
 * @returns {Promise<IDBDatabase>}
 */
export function openProgressionsDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PROGRESSIONS_DB_NAME, PROGRESSIONS_DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onblocked = () => {
      // Another tab may still have the old version open, blocking upgrade.
      reject(new Error('Progressions database upgrade is blocked. Close other tabs/windows running this app and reload.'));
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const tx = event.target.transaction;
      // Create/ensure BOTH stores so schema remains consistent.
      ensureStore(db, tx, STORE_PROGRESSIONS);
      ensureStore(db, tx, STORE_KEY_PROGRESSIONS);
    };

    request.onsuccess = () => {
      const db = request.result;
      // If another tab upgrades later, close this connection so it can proceed.
      db.onversionchange = () => {
        try {
          db.close();
        } catch {
          // ignore
        }
      };
      resolve(db);
    };
  });
}

