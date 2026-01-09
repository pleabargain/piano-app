import '@testing-library/jest-dom'

// Mock indexedDB for tests
global.indexedDB = {
    open: vi.fn().mockImplementation(() => {
        const request = {
            onsuccess: null,
            onerror: null,
            onupgradeneeded: null,
            result: {
                objectStoreNames: {
                    contains: () => true
                },
                createObjectStore: () => ({
                    createIndex: () => { }
                }),
                transaction: () => ({
                    objectStore: () => ({
                        index: () => ({
                            openCursor: () => ({ onsuccess: null })
                        }),
                        put: () => ({ onsuccess: null }),
                        get: () => ({ onsuccess: null }),
                        getAll: () => ({ onsuccess: null }),
                        delete: () => ({ onsuccess: null })
                    }),
                    oncomplete: null,
                    onerror: null
                })
            }
        };
        setTimeout(() => {
            if (request.onsuccess) request.onsuccess({ target: request });
        }, 0);
        return request;
    })
};

