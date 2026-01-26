import { describe, it, expect } from 'vitest';
import { getScaleNotes, NOTES, getNoteIndex } from '../core/music-theory';

function getIntervalsBetween(notes) {
    const indices = notes.map(n => getNoteIndex(n));
    const intervals = [];
    for (let i = 0; i < indices.length - 1; i++) {
        intervals.push((indices[i + 1] - indices[i] + 12) % 12);
    }
    // Last interval back to octave
    intervals.push((indices[0] - indices[indices.length - 1] + 12) % 12);
    return intervals;
}

describe('Pentatonic Scales Correctness', () => {
    it('should return correct notes for C Major Pentatonic', () => {
        const notes = getScaleNotes('C', 'major_pentatonic');
        expect(notes).toEqual(['C', 'D', 'E', 'G', 'A']);
        expect(getIntervalsBetween(notes)).toEqual([2, 2, 3, 2, 3]);
    });

    it('should return correct notes for G Major Pentatonic', () => {
        const notes = getScaleNotes('G', 'major_pentatonic');
        expect(notes).toEqual(['G', 'A', 'B', 'D', 'E']);
        expect(getIntervalsBetween(notes)).toEqual([2, 2, 3, 2, 3]);
    });

    it('should return correct notes for A Minor Pentatonic', () => {
        const notes = getScaleNotes('A', 'minor_pentatonic');
        expect(notes).toEqual(['A', 'C', 'D', 'E', 'G']);
        expect(getIntervalsBetween(notes)).toEqual([3, 2, 2, 3, 2]);
    });

    it('should verify all major pentatonic scales for all roots', () => {
        NOTES.forEach(root => {
            const notes = getScaleNotes(root, 'major_pentatonic');
            expect(notes).toHaveLength(5);
            expect(getIntervalsBetween(notes)).toEqual([2, 2, 3, 2, 3]);
        });
    });

    it('should verify all minor pentatonic scales for all roots', () => {
        NOTES.forEach(root => {
            const notes = getScaleNotes(root, 'minor_pentatonic');
            expect(notes).toHaveLength(5);
            expect(getIntervalsBetween(notes)).toEqual([3, 2, 2, 3, 2]);
        });
    });
});
