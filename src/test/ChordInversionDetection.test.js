/**
 * Unit tests: C Major root / 1st / 2nd inversion detection from MIDI input
 *
 * PURPOSE: Ensure identifyChord correctly reports inversion when the user
 * plays C Major in root position, 1st inversion, or 2nd inversion (e.g. on
 * exercise i4v5-inversions-c). MIDI input must be correctly intercepted
 * so the UI shows the right inversion.
 *
 * WHY: Regression tests for inversion recognition bug where C Major root
 * was not being recognized correctly (or 1st inversion reported as root).
 *
 * 2026-02-01: Added for i4v5-inversions-c inversion recognition.
 */

import { describe, it, expect } from 'vitest';
import { identifyChord, getChordNotesAsMidi } from '../core/music-theory';

describe('C Major inversion detection from MIDI input', () => {
  describe('identifyChord returns correct inversion for canonical MIDI (getChordNotesAsMidi)', () => {
    it('should recognize C Major Root Position from MIDI notes (octave 3)', () => {
      // C3=48, E3=52, G3=55
      const midiNotes = getChordNotesAsMidi('C', 'major', 0, 3);
      expect(midiNotes).toEqual([48, 52, 55]);

      const result = identifyChord(midiNotes);
      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.type).toBe('major');
      expect(result.name).toBe('C Major');
      expect(result.inversion).toBe('Root Position');
    });

    it('should recognize C Major Root Position from MIDI notes (octave 4)', () => {
      // C4=60, E4=64, G4=67
      const midiNotes = getChordNotesAsMidi('C', 'major', 0, 4);
      expect(midiNotes).toEqual([60, 64, 67]);

      const result = identifyChord(midiNotes);
      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.type).toBe('major');
      expect(result.inversion).toBe('Root Position');
    });

    it('should recognize C Major 1st Inversion from MIDI notes (E in bass)', () => {
      // 1st inversion: E, G, C — e.g. E3=52, G3=55, C4=60
      const midiNotes = getChordNotesAsMidi('C', 'major', 1, 3);
      expect(midiNotes).toEqual([52, 55, 60]);

      const result = identifyChord(midiNotes);
      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.type).toBe('major');
      expect(result.inversion).toBe('1st Inversion');
    });

    it('should recognize C Major 1st Inversion from MIDI notes (octave 4)', () => {
      const midiNotes = getChordNotesAsMidi('C', 'major', 1, 4);
      expect(midiNotes).toEqual([64, 67, 72]);

      const result = identifyChord(midiNotes);
      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.type).toBe('major');
      expect(result.inversion).toBe('1st Inversion');
    });

    it('should recognize C Major 2nd Inversion from MIDI notes (G in bass)', () => {
      // 2nd inversion: G, C, E — e.g. G3=55, C4=60, E4=64
      const midiNotes = getChordNotesAsMidi('C', 'major', 2, 3);
      expect(midiNotes).toEqual([55, 60, 64]);

      const result = identifyChord(midiNotes);
      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.type).toBe('major');
      expect(result.inversion).toBe('2nd Inversion');
    });

    it('should recognize C Major 2nd Inversion from MIDI notes (octave 4)', () => {
      const midiNotes = getChordNotesAsMidi('C', 'major', 2, 4);
      expect(midiNotes).toEqual([67, 72, 76]);

      const result = identifyChord(midiNotes);
      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.type).toBe('major');
      expect(result.inversion).toBe('2nd Inversion');
    });
  });

  describe('identifyChord returns correct inversion when MIDI notes are in arbitrary order', () => {
    it('should recognize Root Position when notes are unsorted (simulated MIDI order)', () => {
      // Simulate user pressing C4, then G4, then E4 — still root position
      const unsortedRoot = [60, 67, 64]; // C4, G4, E4
      const result = identifyChord(unsortedRoot);
      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.inversion).toBe('Root Position');
    });

    it('should recognize 1st Inversion when notes are unsorted (E-G-C)', () => {
      // E3=52, G3=55, C4=60 — any order; bass is still E
      const unsorted1st = [55, 60, 52]; // G3, C4, E3
      const result = identifyChord(unsorted1st);
      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.inversion).toBe('1st Inversion');
    });

    it('should recognize 2nd Inversion when notes are unsorted (G-C-E)', () => {
      const unsorted2nd = [64, 55, 60]; // E4, G3, C4
      const result = identifyChord(unsorted2nd);
      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.inversion).toBe('2nd Inversion');
    });
  });

  describe('identifyChord with extra octave doublings (same pitch classes)', () => {
    it('should still report Root Position when root is doubled in higher octave', () => {
      // C3, E3, G3, C4 — bass is still C
      const withDouble = [48, 52, 55, 60];
      const result = identifyChord(withDouble);
      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.inversion).toBe('Root Position');
    });

    it('should still report 1st Inversion when 3rd is in bass despite extra notes', () => {
      // E3, G3, C4, E4 — bass is E
      const withDouble = [52, 55, 60, 64];
      const result = identifyChord(withDouble);
      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.inversion).toBe('1st Inversion');
    });
  });
});
