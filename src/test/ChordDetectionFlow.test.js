import { describe, it, expect, vi, beforeEach } from 'vitest';
import { identifyChord, getScaleNotes } from '../core/music-theory';

/**
 * TEST SUITE: Chord Detection Flow - End-to-End
 * 
 * PURPOSE: This test suite validates the complete chord detection workflow including progression matching.
 * 
 * WHY THESE TESTS ARE IMPORTANT:
 * - Tests the full user flow: MIDI input → chord detection → progression matching
 * - Validates chord practice mode works correctly (matching detected chords to target chords)
 * - Ensures chord name normalization works for comparison
 * - Tests progression advancement logic
 * - Edge cases prevent crashes and false matches
 */

describe('Chord Detection Flow - End-to-End', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Full Chord Detection Flow', () => {
        it('should detect F Major from MIDI notes and match progression target', () => {
            console.log('[Test] Testing F Major detection and progression matching');
            console.log('[Test] WHY: This tests the core user flow in chord practice mode');
            console.log('[Test] IMPORTANCE: Users need accurate detection to advance through progressions');
            console.log('[Test] MIDI Notes: F3=53, A3=57, C4=60');
            
            const progression = [
                { name: 'F Major', roman: 'I' },
                { name: 'A# Major', roman: 'IV' },
                { name: 'C Major', roman: 'V' }
            ];

            const targetChord = progression[0];
            const activeNotes = [53, 57, 60]; // F3, A3, C4

            console.log('[Test] Target chord:', targetChord);
            const detected = identifyChord(activeNotes);
            console.log('[Test] Detected chord:', detected);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
            expect(detected.name).toBe(targetChord.name);
            
            console.log('[Test] ✅ F Major detected and matched progression target');
        });

        it('should detect A# Major from MIDI notes and match progression target', () => {
            console.log('[Test] Testing A# Major detection with sharp root');
            console.log('[Test] WHY: Validates detection works with sharp/flat roots in progressions');
            console.log('[Test] IMPORTANCE: Ensures all chromatic roots work in chord practice mode');
            console.log('[Test] MIDI Notes: A#3=58, D4=62, F4=65');
            
            const progression = [
                { name: 'F Major', roman: 'I' },
                { name: 'A# Major', roman: 'IV' },
                { name: 'C Major', roman: 'V' }
            ];

            const targetChord = progression[1];
            const activeNotes = [58, 62, 65]; // A#3, D4, F4

            console.log('[Test] Target chord:', targetChord);
            const detected = identifyChord(activeNotes);
            console.log('[Test] Detected chord:', detected);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe('A# Major');
            expect(detected.name).toBe(targetChord.name);
            
            console.log('[Test] ✅ A# Major detected and matched progression target');
        });

        it('should detect C Major from MIDI notes and match progression target', () => {
            console.log('[Test] Testing C Major detection in progression context');
            console.log('[Test] WHY: Validates progression matching works for different chord positions');
            console.log('[Test] IMPORTANCE: Ensures users can practice full progressions correctly');
            console.log('[Test] MIDI Notes: C4=60, E4=64, G4=67');
            
            const progression = [
                { name: 'F Major', roman: 'I' },
                { name: 'A# Major', roman: 'IV' },
                { name: 'C Major', roman: 'V' }
            ];

            const targetChord = progression[2];
            const activeNotes = [60, 64, 67]; // C4, E4, G4

            console.log('[Test] Target chord:', targetChord);
            const detected = identifyChord(activeNotes);
            console.log('[Test] Detected chord:', detected);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe('C Major');
            expect(detected.name).toBe(targetChord.name);
            
            console.log('[Test] ✅ C Major detected and matched progression target');
        });
    });

    describe('Chord Name Normalization', () => {
        it('should normalize chord names correctly for comparison', () => {
            console.log('[Test] Testing chord name normalization function');
            console.log('[Test] WHY: Chord names come in different formats - need consistent comparison');
            console.log('[Test] IMPORTANCE: Enables matching between detected chords and progression targets');
            console.log('[Test] Tests: "F Major", "F", "Dm", "D Minor" formats');
            
            const normalizeChordName = (name) => {
                if (!name) return '';
                if (name.includes('Major') || name.includes('Minor') || name.includes('Diminished') || name.includes('Augmented')) {
                    return name;
                }
                if (name.endsWith('m')) {
                    return name.slice(0, -1) + ' Minor';
                }
                return name + ' Major';
            };

            expect(normalizeChordName('F Major')).toBe('F Major');
            expect(normalizeChordName('F')).toBe('F Major');
            expect(normalizeChordName('Dm')).toBe('D Minor');
            expect(normalizeChordName('D Minor')).toBe('D Minor');
            
            console.log('[Test] ✅ Chord name normalization works for all formats');
        });

        it('should match normalized chord names', () => {
            console.log('[Test] Testing normalized chord name matching');
            console.log('[Test] WHY: Validates the matching logic used in chord practice mode');
            console.log('[Test] IMPORTANCE: Ensures users get credit for playing correct chords even with format differences');
            
            const normalizeChordName = (name) => {
                if (!name) return '';
                if (name.includes('Major') || name.includes('Minor') || name.includes('Diminished') || name.includes('Augmented')) {
                    return name;
                }
                if (name.endsWith('m')) {
                    return name.slice(0, -1) + ' Minor';
                }
                return name + ' Major';
            };

            const targetChord = { name: 'F Major' };
            const detected = identifyChord([53, 57, 60]); // F Major

            expect(detected).not.toBeNull();
            const normalizedTarget = normalizeChordName(targetChord.name);
            const normalizedDetected = normalizeChordName(detected.name);
            expect(normalizedDetected).toBe(normalizedTarget);
            
            console.log('[Test] ✅ Normalized names match correctly');
        });
    });

    describe('Progression Advancement Logic', () => {
        it('should correctly identify when to advance to next chord', () => {
            console.log('[Test] Testing progression advancement logic');
            console.log('[Test] WHY: This is the core logic that advances users through chord progressions');
            console.log('[Test] IMPORTANCE: Users need accurate progression advancement for effective practice');
            console.log('[Test] Scenario: Playing correct target chord should trigger advancement');
            
            const progression = [
                { name: 'F Major', roman: 'I' },
                { name: 'A# Major', roman: 'IV' },
                { name: 'C Major', roman: 'V' }
            ];

            let currentStepIndex = 0;
            const targetChord = progression[currentStepIndex];
            const activeNotes = [53, 57, 60]; // F Major

            const detected = identifyChord(activeNotes);
            const normalizeChordName = (name) => {
                if (!name) return '';
                if (name.includes('Major') || name.includes('Minor') || name.includes('Diminished') || name.includes('Augmented')) {
                    return name;
                }
                if (name.endsWith('m')) {
                    return name.slice(0, -1) + ' Minor';
                }
                return name + ' Major';
            };

            const normalizedTarget = normalizeChordName(targetChord.name);
            const normalizedDetected = detected ? normalizeChordName(detected.name) : '';

            const shouldAdvance = detected && normalizedDetected === normalizedTarget;
            expect(shouldAdvance).toBe(true);
            
            console.log('[Test] ✅ Progression advancement logic works correctly');
        });

        it('should not advance when wrong chord is played', () => {
            console.log('[Test] Testing progression advancement prevention for wrong chords');
            console.log('[Test] WHY: Users should not advance when playing incorrect chords');
            console.log('[Test] IMPORTANCE: Prevents false progression and ensures accurate practice');
            console.log('[Test] Scenario: Playing C Major when F Major is target should NOT advance');
            
            const progression = [
                { name: 'F Major', roman: 'I' },
                { name: 'A# Major', roman: 'IV' }
            ];

            let currentStepIndex = 0;
            const targetChord = progression[currentStepIndex];
            const activeNotes = [60, 64, 67]; // C Major (wrong chord)

            const detected = identifyChord(activeNotes);
            const normalizeChordName = (name) => {
                if (!name) return '';
                if (name.includes('Major') || name.includes('Minor') || name.includes('Diminished') || name.includes('Augmented')) {
                    return name;
                }
                if (name.endsWith('m')) {
                    return name.slice(0, -1) + ' Minor';
                }
                return name + ' Major';
            };

            const normalizedTarget = normalizeChordName(targetChord.name);
            const normalizedDetected = detected ? normalizeChordName(detected.name) : '';

            const shouldAdvance = detected && normalizedDetected === normalizedTarget;
            expect(shouldAdvance).toBe(false);
            
            console.log('[Test] ✅ Correctly prevents advancement for wrong chord');
        });
    });

    describe('Edge Cases', () => {
        it('should handle insufficient notes gracefully', () => {
            console.log('[Test] Testing edge case: insufficient notes (2 notes)');
            console.log('[Test] WHY: Prevents crashes and false positives when users play partial chords');
            console.log('[Test] IMPORTANCE: Ensures robust error handling for edge cases');
            
            const activeNotes = [53, 57]; // Only 2 notes
            const detected = identifyChord(activeNotes);
            expect(detected).toBeNull();
            
            console.log('[Test] ✅ Handled insufficient notes gracefully');
        });

        it('should handle empty activeNotes array', () => {
            console.log('[Test] Testing edge case: empty notes array');
            console.log('[Test] WHY: Users may release all keys - app should handle this gracefully');
            console.log('[Test] IMPORTANCE: Prevents crashes when no notes are active');
            
            const activeNotes = [];
            const detected = identifyChord(activeNotes);
            expect(detected).toBeNull();
            
            console.log('[Test] ✅ Handled empty notes array gracefully');
        });

        it('should handle null activeNotes', () => {
            console.log('[Test] Testing edge case: null input');
            console.log('[Test] WHY: Defensive programming - handle unexpected null values');
            console.log('[Test] IMPORTANCE: Prevents crashes from null/undefined inputs');
            
            const detected = identifyChord(null);
            expect(detected).toBeNull();
            
            console.log('[Test] ✅ Handled null input gracefully');
        });

        it('should detect chords in different octaves', () => {
            console.log('[Test] Testing chord detection across different octaves');
            console.log('[Test] WHY: Real MIDI input spans multiple octaves - detection must be octave-independent');
            console.log('[Test] IMPORTANCE: Ensures pitch class matching works correctly (not octave-dependent)');
            console.log('[Test] Testing: F Major in low (F2-A2-C3), mid (F3-A3-C4), high (F4-A4-C5) octaves');
            
            // F Major in different octaves
            const fMajorLow = identifyChord([41, 45, 48]); // F2, A2, C3
            const fMajorMid = identifyChord([53, 57, 60]); // F3, A3, C4
            const fMajorHigh = identifyChord([65, 69, 72]); // F4, A4, C5

            expect(fMajorLow).not.toBeNull();
            expect(fMajorMid).not.toBeNull();
            expect(fMajorHigh).not.toBeNull();

            expect(fMajorLow.name).toBe('F Major');
            expect(fMajorMid.name).toBe('F Major');
            expect(fMajorHigh.name).toBe('F Major');
            
            console.log('[Test] ✅ F Major detected correctly in all octaves');
        });
    });
});

