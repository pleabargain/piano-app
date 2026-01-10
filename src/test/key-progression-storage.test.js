import { describe, it, expect, beforeEach, vi } from 'vitest';
import KeyProgressionStorage from '../core/key-progression-storage';

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
                                continue: function() {
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

    const stores = new Map();
    const transaction = {
        objectStore: (name) => {
            const os = stores.get(name);
            if (!os) throw new Error(`Object store not found: ${name}`);
            return os;
        }
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
        transaction: () => transaction
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

describe('KeyProgressionStorage', () => {
    let storage;
    let originalIndexedDB;
    let originalURL;

    beforeEach(() => {
        originalIndexedDB = global.indexedDB;
        global.indexedDB = mockIndexedDB();
        
        originalURL = global.URL;
        global.URL = {
            ...originalURL,
            createObjectURL: vi.fn(() => 'blob:mock-url'),
            revokeObjectURL: vi.fn()
        };
        
        global.document.createElement = vi.fn(() => ({
            href: '',
            download: '',
            click: vi.fn()
        }));
        global.document.body.appendChild = vi.fn();
        global.document.body.removeChild = vi.fn();
        
        storage = new KeyProgressionStorage();
    });

    afterEach(() => {
        global.indexedDB = originalIndexedDB;
        global.URL = originalURL;
    });

    describe('downloadProgression', () => {
        const createValidProgression = () => ({
            id: 'test-id',
            name: 'Test Progression',
            progression: 'C F G',
            createdAt: Date.now(),
            metadata: { scaleType: 'major' }
        });

        it('should throw error when exporting invalid progression (missing name)', async () => {
            await storage.init();
            
            const invalidProgression = {
                id: 'test-id',
                // Missing 'name' field
                progression: 'C F G',
                createdAt: Date.now()
            };

            await expect(storage.downloadProgression(invalidProgression)).rejects.toThrow(/Missing name field/);
        });

        it('should throw error when exporting invalid progression (missing progression)', async () => {
            await storage.init();
            
            const invalidProgression = {
                id: 'test-id',
                name: 'Test',
                // Missing 'progression' field
                createdAt: Date.now()
            };

            await expect(storage.downloadProgression(invalidProgression)).rejects.toThrow(/Missing or invalid progression field/);
        });

        it('should use File System Access API when available and handle write failures', async () => {
            await storage.init();
            
            const progression = createValidProgression();
            
            // Mock File System Access API with write failure
            const mockWritable = {
                write: vi.fn().mockRejectedValue(new Error('Write failed')),
                close: vi.fn().mockResolvedValue(undefined)
            };
            const mockFileHandle = {
                createWritable: vi.fn().mockResolvedValue(mockWritable)
            };
            const mockShowSaveFilePicker = vi.fn().mockResolvedValue(mockFileHandle);
            
            const originalWindow = global.window;
            global.window = { 
                ...originalWindow, 
                showSaveFilePicker: mockShowSaveFilePicker 
            };

            // Should fall back to download when write fails
            await expect(storage.downloadProgression(progression)).resolves.not.toThrow();
            
            // Verify fallback was used
            expect(global.URL.createObjectURL).toHaveBeenCalled();
            
            global.window = originalWindow;
        });

        it('should handle File System Access API permission denial gracefully', async () => {
            await storage.init();
            
            const progression = createValidProgression();
            
            // Mock permission denial (SecurityError)
            const mockShowSaveFilePicker = vi.fn().mockRejectedValue(
                new DOMException('Permission denied', 'SecurityError')
            );
            
            const originalWindow = global.window;
            global.window = { 
                ...originalWindow, 
                showSaveFilePicker: mockShowSaveFilePicker 
            };

            // Should fall back to download
            await expect(storage.downloadProgression(progression)).resolves.not.toThrow();
            
            // Verify fallback was used
            expect(global.URL.createObjectURL).toHaveBeenCalled();
            
            global.window = originalWindow;
        });

        it('should handle fallback download failure and throw meaningful error', async () => {
            await storage.init();
            
            const progression = createValidProgression();
            
            // Mock File System Access API not available
            const originalWindow = global.window;
            global.window = { 
                ...originalWindow, 
                showSaveFilePicker: undefined 
            };

            // Mock URL.createObjectURL to fail
            global.URL.createObjectURL = vi.fn(() => {
                throw new Error('createObjectURL failed');
            });

            await expect(storage.downloadProgression(progression)).rejects.toThrow(/Failed to save file/);
            
            global.window = originalWindow;
        });

        it('should generate ISO timestamp filename correctly', async () => {
            await storage.init();
            
            const progression = createValidProgression();
            
            // Mock Date methods for predictable timestamp
            const originalGetFullYear = Date.prototype.getFullYear;
            const originalGetMonth = Date.prototype.getMonth;
            const originalGetDate = Date.prototype.getDate;
            const originalGetHours = Date.prototype.getHours;
            const originalGetMinutes = Date.prototype.getMinutes;
            const originalGetSeconds = Date.prototype.getSeconds;

            Date.prototype.getFullYear = vi.fn(() => 2026);
            Date.prototype.getMonth = vi.fn(() => 0);
            Date.prototype.getDate = vi.fn(() => 9);
            Date.prototype.getHours = vi.fn(() => 14);
            Date.prototype.getMinutes = vi.fn(() => 30);
            Date.prototype.getSeconds = vi.fn(() => 45);

            // Mock File System Access API
            const mockWritable = {
                write: vi.fn().mockResolvedValue(undefined),
                close: vi.fn().mockResolvedValue(undefined)
            };
            const mockFileHandle = {
                createWritable: vi.fn().mockResolvedValue(mockWritable)
            };
            const mockShowSaveFilePicker = vi.fn().mockResolvedValue(mockFileHandle);
            
            const originalWindow = global.window;
            global.window = { 
                ...originalWindow, 
                showSaveFilePicker: mockShowSaveFilePicker 
            };

            await storage.downloadProgression(progression);

            // Verify filename format
            expect(mockShowSaveFilePicker).toHaveBeenCalled();
            const callArgs = mockShowSaveFilePicker.mock.calls[0][0];
            expect(callArgs.suggestedName).toBe('2026-01-09-14-30-45.json');
            expect(callArgs.suggestedName).toMatch(/^\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.json$/);

            // Restore
            Date.prototype.getFullYear = originalGetFullYear;
            Date.prototype.getMonth = originalGetMonth;
            Date.prototype.getDate = originalGetDate;
            Date.prototype.getHours = originalGetHours;
            Date.prototype.getMinutes = originalGetMinutes;
            Date.prototype.getSeconds = originalGetSeconds;
            global.window = originalWindow;
        });
    });
});
