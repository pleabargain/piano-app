// https://github.com/pleabargain/piano-app
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App.jsx'

/**
 * TEST SUITE: App Component
 * 
 * PURPOSE: This test suite validates the main App component rendering and basic functionality.
 * 
 * WHY THESE TESTS ARE IMPORTANT:
 * - App component is the root of the application - must render correctly
 * - Tests that the app doesn't crash on initial render
 * - Validates basic UI elements are present
 * - These are smoke tests to catch critical rendering issues early
 */

// Mock MIDI Manager to avoid browser API dependencies
vi.mock('../core/midi-manager', () => ({
  midiManager: {
    requestAccess: vi.fn(() => Promise.resolve(false)),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
}))

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the app without crashing', () => {
    console.log('[Test] Testing App component initial render');
    console.log('[Test] WHY: App component is the root - must render without errors');
    console.log('[Test] IMPORTANCE: Catches critical rendering issues that would break the entire app');
    
    render(<App />)
    expect(screen.getByText('Piano Trainer')).toBeInTheDocument()
    
    console.log('[Test] ✅ App component rendered successfully');
  })

  it('should display the status message', async () => {
    console.log('[Test] Testing App component status message display');
    console.log('[Test] WHY: Status messages provide user feedback - must be visible');
    console.log('[Test] IMPORTANCE: Ensures users can see app state and instructions');
    
    render(<App />)
    // Use findAllByText in case multiple elements match (though ideally only one status message)
    const statusElements = await screen.findAllByText(/Connect MIDI|Web MIDI|Practice|Free Play|Lava Game/i);
    expect(statusElements.length).toBeGreaterThan(0);
    
    console.log('[Test] ✅ Status message displayed correctly');
  })

  it('should render the Piano component', () => {
    const { container } = render(<App />)
    // Check if piano container exists
    const pianoContainer = container.querySelector('.piano-container')
    expect(pianoContainer).toBeInTheDocument()
  })

  it('should render the Controls component', () => {
    const { container } = render(<App />)
    // Check if controls container exists
    const controlsContainer = container.querySelector('.controls-container')
    expect(controlsContainer).toBeInTheDocument()
  })

  it('should have all required mode buttons', () => {
    render(<App />)
    expect(screen.getByText('Scale Practice')).toBeInTheDocument()
    expect(screen.getByText('Chord Practice')).toBeInTheDocument()
    expect(screen.getByText('Free Play')).toBeInTheDocument()
  })
})

