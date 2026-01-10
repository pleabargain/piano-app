// https://github.com/pleabargain/piano-app
import { NOTES } from './music-theory';
import {
    openProgressionsDb,
    PROGRESSIONS_DB_NAME,
    PROGRESSIONS_DB_VERSION,
    STORE_KEY_PROGRESSIONS,
} from './progressions-db';

class KeyProgressionStorage {
    constructor() {
        this.dbName = PROGRESSIONS_DB_NAME;
        this.dbVersion = PROGRESSIONS_DB_VERSION;
        this.storeName = STORE_KEY_PROGRESSIONS;
        this.db = null;
    }

    /**
     * Initialize IndexedDB database
     * @returns {Promise<void>}
     */
    async init() {
        this.db = await openProgressionsDb();
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
        // Validate before exporting
        const validation = this.validateProgression(progression);
        if (!validation.valid) {
            throw new Error(`Invalid progression format: ${validation.error}`);
        }
        return JSON.stringify(progression, null, 2);
    }

    async downloadProgression(progression) {
        const json = this.exportToJSON(progression);
        const blob = new Blob([json], { type: 'application/json' });
        
        // Generate ISO timestamp filename: YYYY-MM-DD-HH-MM-SS
        const generateISOTimestamp = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}.json`;
        };
        
        const defaultFilename = generateISOTimestamp();

        // Try to use File System Access API for save dialog (Chrome/Edge)
        // This allows user to navigate to root directory or any location
        if (typeof window !== 'undefined' && 'showSaveFilePicker' in window && typeof window.showSaveFilePicker === 'function') {
            try {
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: defaultFilename,
                    types: [{
                        description: 'JSON files',
                        accept: { 'application/json': ['.json'] }
                    }]
                });
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
                return;
            } catch (err) {
                // User cancelled or error occurred, fall back to download
                if (err.name !== 'AbortError') {
                    console.warn('[KeyProgressionStorage] File System Access API failed, using fallback:', err);
                } else {
                    // User cancelled - don't proceed with fallback
                    return;
                }
            }
        }

        // Fallback: use download attribute (no save dialog, saves to Downloads)
        try {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = defaultFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (fallbackErr) {
            console.error('[KeyProgressionStorage] Fallback download failed:', fallbackErr);
            throw new Error(`Failed to save file: ${fallbackErr.message}`);
        }
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
