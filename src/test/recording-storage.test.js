import { describe, it, expect, beforeEach, vi } from 'vitest';
import RecordingStorage from '../core/recording-storage';

// Mock IndexedDB
const mockIndexedDB = () => {
    const store = new Map();
    const indexes = {
        createdAt: new Map(),
        name: new Map()
    };

    const objectStore = {
        put: (value) => {
            return new Promise((resolve) => {
                store.set(value.id, value);
                indexes.createdAt.set(value.createdAt, value);
                indexes.name.set(value.name, value);
                resolve(value.id);
            });
        },
        get: (key) => {
            return new Promise((resolve) => {
                resolve(store.get(key) || undefined);
            });
        },
        delete: (key) => {
            return new Promise((resolve) => {
                const value = store.get(key);
                if (value) {
                    store.delete(key);
                    indexes.createdAt.delete(value.createdAt);
                    indexes.name.delete(value.name);
                }
                resolve();
            });
        },
        index: (name) => {
            return {
                openCursor: (direction) => {
                    const values = Array.from(indexes[name].values());
                    const sorted = direction === 'prev' 
                        ? values.sort((a, b) => b.createdAt - a.createdAt)
                        : values.sort((a, b) => a.createdAt - b.createdAt);
                    
                    let index = 0;
                    return {
                        onsuccess: null,
                        result: {
                            value: sorted[index],
                            continue: () => {
                                index++;
                                if (index < sorted.length) {
                                    this.result.value = sorted[index];
                                    if (this.onsuccess) this.onsuccess({ target: this });
                                } else {
                                    this.result = null;
                                    if (this.onsuccess) this.onsuccess({ target: this });
                                }
                            }
                        }
                    };
                }
            };
        }
    };

    const transaction = {
        objectStore: () => objectStore
    };

    const db = {
        objectStoreNames: {
            contains: () => false
        },
        createObjectStore: () => ({
            createIndex: () => {}
        }),
        transaction: () => transaction
    };

    return {
        open: (name, version) => {
            return new Promise((resolve) => {
                const request = {
                    result: db,
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
                    resolve(request);
                }, 0);
            });
        }
    };
};

