// 2026-01-31: Triad Shape-Shifting unit tests
import { describe, it, expect } from 'vitest';
import {
    generateTriadInversions,
    getExercise
} from '../core/exercise-config';

describe('Triad Shape-Shifting Exercise Logic', () => {
    describe('generateTriadInversions', () => {
        it('should generate 12 steps (3 keys x 4 inversions)', () => {
            const progression = generateTriadInversions();
            expect(progression).toHaveLength(12);
        });

        it('should have correct progression for C Major', () => {
            const progression = generateTriadInversions();
            expect(progression[0]).toEqual({ name: 'C Major', roman: 'I', inversion: 'Root Position' });
            expect(progression[1]).toEqual({ name: 'C Major', roman: 'I', inversion: '1st Inversion' });
            expect(progression[2]).toEqual({ name: 'C Major', roman: 'I', inversion: '2nd Inversion' });
            expect(progression[3]).toEqual({ name: 'C Major', roman: 'I', inversion: 'Root Position' });
        });

        it('should transition to F Major after C Major', () => {
            const progression = generateTriadInversions();
            expect(progression[4].name).toBe('F Major');
            expect(progression[4].inversion).toBe('Root Position');
        });

        it('should transition to G Major after F Major', () => {
            const progression = generateTriadInversions();
            expect(progression[8].name).toBe('G Major');
            expect(progression[8].inversion).toBe('Root Position');
        });
    });

    describe('Exercise Registration', () => {
        it('should be registered with correct ID', () => {
            const exercise = getExercise('triad-shape-shifting');
            expect(exercise).toBeDefined();
            expect(exercise.name).toBe('Triad Shape-Shifting');
            expect(exercise.mode).toBe('chord');
        });

        it('should use generateTriadInversions in config', () => {
            const exercise = getExercise('triad-shape-shifting');
            const progression = exercise.config.generateProgression();
            expect(progression).toHaveLength(12);
            expect(progression[0].name).toBe('C Major');
        });
    });
});
