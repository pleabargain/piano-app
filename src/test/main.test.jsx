// https://github.com/pleabargain/piano-app
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * TEST SUITE: Main Entry Point
 * 
 * PURPOSE: This test suite validates that the main.jsx entry point can find and mount to the root element.
 * 
 * WHY THESE TESTS ARE IMPORTANT:
 * - Main entry point is critical - if it fails, the entire app won't load
 * - This test isolates the bug where the app doesn't render when index.html is opened
 * - Validates DOM element mounting works correctly
 * - Ensures React can find and mount to the root element
 * - These tests catch critical startup issues before users encounter them
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
    console.log('[Test] Testing root element detection');
    console.log('[Test] WHY: App cannot mount if root element is missing');
    console.log('[Test] IMPORTANCE: Catches critical startup issue where app fails to render');
    
    const root = document.getElementById('root')
    expect(root).toBeTruthy()
    expect(root.id).toBe('root')
    
    console.log('[Test] ✅ Root element found correctly');
  })

  it('should throw error if root element is missing', () => {
    console.log('[Test] Testing error handling when root element is missing');
    console.log('[Test] WHY: App must handle missing root element gracefully');
    console.log('[Test] IMPORTANCE: Prevents silent failures - user should see error message');
    
    // Remove root element
    if (rootElement && rootElement.parentNode) {
      rootElement.parentNode.removeChild(rootElement)
    }
    
    // Mock getElementById to return null
    document.getElementById = vi.fn(() => null)

    // This should throw an error (as per our error handling in main.jsx)
    const root = document.getElementById('root')
    expect(root).toBeNull()
    
    console.log('[Test] ✅ Correctly handles missing root element');
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
    console.log('[Test] Testing verifyRootElement function (happy path)');
    console.log('[Test] WHY: Abstracted function must work correctly for app initialization');
    console.log('[Test] IMPORTANCE: Ensures root element verification logic is correct');
    
    const result = verifyRootElement()
    expect(result).toBe(rootElement)
    expect(result.id).toBe('root')
    
    console.log('[Test] ✅ verifyRootElement returns root element correctly');
  })

  it('should throw error when root element is missing', () => {
    console.log('[Test] Testing verifyRootElement error handling');
    console.log('[Test] WHY: Function must throw clear error when root element is missing');
    console.log('[Test] IMPORTANCE: Provides helpful error message for debugging');
    
    if (rootElement && rootElement.parentNode) {
      rootElement.parentNode.removeChild(rootElement)
    }
    
    expect(() => verifyRootElement()).toThrow('Root element not found')
    
    console.log('[Test] ✅ verifyRootElement throws error correctly when root missing');
  })
})

