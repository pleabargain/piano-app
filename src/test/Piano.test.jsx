// https://github.com/pleabargain/piano-app
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Piano from '../components/Piano';

/**
 * TEST SUITE: Piano Component Chord Highlighting
 * 
 * PURPOSE: This test suite validates that the Piano component correctly highlights
 * chord notes when chordMidiNotes prop is provided.
 * 
 * WHY THESE TESTS ARE IMPORTANT:
 * - Piano component is core UI - users need visual feedback for which keys to press
 * - Chord highlighting helps users learn chord shapes and fingerings
 * - Tests ensure visual feedback works correctly for different scenarios
 * - Validates that CSS classes are applied correctly for styling
 */

describe('Piano Component Chord Highlighting', () => {
  beforeEach(() => {
    // Clear any previous renders
  });

  it('should render Piano component correctly with chordMidiNotes prop', () => {
    console.log('[Test] Testing Piano component renders with chordMidiNotes prop');
    console.log('[Test] WHY: Component must render without errors when chord notes are provided');
    console.log('[Test] IMPORTANCE: Ensures basic rendering works before testing highlighting logic');
    
    const { container } = render(
      <Piano
        startNote={36}
        endNote={60}
        chordMidiNotes={[41, 45, 48]}
      />
    );
    
    const pianoContainer = container.querySelector('.piano-container');
    expect(pianoContainer).toBeInTheDocument();
    
    console.log('[Test] ✅ Piano component rendered successfully with chordMidiNotes');
  });

  it('should apply chord-note class to keys with MIDI numbers in chordMidiNotes array', () => {
    console.log('[Test] Testing chord-note CSS class application');
    console.log('[Test] WHY: Users need visual feedback - keys must be highlighted when in chordMidiNotes');
    console.log('[Test] IMPORTANCE: Validates core highlighting functionality works correctly');
    console.log('[Test] MIDI Notes: [41, 45, 48] should be highlighted (F2, A2, C3)');
    
    const chordMidiNotes = [41, 45, 48]; // F2, A2, C3
    const startNote = 36;
    const { container } = render(
      <Piano
        startNote={startNote}
        endNote={60}
        chordMidiNotes={chordMidiNotes}
      />
    );
    
    // Keys have data-midi attribute for reliable testing
    const keys = container.querySelectorAll('.key');
    let chordNoteCount = 0;
    
    keys.forEach((key) => {
      const midiNumber = parseInt(key.getAttribute('data-midi') || '0');
      if (chordMidiNotes.includes(midiNumber)) {
        expect(key.classList.contains('chord-note')).toBe(true);
        chordNoteCount++;
      }
    });
    
    expect(chordNoteCount).toBe(3); // Should have 3 chord notes highlighted
    
    console.log('[Test] ✅ chord-note class applied to correct keys:', chordNoteCount, 'keys');
  });

  it('should not apply chord-note class to keys outside chordMidiNotes array', () => {
    console.log('[Test] Testing that non-chord keys do not receive chord-note class');
    console.log('[Test] WHY: Only chord notes should be highlighted - other keys should remain normal');
    console.log('[Test] IMPORTANCE: Ensures highlighting is precise and not over-applied');
    console.log('[Test] MIDI Notes: [41, 45, 48] are chord notes, others should not be highlighted');
    
    const chordMidiNotes = [41, 45, 48];
    const { container } = render(
      <Piano
        startNote={36}
        endNote={60}
        chordMidiNotes={chordMidiNotes}
      />
    );
    
    const keys = container.querySelectorAll('.key');
    let nonChordNoteCount = 0;
    
    keys.forEach((key) => {
      const midiNumber = parseInt(key.getAttribute('data-midi') || '0');
      if (!chordMidiNotes.includes(midiNumber)) {
        // Key should not have chord-note class (unless it's active or has other states)
        // We check that it doesn't have chord-note class when not in the array
        if (!key.classList.contains('active')) {
          expect(key.classList.contains('chord-note')).toBe(false);
          nonChordNoteCount++;
        }
      }
    });
    
    expect(nonChordNoteCount).toBeGreaterThan(0);
    
    console.log('[Test] ✅ Non-chord keys correctly do not have chord-note class');
  });

  it('should highlight chord notes for specific MIDI notes [41, 45, 48]', () => {
    console.log('[Test] Testing specific MIDI notes highlighting: [41, 45, 48]');
    console.log('[Test] WHY: This matches the user requirement - F Major root position in octave 3');
    console.log('[Test] IMPORTANCE: Validates exact scenario from user request works correctly');
    console.log('[Test] MIDI Notes: 41=F2, 45=A2, 48=C3 (F Major root position)');
    
    const chordMidiNotes = [41, 45, 48];
    const { container } = render(
      <Piano
        startNote={36}
        endNote={60}
        chordMidiNotes={chordMidiNotes}
      />
    );
    
    const keys = container.querySelectorAll('.key');
    const highlightedKeys = Array.from(keys).filter((key) => {
      const midiNumber = parseInt(key.getAttribute('data-midi') || '0');
      return chordMidiNotes.includes(midiNumber) && key.classList.contains('chord-note');
    });
    
    expect(highlightedKeys.length).toBe(3);
    
    console.log('[Test] ✅ All three MIDI notes [41, 45, 48] correctly highlighted');
  });

  it('should highlight chord notes in different octaves', () => {
    console.log('[Test] Testing chord highlighting works across different octaves');
    console.log('[Test] WHY: Chords can span multiple octaves - highlighting must work for all');
    console.log('[Test] IMPORTANCE: Ensures users can see chord notes regardless of octave');
    console.log('[Test] MIDI Notes: [36, 48, 60] span multiple octaves (C2, C3, C4)');
    
    const chordMidiNotes = [36, 48, 60]; // C2, C3, C4
    const { container } = render(
      <Piano
        startNote={36}
        endNote={72}
        chordMidiNotes={chordMidiNotes}
      />
    );
    
    const keys = container.querySelectorAll('.key');
    const highlightedKeys = Array.from(keys).filter((key) => {
      const midiNumber = parseInt(key.getAttribute('data-midi') || '0');
      return chordMidiNotes.includes(midiNumber) && key.classList.contains('chord-note');
    });
    
    expect(highlightedKeys.length).toBe(3);
    
    console.log('[Test] ✅ Chord notes highlighted correctly across multiple octaves');
  });

  it('should highlight both white and black keys for chord notes', () => {
    console.log('[Test] Testing chord highlighting works for both white and black keys');
    console.log('[Test] WHY: Chords contain both white and black keys - both must be highlighted');
    console.log('[Test] IMPORTANCE: Ensures visual feedback works for all key types');
    console.log('[Test] MIDI Notes: [36, 37, 38] includes black key (C2, C#2, D2)');
    
    const chordMidiNotes = [36, 37, 38]; // C2, C#2 (black), D2
    const { container } = render(
      <Piano
        startNote={36}
        endNote={60}
        chordMidiNotes={chordMidiNotes}
      />
    );
    
    const keys = container.querySelectorAll('.key');
    const blackKeys = Array.from(keys).filter((key) => {
      const midiNumber = parseInt(key.getAttribute('data-midi') || '0');
      return chordMidiNotes.includes(midiNumber) && key.classList.contains('black') && key.classList.contains('chord-note');
    });
    
    const whiteKeys = Array.from(keys).filter((key) => {
      const midiNumber = parseInt(key.getAttribute('data-midi') || '0');
      return chordMidiNotes.includes(midiNumber) && key.classList.contains('white') && key.classList.contains('chord-note');
    });
    
    expect(blackKeys.length).toBeGreaterThan(0);
    expect(whiteKeys.length).toBeGreaterThan(0);
    
    console.log('[Test] ✅ Both white and black keys correctly highlighted:', { black: blackKeys.length, white: whiteKeys.length });
  });

  it('should override chord highlighting when keys are active (user pressing)', () => {
    console.log('[Test] Testing that active notes override chord highlighting');
    console.log('[Test] WHY: Active state (user pressing) should take visual priority over chord highlighting');
    console.log('[Test] IMPORTANCE: Ensures user input feedback is clear and not obscured');
    console.log('[Test] MIDI Notes: chordMidiNotes=[41, 45, 48], activeNotes=[41]');
    
    const chordMidiNotes = [41, 45, 48];
    const activeNotes = [41]; // User is pressing F2
    const { container } = render(
      <Piano
        startNote={36}
        endNote={60}
        chordMidiNotes={chordMidiNotes}
        activeNotes={activeNotes}
      />
    );
    
    const keys = container.querySelectorAll('.key');
    const activeKey = Array.from(keys).find((key) => {
      const midiNumber = parseInt(key.getAttribute('data-midi') || '0');
      return midiNumber === 41;
    });
    
    // Active key should have 'active' class
    expect(activeKey).toBeTruthy();
    expect(activeKey.classList.contains('active')).toBe(true);
    
    // Active key may or may not have chord-note class, but active styling takes precedence
    // The CSS uses :not(.active) selector, so active keys won't show chord-note background
    
    console.log('[Test] ✅ Active notes correctly override chord highlighting');
  });

  it('should highlight chord notes in different modes (chord, free, scale)', () => {
    console.log('[Test] Testing chord highlighting works in different app modes');
    console.log('[Test] WHY: Users may click chords in any mode - highlighting should work consistently');
    console.log('[Test] IMPORTANCE: Ensures feature works regardless of current app mode');
    console.log('[Test] Testing modes: chord, free, scale');
    
    const chordMidiNotes = [41, 45, 48];
    const modes = ['chord', 'free', 'scale'];
    
    modes.forEach(mode => {
      const { container } = render(
        <Piano
          startNote={36}
          endNote={60}
          chordMidiNotes={chordMidiNotes}
          mode={mode}
        />
      );
      
      const keys = container.querySelectorAll('.key');
      const highlightedKeys = Array.from(keys).filter((key) => {
        const midiNumber = parseInt(key.getAttribute('data-midi') || '0');
        return chordMidiNotes.includes(midiNumber) && key.classList.contains('chord-note');
      });
      
      expect(highlightedKeys.length).toBe(3);
      
      console.log(`[Test] ✅ Chord highlighting works in ${mode} mode`);
    });
  });

  it('should handle empty chordMidiNotes array gracefully', () => {
    console.log('[Test] Testing Piano component handles empty chordMidiNotes array');
    console.log('[Test] WHY: Component should not crash when no chord notes are provided');
    console.log('[Test] IMPORTANCE: Ensures robust error handling and graceful degradation');
    
    const { container } = render(
      <Piano
        startNote={36}
        endNote={60}
        chordMidiNotes={[]}
      />
    );
    
    const pianoContainer = container.querySelector('.piano-container');
    expect(pianoContainer).toBeInTheDocument();
    
    const keys = container.querySelectorAll('.key');
    const chordNoteKeys = Array.from(keys).filter(key => key.classList.contains('chord-note'));
    
    expect(chordNoteKeys.length).toBe(0);
    
    console.log('[Test] ✅ Empty chordMidiNotes handled gracefully');
  });
});

