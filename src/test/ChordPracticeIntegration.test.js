import { describe, it, expect, vi, beforeEach } from 'vitest';
import { identifyChord } from '../core/music-theory';

// Test the chord matching logic that's used in the useEffect
describe('Chord Practice Integration - Matching Logic', () => {
    describe('Chord Name Comparison', () => {
        it('should match F Major exactly', () => {
            const targetChord = { name: 'F Major', roman: 'I' };
            const activeNotes = [53, 57, 60]; // F3, A3, C4
            const detected = identifyChord(activeNotes);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
            expect(detected.name === targetChord.name).toBe(true);
        });

        it('should match C Major exactly', () => {
            const targetChord = { name: 'C Major', roman: 'V' };
            const activeNotes = [60, 64, 67]; // C4, E4, G4
            const detected = identifyChord(activeNotes);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe('C Major');
            expect(detected.name === targetChord.name).toBe(true);
        });

        it('should match A# Major exactly', () => {
            const targetChord = { name: 'A# Major', roman: 'IV' };
            const activeNotes = [58, 62, 65]; // A#3, D4, F4
            const detected = identifyChord(activeNotes);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe('A# Major');
            expect(detected.name === targetChord.name).toBe(true);
        });
    });

    describe('Progression Matching', () => {
        it('should match first chord in I IV V I progression', () => {
            const progression = [
                { name: 'F Major', roman: 'I' },
                { name: 'A# Major', roman: 'IV' },
                { name: 'C Major', roman: 'V' },
                { name: 'F Major', roman: 'I' }
            ];

            const currentStepIndex = 0;
            const targetChord = progression[currentStepIndex];
            const activeNotes = [53, 57, 60]; // F Major
            const detected = identifyChord(activeNotes);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe(targetChord.name);
            expect(detected.name === targetChord.name).toBe(true);
        });

        it('should match second chord in I IV V I progression', () => {
            const progression = [
                { name: 'F Major', roman: 'I' },
                { name: 'A# Major', roman: 'IV' },
                { name: 'C Major', roman: 'V' },
                { name: 'F Major', roman: 'I' }
            ];

            const currentStepIndex = 1;
            const targetChord = progression[currentStepIndex];
            const activeNotes = [58, 62, 65]; // A# Major
            const detected = identifyChord(activeNotes);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe(targetChord.name);
            expect(detected.name === targetChord.name).toBe(true);
        });

        it('should match third chord in I IV V I progression', () => {
            const progression = [
                { name: 'F Major', roman: 'I' },
                { name: 'A# Major', roman: 'IV' },
                { name: 'C Major', roman: 'V' },
                { name: 'F Major', roman: 'I' }
            ];

            const currentStepIndex = 2;
            const targetChord = progression[currentStepIndex];
            const activeNotes = [60, 64, 67]; // C Major
            const detected = identifyChord(activeNotes);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe(targetChord.name);
            expect(detected.name === targetChord.name).toBe(true);
        });
    });

    describe('Edge Cases for Matching', () => {
        it('should not match wrong chord', () => {
            const targetChord = { name: 'F Major', roman: 'I' };
            const activeNotes = [60, 64, 67]; // C Major instead
            const detected = identifyChord(activeNotes);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe('C Major');
            expect(detected.name === targetChord.name).toBe(false);
        });

        it('should handle null detection gracefully', () => {
            const targetChord = { name: 'F Major', roman: 'I' };
            const activeNotes = [53, 57]; // Only 2 notes - insufficient
            const detected = identifyChord(activeNotes);

            expect(detected).toBeNull();
            expect(detected === null).toBe(true);
            // Should not match when detected is null
            expect(detected && detected.name === targetChord.name).toBeFalsy();
        });

        it('should handle empty activeNotes', () => {
            const targetChord = { name: 'F Major', roman: 'I' };
            const activeNotes = [];
            const detected = identifyChord(activeNotes);

            expect(detected).toBeNull();
            expect(detected && detected.name === targetChord.name).toBeFalsy();
        });

        it('should require at least 3 notes for detection', () => {
            const targetChord = { name: 'F Major', roman: 'I' };
            
            // Test with 1 note
            expect(identifyChord([53])).toBeNull();
            
            // Test with 2 notes
            expect(identifyChord([53, 57])).toBeNull();
            
            // Test with 3 notes (should work)
            const detected = identifyChord([53, 57, 60]);
            expect(detected).not.toBeNull();
            expect(detected.name === targetChord.name).toBe(true);
        });
    });

    describe('Chord Name Format Verification', () => {
        it('should verify identifyChord returns correct format', () => {
            const activeNotes = [53, 57, 60]; // F Major
            const detected = identifyChord(activeNotes);

            expect(detected).not.toBeNull();
            expect(detected.name).toMatch(/^[A-G]#?\s+(Major|Minor|Diminished|Augmented|Major 7|Minor 7|Dominant 7|Diminished 7)$/);
            expect(detected.name).toBe('F Major');
        });

        it('should verify all chord types return correct format', () => {
            const testChords = [
                { notes: [48, 52, 55], expected: 'C Major' }, // C Major
                { notes: [48, 51, 55], expected: 'C Minor' }, // C Minor
                { notes: [53, 57, 60], expected: 'F Major' }, // F Major
                { notes: [60, 64, 67], expected: 'C Major' }, // C Major (different octave)
            ];

            testChords.forEach(({ notes, expected }) => {
                const detected = identifyChord(notes);
                expect(detected).not.toBeNull();
                expect(detected.name).toBe(expected);
                expect(detected.name).toMatch(/^[A-G]#?\s+(Major|Minor|Diminished|Augmented|Major 7|Minor 7|Dominant 7|Diminished 7)$/);
            });
        });
    });

    describe('Real-world MIDI Note Ranges', () => {
        it('should detect F Major in low octave (C2-C4 range)', () => {
            // Left piano range: 36-60 (C2-C4)
            const activeNotes = [41, 45, 48]; // F2, A2, C3
            const detected = identifyChord(activeNotes);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
        });

        it('should detect F Major in middle octave (C4-C6 range)', () => {
            // Right piano range: 60-84 (C4-C6)
            const activeNotes = [65, 69, 72]; // F4, A4, C5
            const detected = identifyChord(activeNotes);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
        });

        it('should detect F Major across octaves', () => {
            // Mixed octaves
            const activeNotes = [41, 57, 72]; // F2, A3, C5
            const detected = identifyChord(activeNotes);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
        });
    });
});

