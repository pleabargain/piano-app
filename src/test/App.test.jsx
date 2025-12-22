// https://github.com/pleabargain/piano-app
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  describe('Chord Click Functionality', () => {
    it('should set chordMidiNotes when handleChordClick is called with chord name', async () => {
      console.log('[Test] Testing handleChordClick sets chordMidiNotes state');
      console.log('[Test] WHY: handleChordClick must update state to trigger piano highlighting');
      console.log('[Test] IMPORTANCE: Validates core functionality - clicking chord updates state');
      console.log('[Test] Chord Name: F Major (should produce MIDI notes [41, 45, 48])');
      
      const { container } = render(<App />);
      
      // Find and click F Major chord in Circle of Fifths
      const fMajorSegment = container.querySelector('path[data-key="major-F"]');
      expect(fMajorSegment).toBeTruthy();
      
      await userEvent.click(fMajorSegment);
      
      // Wait for state update and check that chord notes are highlighted on left piano
      await waitFor(() => {
        const leftPiano = container.querySelector('.left-piano .piano-container');
        expect(leftPiano).toBeTruthy();
        
        const keys = leftPiano.querySelectorAll('.key');
        const chordNoteKeys = Array.from(keys).filter(key => {
          const midiNumber = parseInt(key.getAttribute('data-midi') || '0');
          return [41, 45, 48].includes(midiNumber) && key.classList.contains('chord-note');
        });
        
        expect(chordNoteKeys.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
      
      console.log('[Test] ✅ handleChordClick correctly sets chordMidiNotes state');
    });

    it('should calculate correct MIDI notes for root position chord', async () => {
      console.log('[Test] Testing handleChordClick calculates correct MIDI notes for root position');
      console.log('[Test] WHY: Root position is the default - must calculate correct notes');
      console.log('[Test] IMPORTANCE: Ensures users see correct keys to press for root position');
      console.log('[Test] Chord: F Major root position should be [41, 45, 48] (F2, A2, C3)');
      
      const { container } = render(<App />);
      
      // Click F Major chord
      const fMajorSegment = container.querySelector('path[data-key="major-F"]');
      await userEvent.click(fMajorSegment);
      
      await waitFor(() => {
        const leftPiano = container.querySelector('.left-piano .piano-container');
        const keys = leftPiano.querySelectorAll('.key');
        
        // Check for F Major root position: F2=41, A2=45, C3=48
        const fKey = Array.from(keys).find(key => parseInt(key.getAttribute('data-midi') || '0') === 41);
        const aKey = Array.from(keys).find(key => parseInt(key.getAttribute('data-midi') || '0') === 45);
        const cKey = Array.from(keys).find(key => parseInt(key.getAttribute('data-midi') || '0') === 48);
        
        expect(fKey).toBeTruthy();
        expect(aKey).toBeTruthy();
        expect(cKey).toBeTruthy();
        expect(fKey.classList.contains('chord-note')).toBe(true);
        expect(aKey.classList.contains('chord-note')).toBe(true);
        expect(cKey.classList.contains('chord-note')).toBe(true);
      }, { timeout: 3000 });
      
      console.log('[Test] ✅ Root position MIDI notes calculated correctly');
    });

    it('should cycle through inversions when same chord is clicked multiple times', async () => {
      console.log('[Test] Testing chord inversion cycling');
      console.log('[Test] WHY: Users need to see different inversions - cycling is key feature');
      console.log('[Test] IMPORTANCE: Validates inversion cycling works correctly');
      console.log('[Test] Chord: F Major - clicking twice should show 1st inversion');
      
      const { container } = render(<App />);
      
      // Click F Major chord first time (root position)
      const fMajorSegment = container.querySelector('path[data-key="major-F"]');
      await userEvent.click(fMajorSegment);
      
      await waitFor(() => {
        const leftPiano = container.querySelector('.left-piano .piano-container');
        const keys = leftPiano.querySelectorAll('.key');
        const rootPositionKeys = Array.from(keys).filter(key => {
          const midi = parseInt(key.getAttribute('data-midi') || '0');
          return [41, 45, 48].includes(midi) && key.classList.contains('chord-note');
        });
        expect(rootPositionKeys.length).toBe(3);
      }, { timeout: 3000 });
      
      // Click same chord again (should cycle to 1st inversion)
      await userEvent.click(fMajorSegment);
      
      await waitFor(() => {
        const leftPiano = container.querySelector('.left-piano .piano-container');
        const keys = leftPiano.querySelectorAll('.key');
        // 1st inversion of F Major: A2=45, C3=48, F3=53
        const firstInversionKeys = Array.from(keys).filter(key => {
          const midi = parseInt(key.getAttribute('data-midi') || '0');
          return [45, 48, 53].includes(midi) && key.classList.contains('chord-note');
        });
        expect(firstInversionKeys.length).toBe(3);
      }, { timeout: 3000 });
      
      console.log('[Test] ✅ Chord inversion cycling works correctly');
    });

    it('should return chordMidiNotes from getChordHighlights when chordMidiNotes exist', async () => {
      console.log('[Test] Testing getChordHighlights returns chordMidiNotes when they exist');
      console.log('[Test] WHY: getChordHighlights is used to pass notes to piano - must return correct values');
      console.log('[Test] IMPORTANCE: Validates helper function works correctly');
      
      const { container } = render(<App />);
      
      // Click a chord to set chordMidiNotes
      const fMajorSegment = container.querySelector('path[data-key="major-F"]');
      await userEvent.click(fMajorSegment);
      
      await waitFor(() => {
        // Verify that left piano receives chord notes via getChordHighlights
        const leftPiano = container.querySelector('.left-piano .piano-container');
        const keys = leftPiano.querySelectorAll('.key');
        const chordNoteKeys = Array.from(keys).filter(key => key.classList.contains('chord-note'));
        expect(chordNoteKeys.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
      
      console.log('[Test] ✅ getChordHighlights correctly returns chordMidiNotes');
    });

    it('should return empty array from getChordHighlights when not in chord mode and no chord clicked', () => {
      console.log('[Test] Testing getChordHighlights returns empty array when no chord clicked');
      console.log('[Test] WHY: Helper function should return empty array when no chord is selected');
      console.log('[Test] IMPORTANCE: Ensures piano doesn\'t show incorrect highlighting');
      
      const { container } = render(<App />);
      
      // Switch to free mode (not chord mode)
      const freePlayButton = screen.getByText('Free Play');
      fireEvent.click(freePlayButton);
      
      // Check that left piano has no chord notes highlighted
      const leftPiano = container.querySelector('.left-piano .piano-container');
      const keys = leftPiano.querySelectorAll('.key');
      const chordNoteKeys = Array.from(keys).filter(key => key.classList.contains('chord-note'));
      
      expect(chordNoteKeys.length).toBe(0);
      
      console.log('[Test] ✅ getChordHighlights returns empty array when no chord clicked');
    });

    it('should highlight keys on left piano when chord is clicked in CircleOfFifths', async () => {
      console.log('[Test] Testing integration: clicking chord in CircleOfFifths highlights left piano');
      console.log('[Test] WHY: End-to-end test - validates full flow from click to visual feedback');
      console.log('[Test] IMPORTANCE: Ensures user interaction produces expected visual result');
      console.log('[Test] Flow: Click F Major in Circle -> handleChordClick -> chordMidiNotes -> getChordHighlights -> Piano highlights');
      
      const { container } = render(<App />);
      
      // Click F Major chord in Circle of Fifths
      const fMajorSegment = container.querySelector('path[data-key="major-F"]');
      expect(fMajorSegment).toBeTruthy();
      
      await userEvent.click(fMajorSegment);
      
      // Wait for state update and verify left piano highlights correct keys
      await waitFor(() => {
        const leftPiano = container.querySelector('.left-piano .piano-container');
        expect(leftPiano).toBeTruthy();
        
        const keys = leftPiano.querySelectorAll('.key');
        const highlightedKeys = Array.from(keys).filter(key => {
          const midi = parseInt(key.getAttribute('data-midi') || '0');
          return [41, 45, 48].includes(midi) && key.classList.contains('chord-note');
        });
        
        expect(highlightedKeys.length).toBe(3);
      }, { timeout: 3000 });
      
      console.log('[Test] ✅ Clicking chord in CircleOfFifths correctly highlights left piano keys');
    });
  });
})

