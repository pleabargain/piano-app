// https://github.com/pleabargain/piano-app
import { describe, it, expect } from 'vitest';
import {
    getExercise,
    CIRCLE_OF_FIFTHS_KEYS
} from '../core/exercise-config';

describe('Major Pentatonic Circle Exercise', () => {
    it('should be registered correctly', () => {
        const exercise = getExercise('major-pentatonic-circle');
        expect(exercise).toBeDefined();
        expect(exercise.name).toBe('Major Pentatonic Circle');
        expect(exercise.mode).toBe('scale');
        expect(exercise.config.scaleType).toBe('major_pentatonic');
    });

    it('should generate correct sequence for C Major Pentatonic', () => {
        const exercise = getExercise('major-pentatonic-circle');
        const progression = exercise.config.generateProgression('C');

        // C Major Pentatonic: C, D, E, G, A
        // Ascending: C, D, E, G, A, C (6 notes)
        // Descending: A, G, E, D, C (5 notes)
        // Total 11 notes
        expect(progression).toHaveLength(11);

        const expected = ['C', 'D', 'E', 'G', 'A', 'C', 'A', 'G', 'E', 'D', 'C'];
        progression.forEach((note, i) => {
            expect(note.name).toBe(expected[i]);
        });
    });

    it('should use all 12 keys in Circle of Fifths order', () => {
        const exercise = getExercise('major-pentatonic-circle');
        expect(exercise.config.keyProgression).toEqual(CIRCLE_OF_FIFTHS_KEYS);
    });
});
