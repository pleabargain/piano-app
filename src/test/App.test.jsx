import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App.jsx'

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
    render(<App />)
    expect(screen.getByText('Piano Trainer')).toBeInTheDocument()
  })

  it('should display the status message', () => {
    render(<App />)
    // The initial status message should be visible
    expect(screen.getByText(/Connect MIDI keyboard to start|Web MIDI API not supported/i)).toBeInTheDocument()
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

