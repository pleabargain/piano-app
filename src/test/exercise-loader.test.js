// https://github.com/pleabargain/piano-app
import { describe, it, expect } from 'vitest';
import { 
  parseUrlParams, 
  loadExerciseFromUrl, 
  getExerciseIdFromPath 
} from '../core/exercise-loader';

describe('exercise-loader', () => {
  describe('parseUrlParams', () => {
    it('should parse startKey parameter', () => {
      const params = parseUrlParams('?startKey=C');
      expect(params.startKey).toBe('C');
      expect(params.keys).toBeNull();
    });

    it('should parse keys parameter', () => {
      const params = parseUrlParams('?keys=12');
      expect(params.startKey).toBeNull();
      expect(params.keys).toBe(12);
    });

    it('should parse both parameters', () => {
      const params = parseUrlParams('?startKey=G&keys=6');
      expect(params.startKey).toBe('G');
      expect(params.keys).toBe(6);
    });

    it('should handle empty search string', () => {
      const params = parseUrlParams('');
      expect(params.startKey).toBeNull();
      expect(params.keys).toBeNull();
    });

    it('should handle search string without ?', () => {
      const params = parseUrlParams('startKey=C');
      expect(params.startKey).toBeNull();
    });

    it('should parse keys as integer', () => {
      const params = parseUrlParams('?keys=5');
      expect(typeof params.keys).toBe('number');
      expect(params.keys).toBe(5);
    });

    it('should handle invalid keys parameter', () => {
      const params = parseUrlParams('?keys=invalid');
      expect(params.keys).toBeNaN();
    });
  });

  describe('getExerciseIdFromPath', () => {
    it('should extract exercise ID from valid path', () => {
      expect(getExerciseIdFromPath('/exercise/i-v-i-circle')).toBe('i-v-i-circle');
    });

    it('should return null for non-exercise path', () => {
      expect(getExerciseIdFromPath('/')).toBeNull();
      expect(getExerciseIdFromPath('/some/other/path')).toBeNull();
    });

    it('should handle path with trailing slash', () => {
      expect(getExerciseIdFromPath('/exercise/i-v-i-circle/')).toBeNull();
    });

    it('should handle empty path', () => {
      expect(getExerciseIdFromPath('')).toBeNull();
    });

    it('should extract exercise ID with special characters', () => {
      // This tests that the regex works with various exercise ID formats
      expect(getExerciseIdFromPath('/exercise/test-exercise-123')).toBe('test-exercise-123');
    });
  });

  describe('loadExerciseFromUrl', () => {
    it('should load i-v-i-circle exercise', () => {
      const exercise = loadExerciseFromUrl('i-v-i-circle', '');
      expect(exercise).toBeDefined();
      expect(exercise.id).toBe('i-v-i-circle');
      expect(exercise.mode).toBe('chord');
    });

    it('should return null for invalid exercise ID', () => {
      expect(loadExerciseFromUrl('invalid-exercise', '')).toBeNull();
    });

    it('should include params in returned exercise', () => {
      const exercise = loadExerciseFromUrl('i-v-i-circle', '?startKey=C&keys=12');
      expect(exercise.params).toBeDefined();
      expect(exercise.params.startKey).toBe('C');
      expect(exercise.params.keys).toBe(12);
    });

    it('should set startKeyIndex for valid startKey', () => {
      const exercise = loadExerciseFromUrl('i-v-i-circle', '?startKey=G');
      expect(exercise.startKeyIndex).toBe(1); // G is index 1 in Circle of Fifths
    });

    it('should not set startKeyIndex for invalid startKey', () => {
      const exercise = loadExerciseFromUrl('i-v-i-circle', '?startKey=Invalid');
      expect(exercise.startKeyIndex).toBeUndefined();
    });

    it('should set maxKeys for valid keys parameter', () => {
      const exercise = loadExerciseFromUrl('i-v-i-circle', '?keys=6');
      expect(exercise.maxKeys).toBe(6);
    });

    it('should not set maxKeys for invalid keys parameter', () => {
      const exercise = loadExerciseFromUrl('i-v-i-circle', '?keys=20'); // > 12
      expect(exercise.maxKeys).toBeUndefined();
    });

    it('should not set maxKeys for keys <= 0', () => {
      const exercise = loadExerciseFromUrl('i-v-i-circle', '?keys=0');
      expect(exercise.maxKeys).toBeUndefined();
    });

    it('should handle startKey at end of Circle of Fifths', () => {
      const exercise = loadExerciseFromUrl('i-v-i-circle', '?startKey=F');
      expect(exercise.startKeyIndex).toBe(11); // F is last (index 11)
    });

    it('should handle startKey in middle of Circle of Fifths', () => {
      const exercise = loadExerciseFromUrl('i-v-i-circle', '?startKey=D');
      expect(exercise.startKeyIndex).toBe(2); // D is index 2
    });

    it('should load i-iv-v-i-circle exercise', () => {
      const exercise = loadExerciseFromUrl('i-iv-v-i-circle', '');
      expect(exercise).toBeDefined();
      expect(exercise.id).toBe('i-iv-v-i-circle');
      expect(exercise.mode).toBe('chord');
    });

    it('should handle URL parameters for i-iv-v-i-circle', () => {
      const exercise = loadExerciseFromUrl('i-iv-v-i-circle', '?startKey=G&keys=6');
      expect(exercise.params.startKey).toBe('G');
      expect(exercise.params.keys).toBe(6);
      expect(exercise.startKeyIndex).toBe(1);
      expect(exercise.maxKeys).toBe(6);
    });
  });
});
