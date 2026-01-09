import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { NOTES } from '../core/music-theory';

// Mock MIDI Manager
vi.mock('../core/midi-manager', () => ({
    midiManager: {
        requestAccess: vi.fn(() => Promise.resolve(false)),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        getFirstInputName: vi.fn(),
    },
}));

describe('Circle of Fifths Integration', () => {
    it('should show correct keys on keyboard when clicking any chord in Circle of Fifths', async () => {
        const { container } = render(<App />);

        // Switch to Chord Practice mode to ensure the UI is in the correct state
        const chordModeBtn = screen.getByText('Chord Practice');
        fireEvent.click(chordModeBtn);

        // List of all expected chords from Circle of Fifths
        // We'll check a few critical ones including the reported broken one (Eb)
        // and a mix of majors and minors.
        const testCases = [
            { label: 'C Major', selector: 'path[data-key="major-C"]', expectedRoot: 'C' },
            { label: 'G Major', selector: 'path[data-key="major-G"]', expectedRoot: 'G' },
            { label: 'Eb Major', selector: 'path[data-key="major-Eb"]', expectedRoot: 'D#' }, // Eb -> D#
            { label: 'C Minor', selector: 'path[data-key="minor-Cm"]', expectedRoot: 'C' },
            { label: 'F Minor', selector: 'path[data-key="minor-Fm"]', expectedRoot: 'F' },
            { label: 'Bb Major', selector: 'path[data-key="major-Bb"]', expectedRoot: 'A#' }, // Bb -> A#
        ];

        for (const testCase of testCases) {
            // Find the segment
            const segment = container.querySelector(testCase.selector);
            expect(segment).toBeTruthy();

            // Click it
            fireEvent.click(segment);

            // Check if keys are highlighted in the Unified Piano
            // We look for keys with class 'chord-note' inside the unified piano section
            const unifiedPiano = container.querySelector('.piano-section.unified-piano');
            expect(unifiedPiano).toBeTruthy();
            const highlightedKeys = unifiedPiano.querySelectorAll('.key.chord-note');
            expect(highlightedKeys.length).toBeGreaterThan(0);

            // Verify at least the root note is highlighted
            // The piano keys have data-note attribute, e.g., "C", "C#", etc.
            const rootKey = Array.from(highlightedKeys).find(k => k.getAttribute('data-note') === testCase.expectedRoot);

            if (!rootKey) {
                console.error(`Failed to find root key ${testCase.expectedRoot} for ${testCase.label}`);
            }

            expect(highlightedKeys.length).toBeGreaterThan(0);
            expect(rootKey).toBeTruthy();
        }
    });
});
