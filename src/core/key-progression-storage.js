// https://github.com/pleabargain/piano-app
import { NOTES } from './music-theory';

class KeyProgressionStorage {
    constructor() {
        this.dbName = 'piano-progressions';
        this.dbVersion = 1;
        this.storeName = 'key_progressions';
        this.db = null;
    }

    /**
     * Initialize IndexedDB database
     * @returns {Promise<void>}
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                reject(new Error('Failed to open IndexedDB'));
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    objectStore.createIndex('createdAt', 'createdAt', { unique: false });
                    objectStore.createIndex('name', 'name', { unique: false });
                }
            };
        });
    }

    /**
     * Validate key progression format
     * @param {Object} progression - Key progression object to validate
     * @returns {Object} { valid: boolean, error?: string }
     */
    validateProgression(progression) {
        if (!progression || typeof progression !== 'object') {
            return { valid: false, error: 'Progression must be an object' };
        }

        // version and id are now optional during validation as they can be generated
        if (progression.version && typeof progression.version !== 'string') {
            return { valid: false, error: 'Invalid version field' };
        }

        if (progression.id && typeof progression.id !== 'string') {
            return { valid: false, error: 'Invalid id field' };
        }

        if (!progression.name) {
            return { valid: false, error: 'Missing name field' };
        }

        if (!progression.progression || typeof progression.progression !== 'string') {
            return { valid: false, error: 'Missing or invalid progression field' };
        }

        const tokens = progression.progression.trim().split(/\s+/);
        if (tokens.length === 0 || (tokens.length === 1 && tokens[0] === '')) {
            return { valid: false, error: 'Progression cannot be empty' };
        }

        return { valid: true };
    }

    /**
     * Save key progression to IndexedDB
     */
    async save(progression) {
        if (!this.db) {
            await this.init();
        }

        if (!progression.id) {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                progression.id = crypto.randomUUID();
            } else {
                progression.id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                    const r = Math.random() * 16 | 0;
                    const v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }
        }

        if (!progression.createdAt) {
            progression.createdAt = Date.now();
        }

        if (!progression.version) {
            progression.version = '1.0.0';
        }

        const validation = this.validateProgression(progression);
        if (!validation.valid) {
            throw new Error(`Invalid progression format: ${validation.error}`);
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(progression);

            request.onsuccess = () => resolve(progression.id);
            request.onerror = () => reject(new Error('Failed to save key progression'));
        });
    }

    /**
     * Get all key progressions
     */
    async getAll(sortBy = 'createdAt', order = 'desc') {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const index = store.index(sortBy);
            const request = order === 'desc' ? index.openCursor(null, 'prev') : index.openCursor();

            const items = [];
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    items.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(items);
                }
            };
            request.onerror = () => reject(new Error('Failed to get key progressions'));
        });
    }

    async delete(id) {
        if (!this.db) {
            await this.init();
        }
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to delete key progression'));
        });
    }

    exportToJSON(progression) {
        return JSON.stringify(progression, null, 2);
    }

    downloadProgression(progression) {
        const json = this.exportToJSON(progression);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${progression.name.replace(/[^a-z0-9]/gi, '_')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    async importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const parsed = JSON.parse(e.target.result);
                    const validation = this.validateProgression(parsed);
                    if (!validation.valid) throw new Error(validation.error);
                    resolve(parsed);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
}

export default KeyProgressionStorage;
