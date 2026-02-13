import '@testing-library/jest-dom'

// Mock HTMLCanvasElement.getContext for VexFlow (measureText) - JSDOM doesn't implement canvas
const createMockContext = () => ({
  measureText: () => ({ width: 10 }),
  fillRect: () => {},
  clearRect: () => {},
  getImageData: () => ({ data: new Uint8ClampedArray(0) }),
  putImageData: () => {},
  createImageData: () => ({ data: new Uint8ClampedArray(0), width: 0, height: 0 }),
  setTransform: () => {},
  drawImage: () => {},
  save: () => {},
  restore: () => {},
  fill: () => {},
  stroke: () => {},
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  closePath: () => {},
  clip: () => {},
  translate: () => {},
  scale: () => {},
  rotate: () => {},
  arc: () => {},
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  font: '',
  textAlign: 'left',
  textBaseline: 'alphabetic',
  canvas: { width: 400, height: 120, style: {} }
})
HTMLCanvasElement.prototype.getContext = function (type) {
  if (type === '2d') return createMockContext()
  return null
}

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

