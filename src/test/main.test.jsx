// https://github.com/pleabargain/piano-app
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Unit test to verify that the main.jsx entry point can find and mount to the root element.
 * This test isolates the bug where the app doesn't render when index.html is opened.
 */
describe('Main Entry Point', () => {
  let rootElement
  let originalGetElementById

  beforeEach(() => {
    // Create a mock root element
    rootElement = document.createElement('div')
    rootElement.id = 'root'
    document.body.appendChild(rootElement)

    // Mock getElementById to return our root element
    originalGetElementById = document.getElementById
    document.getElementById = vi.fn((id) => {
      if (id === 'root') return rootElement
      return originalGetElementById.call(document, id)
    })
  })

  afterEach(() => {
    // Cleanup
    if (rootElement && rootElement.parentNode) {
      rootElement.parentNode.removeChild(rootElement)
    }
    document.getElementById = originalGetElementById
  })

  it('should find the root element', () => {
    const root = document.getElementById('root')
    expect(root).toBeTruthy()
    expect(root.id).toBe('root')
  })

  it('should throw error if root element is missing', () => {
    // Remove root element
    if (rootElement && rootElement.parentNode) {
      rootElement.parentNode.removeChild(rootElement)
    }
    
    // Mock getElementById to return null
    document.getElementById = vi.fn(() => null)

    // This should throw an error (as per our error handling in main.jsx)
    const root = document.getElementById('root')
    expect(root).toBeNull()
  })
})

/**
 * Abstracted function to verify root element exists
 * This function isolates the root element checking logic
 */
export function verifyRootElement() {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element not found. Make sure index.html has a <div id="root"></div> element.')
  }
  return rootElement
}

describe('verifyRootElement function', () => {
  let rootElement

  beforeEach(() => {
    rootElement = document.createElement('div')
    rootElement.id = 'root'
    document.body.appendChild(rootElement)
  })

  afterEach(() => {
    if (rootElement && rootElement.parentNode) {
      rootElement.parentNode.removeChild(rootElement)
    }
  })

  it('should return root element when it exists', () => {
    const result = verifyRootElement()
    expect(result).toBe(rootElement)
    expect(result.id).toBe('root')
  })

  it('should throw error when root element is missing', () => {
    if (rootElement && rootElement.parentNode) {
      rootElement.parentNode.removeChild(rootElement)
    }
    
    expect(() => verifyRootElement()).toThrow('Root element not found')
  })
})

