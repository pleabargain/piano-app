import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useChordDetection } from '../hooks/useChordDetection';

describe('useChordDetection Hook', () => {
    it('should detect C Major chord', () => {
        // C3, E3, G3 (48, 52, 55)
        const activeNotes = [48, 52, 55];
        const { result } = renderHook(() => useChordDetection(activeNotes));

        expect(result.current.detectedChord).not.toBeNull();
        expect(result.current.detectedChord.name).toBe('C Major');
        // Suggestions might not be empty (e.g. C Major 7), but shouldn't contain C Major
        expect(result.current.chordSuggestions.find(s => s.name === 'C Major')).toBeUndefined();
    });

    it('should detect E Minor chord', () => {
        // E3, G3, B3 (52, 55, 59)
        const activeNotes = [52, 55, 59];
        const { result } = renderHook(() => useChordDetection(activeNotes));

        expect(result.current.detectedChord).not.toBeNull();
        expect(result.current.detectedChord.name).toBe('E Minor');
    });

    it('should provide suggestions for incomplete chord', () => {
        // C3, E3 (48, 52) - Missing G for C Major
        const activeNotes = [48, 52];
        const { result } = renderHook(() => useChordDetection(activeNotes));

        expect(result.current.detectedChord).toBeNull();
        expect(result.current.chordSuggestions.length).toBeGreaterThan(0);
        // Should suggest C Major
        const cMajorSuggestion = result.current.chordSuggestions.find(s => s.name === 'C Major');
        expect(cMajorSuggestion).toBeTruthy();
    });

    it('should return null for empty notes', () => {
        const activeNotes = [];
        const { result } = renderHook(() => useChordDetection(activeNotes));

        expect(result.current.detectedChord).toBeNull();
        expect(result.current.chordSuggestions).toEqual([]);
    });
});
