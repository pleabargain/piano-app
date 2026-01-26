// https://github.com/pleabargain/piano-app
import { describe, it, expect } from 'vitest';
import { 
  CIRCLE_OF_FIFTHS_KEYS, 
  getVChordRoot, 
  generateIVIProgression,
  getExercise 
} from '../core/exercise-config';

describe('I-V-I Circle Exercise Logic', () => {
  describe('Circle of Fifths Key Order', () => {
    it('should have correct order starting from C', () => {
      expect(CIRCLE_OF_FIFTHS_KEYS[0]).toBe('C');
      expect(CIRCLE_OF_FIFTHS_KEYS[1]).toBe('G');
      expect(CIRCLE_OF_FIFTHS_KEYS[2]).toBe('D');
    });

    it('should wrap around correctly (F -> C)', () => {
      const lastKey = CIRCLE_OF_FIFTHS_KEYS[CIRCLE_OF_FIFTHS_KEYS.length - 1];
      const firstKey = CIRCLE_OF_FIFTHS_KEYS[0];
      expect(getVChordRoot(lastKey)).toBe(firstKey);
    });

    it('should maintain perfect fifth relationships', () => {
      for (let i = 0; i < CIRCLE_OF_FIFTHS_KEYS.length - 1; i++) {
        const currentKey = CIRCLE_OF_FIFTHS_KEYS[i];
        const nextKey = CIRCLE_OF_FIFTHS_KEYS[i + 1];
        expect(getVChordRoot(currentKey)).toBe(nextKey);
      }
    });
  });

  describe('V Chord Calculation', () => {
    it('should calculate V chord for C Major correctly', () => {
      expect(getVChordRoot('C')).toBe('G');
    });

    it('should calculate V chord for all keys in Circle of Fifths', () => {
      const expectedVChords = [
        'G',  // C -> G
        'D',  // G -> D
        'A',  // D -> A
        'E',  // A -> E
        'B',  // E -> B
        'F#', // B -> F#
        'C#', // F# -> C#
        'G#', // C# -> G#
        'D#', // G# -> D#
        'A#', // D# -> A#
        'F',  // A# -> F
        'C'   // F -> C (wraps around)
      ];

      CIRCLE_OF_FIFTHS_KEYS.forEach((key, index) => {
        expect(getVChordRoot(key)).toBe(expectedVChords[index]);
      });
    });

    it('should handle enharmonic equivalents correctly', () => {
      // F# and Gb are enharmonic, but we use F# in our system
      expect(getVChordRoot('F#')).toBe('C#');
    });
  });

  describe('I-V-I Progression Generation', () => {
    it('should generate correct progression for C Major', () => {
      const progression = generateIVIProgression('C');
      expect(progression).toEqual([
        { name: 'C Major', roman: 'I' },
        { name: 'G Major', roman: 'V' },
        { name: 'C Major', roman: 'I' }
      ]);
    });

    it('should generate correct progression for G Major', () => {
      const progression = generateIVIProgression('G');
      expect(progression).toEqual([
        { name: 'G Major', roman: 'I' },
        { name: 'D Major', roman: 'V' },
        { name: 'G Major', roman: 'I' }
      ]);
    });

    it('should generate progression for all Circle of Fifths keys', () => {
      CIRCLE_OF_FIFTHS_KEYS.forEach((key, index) => {
        const progression = generateIVIProgression(key);
        const expectedV = CIRCLE_OF_FIFTHS_KEYS[(index + 1) % CIRCLE_OF_FIFTHS_KEYS.length];
        
        expect(progression).toHaveLength(3);
        expect(progression[0].name).toBe(`${key} Major`);
        expect(progression[0].roman).toBe('I');
        expect(progression[1].name).toBe(`${expectedV} Major`);
        expect(progression[1].roman).toBe('V');
        expect(progression[2].name).toBe(`${key} Major`);
        expect(progression[2].roman).toBe('I');
      });
    });

    it('should have correct structure for all progressions', () => {
      CIRCLE_OF_FIFTHS_KEYS.forEach(key => {
        const progression = generateIVIProgression(key);
        
        // Check structure
        expect(progression).toHaveLength(3);
        expect(progression[0]).toHaveProperty('name');
        expect(progression[0]).toHaveProperty('roman');
        expect(progression[1]).toHaveProperty('name');
        expect(progression[1]).toHaveProperty('roman');
        expect(progression[2]).toHaveProperty('name');
        expect(progression[2]).toHaveProperty('roman');
        
        // Check I-V-I pattern
        expect(progression[0].roman).toBe('I');
        expect(progression[1].roman).toBe('V');
        expect(progression[2].roman).toBe('I');
        
        // Check that first and last chords are the same (I)
        expect(progression[0].name).toBe(progression[2].name);
      });
    });
  });

  describe('Exercise Configuration', () => {
    it('should have correct exercise configuration', () => {
      const exercise = getExercise('i-v-i-circle');
      expect(exercise).toBeDefined();
      expect(exercise.config.keyProgression).toEqual(CIRCLE_OF_FIFTHS_KEYS);
    });

    it('should generate progression using exercise config function', () => {
      const exercise = getExercise('i-v-i-circle');
      const generateFn = exercise.config.generateProgression;
      
      const progression = generateFn('C');
      expect(progression).toHaveLength(3);
      expect(progression[0].name).toBe('C Major');
      expect(progression[1].name).toBe('G Major');
      expect(progression[2].name).toBe('C Major');
    });

    it('should work with all keys in exercise key progression', () => {
      const exercise = getExercise('i-v-i-circle');
      const keys = exercise.config.keyProgression;
      
      keys.forEach(key => {
        const progression = exercise.config.generateProgression(key);
        expect(progression).toHaveLength(3);
        expect(progression[0].roman).toBe('I');
        expect(progression[1].roman).toBe('V');
        expect(progression[2].roman).toBe('I');
      });
    });
  });

  describe('Key Advancement Logic', () => {
    it('should advance through all 12 keys in order', () => {
      const exercise = getExercise('i-v-i-circle');
      const keys = exercise.config.keyProgression;
      
      // Verify we can generate progressions for consecutive keys
      for (let i = 0; i < keys.length; i++) {
        const currentKey = keys[i];
        const progression = generateIVIProgression(currentKey);
        
        expect(progression).toHaveLength(3);
        
        // Verify V chord matches next key in circle
        if (i < keys.length - 1) {
          const nextKey = keys[i + 1];
          expect(progression[1].name).toBe(`${nextKey} Major`);
        } else {
          // Last key wraps to first
          const firstKey = keys[0];
          expect(progression[1].name).toBe(`${firstKey} Major`);
        }
      }
    });

    it('should complete full circle (12 keys)', () => {
      const exercise = getExercise('i-v-i-circle');
      const keys = exercise.config.keyProgression;
      
      expect(keys.length).toBe(12);
      
      // Verify circular relationship
      const lastKey = keys[keys.length - 1];
      const lastProgression = generateIVIProgression(lastKey);
      expect(lastProgression[1].name).toBe(`${keys[0]} Major`);
    });
  });
});
