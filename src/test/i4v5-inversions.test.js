// 2026-01-31: I-IV-V Inversions exercise tests
import { describe, it, expect } from 'vitest';
import {
    generateI4V5Inversions,
    getExercise,
    CIRCLE_OF_FIFTHS_KEYS
} from '../core/exercise-config';

describe('I-IV-V Inversions Exercise Logic', () => {
    describe('generateI4V5Inversions', () => {
        it('should generate 18 steps for C Major (3 chords x 6 transitions)', () => {
            const progression = generateI4V5Inversions('C');
            // Each chord (I, IV, V) has 6 inversion transitions
            // 3 chords x 6 transitions = 18 total steps
            expect(progression).toHaveLength(18);
        });

        it('should have correct chords for C Major', () => {
            const progression = generateI4V5Inversions('C');
            
            // Check that all three chords are present
            const chordNames = progression.map(chord => chord.name);
            expect(chordNames).toContain('C Major');
            expect(chordNames).toContain('F Major');
            expect(chordNames).toContain('G Major');
            
            // Check Roman numerals
            const romans = progression.map(chord => chord.roman);
            expect(romans).toContain('I');
            expect(romans).toContain('IV');
            expect(romans).toContain('V');
        });

        it('should have 6 transitions for each chord', () => {
            const progression = generateI4V5Inversions('C');
            
            const iChords = progression.filter(c => c.roman === 'I');
            const ivChords = progression.filter(c => c.roman === 'IV');
            const vChords = progression.filter(c => c.roman === 'V');
            
            expect(iChords).toHaveLength(6);
            expect(ivChords).toHaveLength(6);
            expect(vChords).toHaveLength(6);
        });

        it('should have all inversion types for each chord', () => {
            const progression = generateI4V5Inversions('C');
            
            const iChords = progression.filter(c => c.roman === 'I');
            const ivChords = progression.filter(c => c.roman === 'IV');
            const vChords = progression.filter(c => c.roman === 'V');
            
            const iInversions = iChords.map(c => c.inversion);
            const ivInversions = ivChords.map(c => c.inversion);
            const vInversions = vChords.map(c => c.inversion);
            
            const expectedInversions = ['Root Position', '1st Inversion', '2nd Inversion'];
            
            // Each inversion should appear exactly 2 times (as target of transitions from the other 2 inversions)
            expect(iInversions.filter(inv => inv === 'Root Position').length).toBe(2);
            expect(iInversions.filter(inv => inv === '1st Inversion').length).toBe(2);
            expect(iInversions.filter(inv => inv === '2nd Inversion').length).toBe(2);
            
            expect(ivInversions.filter(inv => inv === 'Root Position').length).toBe(2);
            expect(ivInversions.filter(inv => inv === '1st Inversion').length).toBe(2);
            expect(ivInversions.filter(inv => inv === '2nd Inversion').length).toBe(2);
            
            expect(vInversions.filter(inv => inv === 'Root Position').length).toBe(2);
            expect(vInversions.filter(inv => inv === '1st Inversion').length).toBe(2);
            expect(vInversions.filter(inv => inv === '2nd Inversion').length).toBe(2);
        });

        it('should work for all 12 keys', () => {
            CIRCLE_OF_FIFTHS_KEYS.forEach(key => {
                const progression = generateI4V5Inversions(key);
                expect(progression).toHaveLength(18);
                expect(progression.every(c => c.name && c.roman && c.inversion)).toBe(true);
            });
        });

        it('should return empty array for invalid key', () => {
            const progression = generateI4V5Inversions('Invalid');
            expect(progression).toEqual([]);
        });

        it('should return empty array for null/undefined key', () => {
            expect(generateI4V5Inversions(null)).toEqual([]);
            expect(generateI4V5Inversions(undefined)).toEqual([]);
        });
    });

    describe('Exercise Registration', () => {
        const exerciseIds = [
            'i4v5-inversions-c',
            'i4v5-inversions-g',
            'i4v5-inversions-d',
            'i4v5-inversions-a',
            'i4v5-inversions-e',
            'i4v5-inversions-b',
            'i4v5-inversions-f#',
            'i4v5-inversions-c#',
            'i4v5-inversions-g#',
            'i4v5-inversions-d#',
            'i4v5-inversions-a#',
            'i4v5-inversions-f'
        ];

        exerciseIds.forEach(exerciseId => {
            it(`should be registered: ${exerciseId}`, () => {
                const exercise = getExercise(exerciseId);
                expect(exercise).toBeDefined();
                expect(exercise.id).toBe(exerciseId);
                expect(exercise.mode).toBe('chord');
            });

            it(`should generate 18 steps for ${exerciseId}`, () => {
                const exercise = getExercise(exerciseId);
                const progression = exercise.config.generateProgression();
                expect(progression).toHaveLength(18);
            });
        });
    });
});
