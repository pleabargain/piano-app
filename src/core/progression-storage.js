// https://github.com/pleabargain/piano-app
import { getScaleNotes } from './music-theory';
import { parseProgression } from './progression-parser';
import {
    openProgressionsDb,
    PROGRESSIONS_DB_NAME,
    PROGRESSIONS_DB_VERSION,
    STORE_PROGRESSIONS,
} from './progressions-db';

class ProgressionStorage {
    constructor() {
        this.dbName = PROGRESSIONS_DB_NAME;
        this.dbVersion = PROGRESSIONS_DB_VERSION;
        this.storeName = STORE_PROGRESSIONS;
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
     * Validate progression format
     * @param {Object} progression - Progression object to validate
     * @returns {Object} { valid: boolean, error?: string }
     */
    validateProgression(progression) {
        if (!progression || typeof progression !== 'object') {
            return { valid: false, error: 'Progression must be an object' };
        }

        // Required fields
        if (!progression.version || typeof progression.version !== 'string') {
            return { valid: false, error: 'Missing or invalid version field' };
        }

        if (!progression.id || typeof progression.id !== 'string') {
            return { valid: false, error: 'Missing or invalid id field' };
        }

        // Validate UUID format (basic check)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(progression.id)) {
            return { valid: false, error: 'Invalid UUID format for id' };
        }

        if (!progression.name || typeof progression.name !== 'string') {
            return { valid: false, error: 'Missing or invalid name field' };
        }

        if (progression.name.length > 100) {
            return { valid: false, error: 'Name must be 100 characters or less' };
        }

        if (!progression.progression || typeof progression.progression !== 'string') {
            return { valid: false, error: 'Missing or invalid progression field' };
        }

        if (progression.progression.trim().length === 0) {
            return { valid: false, error: 'Progression string cannot be empty' };
        }

        if (typeof progression.createdAt !== 'number' || progression.createdAt <= 0) {
            return { valid: false, error: 'Missing or invalid createdAt field' };
        }

        // Validate metadata if present
        if (progression.metadata !== undefined) {
            if (typeof progression.metadata !== 'object' || progression.metadata === null) {
                return { valid: false, error: 'Metadata must be an object' };
            }

            // If metadata exists, key and scaleType are required
            if (!progression.metadata.key || typeof progression.metadata.key !== 'string') {
                return { valid: false, error: 'Missing or invalid metadata.key field' };
            }

            if (!progression.metadata.scaleType || typeof progression.metadata.scaleType !== 'string') {
                return { valid: false, error: 'Missing or invalid metadata.scaleType field' };
            }
        }

        return { valid: true };
    }

    /**
     * Validate progression string can be parsed
     * @param {string} progressionString - Roman numeral progression string
     * @param {string} root - Root note (e.g., "C", "F#")
     * @param {string} scaleType - Scale type (e.g., "major", "minor")
     * @returns {Object} { valid: boolean, error?: string }
     */
    validateProgressionString(progressionString, root, scaleType) {
        if (!progressionString || typeof progressionString !== 'string') {
            return { valid: false, error: 'Progression string must be a non-empty string' };
        }

        const trimmed = progressionString.trim();
        if (trimmed.length === 0) {
            return { valid: false, error: 'Progression string cannot be empty' };
        }

        // Validate using the same parser as the UI (supports Roman numerals + absolute chords)
        let scaleNotes = [];
        try {
            if (root && scaleType) {
                // Backwards-compat alias: some callers may use "minor" to mean natural minor
                const resolvedScaleType = scaleType === 'minor' ? 'natural_minor' : scaleType;
                scaleNotes = getScaleNotes(root, resolvedScaleType);
            }
        } catch (err) {
            // If key context is invalid/unavailable, parser can still validate absolute chords.
            scaleNotes = [];
        }

        const { chords, error } = parseProgression(trimmed, scaleNotes);
        if (error) {
            return { valid: false, error };
        }

        if (!chords || chords.length === 0) {
            return { valid: false, error: 'Progression could not be parsed' };
        }

        return { valid: true };
    }

    /**
     * Save progression to IndexedDB
     * @param {Object} progression - Progression object
     * @returns {Promise<string>} Progression ID
     */
    async save(progression) {
        if (!this.db) {
            await this.init();
        }

        // Generate UUID if not provided
        if (!progression.id) {
            // Use crypto.randomUUID() if available, otherwise generate a simple UUID v4
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                progression.id = crypto.randomUUID();
            } else {
                // Fallback UUID v4 generator
                progression.id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    const r = Math.random() * 16 | 0;
                    const v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }
        }

