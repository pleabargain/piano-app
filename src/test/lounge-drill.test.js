import { describe, it, expect } from 'vitest';
import { generateLoungeDrill } from '../core/exercise-config';

describe('Lounge Piano Drill Generator', () => {
    it('should generate a progression', () => {
        const progression = generateLoungeDrill();
        expect(progression).toBeInstanceOf(Array);
        expect(progression.length).toBeGreaterThan(0);
    });

    it('should not have two consecutive chords with the same name', () => {
        const progression = generateLoungeDrill();

        for (let i = 0; i < progression.length - 1; i++) {
            const current = progression[i];
            const next = progression[i + 1];

            expect(current.name).not.toBe(next.name);
            // Optional: Add a custom message for better failure output
            if (current.name === next.name) {
                throw new Error(`Consecutive duplicate found at index ${i}: ${current.name} -> ${next.name}`);
            }
        }
    });

    it('should include correct chords', () => {
        const progression = generateLoungeDrill();
        const chordNames = [...new Set(progression.map(c => c.name))];
        expect(chordNames).toContain('C Major 6');
        expect(chordNames).toContain('D Diminished');
    });
});
