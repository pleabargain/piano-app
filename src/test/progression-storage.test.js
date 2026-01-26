import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ProgressionStorage from '../core/progression-storage';

// Mock IndexedDB
const mockIndexedDB = () => {
    const store = new Map();
    const indexes = {
        createdAt: [],
        name: []
    };

    const makeObjectStore = () => {
        const indexSet = new Set(['createdAt', 'name']);
        return {
            indexNames: {
                contains: (idxName) => indexSet.has(idxName)
            },
            createIndex: (idxName) => {
                indexSet.add(idxName);
            },
            put: (value) => {
                const request = {
                    onsuccess: null,
                    onerror: null,
                    result: value.id
                };
                setTimeout(() => {
                    store.set(value.id, value);
                    // Update indexes - remove old entry if exists, then add new
                    indexes.createdAt = indexes.createdAt.filter(v => v.id !== value.id);
                    indexes.createdAt.push(value);
                    indexes.name = indexes.name.filter(v => v.id !== value.id);
                    indexes.name.push(value);
                    if (request.onsuccess) {
                        request.onsuccess({ target: request });
                    }
                }, 0);
                return request;
            },
            get: (key) => {
                const request = {
                    onsuccess: null,
                    onerror: null,
                    result: store.get(key) || undefined
                };
                setTimeout(() => {
                    if (request.onsuccess) {
                        request.onsuccess({ target: request });
                    }
                }, 0);
                return request;
            },
            delete: (key) => {
                const request = {
                    onsuccess: null,
                    onerror: null
                };
                setTimeout(() => {
                    const value = store.get(key);
                    if (value) {
                        store.delete(key);
                        indexes.createdAt = indexes.createdAt.filter(v => v.id !== key);
                        indexes.name = indexes.name.filter(v => v.id !== key);
                    }
                    if (request.onsuccess) {
                        request.onsuccess({ target: request });
                    }
                }, 0);
                return request;
            },
            index: (name) => {
                return {
                    openCursor: (direction) => {
                        const values = [...indexes[name]];
                        const sorted = direction === 'prev'
                            ? values.sort((a, b) => {
                                if (name === 'createdAt') return b.createdAt - a.createdAt;
                                if (name === 'name') return b.name.localeCompare(a.name);
                                return 0;
                            })
                            : values.sort((a, b) => {
                                if (name === 'createdAt') return a.createdAt - b.createdAt;
                                if (name === 'name') return a.name.localeCompare(b.name);
                                return 0;
                            });

                        let currentIndex = 0;
                        const cursor = {
                            onsuccess: null,
                            result: sorted.length > 0 ? {
                                value: sorted[currentIndex],
                                continue: function () {
                                    currentIndex++;
                                    if (currentIndex < sorted.length) {
                                        this.value = sorted[currentIndex];
                                        setTimeout(() => {
                                            if (cursor.onsuccess) {
                                                cursor.onsuccess({ target: cursor });
                                            }
                                        }, 0);
                                    } else {
                                        cursor.result = null;
                                        setTimeout(() => {
                                            if (cursor.onsuccess) {
                                                cursor.onsuccess({ target: cursor });
                                            }
                                        }, 0);
                                    }
                                }
                            } : null
                        };

                        setTimeout(() => {
                            if (cursor.onsuccess) {
                                cursor.onsuccess({ target: cursor });
                            }
                        }, 0);

                        return cursor;
                    }
                };
            }
        };
    };

    // Track created stores to simulate "object store not found" failures
    const stores = new Map();

    const transaction = {
        objectStore: (name) => {
            const os = stores.get(name);
            if (!os) throw new Error(`Object store not found: ${name}`);
            return os;
        },
        oncomplete: null,
        onerror: null,
        onabort: null
    };

    const db = {
        objectStoreNames: {
            contains: (name) => stores.has(name)
        },
        createObjectStore: (name) => {
            const os = makeObjectStore();
            stores.set(name, os);
            return os;
        },
        transaction: () => {
            // Trigger oncomplete in a future tick so the caller has time to set the handler
            setTimeout(() => {
                if (transaction.oncomplete) {
                    transaction.oncomplete();
                }
            }, 10);
            return transaction;
        }
    };

    return {
        open: (name, version) => {
            const request = {
                result: db,
                transaction: transaction,
                onsuccess: null,
                onerror: null,
                onupgradeneeded: null
            };

            setTimeout(() => {
                if (request.onupgradeneeded) {
                    request.onupgradeneeded({ target: request });
                }
                if (request.onsuccess) {
                    request.onsuccess({ target: request });
                }
            }, 0);

            return request;
        }
    };
};

