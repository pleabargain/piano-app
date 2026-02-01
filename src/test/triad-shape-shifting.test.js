// 2026-01-31: Triad Shape-Shifting unit tests
import { describe, it, expect } from 'vitest';
import {
    generateTriadInversions,
    getExercise
} from '../core/exercise-config';

describe('Triad Shape-Shifting Exercise Logic', () => {
    describe('generateTriadInversions', () => {
        it('should generate 18 steps (3 keys x 6 inversion transitions)', () => {
            const progression = generateTriadInversions();
            // Each key has 3 inversions, so 3x2 = 6 transitions per key (excluding same->same)
            // 3 keys x 6 transitions = 18 total steps
            expect(progression).toHaveLength(18);
        });

        it('should have all inversion combinations for C Major', () => {
            const progression = generateTriadInversions();
            const cMajorSteps = progression.filter(chord => chord.name === 'C Major');
            
            // Should have 6 transitions for C Major
            expect(cMajorSteps).toHaveLength(6);
            
            // Check that all combinations are present
            const inversions = cMajorSteps.map(chord => chord.inversion);
            expect(inversions).toContain('Root Position');
            expect(inversions).toContain('1st Inversion');
            expect(inversions).toContain('2nd Inversion');
            
            // Verify transitions: Root->1st, Root->2nd, 1st->Root, 1st->2nd, 2nd->Root, 2nd->1st
            // First transition should be Root->1st or Root->2nd
            expect(['1st Inversion', '2nd Inversion']).toContain(cMajorSteps[0].inversion);
        });

        it('should have all inversion combinations for F Major', () => {
            const progression = generateTriadInversions();
            const fMajorSteps = progression.filter(chord => chord.name === 'F Major');
            
            // Should have 6 transitions for F Major
            expect(fMajorSteps).toHaveLength(6);
            
            // Check that all inversions are present
            const inversions = fMajorSteps.map(chord => chord.inversion);
            expect(inversions).toContain('Root Position');
            expect(inversions).toContain('1st Inversion');
            expect(inversions).toContain('2nd Inversion');
        });

        it('should have all inversion combinations for G Major', () => {
            const progression = generateTriadInversions();
            const gMajorSteps = progression.filter(chord => chord.name === 'G Major');
            
            // Should have 6 transitions for G Major
            expect(gMajorSteps).toHaveLength(6);
            
            // Check that all inversions are present
            const inversions = gMajorSteps.map(chord => chord.inversion);
            expect(inversions).toContain('Root Position');
            expect(inversions).toContain('1st Inversion');
            expect(inversions).toContain('2nd Inversion');
        });

        it('should not have same inversion transitions (e.g., Root->Root)', () => {
            const progression = generateTriadInversions();
            
            // Group by chord name and check transitions
            const cMajorSteps = progression.filter(chord => chord.name === 'C Major');
            
            // Count occurrences of each inversion
            const rootCount = cMajorSteps.filter(c => c.inversion === 'Root Position').length;
            const firstCount = cMajorSteps.filter(c => c.inversion === '1st Inversion').length;
            const secondCount = cMajorSteps.filter(c => c.inversion === '2nd Inversion').length;
            
            // Each inversion should appear exactly 2 times (as target of transitions from the other 2 inversions)
            expect(rootCount).toBe(2); // From 1st and 2nd inversions
            expect(firstCount).toBe(2); // From Root and 2nd inversions
            expect(secondCount).toBe(2); // From Root and 1st inversions
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
            expect(progression).toHaveLength(18); // 3 keys x 6 transitions
            expect(progression[0].name).toBe('C Major');
        });
    });
});
