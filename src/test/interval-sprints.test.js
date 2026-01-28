// https://github.com/pleabargain/piano-app
import { describe, it, expect } from 'vitest';
import {
    generateIntervalSprints,
    getExercise,
    CIRCLE_OF_FIFTHS_KEYS
} from '../core/exercise-config';

describe('Interval Sprints Exercise', () => {
    describe('generateIntervalSprints', () => {
        it('should generate correct sequence for C Major', () => {
            const progression = generateIntervalSprints('C', 'major');
            // Intervals: C-D, C-E, C-F, C-G, C-A, C-B, C-C
            // Each has 2 notes, total 14 notes
            expect(progression).toHaveLength(14);

            const expectedNames = [
                'C', 'D',
                'C', 'E',
                'C', 'F',
                'C', 'G',
                'C', 'A',
                'C', 'B',
                'C', 'C'
            ];

            progression.forEach((item, index) => {
                expect(item.name).toBe(expectedNames[index]);
            });
        });

        it('should generate correct sequence for G Major', () => {
            const progression = generateIntervalSprints('G', 'major');
            // scale: G, A, B, C, D, E, F#
            expect(progression).toHaveLength(14);
            expect(progression[0].name).toBe('G');
            expect(progression[1].name).toBe('A');
            expect(progression[13].name).toBe('G'); // Octave G
        });
    });

    describe('Exercise Registration', () => {
        it('should have interval-sprints exercise', () => {
            const exercise = getExercise('interval-sprints');
            expect(exercise).toBeDefined();
            expect(exercise.mode).toBe('scale');
            expect(typeof exercise.config.generateProgression).toBe('function');
        });

        it('should have interval-sprints-circle exercise', () => {
            const exercise = getExercise('interval-sprints-circle');
            expect(exercise).toBeDefined();
            expect(exercise.mode).toBe('scale');
            expect(exercise.config.keyProgression).toEqual(CIRCLE_OF_FIFTHS_KEYS);
        });
    });
});
