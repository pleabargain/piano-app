import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useChordDetection } from '../hooks/useChordDetection';

/**
 * TEST SUITE: useChordDetection Hook
 * 
 * PURPOSE: This test suite validates the useChordDetection React hook functionality.
 * 
 * WHY THESE TESTS ARE IMPORTANT:
 * - The hook is used throughout the app for chord detection
 * - Tests that the hook correctly detects chords from active notes
 * - Validates chord suggestions work for incomplete chords
 * - Ensures the hook handles edge cases (empty notes, null values)
 * - These tests ensure the hook integrates correctly with the music theory core
 */

describe('useChordDetection Hook', () => {
    it('should detect C Major chord', () => {
        console.log('[Test] Testing useChordDetection hook with C Major');
        console.log('[Test] WHY: This hook is used throughout the app - must work correctly');
        console.log('[Test] IMPORTANCE: Core functionality - all chord detection goes through this hook');
        console.log('[Test] MIDI Notes: C3=48, E3=52, G3=55');
        
        // C3, E3, G3 (48, 52, 55)
        const activeNotes = [48, 52, 55];
        const { result } = renderHook(() => useChordDetection(activeNotes));

        expect(result.current.detectedChord).not.toBeNull();
        expect(result.current.detectedChord.name).toBe('C Major');
        // Suggestions might not be empty (e.g. C Major 7), but shouldn't contain C Major
        expect(result.current.chordSuggestions.find(s => s.name === 'C Major')).toBeUndefined();
        
        console.log('[Test] ✅ C Major detected correctly by hook');
    });

    it('should detect E Minor chord', () => {
        console.log('[Test] Testing useChordDetection hook with E Minor');
        console.log('[Test] WHY: Validates hook works for minor chords, not just major');
        console.log('[Test] IMPORTANCE: Ensures hook supports all chord types');
        console.log('[Test] MIDI Notes: E3=52, G3=55, B3=59');
        
        // E3, G3, B3 (52, 55, 59)
        const activeNotes = [52, 55, 59];
        const { result } = renderHook(() => useChordDetection(activeNotes));

        expect(result.current.detectedChord).not.toBeNull();
        expect(result.current.detectedChord.name).toBe('E Minor');
        
        console.log('[Test] ✅ E Minor detected correctly by hook');
    });

    it('should provide suggestions for incomplete chord', () => {
        console.log('[Test] Testing chord suggestions for incomplete chords');
        console.log('[Test] WHY: Users often play partial chords - suggestions help them complete them');
        console.log('[Test] IMPORTANCE: Enhances learning by showing what chord could be completed');
        console.log('[Test] MIDI Notes: C3=48, E3=52 (missing G for C Major)');
        
        // C3, E3 (48, 52) - Missing G for C Major
        const activeNotes = [48, 52];
        const { result } = renderHook(() => useChordDetection(activeNotes));

        expect(result.current.detectedChord).toBeNull();
        expect(result.current.chordSuggestions.length).toBeGreaterThan(0);
        // Should suggest C Major
        const cMajorSuggestion = result.current.chordSuggestions.find(s => s.name === 'C Major');
        expect(cMajorSuggestion).toBeTruthy();
        
        console.log('[Test] ✅ Chord suggestions provided for incomplete chord');
    });

    it('should return null for empty notes', () => {
        console.log('[Test] Testing edge case: empty notes array');
        console.log('[Test] WHY: Users release all keys - hook must handle this gracefully');
        console.log('[Test] IMPORTANCE: Prevents crashes and false detections when idle');
        
        const activeNotes = [];
        const { result } = renderHook(() => useChordDetection(activeNotes));

        expect(result.current.detectedChord).toBeNull();
        expect(result.current.chordSuggestions).toEqual([]);
        
        console.log('[Test] ✅ Hook correctly handles empty notes');
    });
});
