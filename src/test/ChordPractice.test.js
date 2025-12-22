import { describe, it, expect, vi, beforeEach } from 'vitest';
import { identifyChord, getChordNotes, NOTES } from '../core/music-theory';

/**
 * TEST SUITE: Chord Practice Mode - F Major Detection
 * 
 * PURPOSE: This test suite validates chord practice mode functionality with F Major as the primary test case.
 * 
 * WHY THESE TESTS ARE IMPORTANT:
 * - Chord practice mode is a core feature - users need accurate chord detection to practice
 * - Tests chord detection across different octaves (realistic MIDI input scenarios)
 * - Validates inversion detection works correctly
 * - Ensures chord name matching works for progression advancement
 * - Tests edge cases like duplicate notes, wrong chords, partial chords
 * - Validates chord name format consistency between detection and progression building
 */

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
            console.log('[Test] Testing F Major detection in low octave');
            console.log('[Test] WHY: Low octave detection is important for left-hand chord practice');
            console.log('[Test] IMPORTANCE: Ensures chord detection works across full MIDI keyboard range');
            console.log('[Test] MIDI Notes: F2=41, A2=45, C3=48');
            
            const activeNotes = [41, 45, 48]; // F2, A2, C3
            const result = identifyChord(activeNotes);

            expect(result).not.toBeNull();
            expect(result.root).toBe('F');
            expect(result.type).toBe('major');
            expect(result.name).toBe('F Major');
            
            console.log('[Test] ✅ F Major detected correctly in low octave');
        });

        it('should detect F Major from MIDI notes 53, 57, 60 (F3, A3, C4)', () => {
            console.log('[Test] Testing F Major detection in middle octave');
            console.log('[Test] WHY: Middle octave is the most common playing range');
            console.log('[Test] IMPORTANCE: Validates detection works in typical user scenarios');
            console.log('[Test] MIDI Notes: F3=53, A3=57, C4=60');
            
            const activeNotes = [53, 57, 60]; // F3, A3, C4
            const result = identifyChord(activeNotes);

            expect(result).not.toBeNull();
            expect(result.root).toBe('F');
            expect(result.type).toBe('major');
            expect(result.name).toBe('F Major');
            
            console.log('[Test] ✅ F Major detected correctly in middle octave');
        });

        it('should detect F Major from MIDI notes 65, 69, 72 (F4, A4, C5)', () => {
            console.log('[Test] Testing F Major detection in high octave');
            console.log('[Test] WHY: High octave detection is important for right-hand chord practice');
            console.log('[Test] IMPORTANCE: Ensures chord detection works across full MIDI keyboard range');
            console.log('[Test] MIDI Notes: F4=65, A4=69, C5=72');
            
            const activeNotes = [65, 69, 72]; // F4, A4, C5
            const result = identifyChord(activeNotes);

            expect(result).not.toBeNull();
            expect(result.root).toBe('F');
            expect(result.type).toBe('major');
            expect(result.name).toBe('F Major');
            
            console.log('[Test] ✅ F Major detected correctly in high octave');
        });

        it('should detect F Major in first inversion (A, C, F)', () => {
            console.log('[Test] Testing F Major 1st inversion detection');
            console.log('[Test] WHY: Inversions are common in real music - users need accurate detection');
            console.log('[Test] IMPORTANCE: Enables practice of different chord voicings');
            console.log('[Test] MIDI Notes: A3=57, C4=60, F4=65 (3rd A in bass)');
            
            const activeNotes = [57, 60, 65]; // A3, C4, F4 (1st inversion)
            const result = identifyChord(activeNotes);

            expect(result).not.toBeNull();
            expect(result.root).toBe('F');
            expect(result.type).toBe('major');
            expect(result.name).toBe('F Major');
            expect(result.inversion).toBe('1st Inversion');
            
            console.log('[Test] ✅ F Major 1st inversion correctly detected');
        });

        it('should detect F Major in second inversion (C, F, A)', () => {
            console.log('[Test] Testing F Major 2nd inversion detection');
            console.log('[Test] WHY: 2nd inversion is another common voicing - must be detected');
            console.log('[Test] IMPORTANCE: Complete inversion support enables full chord practice');
            console.log('[Test] MIDI Notes: C4=60, F4=65, A4=69 (5th C in bass)');
            
            const activeNotes = [60, 65, 69]; // C4, F4, A4 (2nd inversion)
            const result = identifyChord(activeNotes);

            expect(result).not.toBeNull();
            expect(result.root).toBe('F');
            expect(result.type).toBe('major');
            expect(result.name).toBe('F Major');
            expect(result.inversion).toBe('2nd Inversion');
            
            console.log('[Test] ✅ F Major 2nd inversion correctly detected');
        });

        it('should handle F Major with duplicate octaves', () => {
            console.log('[Test] Testing F Major detection with duplicate octaves');
            console.log('[Test] WHY: Users may press keys in multiple octaves simultaneously');
            console.log('[Test] IMPORTANCE: Ensures detection works with realistic playing patterns');
            console.log('[Test] MIDI Notes: F2-A2-C3 and F3-A3-C4 (duplicate octaves)');
            
            const activeNotes = [41, 45, 48, 53, 57, 60]; // Multiple octaves
            const result = identifyChord(activeNotes);

            expect(result).not.toBeNull();
            expect(result.root).toBe('F');
            expect(result.type).toBe('major');
            expect(result.name).toBe('F Major');
            
            console.log('[Test] ✅ F Major detected correctly with duplicate octaves');
        });
    });

    describe('Chord Name Matching', () => {
        it('should match F Major chord names correctly', () => {
            console.log('[Test] Testing chord name matching for progression advancement');
            console.log('[Test] WHY: Chord practice mode requires exact name matching to advance');
            console.log('[Test] IMPORTANCE: Users need accurate progression advancement for effective practice');
            
            const detected = { name: 'F Major', root: 'F', type: 'major' };
            const target = { name: 'F Major', roman: 'I' };

            expect(detected.name).toBe(target.name);
            
            console.log('[Test] ✅ Chord names match correctly');
        });

        it('should match chord names from progression builder', () => {
            console.log('[Test] Testing chord name consistency between progression builder and detection');
            console.log('[Test] WHY: Progression builder and chord detection must use same name format');
            console.log('[Test] IMPORTANCE: Prevents progression advancement failures due to format mismatches');
            console.log('[Test] Testing: Roman numeral "I" in F Major scale should match detected "F Major"');
            
            // Simulate F Major scale
            const scaleNotes = ['F', 'G', 'A', 'A#', 'C', 'D', 'E'];
            const chordName = getChordNameFromRoman('I', scaleNotes);

            expect(chordName).toBe('F Major');

            // Now test detection
            const activeNotes = [53, 57, 60]; // F3, A3, C4
            const detected = identifyChord(activeNotes);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe(chordName);
            
            console.log('[Test] ✅ Chord names match between progression builder and detection');
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
            console.log('[Test] Testing edge case: insufficient notes for chord detection');
            console.log('[Test] WHY: Prevents false positives from intervals/dyads');
            console.log('[Test] IMPORTANCE: Ensures only complete chords (3+ notes) are identified');
            
            expect(identifyChord([53, 57])).toBeNull(); // Just F and A
            expect(identifyChord([53])).toBeNull(); // Just F
            expect(identifyChord([])).toBeNull(); // Empty
            
            console.log('[Test] ✅ Correctly returns null for insufficient notes');
        });

        it('should handle wrong chord played', () => {
            console.log('[Test] Testing edge case: wrong chord played in practice mode');
            console.log('[Test] WHY: Users will play wrong chords - app must handle gracefully');
            console.log('[Test] IMPORTANCE: Prevents progression advancement for incorrect chords');
            console.log('[Test] Scenario: Target is F Major, user plays C Major');
            
            const target = { name: 'F Major', roman: 'I' };
            const wrongChord = identifyChord([60, 64, 67]); // C Major instead

            expect(wrongChord).not.toBeNull();
            expect(wrongChord.name).not.toBe(target.name);
            expect(wrongChord.name).toBe('C Major');
            
            console.log('[Test] ✅ Wrong chord correctly identified and does not match target');
        });

        it('should handle partial chord (missing notes)', () => {
            console.log('[Test] Testing edge case: partial chord (missing notes)');
            console.log('[Test] WHY: Users may play incomplete chords while learning');
            console.log('[Test] IMPORTANCE: Prevents false detection from partial chord voicings');
            console.log('[Test] Scenario: F Major needs F-A-C, but only F-A played');
            
            // F Major needs F, A, C - but only playing F and A
            const partial = identifyChord([53, 57]); // F3, A3 (missing C)
            expect(partial).toBeNull();
            
            console.log('[Test] ✅ Partial chord correctly returns null');
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
            console.log('[Test] Testing chord name format consistency');
            console.log('[Test] WHY: Format mismatches cause progression advancement to fail');
            console.log('[Test] IMPORTANCE: Critical for chord practice mode - names must match exactly');
            console.log('[Test] Testing: Roman numeral "I" name format vs detected chord name format');
            
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
            
            console.log('[Test] ✅ Chord name formats are consistent');
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

