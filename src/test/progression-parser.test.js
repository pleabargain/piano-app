
import { describe, it, expect, vi } from 'vitest';
import { parseProgression, normalizeToken } from '../core/progression-parser';
import * as MusicTheory from '../core/music-theory';

// Mock getChordNameFromRoman since it depends on logic we don't want to test here or want to control
vi.mock('../core/music-theory', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        getChordNameFromRoman: vi.fn(),
    };
});

describe('Progression Parser', () => {
    describe('normalizeToken', () => {
        it('should handle standard ASCII', () => {
            expect(normalizeToken('Cm')).toBe('Cm');
            expect(normalizeToken('F#')).toBe('F#');
            expect(normalizeToken('Bb')).toBe('Bb');
        });

        it('should normalize Unicode flat and sharp', () => {
            expect(normalizeToken('B♭')).toBe('Bb');
            expect(normalizeToken('C♯')).toBe('C#'); // If we supported sharp symbol
            expect(normalizeToken('E♭')).toBe('Eb');
        });

        it('should normalize subscript m', () => {
            expect(normalizeToken('Gₘ')).toBe('Gm');
            expect(normalizeToken('A♭ₘ')).toBe('Abm');
        });

        it('should normalize superscript digits', () => {
            expect(normalizeToken('Eₘ⁷')).toBe('Em7');
            expect(normalizeToken('Aₘ⁷')).toBe('Am7');
            expect(normalizeToken('C⁷')).toBe('C7');
        });

        it('should normalize superscript maj7', () => {
            expect(normalizeToken('Fᵐᵃʲ⁷')).toBe('Fmaj7');
            expect(normalizeToken('Cᵐᵃʲ⁷')).toBe('Cmaj7');
        });

        it('should handle whitespace', () => {
            expect(normalizeToken('  C  ')).toBe('C');
        });
    });

    describe('parseProgression', () => {
        it('should parse absolute chords with Unicode', () => {
            const result = parseProgression('F B♭ Gₘ C E♭ D');
            expect(result.error).toBeNull();
            expect(result.chords).toHaveLength(6);

            expect(result.chords[0].name).toBe('F');
            expect(result.chords[1].name).toBe('Bb'); // Normalized
            expect(result.chords[2].name).toBe('Gm'); // Normalized
            expect(result.chords[3].name).toBe('C');
            expect(result.chords[4].name).toBe('Eb');
            expect(result.chords[5].name).toBe('D');
        });

        it('should parse Roman numerals when scale is provided', () => {
            // Mock getChordNameFromRoman behavior
            MusicTheory.getChordNameFromRoman.mockImplementation((token) => {
                if (token === 'I') return 'C Major';
                if (token === 'IV') return 'F Major';
                return '?';
            });

            const scaleNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
            const result = parseProgression('I IV', scaleNotes);

            expect(result.error).toBeNull();
            expect(result.chords).toHaveLength(2);
            expect(result.chords[0].name).toBe('C Major');
            expect(result.chords[1].name).toBe('F Major');
        });

        it('should mixed inputs', () => {
            MusicTheory.getChordNameFromRoman.mockReturnValue('C Major');
            const scaleNotes = ['C'];

            const result = parseProgression('I Cm', scaleNotes);
            expect(result.error).toBeNull();
            expect(result.chords[0].type).toBe('roman');
            expect(result.chords[1].type).toBe('absolute');
            expect(result.chords[1].name).toBe('Cm');
        });

        it('should return error for invalid tokens', () => {
            const result = parseProgression('I InvalidToken');
            expect(result.error).toContain('Invalid symbol');
        });

        it('should parse lead-sheet style chords with pipes, slash chords, and unicode superscripts', () => {
            const input = 'C | Eₘ⁷ | G/B | Aₘ⁷ | D | G | Eₘ | Dₘ | D/F♯ | Aₘ | E | Cₘ | Fᵐᵃʲ⁷ | F';
            const scaleNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

            const result = parseProgression(input, scaleNotes);

            expect(result.error).toBeNull();
            expect(result.chords).toHaveLength(14);

            const names = result.chords.map(c => c.name);
            expect(names).toEqual([
                'C',
                'Em7',
                'G/B',
                'Am7',
                'D',
                'G',
                'Em',
                'Dm',
                'D/F#',
                'Am',
                'E',
                'Cm',
                'Fmaj7',
                'F',
            ]);

            result.chords.forEach(ch => expect(ch.type).toBe('absolute'));
        });

        it('should parse chord progressions with hyphens as separators', () => {
            const result = parseProgression('C - F - G - C - D - G');
            expect(result.error).toBeNull();
            expect(result.chords).toHaveLength(6);

            expect(result.chords[0].name).toBe('C');
            expect(result.chords[1].name).toBe('F');
            expect(result.chords[2].name).toBe('G');
            expect(result.chords[3].name).toBe('C');
            expect(result.chords[4].name).toBe('D');
            expect(result.chords[5].name).toBe('G');

            result.chords.forEach(ch => expect(ch.type).toBe('absolute'));
        });

        it('should parse Roman numerals with hyphens as separators', () => {
            MusicTheory.getChordNameFromRoman.mockImplementation((token) => {
                if (token === 'I') return 'C Major';
                if (token === 'IV') return 'F Major';
                if (token === 'V') return 'G Major';
                return '?';
            });

            const scaleNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
            const result = parseProgression('I - IV - V - I', scaleNotes);

            expect(result.error).toBeNull();
            expect(result.chords).toHaveLength(4);
            expect(result.chords[0].name).toBe('C Major');
            expect(result.chords[1].name).toBe('F Major');
            expect(result.chords[2].name).toBe('G Major');
            expect(result.chords[3].name).toBe('C Major');
        });
    });
});
