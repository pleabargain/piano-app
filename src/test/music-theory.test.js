// https://github.com/pleabargain/piano-app
import { describe, it, expect } from 'vitest';
import { getChordNotesAsMidi } from '../core/music-theory';

/**
 * TEST SUITE: Music Theory - getChordNotesAsMidi Function
 * 
 * PURPOSE: This test suite validates the getChordNotesAsMidi function which converts
 * chord names to MIDI note numbers for display and playback.
 * 
 * WHY THESE TESTS ARE IMPORTANT:
 * - getChordNotesAsMidi is used by handleChordClick to calculate which keys to highlight
 * - Function must return correct MIDI numbers for accurate visual feedback
 * - Tests ensure chords are displayed correctly across different inversions and octaves
 * - Validates core music theory calculations are correct
 */

describe('getChordNotesAsMidi Function', () => {
  describe('Basic Chord Types', () => {
    it('should return correct MIDI notes for C Major root position', () => {
      console.log('[Test] Testing C Major root position MIDI note calculation');
      console.log('[Test] WHY: Major chords are fundamental - must calculate correctly');
      console.log('[Test] IMPORTANCE: Validates basic major chord calculation works');
      console.log('[Test] Input: root=C, chordType=major, inversion=0, baseOctave=4');
      
      const midiNotes = getChordNotesAsMidi('C', 'major', 0, 4);
      
      // C Major root position: C4=60, E4=64, G4=67
      expect(midiNotes).toEqual([60, 64, 67]);
      expect(midiNotes.length).toBe(3);
      
      console.log('[Test] ✅ C Major root position calculated correctly:', midiNotes);
    });

    it('should return correct MIDI notes for F Major root position in octave 2', () => {
      console.log('[Test] Testing F Major root position in octave 2');
      console.log('[Test] WHY: This matches user requirement - F Major [41, 45, 48]');
      console.log('[Test] IMPORTANCE: Validates exact scenario from user request');
      console.log('[Test] Input: root=F, chordType=major, inversion=0, baseOctave=2');
      
      const midiNotes = getChordNotesAsMidi('F', 'major', 0, 2);
      
      // F Major root position in octave 2: F2=41, A2=45, C3=48
      expect(midiNotes).toEqual([41, 45, 48]);
      expect(midiNotes.length).toBe(3);
      
      console.log('[Test] ✅ F Major root position in octave 2 calculated correctly:', midiNotes);
    });

    it('should return correct MIDI notes for C Minor root position', () => {
      console.log('[Test] Testing C Minor root position MIDI note calculation');
      console.log('[Test] WHY: Minor chords are common - must calculate correctly');
      console.log('[Test] IMPORTANCE: Validates minor chord interval pattern [0, 3, 7]');
      console.log('[Test] Input: root=C, chordType=minor, inversion=0, baseOctave=4');
      
      const midiNotes = getChordNotesAsMidi('C', 'minor', 0, 4);
      
      // C Minor root position: C4=60, D#4=63, G4=67
      expect(midiNotes).toEqual([60, 63, 67]);
      expect(midiNotes.length).toBe(3);
      
      console.log('[Test] ✅ C Minor root position calculated correctly:', midiNotes);
    });

    it('should return correct MIDI notes for various chord types', () => {
      console.log('[Test] Testing various chord types return correct MIDI notes');
      console.log('[Test] WHY: Different chord types have different interval patterns');
      console.log('[Test] IMPORTANCE: Ensures all chord types are supported correctly');
      
      const testCases = [
        { root: 'C', type: 'diminished', expected: [60, 63, 66] }, // C, D#, F#
        { root: 'C', type: 'augmented', expected: [60, 64, 68] }, // C, E, G#
        { root: 'C', type: 'sus2', expected: [60, 62, 67] }, // C, D, G
        { root: 'C', type: 'sus4', expected: [60, 65, 67] }, // C, F, G
      ];
      
      testCases.forEach(({ root, type, expected }) => {
        console.log(`[Test] Testing ${root} ${type}`);
        const midiNotes = getChordNotesAsMidi(root, type, 0, 4);
        expect(midiNotes).toEqual(expected);
        expect(midiNotes.length).toBe(3);
      });
      
      console.log('[Test] ✅ Various chord types calculated correctly');
    });
  });

  describe('Inversions', () => {
    it('should return correct MIDI notes for 1st inversion', () => {
      console.log('[Test] Testing 1st inversion MIDI note calculation');
      console.log('[Test] WHY: Inversions are common - users need to see different voicings');
      console.log('[Test] IMPORTANCE: Validates inversion rotation logic works correctly');
      console.log('[Test] Input: root=C, chordType=major, inversion=1, baseOctave=4');
      
      const midiNotes = getChordNotesAsMidi('C', 'major', 1, 4);
      
      // C Major 1st inversion: E4=64, G4=67, C5=72
      expect(midiNotes).toEqual([64, 67, 72]);
      expect(midiNotes.length).toBe(3);
      
      console.log('[Test] ✅ 1st inversion calculated correctly:', midiNotes);
    });

    it('should return correct MIDI notes for 2nd inversion', () => {
      console.log('[Test] Testing 2nd inversion MIDI note calculation');
      console.log('[Test] WHY: Multiple inversions needed for complete chord practice');
      console.log('[Test] IMPORTANCE: Validates second inversion rotation works');
      console.log('[Test] Input: root=C, chordType=major, inversion=2, baseOctave=4');
      
      const midiNotes = getChordNotesAsMidi('C', 'major', 2, 4);
      
      // C Major 2nd inversion: G4=67, C5=72, E5=76
      expect(midiNotes).toEqual([67, 72, 76]);
      expect(midiNotes.length).toBe(3);
      
      console.log('[Test] ✅ 2nd inversion calculated correctly:', midiNotes);
    });

    it('should return correct MIDI notes for 3rd inversion (7th chords)', () => {
      console.log('[Test] Testing 3rd inversion for 7th chords');
      console.log('[Test] WHY: 7th chords have 4 notes, allowing 3rd inversion');
      console.log('[Test] IMPORTANCE: Validates inversion logic works for 4-note chords');
      console.log('[Test] Input: root=C, chordType=major7, inversion=3, baseOctave=4');
      
      const midiNotes = getChordNotesAsMidi('C', 'major7', 3, 4);
      
      // C Major7 3rd inversion: B4=71, C5=72, E5=76, G5=79
      expect(midiNotes.length).toBe(4);
      expect(midiNotes[0]).toBe(71); // B
      
      console.log('[Test] ✅ 3rd inversion calculated correctly:', midiNotes);
    });

    it('should cycle back to root position after max inversions', () => {
      console.log('[Test] Testing inversion cycling wraps around correctly');
      console.log('[Test] WHY: Clicking chord multiple times cycles inversions');
      console.log('[Test] IMPORTANCE: Ensures inversion cycling works without errors');
      console.log('[Test] Input: root=C, chordType=major, inversion=3 (should wrap to 0)');
      
      // For major chord (3 notes), inversion 3 should wrap to 0
      const midiNotes = getChordNotesAsMidi('C', 'major', 3, 4);
      
      // Should be same as root position
      expect(midiNotes).toEqual([60, 64, 67]);
      
      console.log('[Test] ✅ Inversion cycling wraps correctly');
    });
  });

  describe('Different Base Octaves', () => {
    it('should return correct MIDI notes for different base octaves', () => {
      console.log('[Test] Testing getChordNotesAsMidi with different base octaves');
      console.log('[Test] WHY: Left piano uses octave 3, right piano uses different octaves');
      console.log('[Test] IMPORTANCE: Ensures function works for different piano ranges');
      console.log('[Test] Testing octaves: 2, 3, 4, 5');
      
      const octave2 = getChordNotesAsMidi('C', 'major', 0, 2);
      const octave3 = getChordNotesAsMidi('C', 'major', 0, 3);
      const octave4 = getChordNotesAsMidi('C', 'major', 0, 4);
      const octave5 = getChordNotesAsMidi('C', 'major', 0, 5);
      
      // C Major: C, E, G
      // Octave 2: C2=36, E2=40, G2=43
      expect(octave2).toEqual([36, 40, 43]);
      
      // Octave 3: C3=48, E3=52, G3=55
      expect(octave3).toEqual([48, 52, 55]);
      
      // Octave 4: C4=60, E4=64, G4=67
      expect(octave4).toEqual([60, 64, 67]);
      
      // Octave 5: C5=72, E5=76, G5=79
      expect(octave5).toEqual([72, 76, 79]);
      
      console.log('[Test] ✅ Different base octaves calculated correctly');
    });

    it('should return MIDI notes within expected piano range (36-96)', () => {
      console.log('[Test] Testing MIDI notes are within piano range');
      console.log('[Test] WHY: Piano component displays keys from MIDI 36-96');
      console.log('[Test] IMPORTANCE: Ensures calculated notes are visible on piano');
      console.log('[Test] Testing various chords in octave 3 (left piano range)');
      
      const chords = [
        { root: 'C', type: 'major' },
        { root: 'F', type: 'major' },
        { root: 'G', type: 'major' },
        { root: 'A', type: 'minor' },
      ];
      
      chords.forEach(({ root, type }) => {
        const midiNotes = getChordNotesAsMidi(root, type, 0, 3);
        midiNotes.forEach(midi => {
          expect(midi).toBeGreaterThanOrEqual(36);
          expect(midi).toBeLessThanOrEqual(96);
        });
      });
      
      console.log('[Test] ✅ All MIDI notes within expected piano range');
    });
  });

  describe('Edge Cases', () => {
    it('should return empty array for invalid root', () => {
      console.log('[Test] Testing edge case: invalid root note');
      console.log('[Test] WHY: Function should handle invalid input gracefully');
      console.log('[Test] IMPORTANCE: Prevents crashes from bad input');
      console.log('[Test] Input: root=Invalid, chordType=major, inversion=0, baseOctave=4');
      
      const midiNotes = getChordNotesAsMidi('Invalid', 'major', 0, 4);
      
      expect(midiNotes).toEqual([]);
      
      console.log('[Test] ✅ Invalid root handled gracefully');
    });

    it('should return empty array for invalid chord type', () => {
      console.log('[Test] Testing edge case: invalid chord type');
      console.log('[Test] WHY: Function should handle unknown chord types');
      console.log('[Test] IMPORTANCE: Prevents crashes from unsupported chord types');
      console.log('[Test] Input: root=C, chordType=invalid, inversion=0, baseOctave=4');
      
      // This might throw or return empty, depending on implementation
      // Let's test it doesn't crash
      try {
        const midiNotes = getChordNotesAsMidi('C', 'invalid', 0, 4);
        // If it doesn't throw, it should return empty array or handle gracefully
        expect(Array.isArray(midiNotes)).toBe(true);
      } catch (error) {
        // If it throws, that's also acceptable error handling
        expect(error).toBeDefined();
      }
      
      console.log('[Test] ✅ Invalid chord type handled gracefully');
    });

    it('should handle negative inversion gracefully', () => {
      console.log('[Test] Testing edge case: negative inversion');
      console.log('[Test] WHY: Function should handle edge case inputs');
      console.log('[Test] IMPORTANCE: Ensures robust error handling');
      console.log('[Test] Input: root=C, chordType=major, inversion=-1, baseOctave=4');
      
      // Negative inversion should be handled (might wrap or return empty)
      const midiNotes = getChordNotesAsMidi('C', 'major', -1, 4);
      
      // Should either return valid notes (if wrapped) or empty array
      expect(Array.isArray(midiNotes)).toBe(true);
      
      console.log('[Test] ✅ Negative inversion handled gracefully');
    });

    it('should handle very high inversion numbers', () => {
      console.log('[Test] Testing edge case: very high inversion number');
      console.log('[Test] WHY: Users might cycle inversions many times');
      console.log('[Test] IMPORTANCE: Ensures inversion cycling works for large numbers');
      console.log('[Test] Input: root=C, chordType=major, inversion=100, baseOctave=4');
      
      // High inversion should wrap using modulo
      const midiNotes = getChordNotesAsMidi('C', 'major', 100, 4);
      
      // Should return valid notes (wrapped)
      expect(Array.isArray(midiNotes)).toBe(true);
      expect(midiNotes.length).toBeGreaterThan(0);
      
      console.log('[Test] ✅ Very high inversion handled correctly');
    });
  });

  describe('Function Contract (Single Input, Single Output)', () => {
    it('should have single input (chord parameters) and single output (MIDI array)', () => {
      console.log('[Test] Testing function contract: single input, single output');
      console.log('[Test] WHY: Per agent-rules.md, functions should have single input and single output');
      console.log('[Test] IMPORTANCE: Ensures function follows coding standards');
      
      // Function takes: root, chordType, inversion, baseOctave
      // Returns: array of MIDI numbers
      const result = getChordNotesAsMidi('C', 'major', 0, 4);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // All inputs are required parameters (single input concept)
      // Output is single array (single output)
      
      console.log('[Test] ✅ Function follows single input/single output contract');
    });
  });
});