describe('RecordingStorage', () => {
    let storage;
    let originalIndexedDB;

    beforeEach(() => {
        originalIndexedDB = global.indexedDB;
        global.indexedDB = mockIndexedDB();
        storage = new RecordingStorage();
    });

    afterEach(() => {
        global.indexedDB = originalIndexedDB;
    });

    describe('Initialization', () => {
        it('should initialize database', async () => {
            await storage.init();
            expect(storage.db).toBeDefined();
        });
    });

    describe('Recording Validation', () => {
        const createValidRecording = () => ({
            version: '1.0',
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Test Recording',
            createdAt: Date.now(),
            duration: 1000,
            events: [
                { type: 'noteOn', note: 60, velocity: 100, timestamp: 0, channel: 0 }
            ]
        });

        it('should validate valid recording', () => {
            const recording = createValidRecording();
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(true);
        });

        it('should reject recording without version', () => {
            const recording = createValidRecording();
            delete recording.version;
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('version');
        });

        it('should reject recording without id', () => {
            const recording = createValidRecording();
            delete recording.id;
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('id');
        });

        it('should reject recording with invalid UUID', () => {
            const recording = createValidRecording();
            recording.id = 'invalid-uuid';
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('UUID');
        });

        it('should reject recording without name', () => {
            const recording = createValidRecording();
            delete recording.name;
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('name');
        });

        it('should reject recording without createdAt', () => {
            const recording = createValidRecording();
            delete recording.createdAt;
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('createdAt');
        });

        it('should reject recording without duration', () => {
            const recording = createValidRecording();
            delete recording.duration;
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('duration');
        });

        it('should reject recording without events array', () => {
            const recording = createValidRecording();
            delete recording.events;
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('events');
        });

        it('should validate event types', () => {
            const recording = createValidRecording();
            recording.events[0].type = 'invalid';
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('type');
        });

        it('should validate note range', () => {
            const recording = createValidRecording();
            recording.events[0].note = 200; // Invalid
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('note');
        });

        it('should validate velocity range', () => {
            const recording = createValidRecording();
            recording.events[0].velocity = 200; // Invalid
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('velocity');
        });

        it('should validate timestamp', () => {
            const recording = createValidRecording();
            recording.events[0].timestamp = -1; // Invalid
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('timestamp');
        });

        it('should validate channel range', () => {
            const recording = createValidRecording();
            recording.events[0].channel = 20; // Invalid
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('channel');
        });
    });

    describe('IndexedDB Operations', () => {
        const createValidRecording = () => ({
            version: '1.0',
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Test Recording',
            createdAt: Date.now(),
            duration: 1000,
            events: []
        });

        beforeEach(async () => {
            await storage.init();
        });

        it('should save recording to IndexedDB', async () => {
            const recording = createValidRecording();
            const id = await storage.save(recording);
            expect(id).toBe(recording.id);
        });

        it('should throw error when saving invalid recording', async () => {
            const invalidRecording = { invalid: 'data' };
            await expect(storage.save(invalidRecording)).rejects.toThrow();
        });

        it('should load recording from IndexedDB', async () => {
            const recording = createValidRecording();
            await storage.save(recording);
            const loaded = await storage.load(recording.id);
            expect(loaded).toEqual(recording);
        });

        it('should throw error when loading non-existent recording', async () => {
            await expect(storage.load('non-existent')).rejects.toThrow();
        });

        it('should delete recording from IndexedDB', async () => {
            const recording = createValidRecording();
            await storage.save(recording);
            await storage.delete(recording.id);
            await expect(storage.load(recording.id)).rejects.toThrow();
        });

        it('should get all recordings', async () => {
            const recording1 = createValidRecording();
            recording1.id = 'id1';
            recording1.createdAt = Date.now() - 1000;
            
            const recording2 = createValidRecording();
            recording2.id = 'id2';
            recording2.createdAt = Date.now();
            
            await storage.save(recording1);
            await storage.save(recording2);
            
            const all = await storage.getAll('createdAt', 'desc');
            expect(all.length).toBe(2);
        });
    });

    describe('File Import/Export', () => {
        const createValidRecording = () => ({
            version: '1.0',
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Test Recording',
            createdAt: Date.now(),
            duration: 1000,
            events: [
                { type: 'noteOn', note: 60, velocity: 100, timestamp: 0, channel: 0 }
            ]
        });

        it('should export recording to JSON', () => {
            const recording = createValidRecording();
            const json = storage.exportToJSON(recording);
            const parsed = JSON.parse(json);
            
            expect(parsed.version).toBe('1.0');
            expect(parsed.id).toBe(recording.id);
            expect(parsed.name).toBe(recording.name);
            expect(parsed.events).toBeDefined();
        });

        it('should throw error when exporting invalid recording', () => {
            const invalidRecording = { invalid: 'data' };
            expect(() => {
                storage.exportToJSON(invalidRecording);
            }).toThrow();
        });

        it('should import recording from JSON', () => {
            const recording = createValidRecording();
            const json = JSON.stringify(recording);
            const imported = storage.importFromJSON(json);
            
            expect(imported).toEqual(recording);
        });

        it('should throw error when importing invalid JSON', () => {
            const invalidJSON = 'not json';
            expect(() => {
                storage.importFromJSON(invalidJSON);
            }).toThrow();
        });

        it('should throw error when importing invalid recording format', () => {
            const invalidJSON = JSON.stringify({ invalid: 'data' });
            expect(() => {
                storage.importFromJSON(invalidJSON);
            }).toThrow();
        });

        it('should download recording as file', () => {
            const recording = createValidRecording();
            const createElementSpy = vi.spyOn(document, 'createElement');
            const appendChildSpy = vi.spyOn(document.body, 'appendChild');
            const removeChildSpy = vi.spyOn(document.body, 'removeChild');
            
            storage.downloadRecording(recording);
            
            expect(createElementSpy).toHaveBeenCalledWith('a');
            expect(appendChildSpy).toHaveBeenCalled();
            expect(removeChildSpy).toHaveBeenCalled();
        });

        it('should import recording from file', async () => {
            const recording = createValidRecording();
            const json = JSON.stringify(recording);
            const blob = new Blob([json], { type: 'application/json' });
            const file = new File([blob], 'test.json', { type: 'application/json' });
            
            const imported = await storage.importFromFile(file);
            expect(imported).toEqual(recording);
        });

        it('should throw error when importing invalid file', async () => {
            const invalidBlob = new Blob(['invalid json'], { type: 'application/json' });
            const file = new File([invalidBlob], 'test.json', { type: 'application/json' });
            
            await expect(storage.importFromFile(file)).rejects.toThrow();
        });
    });
});

