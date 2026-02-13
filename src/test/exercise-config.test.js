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

    it('should include i-iv-v-i-circle exercise', () => {
      const exercises = getAllExercises();
      const iIvViCircle = exercises.find(e => e.id === 'i-iv-v-i-circle');
      expect(iIvViCircle).toBeDefined();
    });
  });

  describe('I-IV-V-I Circle Exercise', () => {
    it('should contain i-iv-v-i-circle exercise', () => {
      expect(EXERCISES['i-iv-v-i-circle']).toBeDefined();
    });

    it('should have correct structure for i-iv-v-i-circle', () => {
      const exercise = EXERCISES['i-iv-v-i-circle'];
      expect(exercise.id).toBe('i-iv-v-i-circle');
      expect(exercise.name).toBe('I-IV-V-I Circle of Fifths');
      expect(exercise.mode).toBe('chord');
      expect(exercise.config).toBeDefined();
      expect(exercise.config.keyProgression).toEqual(CIRCLE_OF_FIFTHS_KEYS);
      expect(typeof exercise.config.generateProgression).toBe('function');
      expect(exercise.config.scaleType).toBe('major');
    });

    it('should generate I-IV-V-I progression for C Major', () => {
      const exercise = getExercise('i-iv-v-i-circle');
      const progression = exercise.config.generateProgression('C');
      expect(progression).toHaveLength(4);
      expect(progression[0].roman).toBe('I');
      expect(progression[1].roman).toBe('IV');
      expect(progression[2].roman).toBe('V');
      expect(progression[3].roman).toBe('I');
      expect(progression[0].name).toBe('C Major');
      expect(progression[1].name).toBe('F Major');
      expect(progression[2].name).toBe('G Major');
      expect(progression[3].name).toBe('C Major');
    });

    it('should generate I-IV-V-I progression for all Circle of Fifths keys', () => {
      const exercise = getExercise('i-iv-v-i-circle');
      CIRCLE_OF_FIFTHS_KEYS.forEach(root => {
        const progression = exercise.config.generateProgression(root);
        expect(progression).toHaveLength(4);
        expect(progression[0].roman).toBe('I');
        expect(progression[1].roman).toBe('IV');
        expect(progression[2].roman).toBe('V');
        expect(progression[3].roman).toBe('I');
        expect(progression[0].name).toBe(`${root} Major`);
        expect(progression[3].name).toBe(`${root} Major`);
      });
    });
  });

  describe('vi-IV-I-V Circle Exercise', () => {
    it('should contain vi-iv-i-v-circle exercise', () => {
      expect(EXERCISES['vi-iv-i-v-circle']).toBeDefined();
    });

    it('should have correct structure for vi-iv-i-v-circle', () => {
      const exercise = EXERCISES['vi-iv-i-v-circle'];
      expect(exercise.id).toBe('vi-iv-i-v-circle');
      expect(exercise.name).toBe('vi-IV-I-V Circle of Fifths');
      expect(exercise.mode).toBe('chord');
      expect(exercise.config).toBeDefined();
      expect(exercise.config.keyProgression).toEqual(CIRCLE_OF_FIFTHS_KEYS);
      expect(typeof exercise.config.generateProgression).toBe('function');
      expect(exercise.config.scaleType).toBe('major');
    });

    it('should generate vi-IV-I-V progression for C Major', () => {
      const exercise = getExercise('vi-iv-i-v-circle');
      const progression = exercise.config.generateProgression('C');
      expect(progression).toHaveLength(4);
      expect(progression[0].roman).toBe('vi');
      expect(progression[1].roman).toBe('IV');
      expect(progression[2].roman).toBe('I');
      expect(progression[3].roman).toBe('V');
      expect(progression[0].name).toBe('A Minor');
      expect(progression[1].name).toBe('F Major');
      expect(progression[2].name).toBe('C Major');
      expect(progression[3].name).toBe('G Major');
    });

    it('should generate vi-IV-I-V progression for G Major', () => {
      const exercise = getExercise('vi-iv-i-v-circle');
      const progression = exercise.config.generateProgression('G');
      expect(progression).toHaveLength(4);
      expect(progression[0].roman).toBe('vi');
      expect(progression[1].roman).toBe('IV');
      expect(progression[2].roman).toBe('I');
      expect(progression[3].roman).toBe('V');
      expect(progression[0].name).toBe('E Minor');
      expect(progression[1].name).toBe('C Major');
      expect(progression[2].name).toBe('G Major');
      expect(progression[3].name).toBe('D Major');
    });

    it('should generate vi-IV-I-V progression for all Circle of Fifths keys', () => {
      const exercise = getExercise('vi-iv-i-v-circle');
      CIRCLE_OF_FIFTHS_KEYS.forEach(root => {
        const progression = exercise.config.generateProgression(root);
        expect(progression).toHaveLength(4);
        expect(progression[0].roman).toBe('vi');
        expect(progression[1].roman).toBe('IV');
        expect(progression[2].roman).toBe('I');
        expect(progression[3].roman).toBe('V');
      });
    });

    it('should return empty array for invalid root', () => {
      const exercise = getExercise('vi-iv-i-v-circle');
      const progression = exercise.config.generateProgression('Invalid');
      expect(progression).toEqual([]);
    });
  });

  describe('I-vi-ii-V Scale & Chords Creative Lessons', () => {
    const lessonIds = [
      'i-vi-ii-v-lesson-c', 'i-vi-ii-v-lesson-g', 'i-vi-ii-v-lesson-d',
      'i-vi-ii-v-lesson-a', 'i-vi-ii-v-lesson-e', 'i-vi-ii-v-lesson-b',
      'i-vi-ii-v-lesson-f#', 'i-vi-ii-v-lesson-c#', 'i-vi-ii-v-lesson-g#',
      'i-vi-ii-v-lesson-d#', 'i-vi-ii-v-lesson-a#', 'i-vi-ii-v-lesson-f'
    ];

    it('should have all 12 lesson exercises defined', () => {
      lessonIds.forEach(id => {
        expect(EXERCISES[id]).toBeDefined();
      });
    });

    it('should have scale_then_chord mode and phased config for i-vi-ii-v-lesson-c', () => {
      const exercise = EXERCISES['i-vi-ii-v-lesson-c'];
      expect(exercise.id).toBe('i-vi-ii-v-lesson-c');
      expect(exercise.mode).toBe('scale_then_chord');
      expect(exercise.config.keyProgression).toEqual(['C']);
      expect(typeof exercise.config.generateScaleProgression).toBe('function');
      expect(typeof exercise.config.generateChordProgression).toBe('function');
    });

    it('should generate scale progression for C Major', () => {
      const exercise = EXERCISES['i-vi-ii-v-lesson-c'];
      const scaleProg = exercise.config.generateScaleProgression('C');
      expect(scaleProg).toBeDefined();
      expect(scaleProg.length).toBe(15); // ascending + descending
      expect(scaleProg[0].name).toBe('C');
      expect(scaleProg[7].name).toBe('C'); // octave
    });

    it('should generate I-vi-ii-V chord progression for C Major', () => {
      const exercise = EXERCISES['i-vi-ii-v-lesson-c'];
      const chordProg = exercise.config.generateChordProgression('C');
      expect(chordProg).toHaveLength(4);
      expect(chordProg[0]).toEqual({ name: 'C Major', roman: 'I' });
      expect(chordProg[1].roman).toBe('vi');
      expect(chordProg[2].roman).toBe('ii');
      expect(chordProg[3].roman).toBe('V');
    });

    it('should generate I-vi-ii-V chord progression for G Major (G-Em-Am-D)', () => {
      const exercise = EXERCISES['i-vi-ii-v-lesson-g'];
      const chordProg = exercise.config.generateChordProgression('G');
      expect(chordProg).toHaveLength(4);
      expect(chordProg[0]).toEqual({ name: 'G Major', roman: 'I' });
      expect(chordProg[1].name).toBe('E Minor');
      expect(chordProg[2].name).toBe('A Minor');
      expect(chordProg[3].name).toBe('D Major');
    });

    it('should have standalone lesson description mentioning creative powers', () => {
      const exercise = EXERCISES['i-vi-ii-v-lesson-c'];
      expect(exercise.description).toMatch(/standalone/i);
      expect(exercise.description.toLowerCase()).toMatch(/creative|encouraging/);
    });
  });
});
