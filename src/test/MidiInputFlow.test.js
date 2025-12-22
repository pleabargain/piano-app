import { describe, it, expect, vi, beforeEach } from 'vitest';
import { identifyChord } from '../core/music-theory';

/**
 * TEST SUITE: MIDI Input Flow - Chord Detection
 * 
 * PURPOSE: This test suite validates chord detection from real MIDI input scenarios.
 * 
 * WHY THESE TESTS ARE IMPORTANT:
 * - Simulates real-world MIDI keyboard usage patterns
 * - Tests sequential note addition/removal (how users actually play)
 * - Validates chord detection across different octaves
 * - Tests inversion detection from MIDI input
 * - Edge cases prevent crashes and false detections
 * - These tests ensure the app works correctly with actual MIDI devices
 */

describe('MIDI Input Flow - Chord Detection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('MIDI Note Input to Chord Detection', () => {
        it('should detect F Major when F, A, C are pressed simultaneously', () => {
            console.log('[Test] Testing simultaneous MIDI note input (chord detection)');
            console.log('[Test] WHY: This is the primary use case - users press multiple keys at once');
            console.log('[Test] IMPORTANCE: Core functionality - must work correctly for all users');
            console.log('[Test] MIDI Notes: F3=53, A3=57, C4=60');
            
            const activeNotes = [53, 57, 60];
            
            console.log('[Test] Simulating MIDI input:', activeNotes);
            const detected = identifyChord(activeNotes);
            
            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
            console.log('[Test] ✅ F Major detected correctly');
        });

        it('should detect C Major when C, E, G are pressed simultaneously', () => {
            console.log('[Test] Testing C Major detection (most common chord)');
            console.log('[Test] WHY: C Major is the most fundamental chord - must work perfectly');
            console.log('[Test] IMPORTANCE: Regression test for the most common use case');
            console.log('[Test] MIDI Notes: C4=60, E4=64, G4=67');
            
            const activeNotes = [60, 64, 67];
            
            console.log('[Test] Simulating MIDI input:', activeNotes);
            const detected = identifyChord(activeNotes);
            
            expect(detected).not.toBeNull();
            expect(detected.name).toBe('C Major');
            console.log('[Test] ✅ C Major detected correctly');
        });

        it('should detect D Minor when D, F, A are pressed simultaneously', () => {
            console.log('[Test] Testing D Minor detection (minor chord validation)');
            console.log('[Test] WHY: Validates minor chord detection works correctly');
            console.log('[Test] IMPORTANCE: Ensures both major and minor chords are supported');
            console.log('[Test] MIDI Notes: D3=50, F3=53, A3=57');
            
            const activeNotes = [50, 53, 57];
            
            console.log('[Test] Simulating MIDI input:', activeNotes);
            const detected = identifyChord(activeNotes);
            
            expect(detected).not.toBeNull();
            expect(detected.name).toBe('D Minor');
            console.log('[Test] ✅ D Minor detected correctly');
        });

        it('should return null when only 2 notes are pressed', () => {
            console.log('[Test] Testing edge case: only 2 notes pressed');
            console.log('[Test] WHY: Prevents false chord detection from intervals/dyads');
            console.log('[Test] IMPORTANCE: Ensures only complete chords (3+ notes) are identified');
            console.log('[Test] MIDI Notes: F3=53, A3=57 (only 2 notes - insufficient)');
            
            const activeNotes = [53, 57]; // F and A only
            
            console.log('[Test] Simulating insufficient MIDI input:', activeNotes);
            const detected = identifyChord(activeNotes);
            
            expect(detected).toBeNull();
            console.log('[Test] ✅ Correctly returned null for insufficient notes');
        });

        it('should return null when no notes are pressed', () => {
            console.log('[Test] Testing edge case: no notes pressed (empty array)');
            console.log('[Test] WHY: Users release all keys - app must handle this gracefully');
            console.log('[Test] IMPORTANCE: Prevents crashes and false detections when idle');
            
            const activeNotes = [];
            
            console.log('[Test] Simulating empty MIDI input');
            const detected = identifyChord(activeNotes);
            
            expect(detected).toBeNull();
            console.log('[Test] ✅ Correctly returned null for empty input');
        });
    });

    describe('MIDI Note Sequence Handling', () => {
        it('should detect chord when notes are added sequentially', () => {
            console.log('[Test] Testing sequential note addition (realistic playing pattern)');
            console.log('[Test] WHY: Users often press keys one at a time, not simultaneously');
            console.log('[Test] IMPORTANCE: Ensures chord detection works for realistic playing styles');
            console.log('[Test] Scenario: Adding F, then A, then C - should detect F Major when complete');
            
            // Simulate adding notes one by one
            let activeNotes = [];
            
            // Add F
            activeNotes = [53];
            let detected = identifyChord(activeNotes);
            console.log('[Test] After F:', detected);
            expect(detected).toBeNull();
            
            // Add A
            activeNotes = [53, 57];
            detected = identifyChord(activeNotes);
            console.log('[Test] After F, A:', detected);
            expect(detected).toBeNull();
            
            // Add C - now should detect F Major
            activeNotes = [53, 57, 60];
            detected = identifyChord(activeNotes);
            console.log('[Test] After F, A, C:', detected);
            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
            console.log('[Test] ✅ Chord detected after all notes added');
        });

        it('should detect chord when notes are removed sequentially', () => {
            console.log('[Test] Testing sequential note removal (realistic playing pattern)');
            console.log('[Test] WHY: Users release keys one at a time - detection must update correctly');
            console.log('[Test] IMPORTANCE: Ensures UI updates correctly as users release keys');
            console.log('[Test] Scenario: Start with F Major, remove C, remove A - detection should update');
            
            // Start with F Major
            let activeNotes = [53, 57, 60];
            let detected = identifyChord(activeNotes);
            console.log('[Test] Full chord:', detected?.name);
            expect(detected.name).toBe('F Major');
            
            // Remove C
            activeNotes = [53, 57];
            detected = identifyChord(activeNotes);
            console.log('[Test] After removing C:', detected);
            expect(detected).toBeNull();
            
            // Remove A
            activeNotes = [53];
            detected = identifyChord(activeNotes);
            console.log('[Test] After removing A:', detected);
            expect(detected).toBeNull();
            
            console.log('[Test] ✅ Chord detection correctly responds to note removal');
        });
    });

    describe('Multiple Octave Detection', () => {
        it('should detect F Major in low octave', () => {
            const activeNotes = [41, 45, 48]; // F2, A2, C3
            const detected = identifyChord(activeNotes);
            
            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
            console.log('[Test] ✅ F Major detected in low octave');
        });

        it('should detect F Major in middle octave', () => {
            const activeNotes = [53, 57, 60]; // F3, A3, C4
            const detected = identifyChord(activeNotes);
            
            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
            console.log('[Test] ✅ F Major detected in middle octave');
        });

        it('should detect F Major in high octave', () => {
            const activeNotes = [65, 69, 72]; // F4, A4, C5
            const detected = identifyChord(activeNotes);
            
            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
            console.log('[Test] ✅ F Major detected in high octave');
        });

        it('should detect F Major across octaves', () => {
            const activeNotes = [41, 57, 72]; // F2, A3, C5
            const detected = identifyChord(activeNotes);
            
            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
            console.log('[Test] ✅ F Major detected across octaves');
        });
    });

    describe('Chord Inversion Detection', () => {
        it('should detect F Major root position', () => {
            console.log('[Test] Testing root position inversion detection');
            console.log('[Test] WHY: Root position is the most common voicing - must be detected correctly');
            console.log('[Test] IMPORTANCE: Users need accurate inversion feedback for learning');
            console.log('[Test] MIDI Notes: F3=53, A3=57, C4=60 (root F in bass)');
            
            const activeNotes = [53, 57, 60]; // F3, A3, C4 (root position)
            const detected = identifyChord(activeNotes);
            
            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
            expect(detected.inversion).toBe('Root Position');
            console.log('[Test] ✅ Root position detected');
        });

        it('should detect F Major 1st inversion', () => {
            console.log('[Test] Testing 1st inversion detection (3rd in bass)');
            console.log('[Test] WHY: Inversions are common in real music - users need accurate detection');
            console.log('[Test] IMPORTANCE: Enables practice of different chord voicings');
            console.log('[Test] MIDI Notes: A3=57, C4=60, F4=65 (3rd A in bass)');
            
            const activeNotes = [57, 60, 65]; // A3, C4, F4 (1st inversion)
            const detected = identifyChord(activeNotes);
            
            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
            expect(detected.inversion).toBe('1st Inversion');
            console.log('[Test] ✅ 1st inversion detected');
        });

        it('should detect F Major 2nd inversion', () => {
            console.log('[Test] Testing 2nd inversion detection (5th in bass)');
            console.log('[Test] WHY: 2nd inversion is another common voicing - must be detected');
            console.log('[Test] IMPORTANCE: Complete inversion support enables full chord practice');
            console.log('[Test] MIDI Notes: C4=60, F4=65, A4=69 (5th C in bass)');
            
            const activeNotes = [60, 65, 69]; // C4, F4, A4 (2nd inversion)
            const detected = identifyChord(activeNotes);
            
            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
            expect(detected.inversion).toBe('2nd Inversion');
            console.log('[Test] ✅ 2nd inversion detected');
        });
    });

    describe('Edge Cases', () => {
        it('should handle null activeNotes', () => {
            const detected = identifyChord(null);
            expect(detected).toBeNull();
            console.log('[Test] ✅ Handled null input');
        });

        it('should handle undefined activeNotes', () => {
            const detected = identifyChord(undefined);
            expect(detected).toBeNull();
            console.log('[Test] ✅ Handled undefined input');
        });

        it('should handle duplicate MIDI notes', () => {
            const activeNotes = [53, 53, 57, 60]; // Duplicate F
            const detected = identifyChord(activeNotes);
            
            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
            console.log('[Test] ✅ Handled duplicate notes');
        });

        it('should handle very high MIDI notes', () => {
            const activeNotes = [89, 93, 96]; // F6, A6, C7
            const detected = identifyChord(activeNotes);
            
            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
            console.log('[Test] ✅ Handled high octave notes');
        });

        it('should handle very low MIDI notes', () => {
            const activeNotes = [17, 21, 24]; // F1, A1, C2
            const detected = identifyChord(activeNotes);
            
            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
            console.log('[Test] ✅ Handled low octave notes');
        });
    });
});