        // Set createdAt if not provided
        if (!progression.createdAt) {
            progression.createdAt = Date.now();
        }

        // Set version if not provided
        if (!progression.version) {
            progression.version = '1.0.0';
        }

        const validation = this.validateProgression(progression);
        if (!validation.valid) {
            throw new Error(`Invalid progression format: ${validation.error}`);
        }

        return new Promise((resolve, reject) => {
            let settled = false;
            const finish = (err, value) => {
                if (settled) return;
                settled = true;
                clearTimeout(timeoutId);
                if (err) reject(err);
                else resolve(value);
            };

            // Prevent UI from hanging forever if IndexedDB is blocked/hung
            const timeoutId = setTimeout(() => {
                finish(new Error('Timed out saving progression (IndexedDB did not respond).'));
            }, 5000);

            let transaction;
            try {
                transaction = this.db.transaction([this.storeName], 'readwrite');
            } catch (err) {
                finish(err);
                return;
            }

            transaction.oncomplete = () => finish(null, progression.id);
            transaction.onerror = () => finish(transaction.error || new Error('Failed to save progression'));
            transaction.onabort = () => finish(transaction.error || new Error('Failed to save progression (transaction aborted)'));

            let request;
            try {
                const store = transaction.objectStore(this.storeName);
                request = store.put(progression);
            } catch (err) {
                finish(err);
                return;
            }

            request.onerror = () => {
                // transaction.onerror will handle the final rejection in most browsers,
                // but keep a fallback here.
                finish(request.error || new Error('Failed to save progression'));
            };
        });
    }

    /**
     * Load progression from IndexedDB
     * @param {string} id - Progression ID
     * @returns {Promise<Object>} Progression object
     */
    async load(id) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);

            request.onsuccess = () => {
                const progression = request.result;
                if (progression) {
                    // Validate loaded data
                    const validation = this.validateProgression(progression);
                    if (!validation.valid) {
                        reject(new Error(`Invalid progression data: ${validation.error}`));
                        return;
                    }
                    resolve(progression);
                } else {
                    reject(new Error(`Progression with id ${id} not found`));
                }
            };

            request.onerror = () => {
                reject(new Error('Failed to load progression'));
            };
        });
    }

    /**
     * Delete progression from IndexedDB
     * @param {string} id - Progression ID
     * @returns {Promise<void>}
     */
    async delete(id) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(new Error('Failed to delete progression'));
            };
        });
    }

    /**
     * Get all progressions from IndexedDB
     * @param {string} sortBy - Sort field ('createdAt' or 'name')
     * @param {string} order - Sort order ('asc' or 'desc')
     * @returns {Promise<Array>} Array of progressions
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

            const progressions = [];

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    // Validate each progression before adding
                    const validation = this.validateProgression(cursor.value);
                    if (validation.valid) {
                        progressions.push(cursor.value);
                    }
                    cursor.continue();
                } else {
                    resolve(progressions);
                }
            };

            request.onerror = () => {
                reject(new Error('Failed to get progressions'));
            };
        });
    }

    /**
     * Export progression to JSON string
     * @param {Object} progression - Progression object
     * @returns {string} JSON string
     */
    exportToJSON(progression) {
        const validation = this.validateProgression(progression);
        if (!validation.valid) {
            throw new Error(`Invalid progression format: ${validation.error}`);
        }

        return JSON.stringify(progression, null, 2);
    }

    /**
     * Import progression from JSON string
     * @param {string} jsonString - JSON string
     * @returns {Object} Progression object
     */
    importFromJSON(jsonString) {
        let parsed;
        try {
            parsed = JSON.parse(jsonString);
        } catch (error) {
            throw new Error(`Invalid JSON: ${error.message}`);
        }

        const validation = this.validateProgression(parsed);
        if (!validation.valid) {
            throw new Error(`Invalid progression format: ${validation.error}`);
        }

        return parsed;
    }

    /**
     * Download progression as JSON file
     * @param {Object} progression - Progression object
     * @param {string} filename - Optional filename (defaults to progression name)
     */
    async downloadProgression(progression, filename = null) {
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
        
        const defaultFilename = filename || generateISOTimestamp();

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
                    console.warn('[ProgressionStorage] File System Access API failed, using fallback:', err);
                } else {
                    // User cancelled - don't proceed with fallback
                    return;
                }
            }
        }

        // Fallback: use download attribute (no save dialog, saves to Downloads)
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = defaultFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Import progression from file
     * @param {File} file - File object
     * @returns {Promise<Object>} Progression object
     */
    async importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const progression = this.importFromJSON(event.target.result);
                    resolve(progression);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
        });
    }
}

export default ProgressionStorage;

