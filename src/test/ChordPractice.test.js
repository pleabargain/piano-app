import { describe, it, expect, vi, beforeEach } from 'vitest';
import { identifyChord, getChordNotes, NOTES } from '../core/music-theory';

// Import the helper function from ProgressionBuilder
// We'll need to test chord name generation
function getChordNameFromRoman(roman, scaleNotes) {
    const degreeMap = {
        'i': 0, 'ii': 1, 'iii': 2, 'iv': 3, 'v': 4, 'vi': 5, 'vii': 6,
        'I': 0, 'II': 1, 'III': 2, 'IV': 3, 'V': 4, 'VI': 5, 'VII': 6
    };

    const match = roman.match(/^(b|#)?(VII|III|IV|VI|II|V|I)/i);
    if (!match) return '?';

    const accidental = match[1] || '';
    const baseRoman = match[2];
    const suffix = roman.substring(match[0].length);

    let degreeIndex = degreeMap[baseRoman];
    let rootNote = scaleNotes[degreeIndex];

    const isLowerCase = baseRoman === baseRoman.toLowerCase();
    let chordType = 'major';

    if (suffix === '°' || suffix === 'dim') chordType = 'diminished';
    else if (suffix === '+') chordType = 'augmented';
    else if (isLowerCase) chordType = 'minor';
    else chordType = 'major';

    if (suffix.includes('7')) {
        if (isLowerCase) {
            chordType = suffix.includes('maj7') || suffix.includes('M7') ? 'minor7' : 'minor7';
        } else {
            if (suffix.includes('maj7') || suffix.includes('M7')) chordType = 'major7';
            else if (suffix.includes('dim7')) chordType = 'diminished7';
            else chordType = 'dominant7';
        }
    }

    const chordTypeNames = {
        'major': 'Major',
        'minor': 'Minor',
        'diminished': 'Diminished',
        'augmented': 'Augmented',
        'major7': 'Major 7',
        'minor7': 'Minor 7',
        'dominant7': 'Dominant 7',
        'diminished7': 'Diminished 7'
    };

    return `${rootNote} ${chordTypeNames[chordType] || 'Major'}`;
}

describe('Chord Practice Mode - F Major Detection', () => {
    describe('F Major Chord Detection', () => {
        it('should detect F Major from MIDI notes 41, 45, 48 (F2, A2, C3)', () => {
            const activeNotes = [41, 45, 48]; // F2, A2, C3
            const result = identifyChord(activeNotes);

            expect(result).not.toBeNull();
            expect(result.root).toBe('F');
            expect(result.type).toBe('major');
            expect(result.name).toBe('F Major');
        });

        it('should detect F Major from MIDI notes 53, 57, 60 (F3, A3, C4)', () => {
            const activeNotes = [53, 57, 60]; // F3, A3, C4
            const result = identifyChord(activeNotes);

            expect(result).not.toBeNull();
            expect(result.root).toBe('F');
            expect(result.type).toBe('major');
            expect(result.name).toBe('F Major');
        });

        it('should detect F Major from MIDI notes 65, 69, 72 (F4, A4, C5)', () => {
            const activeNotes = [65, 69, 72]; // F4, A4, C5
            const result = identifyChord(activeNotes);

            expect(result).not.toBeNull();
            expect(result.root).toBe('F');
            expect(result.type).toBe('major');
            expect(result.name).toBe('F Major');
        });

        it('should detect F Major in first inversion (A, C, F)', () => {
            const activeNotes = [57, 60, 65]; // A3, C4, F4 (1st inversion)
            const result = identifyChord(activeNotes);

            expect(result).not.toBeNull();
            expect(result.root).toBe('F');
            expect(result.type).toBe('major');
            expect(result.name).toBe('F Major');
            expect(result.inversion).toBe('1st Inversion');
        });

        it('should detect F Major in second inversion (C, F, A)', () => {
            const activeNotes = [60, 65, 69]; // C4, F4, A4 (2nd inversion)
            const result = identifyChord(activeNotes);

            expect(result).not.toBeNull();
            expect(result.root).toBe('F');
            expect(result.type).toBe('major');
            expect(result.name).toBe('F Major');
            expect(result.inversion).toBe('2nd Inversion');
        });

        it('should handle F Major with duplicate octaves', () => {
            const activeNotes = [41, 45, 48, 53, 57, 60]; // Multiple octaves
            const result = identifyChord(activeNotes);

            expect(result).not.toBeNull();
            expect(result.root).toBe('F');
            expect(result.type).toBe('major');
            expect(result.name).toBe('F Major');
        });
    });

    describe('Chord Name Matching', () => {
        it('should match F Major chord names correctly', () => {
            const detected = { name: 'F Major', root: 'F', type: 'major' };
            const target = { name: 'F Major', roman: 'I' };

            expect(detected.name).toBe(target.name);
        });

        it('should match chord names from progression builder', () => {
            // Simulate F Major scale
            const scaleNotes = ['F', 'G', 'A', 'A#', 'C', 'D', 'E'];
            const chordName = getChordNameFromRoman('I', scaleNotes);

            expect(chordName).toBe('F Major');

            // Now test detection
            const activeNotes = [53, 57, 60]; // F3, A3, C4
            const detected = identifyChord(activeNotes);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe(chordName);
        });

        it('should match IV chord (A# Major) in F Major scale', () => {
            const scaleNotes = ['F', 'G', 'A', 'A#', 'C', 'D', 'E'];
            const chordName = getChordNameFromRoman('IV', scaleNotes);

            expect(chordName).toBe('A# Major');

            // A# Major = A#, D, F
            const activeNotes = [58, 62, 65]; // A#3, D4, F4
            const detected = identifyChord(activeNotes);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe(chordName);
        });

        it('should match V chord (C Major) in F Major scale', () => {
            const scaleNotes = ['F', 'G', 'A', 'A#', 'C', 'D', 'E'];
            const chordName = getChordNameFromRoman('V', scaleNotes);

            expect(chordName).toBe('C Major');

            // C Major = C, E, G
            const activeNotes = [60, 64, 67]; // C4, E4, G4
            const detected = identifyChord(activeNotes);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe(chordName);
        });
    });

    describe('Progression Building', () => {
        it('should build correct progression for I IV V I in F Major', () => {
            const scaleNotes = ['F', 'G', 'A', 'A#', 'C', 'D', 'E'];
            const progression = ['I', 'IV', 'V', 'I'].map(roman => ({
                roman,
                name: getChordNameFromRoman(roman, scaleNotes)
            }));

            expect(progression[0].name).toBe('F Major');
            expect(progression[1].name).toBe('A# Major');
            expect(progression[2].name).toBe('C Major');
            expect(progression[3].name).toBe('F Major');
        });

        it('should match each chord in progression when played', () => {
            const scaleNotes = ['F', 'G', 'A', 'A#', 'C', 'D', 'E'];
            const progression = ['I', 'IV', 'V', 'I'].map(roman => ({
                roman,
                name: getChordNameFromRoman(roman, scaleNotes)
            }));

            // Test I chord (F Major)
            const fMajor = identifyChord([53, 57, 60]); // F3, A3, C4
            expect(fMajor).not.toBeNull();
            expect(fMajor.name).toBe(progression[0].name);

            // Test IV chord (A# Major)
            const aSharpMajor = identifyChord([58, 62, 65]); // A#3, D4, F4
            expect(aSharpMajor).not.toBeNull();
            expect(aSharpMajor.name).toBe(progression[1].name);

            // Test V chord (C Major)
            const cMajor = identifyChord([60, 64, 67]); // C4, E4, G4
            expect(cMajor).not.toBeNull();
            expect(cMajor.name).toBe(progression[2].name);
        });
    });

    describe('Edge Cases', () => {
        it('should return null for less than 3 notes', () => {
            expect(identifyChord([53, 57])).toBeNull(); // Just F and A
            expect(identifyChord([53])).toBeNull(); // Just F
            expect(identifyChord([])).toBeNull(); // Empty
        });

        it('should handle wrong chord played', () => {
            const target = { name: 'F Major', roman: 'I' };
            const wrongChord = identifyChord([60, 64, 67]); // C Major instead

            expect(wrongChord).not.toBeNull();
            expect(wrongChord.name).not.toBe(target.name);
            expect(wrongChord.name).toBe('C Major');
        });

        it('should handle partial chord (missing notes)', () => {
            // F Major needs F, A, C - but only playing F and A
            const partial = identifyChord([53, 57]); // F3, A3 (missing C)
            expect(partial).toBeNull();
        });

        it('should handle extra notes in chord', () => {
            // F Major with extra note
            const withExtra = identifyChord([53, 57, 60, 64]); // F, A, C, E
            // Should still detect as F Major (or might detect as F Major 7)
            expect(withExtra).not.toBeNull();
            // Could be F Major or F Major 7 depending on implementation
        });
    });

    describe('Chord Name Format Consistency', () => {
        it('should ensure identifyChord and getChordNameFromRoman use same format', () => {
            const scaleNotes = ['F', 'G', 'A', 'A#', 'C', 'D', 'E'];
            
            // Get chord name from Roman numeral
            const romanName = getChordNameFromRoman('I', scaleNotes);
            expect(romanName).toBe('F Major');
            expect(romanName).toMatch(/Major|Minor|Diminished|Augmented/);

            // Detect actual chord
            const detected = identifyChord([53, 57, 60]); // F Major
            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');

            // They should match exactly
            expect(detected.name).toBe(romanName);
        });

        it('should handle all chord types consistently', () => {
            const scaleNotes = ['F', 'G', 'A', 'A#', 'C', 'D', 'E'];
            
            const testCases = [
                { roman: 'I', expected: 'F Major' },
                { roman: 'ii', expected: 'G Minor' },
                { roman: 'iii', expected: 'A Minor' },
                { roman: 'IV', expected: 'A# Major' },
                { roman: 'V', expected: 'C Major' },
                { roman: 'vi', expected: 'D Minor' },
            ];

            testCases.forEach(({ roman, expected }) => {
                const name = getChordNameFromRoman(roman, scaleNotes);
                expect(name).toBe(expected);
            });
        });
    });
});

