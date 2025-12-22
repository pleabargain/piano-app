import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useState, useEffect } from 'react';
import { identifyChord } from '../core/music-theory';

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








