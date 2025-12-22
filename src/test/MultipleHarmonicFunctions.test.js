import { describe, it, expect } from 'vitest';
import { identifyAllChords, identifyChord } from '../core/music-theory';

/**
 * TEST SUITE: Multiple Harmonic Function Detection
 * 
 * PURPOSE: This test suite validates that the same set of notes can be detected
 * as multiple chord interpretations (e.g., Am7 and C6 both contain A, C, E, G).
 * 
 * WHY THESE TESTS ARE IMPORTANT:
 * - Users need to see all possible harmonic interpretations of what they're playing
 * - Enhances music theory understanding by showing equivalent chord voicings
 * - Validates that identifyAllChords returns all matches, not just the first one
 */

describe('Multiple Harmonic Function Detection', () => {
    describe('Am7 / C6 Case', () => {
        it('should detect both Am7 and C6 from notes A, C, E, G', () => {
            console.log('[Test] Testing Am7/C6 multiple harmonic function detection');
            console.log('[Test] WHY: Am7 and C6 contain the exact same four notes - both interpretations are valid');
            console.log('[Test] IMPORTANCE: Users need to see all possible harmonic functions');
            console.log('[Test] MIDI Notes: A3=57, C4=60, E4=64, G4=67');
            
            // A3, C4, E4, G4 - Am7 or C6
            const activeNotes = [57, 60, 64, 67];
            const allChords = identifyAllChords(activeNotes);
            
            expect(allChords.length).toBeGreaterThanOrEqual(2);
            
            // Check that both Am7 and C6 are detected
            const chordNames = allChords.map(c => c.name);
            const hasAm7 = chordNames.some(name => name === 'A Minor 7');
            const hasC6 = chordNames.some(name => name === 'C Major 6');
            
            expect(hasAm7).toBe(true);
            expect(hasC6).toBe(true);
            
            console.log('[Test] ✅ Both Am7 and C6 detected:', chordNames);
        });

        it('should verify identifyChord returns first match (backward compatibility)', () => {
            console.log('[Test] Testing backward compatibility - identifyChord returns first match');
            console.log('[Test] WHY: Existing code relies on identifyChord returning a single chord');
            console.log('[Test] IMPORTANCE: Ensures no breaking changes to existing functionality');
            
            const activeNotes = [57, 60, 64, 67]; // A, C, E, G
            const singleChord = identifyChord(activeNotes);
            const allChords = identifyAllChords(activeNotes);
            
            expect(singleChord).not.toBeNull();
            expect(allChords.length).toBeGreaterThan(0);
            // First match from identifyAllChords should match identifyChord
            expect(singleChord.name).toBe(allChords[0].name);
            
            console.log('[Test] ✅ identifyChord maintains backward compatibility');
        });
    });

    describe('New Chord Types Detection', () => {
        it('should detect C Major 6 chord', () => {
            console.log('[Test] Testing C6 chord detection');
            console.log('[Test] WHY: Major 6 chords are common extensions');
            console.log('[Test] MIDI Notes: C4=60, E4=64, G4=67, A4=69');
            
            const activeNotes = [60, 64, 67, 69]; // C, E, G, A
            const allChords = identifyAllChords(activeNotes);
            
            expect(allChords.length).toBeGreaterThan(0);
            const chordNames = allChords.map(c => c.name);
            const hasC6 = chordNames.some(name => name === 'C Major 6');
            
            expect(hasC6).toBe(true);
            console.log('[Test] ✅ C6 detected:', chordNames);
        });

        it('should detect C Add9 chord', () => {
            console.log('[Test] Testing Cadd9 chord detection');
            console.log('[Test] WHY: Add9 chords are common extensions');
            console.log('[Test] MIDI Notes: C4=60, E4=64, G4=67, D5=74');
            
            const activeNotes = [60, 64, 67, 74]; // C, E, G, D (D5 = 74, but pitch class is D = 2)
            const allChords = identifyAllChords(activeNotes);
            
            expect(allChords.length).toBeGreaterThan(0);
            const chordNames = allChords.map(c => c.name);
            const hasCadd9 = chordNames.some(name => name === 'C Add9');
            
            expect(hasCadd9).toBe(true);
            console.log('[Test] ✅ Cadd9 detected:', chordNames);
        });
    });
});

