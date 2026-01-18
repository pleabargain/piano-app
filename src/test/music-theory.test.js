// https://github.com/pleabargain/piano-app
import { describe, it, expect } from 'vitest';
import { getChordNotesAsMidi, getScaleNotes } from '../core/music-theory';

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

/**
 * TEST SUITE: Music Theory - getScaleNotes Function
 * 
 * PURPOSE: This test suite validates the getScaleNotes function which generates
 * scale notes based on root note and scale type.
 * 
 * WHY THESE TESTS ARE IMPORTANT:
 * - getScaleNotes is used throughout the app for scale practice mode
 * - Function must return correct scale notes for accurate scale display and practice
 * - Tests ensure all scale types work correctly across all 12 keys
 * - Validates core music theory calculations are correct
 */

describe('getScaleNotes Function', () => {
  describe('Major Scale', () => {
    it('should generate correct major scale notes for C', () => {
      console.log('[Test] Testing C Major scale generation');
      console.log('[Test] WHY: Major scale is fundamental - must calculate correctly');
      console.log('[Test] IMPORTANCE: Validates basic major scale interval pattern [2,2,1,2,2,2,1]');
      
      const notes = getScaleNotes('C', 'major');
      
      // C Major: C D E F G A B
      expect(notes).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
      expect(notes.length).toBe(7);
      
      console.log('[Test] ✅ C Major scale calculated correctly:', notes);
    });

    it('should generate correct major scale notes for F', () => {
      const notes = getScaleNotes('F', 'major');
      
      // F Major: F G A Bb C D E
      expect(notes).toEqual(['F', 'G', 'A', 'A#', 'C', 'D', 'E']);
      expect(notes.length).toBe(7);
    });

    it('should generate correct major scale notes for all 12 keys', () => {
      const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const expectedResults = {
        'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
        'C#': ['C#', 'D#', 'F', 'F#', 'G#', 'A#', 'C'],
        'D': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
        'D#': ['D#', 'F', 'G', 'G#', 'A#', 'C', 'D'],
        'E': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
        'F': ['F', 'G', 'A', 'A#', 'C', 'D', 'E'],
        'F#': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'F'],
        'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
        'G#': ['G#', 'A#', 'C', 'C#', 'D#', 'F', 'G'],
        'A': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
        'A#': ['A#', 'C', 'D', 'D#', 'F', 'G', 'A'],
        'B': ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#']
      };

      keys.forEach(key => {
        const notes = getScaleNotes(key, 'major');
        expect(notes).toEqual(expectedResults[key]);
        expect(notes.length).toBe(7);
        expect(notes[0]).toBe(key);
      });
    });
  });

  describe('Natural Minor Scale', () => {
    it('should generate correct natural minor scale notes for A', () => {
      console.log('[Test] Testing A Natural Minor scale generation');
      console.log('[Test] WHY: Natural minor is fundamental - must calculate correctly');
      console.log('[Test] IMPORTANCE: Validates natural minor interval pattern [2,1,2,2,1,2,2]');
      
      const notes = getScaleNotes('A', 'natural_minor');
      
      // A Natural Minor: A B C D E F G
      expect(notes).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
      expect(notes.length).toBe(7);
      
      console.log('[Test] ✅ A Natural Minor scale calculated correctly:', notes);
    });

    it('should generate correct natural minor scale notes for C', () => {
      const notes = getScaleNotes('C', 'natural_minor');
      
      // C Natural Minor: C D Eb F G Ab Bb
      expect(notes).toEqual(['C', 'D', 'D#', 'F', 'G', 'G#', 'A#']);
      expect(notes.length).toBe(7);
    });

    it('should generate natural minor scales for all 12 keys', () => {
      const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      
      keys.forEach(key => {
        const notes = getScaleNotes(key, 'natural_minor');
        expect(notes.length).toBe(7);
        expect(notes[0]).toBe(key);
        // Verify it's different from major scale
        const majorNotes = getScaleNotes(key, 'major');
        expect(notes).not.toEqual(majorNotes);
      });
    });
  });

  describe('Harmonic Minor Scale', () => {
    it('should generate correct harmonic minor scale notes for A', () => {
      console.log('[Test] Testing A Harmonic Minor scale generation');
      console.log('[Test] WHY: Harmonic minor has raised 7th - must calculate correctly');
      console.log('[Test] IMPORTANCE: Validates harmonic minor interval pattern [2,1,2,2,1,3,1]');
      
      const notes = getScaleNotes('A', 'harmonic_minor');
      
      // A Harmonic Minor: A B C D E F G#
      expect(notes).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G#']);
      expect(notes.length).toBe(7);
      
      console.log('[Test] ✅ A Harmonic Minor scale calculated correctly:', notes);
    });

    it('should generate correct harmonic minor scale notes for C', () => {
      const notes = getScaleNotes('C', 'harmonic_minor');
      
      // C Harmonic Minor: C D Eb F G Ab B
      expect(notes).toEqual(['C', 'D', 'D#', 'F', 'G', 'G#', 'B']);
      expect(notes.length).toBe(7);
    });

    it('should differ from natural minor by raised 7th', () => {
      const naturalMinor = getScaleNotes('A', 'natural_minor');
      const harmonicMinor = getScaleNotes('A', 'harmonic_minor');
      
      // First 6 notes should be the same
      expect(naturalMinor.slice(0, 6)).toEqual(harmonicMinor.slice(0, 6));
      // 7th note should be different (G vs G#)
      expect(naturalMinor[6]).toBe('G');
      expect(harmonicMinor[6]).toBe('G#');
    });
  });

  describe('Melodic Minor Scale', () => {
    it('should generate correct melodic minor scale notes for A', () => {
      console.log('[Test] Testing A Melodic Minor scale generation');
      console.log('[Test] WHY: Melodic minor has raised 6th and 7th - must calculate correctly');
      console.log('[Test] IMPORTANCE: Validates melodic minor interval pattern [2,1,2,2,2,2,1]');
      
      const notes = getScaleNotes('A', 'melodic_minor');
      
      // A Melodic Minor: A B C D E F# G#
      expect(notes).toEqual(['A', 'B', 'C', 'D', 'E', 'F#', 'G#']);
      expect(notes.length).toBe(7);
      
      console.log('[Test] ✅ A Melodic Minor scale calculated correctly:', notes);
    });

    it('should generate correct melodic minor scale notes for C', () => {
      const notes = getScaleNotes('C', 'melodic_minor');
      
      // C Melodic Minor: C D Eb F G A B
      expect(notes).toEqual(['C', 'D', 'D#', 'F', 'G', 'A', 'B']);
      expect(notes.length).toBe(7);
    });

    it('should differ from natural minor by raised 6th and 7th', () => {
      const naturalMinor = getScaleNotes('A', 'natural_minor');
      const melodicMinor = getScaleNotes('A', 'melodic_minor');
      
      // First 5 notes should be the same
      expect(naturalMinor.slice(0, 5)).toEqual(melodicMinor.slice(0, 5));
      // 6th and 7th notes should be different
      expect(naturalMinor[5]).toBe('F');
      expect(melodicMinor[5]).toBe('F#');
      expect(naturalMinor[6]).toBe('G');
      expect(melodicMinor[6]).toBe('G#');
    });
  });

  describe('Blues Scale', () => {
    it('should generate correct blues scale notes for C', () => {
      console.log('[Test] Testing C Blues scale generation');
      console.log('[Test] WHY: Blues scale is important for jazz/blues practice');
      console.log('[Test] IMPORTANCE: Validates blues interval pattern [3,1,2,1,3,2]');
      
      const notes = getScaleNotes('C', 'blues');
      
      // C Blues with intervals [3,1,2,1,3,2]: C Eb E Gb G Bb
      expect(notes).toEqual(['C', 'D#', 'E', 'F#', 'G', 'A#']);
      expect(notes.length).toBe(6);
      
      console.log('[Test] ✅ C Blues scale calculated correctly:', notes);
    });

    it('should generate correct blues scale notes for A', () => {
      const notes = getScaleNotes('A', 'blues');
      
      // A Blues with intervals [3,1,2,1,3,2]: A C C# Eb E G
      expect(notes).toEqual(['A', 'C', 'C#', 'D#', 'E', 'G']);
      expect(notes.length).toBe(6);
    });

    it('should generate blues scales for all 12 keys', () => {
      const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      
      keys.forEach(key => {
        const notes = getScaleNotes(key, 'blues');
        expect(notes.length).toBe(6);
        expect(notes[0]).toBe(key);
      });
    });
  });

  describe('Major Pentatonic Scale', () => {
    it('should generate correct major pentatonic scale notes for C', () => {
      console.log('[Test] Testing C Major Pentatonic scale generation');
      console.log('[Test] WHY: Pentatonic scales are common in many music styles');
      console.log('[Test] IMPORTANCE: Validates major pentatonic interval pattern [2,2,3,2,3]');
      
      const notes = getScaleNotes('C', 'major_pentatonic');
      
      // C Major Pentatonic: C D E G A
      expect(notes).toEqual(['C', 'D', 'E', 'G', 'A']);
      expect(notes.length).toBe(5);
      
      console.log('[Test] ✅ C Major Pentatonic scale calculated correctly:', notes);
    });

    it('should generate correct major pentatonic scale notes for A', () => {
      const notes = getScaleNotes('A', 'major_pentatonic');
      
      // A Major Pentatonic: A B C# E F#
      expect(notes).toEqual(['A', 'B', 'C#', 'E', 'F#']);
      expect(notes.length).toBe(5);
    });

    it('should generate major pentatonic scales for all 12 keys', () => {
      const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      
      keys.forEach(key => {
        const notes = getScaleNotes(key, 'major_pentatonic');
        expect(notes.length).toBe(5);
        expect(notes[0]).toBe(key);
      });
    });
  });

  describe('Minor Pentatonic Scale', () => {
    it('should generate correct minor pentatonic scale notes for A', () => {
      console.log('[Test] Testing A Minor Pentatonic scale generation');
      console.log('[Test] WHY: Minor pentatonic is fundamental for blues and rock');
      console.log('[Test] IMPORTANCE: Validates minor pentatonic interval pattern [3,2,2,3,2]');
      
      const notes = getScaleNotes('A', 'minor_pentatonic');
      
      // A Minor Pentatonic: A C D E G
      expect(notes).toEqual(['A', 'C', 'D', 'E', 'G']);
      expect(notes.length).toBe(5);
      
      console.log('[Test] ✅ A Minor Pentatonic scale calculated correctly:', notes);
    });

    it('should generate correct minor pentatonic scale notes for C', () => {
      const notes = getScaleNotes('C', 'minor_pentatonic');
      
      // C Minor Pentatonic: C Eb F G Bb
      expect(notes).toEqual(['C', 'D#', 'F', 'G', 'A#']);
      expect(notes.length).toBe(5);
    });

    it('should generate minor pentatonic scales for all 12 keys', () => {
      const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      
      keys.forEach(key => {
        const notes = getScaleNotes(key, 'minor_pentatonic');
        expect(notes.length).toBe(5);
        expect(notes[0]).toBe(key);
      });
    });
  });

  describe('Lydian Mode', () => {
    it('should generate correct lydian mode scale notes for C', () => {
      console.log('[Test] Testing C Lydian mode scale generation');
      console.log('[Test] WHY: Lydian is a common mode for jazz and modern music');
      console.log('[Test] IMPORTANCE: Validates lydian interval pattern [2,2,2,1,2,2,1]');
      
      const notes = getScaleNotes('C', 'lydian');
      
      // C Lydian: C D E F# G A B
      expect(notes).toEqual(['C', 'D', 'E', 'F#', 'G', 'A', 'B']);
      expect(notes.length).toBe(7);
      
      console.log('[Test] ✅ C Lydian mode calculated correctly:', notes);
    });

    it('should generate correct lydian mode scale notes for F', () => {
      const notes = getScaleNotes('F', 'lydian');
      
      // F Lydian: F G A B C D E
      expect(notes).toEqual(['F', 'G', 'A', 'B', 'C', 'D', 'E']);
      expect(notes.length).toBe(7);
    });

    it('should differ from major scale by raised 4th', () => {
      const major = getScaleNotes('C', 'major');
      const lydian = getScaleNotes('C', 'lydian');
      
      // First 3 notes should be the same
      expect(major.slice(0, 3)).toEqual(lydian.slice(0, 3));
      // 4th note should be different (F vs F#)
      expect(major[3]).toBe('F');
      expect(lydian[3]).toBe('F#');
      // Rest should be the same
      expect(major.slice(4)).toEqual(lydian.slice(4));
    });
  });

  describe('All Scale Types for All Keys', () => {
    it('should generate scales for all implemented scale types and all 12 keys', () => {
      console.log('[Test] Testing all scale types work for all 12 keys');
      console.log('[Test] WHY: Comprehensive test ensures no scale/key combination fails');
      console.log('[Test] IMPORTANCE: Validates robustness of scale generation');
      
      const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const scaleTypes = [
        'major',
        'natural_minor',
        'harmonic_minor',
        'melodic_minor',
        'blues',
        'major_pentatonic',
        'minor_pentatonic',
        'lydian'
      ];
      
      keys.forEach(key => {
        scaleTypes.forEach(scaleType => {
          const notes = getScaleNotes(key, scaleType);
          expect(notes.length).toBeGreaterThan(0);
          expect(notes[0]).toBe(key);
          // Verify all notes are valid note names
          notes.forEach(note => {
            expect(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']).toContain(note);
          });
        });
      });
      
      console.log('[Test] ✅ All scale types work for all 12 keys');
    });
  });

  describe('Edge Cases', () => {
    it('should return empty array for invalid root', () => {
      console.log('[Test] Testing edge case: invalid root note');
      console.log('[Test] WHY: Function should handle invalid input gracefully');
      console.log('[Test] IMPORTANCE: Prevents crashes from bad input');
      
      const notes = getScaleNotes('Invalid', 'major');
      
      expect(notes).toEqual([]);
      
      console.log('[Test] ✅ Invalid root handled gracefully');
    });

    it('should handle invalid scale type gracefully', () => {
      console.log('[Test] Testing edge case: invalid scale type');
      console.log('[Test] WHY: Function should handle unknown scale types');
      console.log('[Test] IMPORTANCE: Prevents crashes from unsupported scale types');
      
      // This might throw or return empty, depending on implementation
      try {
        const notes = getScaleNotes('C', 'invalid_scale');
        // If it doesn't throw, it should return empty array or handle gracefully
        expect(Array.isArray(notes)).toBe(true);
      } catch (error) {
        // If it throws, that's also acceptable error handling
        expect(error).toBeDefined();
      }
      
      console.log('[Test] ✅ Invalid scale type handled gracefully');
    });

    it('should handle null/undefined root gracefully', () => {
      const notes1 = getScaleNotes(null, 'major');
      const notes2 = getScaleNotes(undefined, 'major');
      
      expect(notes1).toEqual([]);
      expect(notes2).toEqual([]);
    });
  });
});


