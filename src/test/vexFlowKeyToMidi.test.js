/**
 * Unit tests for vexFlowKeyToMidi - converts VexFlow key strings to MIDI numbers.
 * Middle C (C4) = 60. Used for highlighting played notes on the sheet music staff.
 */
import { describe, it, expect } from 'vitest';
import { vexFlowKeyToMidi } from '../components/SheetMusicDisplay';

describe('vexFlowKeyToMidi', () => {
  describe('middle C and octave 4', () => {
    it('should convert C/4 to 60 (middle C)', () => {
      expect(vexFlowKeyToMidi('C/4')).toBe(60);
    });
    it('should convert c/4 to 60 (lowercase)', () => {
      expect(vexFlowKeyToMidi('c/4')).toBe(60);
    });
    it('should convert C4 to 60 (no slash)', () => {
      expect(vexFlowKeyToMidi('C4')).toBe(60);
    });
    it('should convert E/4 to 64', () => {
      expect(vexFlowKeyToMidi('E/4')).toBe(64);
    });
    it('should convert G/4 to 67', () => {
      expect(vexFlowKeyToMidi('G/4')).toBe(67);
    });
  });

  describe('sharps', () => {
    it('should convert C#/4 to 61', () => {
      expect(vexFlowKeyToMidi('C#/4')).toBe(61);
    });
    it('should convert D#/4 to 63', () => {
      expect(vexFlowKeyToMidi('D#/4')).toBe(63);
    });
    it('should convert F#/4 to 66', () => {
      expect(vexFlowKeyToMidi('F#/4')).toBe(66);
    });
    it('should convert G#/4 to 68', () => {
      expect(vexFlowKeyToMidi('G#/4')).toBe(68);
    });
    it('should convert A#/4 to 70', () => {
      expect(vexFlowKeyToMidi('A#/4')).toBe(70);
    });
  });

  describe('flats (normalized to sharps)', () => {
    it('should convert Bb/4 to 70 (same as A#)', () => {
      expect(vexFlowKeyToMidi('Bb/4')).toBe(70);
    });
    it('should convert Eb/4 to 63 (same as D#)', () => {
      expect(vexFlowKeyToMidi('Eb/4')).toBe(63);
    });
    it('should convert Ab/4 to 68 (same as G#)', () => {
      expect(vexFlowKeyToMidi('Ab/4')).toBe(68);
    });
    it('should convert Db/4 to 61 (same as C#)', () => {
      expect(vexFlowKeyToMidi('Db/4')).toBe(61);
    });
    it('should convert Gb/4 to 66 (same as F#)', () => {
      expect(vexFlowKeyToMidi('Gb/4')).toBe(66);
    });
  });

  describe('other octaves', () => {
    it('should convert C/3 to 48', () => {
      expect(vexFlowKeyToMidi('C/3')).toBe(48);
    });
    it('should convert C/5 to 72', () => {
      expect(vexFlowKeyToMidi('C/5')).toBe(72);
    });
    it('should convert A/2 to 45 (low A)', () => {
      expect(vexFlowKeyToMidi('A/2')).toBe(45);
    });
    it('should convert B/5 to 83', () => {
      expect(vexFlowKeyToMidi('B/5')).toBe(83);
    });
  });

  describe('edge cases and invalid input', () => {
    it('should return null for empty string', () => {
      expect(vexFlowKeyToMidi('')).toBeNull();
    });
    it('should return null for null', () => {
      expect(vexFlowKeyToMidi(null)).toBeNull();
    });
    it('should return null for undefined', () => {
      expect(vexFlowKeyToMidi(undefined)).toBeNull();
    });
    it('should return null for non-string', () => {
      expect(vexFlowKeyToMidi(60)).toBeNull();
      expect(vexFlowKeyToMidi([])).toBeNull();
    });
    it('should return null for invalid format', () => {
      expect(vexFlowKeyToMidi('invalid')).toBeNull();
      expect(vexFlowKeyToMidi('X4')).toBeNull();
      expect(vexFlowKeyToMidi('C')).toBeNull();
    });
    it('should trim whitespace', () => {
      expect(vexFlowKeyToMidi('  C/4  ')).toBe(60);
    });
  });

  describe('acceptance criteria: middle C', () => {
    it('if user plays middle C (MIDI 60), vexFlowKeyToMidi should identify C4 as 60', () => {
      const middleCMidi = 60;
      const vexFlowKeyForMiddleC = 'C/4';
      expect(vexFlowKeyToMidi(vexFlowKeyForMiddleC)).toBe(middleCMidi);
    });
  });
});
