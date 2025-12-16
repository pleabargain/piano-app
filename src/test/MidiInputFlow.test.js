import { describe, it, expect, vi, beforeEach } from 'vitest';
import { identifyChord } from '../core/music-theory';

describe('MIDI Input Flow - Chord Detection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('MIDI Note Input to Chord Detection', () => {
        it('should detect F Major when F, A, C are pressed simultaneously', () => {
            // Simulate MIDI notes: F3=53, A3=57, C4=60
            const activeNotes = [53, 57, 60];
            
            console.log('[Test] Simulating MIDI input:', activeNotes);
            const detected = identifyChord(activeNotes);
            
            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
            console.log('[Test] ✅ F Major detected correctly');
        });

        it('should detect C Major when C, E, G are pressed simultaneously', () => {
            // Simulate MIDI notes: C4=60, E4=64, G4=67
            const activeNotes = [60, 64, 67];
            
            console.log('[Test] Simulating MIDI input:', activeNotes);
            const detected = identifyChord(activeNotes);
            
            expect(detected).not.toBeNull();
            expect(detected.name).toBe('C Major');
            console.log('[Test] ✅ C Major detected correctly');
        });

        it('should detect D Minor when D, F, A are pressed simultaneously', () => {
            // Simulate MIDI notes: D3=50, F3=53, A3=57
            const activeNotes = [50, 53, 57];
            
            console.log('[Test] Simulating MIDI input:', activeNotes);
            const detected = identifyChord(activeNotes);
            
            expect(detected).not.toBeNull();
            expect(detected.name).toBe('D Minor');
            console.log('[Test] ✅ D Minor detected correctly');
        });

        it('should return null when only 2 notes are pressed', () => {
            const activeNotes = [53, 57]; // F and A only
            
            console.log('[Test] Simulating insufficient MIDI input:', activeNotes);
            const detected = identifyChord(activeNotes);
            
            expect(detected).toBeNull();
            console.log('[Test] ✅ Correctly returned null for insufficient notes');
        });

        it('should return null when no notes are pressed', () => {
            const activeNotes = [];
            
            console.log('[Test] Simulating empty MIDI input');
            const detected = identifyChord(activeNotes);
            
            expect(detected).toBeNull();
            console.log('[Test] ✅ Correctly returned null for empty input');
        });
    });

    describe('MIDI Note Sequence Handling', () => {
        it('should detect chord when notes are added sequentially', () => {
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
            const activeNotes = [53, 57, 60]; // F3, A3, C4 (root position)
            const detected = identifyChord(activeNotes);
            
            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
            expect(detected.inversion).toBe('Root Position');
            console.log('[Test] ✅ Root position detected');
        });

        it('should detect F Major 1st inversion', () => {
            const activeNotes = [57, 60, 65]; // A3, C4, F4 (1st inversion)
            const detected = identifyChord(activeNotes);
            
            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
            expect(detected.inversion).toBe('1st Inversion');
            console.log('[Test] ✅ 1st inversion detected');
        });

        it('should detect F Major 2nd inversion', () => {
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