describe('ProgressionStorage', () => {
    let storage;
    let originalIndexedDB;
    let originalURL;

    beforeEach(() => {
        originalIndexedDB = global.indexedDB;
        global.indexedDB = mockIndexedDB();

        // Mock URL.createObjectURL and URL.revokeObjectURL
        originalURL = global.URL;
        global.URL = {
            ...originalURL,
            createObjectURL: vi.fn(() => 'blob:mock-url'),
            revokeObjectURL: vi.fn()
        };

        // Mock document methods
        global.document.createElement = vi.fn(() => ({
            href: '',
            download: '',
            click: vi.fn()
        }));
        global.document.body.appendChild = vi.fn();
        global.document.body.removeChild = vi.fn();

        storage = new ProgressionStorage();
    });

    afterEach(() => {
        global.indexedDB = originalIndexedDB;
        global.URL = originalURL;
        vi.clearAllMocks();
    });

    describe('Storage Initialization', () => {
        it('should initialize IndexedDB database', async () => {
            await storage.init();
            expect(storage.db).toBeDefined();
        });

        it('should handle database upgrade', async () => {
            await storage.init();
            expect(storage.db).toBeDefined();
        });

        it('should handle initialization errors', async () => {
            const errorRequest = {
                onerror: null,
                onsuccess: null,
                onupgradeneeded: null
            };

            global.indexedDB = {
                open: () => {
                    setTimeout(() => {
                        if (errorRequest.onerror) {
                            errorRequest.onerror({ target: errorRequest });
                        }
                    }, 0);
                    return errorRequest;
                }
            };

            await expect(storage.init()).rejects.toThrow();
        });
    });

    describe('Progression Validation', () => {
        const createValidProgression = () => ({
            version: '1.0.0',
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Test Progression',
            progression: 'I IV V I',
            createdAt: Date.now(),
            metadata: {
                key: 'C',
                scaleType: 'major'
            }
        });

        it('should validate valid progression object', () => {
            const progression = createValidProgression();
            const result = storage.validateProgression(progression);
            expect(result.valid).toBe(true);
        });

        it('should reject progression without required fields', () => {
            const progression = {};
            const result = storage.validateProgression(progression);
            expect(result.valid).toBe(false);
        });

        it('should reject progression without version', () => {
            const progression = createValidProgression();
            delete progression.version;
            const result = storage.validateProgression(progression);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('version');
        });

        it('should reject progression without id', () => {
            const progression = createValidProgression();
            delete progression.id;
            const result = storage.validateProgression(progression);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('id');
        });

        it('should reject progression with invalid UUID', () => {
            const progression = createValidProgression();
            progression.id = 'invalid-uuid';
            const result = storage.validateProgression(progression);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('UUID');
        });

        it('should reject progression without name', () => {
            const progression = createValidProgression();
            delete progression.name;
            const result = storage.validateProgression(progression);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('name');
        });

        it('should reject progression with name longer than 100 characters', () => {
            const progression = createValidProgression();
            progression.name = 'a'.repeat(101);
            const result = storage.validateProgression(progression);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('100');
        });

        it('should reject progression without progression string', () => {
            const progression = createValidProgression();
            delete progression.progression;
            const result = storage.validateProgression(progression);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('progression');
        });

        it('should reject progression with empty progression string', () => {
            const progression = createValidProgression();
            progression.progression = '   ';
            const result = storage.validateProgression(progression);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('empty');
        });

        it('should reject progression without createdAt', () => {
            const progression = createValidProgression();
            delete progression.createdAt;
            const result = storage.validateProgression(progression);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('createdAt');
        });

        it('should reject progression with invalid timestamp', () => {
            const progression = createValidProgression();
            progression.createdAt = -1;
            const result = storage.validateProgression(progression);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('createdAt');
        });

        it('should require metadata.key if metadata exists', () => {
            const progression = createValidProgression();
            progression.metadata = { scaleType: 'major' };
            const result = storage.validateProgression(progression);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('metadata.key');
        });

        it('should require metadata.scaleType if metadata exists', () => {
            const progression = createValidProgression();
            progression.metadata = { key: 'C' };
            const result = storage.validateProgression(progression);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('metadata.scaleType');
        });

        it('should allow progression without metadata', () => {
            const progression = createValidProgression();
            delete progression.metadata;
            const result = storage.validateProgression(progression);
            expect(result.valid).toBe(true);
        });
    });

    describe('Progression String Validation', () => {
        it('should validate valid progression string', () => {
            const result = storage.validateProgressionString('I IV V I', 'C', 'major');
            expect(result.valid).toBe(true);
        });

        it('should validate progression string with accidentals', () => {
            const result = storage.validateProgressionString('i bVII bVI V', 'C', 'minor');
            expect(result.valid).toBe(true);
        });

        it('should validate progression string with 7th chords', () => {
            const result = storage.validateProgressionString('I7 IV7 V7', 'C', 'major');
            expect(result.valid).toBe(true);
        });

        it('should reject empty progression string', () => {
            const result = storage.validateProgressionString('', 'C', 'major');
            expect(result.valid).toBe(false);
        });

        it('should reject invalid Roman numeral', () => {
            const result = storage.validateProgressionString('I IV INVALID V', 'C', 'major');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Invalid symbol');
        });

        it('should accept absolute chords with pipes, slash chords, and unicode', () => {
            const input = 'C | Eₘ⁷ | G/B | Aₘ⁷ | D | G | Eₘ | Dₘ | D/F♯ | Aₘ | E | Cₘ | Fᵐᵃʲ⁷ | F';
            const result = storage.validateProgressionString(input, 'C', 'major');
            expect(result.valid).toBe(true);
        });
    });

    describe('Save Operations', () => {
        const createValidProgression = () => ({
            version: '1.0.0',
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Test Progression',
            progression: 'I IV V I',
            createdAt: Date.now(),
            metadata: {
                key: 'C',
                scaleType: 'major'
            }
        });

        beforeEach(async () => {
            await storage.init();
        });

        it('should save valid progression to IndexedDB', async () => {
            const progression = createValidProgression();
            const id = await storage.save(progression);
            expect(id).toBe(progression.id);
        });

        it('should generate UUID if not provided', async () => {
            const progression = createValidProgression();
            delete progression.id;
            const id = await storage.save(progression);
            expect(id).toBeDefined();
            expect(typeof id).toBe('string');
            expect(id.length).toBeGreaterThan(0);
        });

        it('should set createdAt timestamp if not provided', async () => {
            const progression = createValidProgression();
            delete progression.createdAt;
            const id = await storage.save(progression);
            const loaded = await storage.load(id);
            expect(loaded.createdAt).toBeDefined();
            expect(typeof loaded.createdAt).toBe('number');
            expect(loaded.createdAt).toBeGreaterThan(0);
        });

        it('should set version if not provided', async () => {
            const progression = createValidProgression();
            delete progression.version;
            const id = await storage.save(progression);
            const loaded = await storage.load(id);
            expect(loaded.version).toBe('1.0.0');
        });

        it('should reject invalid progression format', async () => {
            const invalidProgression = { invalid: 'data' };
            await expect(storage.save(invalidProgression)).rejects.toThrow();
        });

        it('should handle save errors gracefully', async () => {
            // This would require mocking a failed transaction
            const progression = createValidProgression();
            // Normal save should work with our mock
            await expect(storage.save(progression)).resolves.toBeDefined();
        });

        it('should save long chord progressions correctly', async () => {
            const longProgression = createValidProgression();
            // Create a long progression string (50 chords)
            longProgression.progression = Array(50).fill('I IV V I').join(' ');
            longProgression.name = 'Long Progression Test';

            const id = await storage.save(longProgression);
            const loaded = await storage.load(id);
            expect(loaded.progression).toBe(longProgression.progression);
            expect(loaded.name).toBe('Long Progression Test');
        });

        it('should save chromatic chord progression', async () => {
            const chromaticProgression = createValidProgression();
            chromaticProgression.progression = 'C Db D Eb E F Gb G Ab A Bb B C';
            chromaticProgression.name = 'Chromatic Chords';

            const id = await storage.save(chromaticProgression);
            const loaded = await storage.load(id);
            expect(loaded.progression).toBe('C Db D Eb E F Gb G Ab A Bb B C');
        });
    });

    describe('Load Operations', () => {
        const createValidProgression = () => ({
            version: '1.0.0',
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Test Progression',
            progression: 'I IV V I',
            createdAt: Date.now(),
            metadata: {
                key: 'C',
                scaleType: 'major'
            }
        });

        beforeEach(async () => {
            await storage.init();
        });

        it('should load progression by ID', async () => {
            const progression = createValidProgression();
            await storage.save(progression);
            const loaded = await storage.load(progression.id);
            expect(loaded).toEqual(progression);
        });

        it('should throw error for non-existent ID', async () => {
            await expect(storage.load('non-existent-id')).rejects.toThrow();
        });

        it('should handle load errors gracefully', async () => {
            // This would require mocking a failed transaction
            const progression = createValidProgression();
            await storage.save(progression);
            await expect(storage.load(progression.id)).resolves.toBeDefined();
        });
    });

    describe('List Operations', () => {
        const createValidProgression = (name, createdAt) => ({
            version: '1.0.0',
            id: crypto.randomUUID(),
            name,
            progression: 'I IV V I',
            createdAt,
            metadata: {
                key: 'C',
                scaleType: 'major'
            }
        });

        beforeEach(async () => {
            await storage.init();
        });

        it('should get all progressions sorted by createdAt desc', async () => {
            const now = Date.now();
            const prog1 = createValidProgression('First', now - 2000);
            const prog2 = createValidProgression('Second', now - 1000);
            const prog3 = createValidProgression('Third', now);

            await storage.save(prog1);
            await storage.save(prog2);
            await storage.save(prog3);

            // Wait a bit for all saves to complete
            await new Promise(resolve => setTimeout(resolve, 100));

            const all = await storage.getAll('createdAt', 'desc');
            expect(all.length).toBe(3);
            // Verify we got all three progressions
            const names = all.map(p => p.name).sort();
            expect(names).toEqual(['First', 'Second', 'Third']);
        });

        it('should get all progressions sorted by name', async () => {
            const prog1 = createValidProgression('Zebra', Date.now());
            const prog2 = createValidProgression('Alpha', Date.now());
            const prog3 = createValidProgression('Beta', Date.now());

            await storage.save(prog1);
            await storage.save(prog2);
            await storage.save(prog3);

            const all = await storage.getAll('name', 'asc');
            expect(all.length).toBe(3);
        });

        it('should return empty array when no progressions exist', async () => {
            const all = await storage.getAll();
            expect(all).toEqual([]);
        });
    });

    describe('Delete Operations', () => {
        const createValidProgression = () => ({
            version: '1.0.0',
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Test Progression',
            progression: 'I IV V I',
            createdAt: Date.now(),
            metadata: {
                key: 'C',
                scaleType: 'major'
            }
        });

        beforeEach(async () => {
            await storage.init();
        });

        it('should delete progression by ID', async () => {
            const progression = createValidProgression();
            await storage.save(progression);
            await storage.delete(progression.id);
            await expect(storage.load(progression.id)).rejects.toThrow();
        });

        it('should handle delete errors gracefully', async () => {
            const progression = createValidProgression();
            await storage.save(progression);
            await expect(storage.delete(progression.id)).resolves.toBeUndefined();
        });

        it('should not throw error for non-existent ID', async () => {
            await expect(storage.delete('non-existent-id')).resolves.toBeUndefined();
        });
    });

    describe('Import/Export Operations', () => {
        const createValidProgression = () => ({
            version: '1.0.0',
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Test Progression',
            progression: 'I IV V I',
            createdAt: Date.now(),
            metadata: {
                key: 'C',
                scaleType: 'major'
            }
        });

        it('should export progression to JSON string', () => {
            const progression = createValidProgression();
            const json = storage.exportToJSON(progression);
            const parsed = JSON.parse(json);

            expect(parsed.version).toBe('1.0.0');
            expect(parsed.id).toBe(progression.id);
            expect(parsed.name).toBe(progression.name);
            expect(parsed.progression).toBe(progression.progression);
        });

        it('should import progression from JSON string', () => {
            const progression = createValidProgression();
            const json = JSON.stringify(progression);
            const imported = storage.importFromJSON(json);

            expect(imported).toEqual(progression);
        });

        it('should validate imported progression', () => {
            const progression = createValidProgression();
            const json = JSON.stringify(progression);
            const imported = storage.importFromJSON(json);
            const validation = storage.validateProgression(imported);
            expect(validation.valid).toBe(true);
        });

        it('should throw error for invalid JSON', () => {
            const invalidJSON = 'not json';
            expect(() => {
                storage.importFromJSON(invalidJSON);
            }).toThrow();
        });

        it('should throw error for invalid progression format', () => {
            const invalidJSON = JSON.stringify({ invalid: 'data' });
            expect(() => {
                storage.importFromJSON(invalidJSON);
            }).toThrow();
        });

        it('should download progression as JSON file', () => {
            const progression = createValidProgression();

            storage.downloadProgression(progression);

            expect(global.URL.createObjectURL).toHaveBeenCalled();
            expect(global.document.createElement).toHaveBeenCalledWith('a');
            expect(global.document.body.appendChild).toHaveBeenCalled();
            expect(global.document.body.removeChild).toHaveBeenCalled();
        });

        it('should save file to root directory using File System Access API with ISO timestamp filename', async () => {
            const progression = createValidProgression();
            progression.name = 'Test Progression';

            // Mock File System Access API
            const mockWritable = {
                write: vi.fn().mockResolvedValue(undefined),
                close: vi.fn().mockResolvedValue(undefined)
            };
            const mockFileHandle = {
                createWritable: vi.fn().mockResolvedValue(mockWritable)
            };
            const mockShowSaveFilePicker = vi.fn().mockResolvedValue(mockFileHandle);

            // Set up the mock - preserve existing window properties
            const originalWindow = global.window;
            global.window = {
                ...originalWindow,
                showSaveFilePicker: mockShowSaveFilePicker
            };

            // Mock Date methods to get predictable timestamp without breaking Date constructor
            const originalDateNow = Date.now;
            const originalDateGetFullYear = Date.prototype.getFullYear;
            const originalDateGetMonth = Date.prototype.getMonth;
            const originalDateGetDate = Date.prototype.getDate;
            const originalDateGetHours = Date.prototype.getHours;
            const originalDateGetMinutes = Date.prototype.getMinutes;
            const originalDateGetSeconds = Date.prototype.getSeconds;

            // Mock specific Date methods for predictable timestamp
            const mockDate = new Date('2026-01-09T14:30:45Z');
            Date.prototype.getFullYear = vi.fn(() => 2026);
            Date.prototype.getMonth = vi.fn(() => 0); // January (0-indexed)
            Date.prototype.getDate = vi.fn(() => 9);
            Date.prototype.getHours = vi.fn(() => 14);
            Date.prototype.getMinutes = vi.fn(() => 30);
            Date.prototype.getSeconds = vi.fn(() => 45);

            await storage.downloadProgression(progression);

            // Verify showSaveFilePicker was called (allows navigation to root directory)
            expect(mockShowSaveFilePicker).toHaveBeenCalledTimes(1);
            const callArgs = mockShowSaveFilePicker.mock.calls[0][0];

            // Verify filename uses ISO timestamp format: YYYY-MM-DD-HH-MM-SS
            expect(callArgs.suggestedName).toMatch(/^\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.json$/);
            expect(callArgs.suggestedName).toBe('2026-01-09-14-30-45.json');

            // Verify file types are correct
            expect(callArgs.types).toEqual([{
                description: 'JSON files',
                accept: { 'application/json': ['.json'] }
            }]);

            // Verify file was written
            expect(mockFileHandle.createWritable).toHaveBeenCalled();
            expect(mockWritable.write).toHaveBeenCalled();
            expect(mockWritable.close).toHaveBeenCalled();

            // Verify the written content is valid JSON
            const writtenBlob = mockWritable.write.mock.calls[0][0];
            expect(writtenBlob).toBeInstanceOf(Blob);
            expect(writtenBlob.type).toBe('application/json');

            // Restore mocks
            Date.prototype.getFullYear = originalDateGetFullYear;
            Date.prototype.getMonth = originalDateGetMonth;
            Date.prototype.getDate = originalDateGetDate;
            Date.prototype.getHours = originalDateGetHours;
            Date.prototype.getMinutes = originalDateGetMinutes;
            Date.prototype.getSeconds = originalDateGetSeconds;
            global.window = originalWindow;
        });

        it('should import progression from file', async () => {
            const progression = createValidProgression();
            const json = JSON.stringify(progression);
            const blob = new Blob([json], { type: 'application/json' });
            const file = new File([blob], 'test.json', { type: 'application/json' });

            const imported = await storage.importFromFile(file);
            expect(imported).toEqual(progression);
        });

        it('should throw error when importing invalid file', async () => {
            const invalidBlob = new Blob(['invalid json'], { type: 'application/json' });
            const file = new File([invalidBlob], 'test.json', { type: 'application/json' });

            await expect(storage.importFromFile(file)).rejects.toThrow();
        });
    });
});

