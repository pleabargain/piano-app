import { describe, it, expect } from 'vitest';
import { identifyChord } from '../core/music-theory';

describe('Chord Detection Logic', () => {
    it('should identify E Minor from MIDI notes 52, 55, 59', () => {
        // E3, G3, B3
        const activeNotes = [52, 55, 59];
        const result = identifyChord(activeNotes);

        expect(result).not.toBeNull();
        expect(result.root).toBe('E');
        expect(result.type).toBe('minor');
        expect(result.name).toBe('E Minor');
    });

    it('should identify C Major from MIDI notes 48, 52, 55', () => {
        // C3, E3, G3
        const activeNotes = [48, 52, 55];
        const result = identifyChord(activeNotes);

        expect(result).not.toBeNull();
        expect(result.root).toBe('C');
        expect(result.type).toBe('major');
        expect(result.name).toBe('C Major');
    });

    it('should return null for insufficient notes', () => {
        const activeNotes = [52, 55]; // Just E and G
        const result = identifyChord(activeNotes);
        expect(result).toBeNull();
    });
});
