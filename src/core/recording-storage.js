// https://github.com/pleabargain/piano-app
class RecordingStorage {
    constructor() {
        this.dbName = 'piano-recordings';
        this.dbVersion = 1;
        this.storeName = 'recordings';
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
     * Validate recording format
     * @param {Object} recording - Recording object to validate
     * @returns {Object} { valid: boolean, error?: string }
     */
    validateRecording(recording) {
        if (!recording || typeof recording !== 'object') {
            return { valid: false, error: 'Recording must be an object' };
        }

        // Required fields
        if (!recording.version || typeof recording.version !== 'string') {
            return { valid: false, error: 'Missing or invalid version field' };
        }

        if (!recording.id || typeof recording.id !== 'string') {
            return { valid: false, error: 'Missing or invalid id field' };
        }

        // Validate UUID format (basic check)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(recording.id)) {
            return { valid: false, error: 'Invalid UUID format for id' };
        }

        if (!recording.name || typeof recording.name !== 'string') {
            return { valid: false, error: 'Missing or invalid name field' };
        }

        if (typeof recording.createdAt !== 'number' || recording.createdAt <= 0) {
            return { valid: false, error: 'Missing or invalid createdAt field' };
        }

        if (typeof recording.duration !== 'number' || recording.duration < 0) {
            return { valid: false, error: 'Missing or invalid duration field' };
        }

        if (!Array.isArray(recording.events)) {
            return { valid: false, error: 'Missing or invalid events array' };
        }

        // Validate events
        for (let i = 0; i < recording.events.length; i++) {
            const event = recording.events[i];
            const eventError = this.validateEvent(event, i);
            if (eventError) {
                return { valid: false, error: eventError };
            }
        }

        return { valid: true };
    }

    /**
     * Validate a single event
     * @param {Object} event - Event object to validate
     * @param {number} index - Event index for error messages
     * @returns {string|null} Error message or null if valid
     */
    validateEvent(event, index) {
        if (!event || typeof event !== 'object') {
            return `Event at index ${index} must be an object`;
        }

        if (event.type !== 'noteOn' && event.type !== 'noteOff') {
            return `Event at index ${index} has invalid type: ${event.type}`;
        }

        if (typeof event.note !== 'number' || event.note < 0 || event.note > 127) {
            return `Event at index ${index} has invalid note: ${event.note} (must be 0-127)`;
        }

        if (typeof event.velocity !== 'number' || event.velocity < 0 || event.velocity > 127) {
            return `Event at index ${index} has invalid velocity: ${event.velocity} (must be 0-127)`;
        }

        if (typeof event.timestamp !== 'number' || event.timestamp < 0) {
            return `Event at index ${index} has invalid timestamp: ${event.timestamp}`;
        }

        if (event.channel !== undefined && (typeof event.channel !== 'number' || event.channel < 0 || event.channel > 15)) {
            return `Event at index ${index} has invalid channel: ${event.channel} (must be 0-15)`;
        }

        return null;
    }

    /**
     * Save recording to IndexedDB
     * @param {Object} recording - Recording object
     * @returns {Promise<string>} Recording ID
     */
    async save(recording) {
        if (!this.db) {
            await this.init();
        }

        const validation = this.validateRecording(recording);
        if (!validation.valid) {
            throw new Error(`Invalid recording format: ${validation.error}`);
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(recording);

            request.onsuccess = () => {
                resolve(recording.id);
            };

            request.onerror = () => {
                reject(new Error('Failed to save recording'));
            };
        });
    }

    /**
     * Load recording from IndexedDB
     * @param {string} id - Recording ID
     * @returns {Promise<Object>} Recording object
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
                const recording = request.result;
                if (recording) {
                    resolve(recording);
                } else {
                    reject(new Error(`Recording with id ${id} not found`));
                }
            };

            request.onerror = () => {
                reject(new Error('Failed to load recording'));
            };
        });
    }

    /**
     * Delete recording from IndexedDB
     * @param {string} id - Recording ID
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
                reject(new Error('Failed to delete recording'));
            };
        });
    }

    /**
     * Get all recordings from IndexedDB
     * @param {string} sortBy - Sort field ('createdAt' or 'name')
     * @param {string} order - Sort order ('asc' or 'desc')
     * @returns {Promise<Array>} Array of recordings
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

            const recordings = [];

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    recordings.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(recordings);
                }
            };

            request.onerror = () => {
                reject(new Error('Failed to get recordings'));
            };
        });
    }

    /**
     * Export recording to JSON string
     * @param {Object} recording - Recording object
     * @returns {string} JSON string
     */
    exportToJSON(recording) {
        const validation = this.validateRecording(recording);
        if (!validation.valid) {
            throw new Error(`Invalid recording format: ${validation.error}`);
        }

        return JSON.stringify(recording, null, 2);
    }

    /**
     * Import recording from JSON string
     * @param {string} jsonString - JSON string
     * @returns {Object} Recording object
     */
    importFromJSON(jsonString) {
        let parsed;
        try {
            parsed = JSON.parse(jsonString);
        } catch (error) {
            throw new Error(`Invalid JSON: ${error.message}`);
        }

        const validation = this.validateRecording(parsed);
        if (!validation.valid) {
            throw new Error(`Invalid recording format: ${validation.error}`);
        }

        return parsed;
    }

    /**
     * Download recording as JSON file
     * @param {Object} recording - Recording object
     * @param {string} filename - Optional filename (defaults to recording name)
     */
    downloadRecording(recording, filename = null) {
        const json = this.exportToJSON(recording);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `${recording.name.replace(/[^a-z0-9]/gi, '_')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Import recording from file
     * @param {File} file - File object
     * @returns {Promise<Object>} Recording object
     */
    async importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const recording = this.importFromJSON(event.target.result);
                    resolve(recording);
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

export default RecordingStorage;

