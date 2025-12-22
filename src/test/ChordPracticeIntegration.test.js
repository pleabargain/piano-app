import { describe, it, expect, vi, beforeEach } from 'vitest';
import { identifyChord } from '../core/music-theory';

/**
 * TEST SUITE: Chord Practice Integration - Matching Logic
 * 
 * PURPOSE: This test suite validates the chord matching logic used in chord practice mode's useEffect.
 * 
 * WHY THESE TESTS ARE IMPORTANT:
 * - Tests the exact matching logic used in the app's chord practice mode
 * - Validates progression advancement works correctly
 * - Ensures chord name format consistency
 * - Tests edge cases like wrong chords, null detection, insufficient notes
 * - Validates detection works across different MIDI note ranges (real-world scenarios)
 */

// Test the chord matching logic that's used in the useEffect
describe('Chord Practice Integration - Matching Logic', () => {
    describe('Chord Name Comparison', () => {
        it('should match F Major exactly', () => {
            console.log('[Test] Testing exact chord name matching');
            console.log('[Test] WHY: Chord practice mode requires exact name matching to advance');
            console.log('[Test] IMPORTANCE: Users need accurate progression advancement for effective practice');
            console.log('[Test] MIDI Notes: F3=53, A3=57, C4=60');
            
            const targetChord = { name: 'F Major', roman: 'I' };
            const activeNotes = [53, 57, 60]; // F3, A3, C4
            const detected = identifyChord(activeNotes);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
            expect(detected.name === targetChord.name).toBe(true);
            
            console.log('[Test] ✅ F Major matched exactly');
        });

        it('should match C Major exactly', () => {
            console.log('[Test] Testing C Major exact matching');
            console.log('[Test] WHY: Validates matching works for different chord positions in progression');
            console.log('[Test] IMPORTANCE: Ensures progression advancement works for all chords, not just first');
            console.log('[Test] MIDI Notes: C4=60, E4=64, G4=67');
            
            const targetChord = { name: 'C Major', roman: 'V' };
            const activeNotes = [60, 64, 67]; // C4, E4, G4
            const detected = identifyChord(activeNotes);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe('C Major');
            expect(detected.name === targetChord.name).toBe(true);
            
            console.log('[Test] ✅ C Major matched exactly');
        });

        it('should match A# Major exactly', () => {
            console.log('[Test] Testing A# Major exact matching with sharp root');
            console.log('[Test] WHY: Validates matching works with sharp/flat roots');
            console.log('[Test] IMPORTANCE: Ensures all chromatic roots work in chord practice mode');
            console.log('[Test] MIDI Notes: A#3=58, D4=62, F4=65');
            
            const targetChord = { name: 'A# Major', roman: 'IV' };
            const activeNotes = [58, 62, 65]; // A#3, D4, F4
            const detected = identifyChord(activeNotes);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe('A# Major');
            expect(detected.name === targetChord.name).toBe(true);
            
            console.log('[Test] ✅ A# Major matched exactly');
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
            console.log('[Test] Testing edge case: wrong chord played');
            console.log('[Test] WHY: Users will play wrong chords - app must not advance progression');
            console.log('[Test] IMPORTANCE: Prevents false progression advancement');
            console.log('[Test] Scenario: Target is F Major, user plays C Major');
            
            const targetChord = { name: 'F Major', roman: 'I' };
            const activeNotes = [60, 64, 67]; // C Major instead
            const detected = identifyChord(activeNotes);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe('C Major');
            expect(detected.name === targetChord.name).toBe(false);
            
            console.log('[Test] ✅ Wrong chord correctly does not match target');
        });

        it('should handle null detection gracefully', () => {
            console.log('[Test] Testing edge case: null detection (insufficient notes)');
            console.log('[Test] WHY: Users may play partial chords - app must handle gracefully');
            console.log('[Test] IMPORTANCE: Prevents crashes and false matches when no chord detected');
            console.log('[Test] Scenario: Only 2 notes played - should return null');
            
            const targetChord = { name: 'F Major', roman: 'I' };
            const activeNotes = [53, 57]; // Only 2 notes - insufficient
            const detected = identifyChord(activeNotes);

            expect(detected).toBeNull();
            expect(detected === null).toBe(true);
            // Should not match when detected is null
            expect(detected && detected.name === targetChord.name).toBeFalsy();
            
            console.log('[Test] ✅ Null detection handled gracefully');
        });

        it('should handle empty activeNotes', () => {
            const targetChord = { name: 'F Major', roman: 'I' };
            const activeNotes = [];
            const detected = identifyChord(activeNotes);

            expect(detected).toBeNull();
            expect(detected && detected.name === targetChord.name).toBeFalsy();
        });

        it('should require at least 3 notes for detection', () => {
            console.log('[Test] Testing minimum note requirement (3 notes)');
            console.log('[Test] WHY: Prevents false positives from intervals/dyads');
            console.log('[Test] IMPORTANCE: Ensures only complete chords are detected');
            console.log('[Test] Testing: 1 note, 2 notes (should fail), 3 notes (should work)');
            
            const targetChord = { name: 'F Major', roman: 'I' };
            
            // Test with 1 note
            expect(identifyChord([53])).toBeNull();
            
            // Test with 2 notes
            expect(identifyChord([53, 57])).toBeNull();
            
            // Test with 3 notes (should work)
            const detected = identifyChord([53, 57, 60]);
            expect(detected).not.toBeNull();
            expect(detected.name === targetChord.name).toBe(true);
            
            console.log('[Test] ✅ Minimum 3 note requirement enforced correctly');
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
            console.log('[Test] Testing F Major detection in low octave (left hand range)');
            console.log('[Test] WHY: Left hand typically plays in lower octaves - must work correctly');
            console.log('[Test] IMPORTANCE: Ensures chord practice works for left-hand chord practice');
            console.log('[Test] MIDI Range: C2-C4 (36-60), Testing F2-A2-C3');
            
            // Left piano range: 36-60 (C2-C4)
            const activeNotes = [41, 45, 48]; // F2, A2, C3
            const detected = identifyChord(activeNotes);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
            
            console.log('[Test] ✅ F Major detected correctly in low octave');
        });

        it('should detect F Major in middle octave (C4-C6 range)', () => {
            console.log('[Test] Testing F Major detection in middle/high octave (right hand range)');
            console.log('[Test] WHY: Right hand typically plays in higher octaves - must work correctly');
            console.log('[Test] IMPORTANCE: Ensures chord practice works for right-hand chord practice');
            console.log('[Test] MIDI Range: C4-C6 (60-84), Testing F4-A4-C5');
            
            // Right piano range: 60-84 (C4-C6)
            const activeNotes = [65, 69, 72]; // F4, A4, C5
            const detected = identifyChord(activeNotes);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
            
            console.log('[Test] ✅ F Major detected correctly in middle/high octave');
        });

        it('should detect F Major across octaves', () => {
            console.log('[Test] Testing F Major detection across multiple octaves');
            console.log('[Test] WHY: Real MIDI input often spans multiple octaves');
            console.log('[Test] IMPORTANCE: Ensures detection is octave-independent (pitch class based)');
            console.log('[Test] MIDI Notes: F2=41, A3=57, C5=72 (spans 3 octaves)');
            
            // Mixed octaves
            const activeNotes = [41, 57, 72]; // F2, A3, C5
            const detected = identifyChord(activeNotes);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
            
            console.log('[Test] ✅ F Major detected correctly across octaves');
        });
    });
});

