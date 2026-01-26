// https://github.com/pleabargain/piano-app
import { describe, it, expect } from 'vitest';
import { 
  CIRCLE_OF_FIFTHS_KEYS, 
  getVChordRoot, 
  generateIVIProgression, 
  getExercise, 
  getAllExercises,
  EXERCISES 
} from '../core/exercise-config';

describe('exercise-config', () => {
  describe('CIRCLE_OF_FIFTHS_KEYS', () => {
    it('should contain 12 keys', () => {
      expect(CIRCLE_OF_FIFTHS_KEYS).toHaveLength(12);
    });

    it('should start with C', () => {
      expect(CIRCLE_OF_FIFTHS_KEYS[0]).toBe('C');
    });

    it('should contain all expected keys', () => {
      const expectedKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
      expect(CIRCLE_OF_FIFTHS_KEYS).toEqual(expectedKeys);
    });
  });

  describe('getVChordRoot', () => {
    it('should return G for C', () => {
      expect(getVChordRoot('C')).toBe('G');
    });

    it('should return D for G', () => {
      expect(getVChordRoot('G')).toBe('D');
    });

    it('should return C for F', () => {
      expect(getVChordRoot('F')).toBe('C');
    });

    it('should return A# for D#', () => {
      expect(getVChordRoot('D#')).toBe('A#');
    });

    it('should return null for invalid root', () => {
      expect(getVChordRoot('Invalid')).toBeNull();
    });

    it('should handle all Circle of Fifths keys', () => {
      const expectedVChords = {
        'C': 'G',
        'G': 'D',
        'D': 'A',
        'A': 'E',
        'E': 'B',
        'B': 'F#',
        'F#': 'C#',
        'C#': 'G#',
        'G#': 'D#',
        'D#': 'A#',
        'A#': 'F',
        'F': 'C'
      };

      CIRCLE_OF_FIFTHS_KEYS.forEach(root => {
        expect(getVChordRoot(root)).toBe(expectedVChords[root]);
      });
    });
  });

  describe('generateIVIProgression', () => {
    it('should generate I-V-I progression for C', () => {
      const progression = generateIVIProgression('C');
      expect(progression).toHaveLength(3);
      expect(progression[0]).toEqual({ name: 'C Major', roman: 'I' });
      expect(progression[1]).toEqual({ name: 'G Major', roman: 'V' });
      expect(progression[2]).toEqual({ name: 'C Major', roman: 'I' });
    });

    it('should generate I-V-I progression for G', () => {
      const progression = generateIVIProgression('G');
      expect(progression).toHaveLength(3);
      expect(progression[0]).toEqual({ name: 'G Major', roman: 'I' });
      expect(progression[1]).toEqual({ name: 'D Major', roman: 'V' });
      expect(progression[2]).toEqual({ name: 'G Major', roman: 'I' });
    });

    it('should return empty array for invalid root', () => {
      const progression = generateIVIProgression('Invalid');
      expect(progression).toEqual([]);
    });

    it('should generate valid progressions for all Circle of Fifths keys', () => {
      CIRCLE_OF_FIFTHS_KEYS.forEach(root => {
        const progression = generateIVIProgression(root);
        expect(progression).toHaveLength(3);
        expect(progression[0].name).toBe(`${root} Major`);
        expect(progression[0].roman).toBe('I');
        expect(progression[1].roman).toBe('V');
        expect(progression[2].name).toBe(`${root} Major`);
        expect(progression[2].roman).toBe('I');
      });
    });
  });

  describe('EXERCISES registry', () => {
    it('should contain i-v-i-circle exercise', () => {
      expect(EXERCISES['i-v-i-circle']).toBeDefined();
    });

    it('should have correct structure for i-v-i-circle', () => {
      const exercise = EXERCISES['i-v-i-circle'];
      expect(exercise.id).toBe('i-v-i-circle');
      expect(exercise.name).toBe('I-V-I Circle of Fifths');
      expect(exercise.mode).toBe('chord');
      expect(exercise.config).toBeDefined();
      expect(exercise.config.keyProgression).toEqual(CIRCLE_OF_FIFTHS_KEYS);
      expect(typeof exercise.config.generateProgression).toBe('function');
      expect(exercise.config.scaleType).toBe('major');
    });
  });

  describe('getExercise', () => {
    it('should return exercise for valid ID', () => {
      const exercise = getExercise('i-v-i-circle');
      expect(exercise).toBeDefined();
      expect(exercise.id).toBe('i-v-i-circle');
    });

    it('should return null for invalid ID', () => {
      expect(getExercise('invalid-exercise')).toBeNull();
      expect(getExercise('')).toBeNull();
      expect(getExercise(null)).toBeNull();
    });
  });

  describe('getAllExercises', () => {
    it('should return array of exercises', () => {
      const exercises = getAllExercises();
      expect(Array.isArray(exercises)).toBe(true);
      expect(exercises.length).toBeGreaterThan(0);
    });

    it('should include i-v-i-circle exercise', () => {
      const exercises = getAllExercises();
      const iViCircle = exercises.find(e => e.id === 'i-v-i-circle');
      expect(iViCircle).toBeDefined();
    });
  });
});
