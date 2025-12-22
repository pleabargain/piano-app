import { describe, it, expect } from 'vitest';
import { identifyChord } from '../core/music-theory';

/**
 * TEST SUITE: Basic Chord Detection Logic
 * 
 * PURPOSE: This test suite validates the core chord detection functionality.
 * 
 * WHY THESE TESTS ARE IMPORTANT:
 * - Chord detection is the foundation of the application - users need accurate chord identification
 * - These tests ensure basic major and minor chords are detected correctly
 * - Edge case testing (insufficient notes) prevents false positives
 * - These are regression tests to ensure core functionality never breaks
 */

describe('Chord Detection Logic', () => {
    it('should identify E Minor from MIDI notes 52, 55, 59', () => {
        console.log('[Test] Testing E Minor chord detection');
        console.log('[Test] WHY: Minor chords are fundamental - users need accurate detection');
        console.log('[Test] IMPORTANCE: Validates minor chord interval pattern [3, 7] works correctly');
        console.log('[Test] MIDI Notes: E3=52, G3=55, B3=59');
        
        const activeNotes = [52, 55, 59];
        const result = identifyChord(activeNotes);

        expect(result).not.toBeNull();
        expect(result.root).toBe('E');
        expect(result.type).toBe('minor');
        expect(result.name).toBe('E Minor');
        
        console.log('[Test] ✅ E Minor correctly detected:', result);
    });

    it('should identify C Major from MIDI notes 48, 52, 55', () => {
        console.log('[Test] Testing C Major chord detection');
        console.log('[Test] WHY: Major chords are the most common - this is a critical test');
        console.log('[Test] IMPORTANCE: Validates major chord interval pattern [4, 7] works correctly');
        console.log('[Test] MIDI Notes: C3=48, E3=52, G3=55');
        
        const activeNotes = [48, 52, 55];
        const result = identifyChord(activeNotes);

        expect(result).not.toBeNull();
        expect(result.root).toBe('C');
        expect(result.type).toBe('major');
        expect(result.name).toBe('C Major');
        
        console.log('[Test] ✅ C Major correctly detected:', result);
    });

    it('should return null for insufficient notes', () => {
        console.log('[Test] Testing edge case: insufficient notes (only 2 notes)');
        console.log('[Test] WHY: Prevents false positives - 2 notes cannot form a chord');
        console.log('[Test] IMPORTANCE: Ensures the app doesn\'t incorrectly identify partial notes as chords');
        console.log('[Test] MIDI Notes: E3=52, G3=55 (only 2 notes - insufficient)');
        
        const activeNotes = [52, 55]; // Just E and G
        const result = identifyChord(activeNotes);
        
        expect(result).toBeNull();
        console.log('[Test] ✅ Correctly returned null for insufficient notes');
    });
});
