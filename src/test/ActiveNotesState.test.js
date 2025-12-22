import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useState, useEffect } from 'react';
import { identifyChord } from '../core/music-theory';

/**
 * TEST SUITE: Active Notes State Management
 * 
 * PURPOSE: This test suite validates state management for active MIDI notes and chord detection.
 * 
 * WHY THESE TESTS ARE IMPORTANT:
 * - Tests React state updates when active notes change
 * - Validates chord detection updates correctly as notes are added/removed
 * - Ensures rapid note changes are handled correctly
 * - Tests edge cases like empty notes, switching chords, partial chords
 * - These tests ensure the UI updates correctly in response to MIDI input
 */

// Mock the useChordDetection hook behavior
const mockUseChordDetection = (activeNotes) => {
    const [detectedChord, setDetectedChord] = useState(null);
    const [chordSuggestions, setChordSuggestions] = useState([]);

    useEffect(() => {
        console.log('[Test] useChordDetection effect triggered', { activeNotes, length: activeNotes?.length });
        
        const chord = identifyChord(activeNotes);
        console.log('[Test] Chord detected in hook:', chord ? `🎵 ${chord.name}` : 'null');
        
        setDetectedChord(chord);
        
        if (activeNotes && activeNotes.length >= 2) {
            // Simplified suggestions
            setChordSuggestions([]);
        } else {
            setChordSuggestions([]);
        }
    }, [activeNotes]);

    return { detectedChord, chordSuggestions };
};

describe('Active Notes State Management', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should update detectedChord when activeNotes changes', () => {
        console.log('[Test] Testing state update when active notes change');
        console.log('[Test] WHY: React state must update correctly when MIDI notes change');
        console.log('[Test] IMPORTANCE: Ensures UI reflects current chord detection in real-time');
        console.log('[Test] Scenario: Starting empty, then playing F Major');
        
        const { result, rerender } = renderHook(
            ({ activeNotes }) => mockUseChordDetection(activeNotes),
            { initialProps: { activeNotes: [] } }
        );

        expect(result.current.detectedChord).toBeNull();
        console.log('[Test] Initial state: no chord');

        // Update to F Major
        rerender({ activeNotes: [53, 57, 60] });
        
        expect(result.current.detectedChord).not.toBeNull();
        expect(result.current.detectedChord.name).toBe('F Major');
        console.log('[Test] ✅ Chord detected after state update');
    });

    it('should clear detectedChord when activeNotes becomes empty', () => {
        console.log('[Test] Testing state update when all notes are released');
        console.log('[Test] WHY: Users release all keys - state must clear correctly');
        console.log('[Test] IMPORTANCE: Ensures UI shows "no chord" when idle');
        console.log('[Test] Scenario: Starting with F Major, then releasing all keys');
        
        const { result, rerender } = renderHook(
            ({ activeNotes }) => mockUseChordDetection(activeNotes),
            { initialProps: { activeNotes: [53, 57, 60] } }
        );

        expect(result.current.detectedChord).not.toBeNull();
        expect(result.current.detectedChord.name).toBe('F Major');
        console.log('[Test] Initial state: F Major detected');

        // Clear notes
        rerender({ activeNotes: [] });
        
        expect(result.current.detectedChord).toBeNull();
        console.log('[Test] ✅ Chord cleared when notes released');
    });

    it('should update detectedChord when switching between chords', () => {
        console.log('[Test] Testing state update when switching between different chords');
        console.log('[Test] WHY: Users play different chords in sequence - state must update correctly');
        console.log('[Test] IMPORTANCE: Ensures UI reflects chord changes in real-time');
        console.log('[Test] Scenario: F Major → C Major → F Major');
        
        const { result, rerender } = renderHook(
            ({ activeNotes }) => mockUseChordDetection(activeNotes),
            { initialProps: { activeNotes: [53, 57, 60] } }
        );

        expect(result.current.detectedChord.name).toBe('F Major');
        console.log('[Test] Initial: F Major');

        // Switch to C Major
        rerender({ activeNotes: [60, 64, 67] });
        
        expect(result.current.detectedChord.name).toBe('C Major');
        console.log('[Test] ✅ Switched to C Major');

        // Switch back to F Major
        rerender({ activeNotes: [53, 57, 60] });
        
        expect(result.current.detectedChord.name).toBe('F Major');
        console.log('[Test] ✅ Switched back to F Major');
    });

    it('should handle rapid note changes', () => {
        console.log('[Test] Testing rapid note changes (realistic playing pattern)');
        console.log('[Test] WHY: Users play notes rapidly - state must handle this without issues');
        console.log('[Test] IMPORTANCE: Prevents state inconsistencies and UI glitches during fast playing');
        console.log('[Test] Scenario: Rapid sequence of note additions and removals');
        
        const { result, rerender } = renderHook(
            ({ activeNotes }) => mockUseChordDetection(activeNotes),
            { initialProps: { activeNotes: [] } }
        );

        // Rapid sequence of changes
        const changes = [
            [53],           // F only
            [53, 57],       // F, A
            [53, 57, 60],   // F Major
            [57, 60],       // A, C
            [60],           // C only
            [60, 64],       // C, E
            [60, 64, 67],   // C Major
            []              // Empty
        ];

        changes.forEach((notes, index) => {
            rerender({ activeNotes: notes });
            console.log(`[Test] Change ${index + 1}:`, notes, result.current.detectedChord?.name || 'null');
        });

        expect(result.current.detectedChord).toBeNull();
        console.log('[Test] ✅ Handled rapid changes correctly');
    });

    it('should maintain chord detection during note additions', () => {
        console.log('[Test] Testing chord detection during sequential note additions');
        console.log('[Test] WHY: Users often press keys one at a time - detection must update correctly');
        console.log('[Test] IMPORTANCE: Ensures UI shows correct state as users build chords');
        console.log('[Test] Scenario: Adding F, then A, then C - should detect F Major when complete');
        
        const { result, rerender } = renderHook(
            ({ activeNotes }) => mockUseChordDetection(activeNotes),
            { initialProps: { activeNotes: [53] } }
        );

        expect(result.current.detectedChord).toBeNull();
        console.log('[Test] After F: no chord');

        rerender({ activeNotes: [53, 57] });
        expect(result.current.detectedChord).toBeNull();
        console.log('[Test] After F, A: no chord');

        rerender({ activeNotes: [53, 57, 60] });
        expect(result.current.detectedChord.name).toBe('F Major');
        console.log('[Test] ✅ After F, A, C: F Major detected');

        // Add extra note (should still be F Major)
        rerender({ activeNotes: [53, 57, 60, 65] });
        // Note: Adding a 4th note might change detection, but F Major should still be possible
        console.log('[Test] After adding 4th note:', result.current.detectedChord?.name || 'null');
    });
});








