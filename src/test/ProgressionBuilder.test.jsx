import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProgressionBuilder from '../components/ProgressionBuilder';

// Mock the music-theory module
vi.mock('../core/music-theory', () => ({
    getScaleNotes: vi.fn((root, type) => {
        if (root === 'F' && type === 'major') {
            return ['F', 'G', 'A', 'A#', 'C', 'D', 'E'];
        }
        if (root === 'C' && type === 'major') {
            return ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        }
        return [];
    }),
    NOTES: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
}));

describe('ProgressionBuilder Component', () => {
    let onProgressionSetMock;
    let onChordClickMock;

    beforeEach(() => {
        onProgressionSetMock = vi.fn();
        onChordClickMock = vi.fn();
        vi.clearAllMocks();
    });

    it('should render with default input', () => {
        render(
            <ProgressionBuilder
                selectedRoot="F"
                selectedScaleType="major"
                onProgressionSet={onProgressionSetMock}
                onChordClick={onChordClickMock}
            />
        );

        const input = screen.getByPlaceholderText('e.g., I IV V ii');
        expect(input).toBeInTheDocument();
        expect(input.value).toBe('I IV V I');
    });

    it('should parse and display progression preview', async () => {
        render(
            <ProgressionBuilder
                selectedRoot="F"
                selectedScaleType="major"
                onProgressionSet={onProgressionSetMock}
                onChordClick={onChordClickMock}
            />
        );

        // Wait for useEffect to parse the default input
        await waitFor(() => {
            expect(screen.getByText('I')).toBeInTheDocument();
            expect(screen.getByText('IV')).toBeInTheDocument();
            expect(screen.getByText('V')).toBeInTheDocument();
        });
    });

    it('should enable Set Progression button when valid progression is parsed', async () => {
        render(
            <ProgressionBuilder
                selectedRoot="F"
                selectedScaleType="major"
                onProgressionSet={onProgressionSetMock}
                onChordClick={onChordClickMock}
            />
        );

        const button = screen.getByText('Set Progression');
        
        // Wait for parsing to complete
        await waitFor(() => {
            expect(button).not.toBeDisabled();
        });
    });

    it('should call onProgressionSet when Set Progression button is clicked', async () => {
        render(
            <ProgressionBuilder
                selectedRoot="F"
                selectedScaleType="major"
                onProgressionSet={onProgressionSetMock}
                onChordClick={onChordClickMock}
            />
        );

        const button = screen.getByText('Set Progression');
        
        // Wait for parsing to complete
        await waitFor(() => {
            expect(button).not.toBeDisabled();
        });

        fireEvent.click(button);

        await waitFor(() => {
            expect(onProgressionSetMock).toHaveBeenCalled();
        });

        // Check that it was called with an array of chord objects
        const callArgs = onProgressionSetMock.mock.calls[0][0];
        expect(Array.isArray(callArgs)).toBe(true);
        expect(callArgs.length).toBeGreaterThan(0);
        expect(callArgs[0]).toHaveProperty('roman');
        expect(callArgs[0]).toHaveProperty('name');
    });

    it('should disable Set Progression button when input is empty', () => {
        render(
            <ProgressionBuilder
                selectedRoot="F"
                selectedScaleType="major"
                onProgressionSet={onProgressionSetMock}
                onChordClick={onChordClickMock}
            />
        );

        const input = screen.getByPlaceholderText('e.g., I IV V ii');
        const button = screen.getByText('Set Progression');

        fireEvent.change(input, { target: { value: '' } });

        expect(button).toBeDisabled();
    });

    it('should disable Set Progression button when there is an error', async () => {
        render(
            <ProgressionBuilder
                selectedRoot="F"
                selectedScaleType="major"
                onProgressionSet={onProgressionSetMock}
                onChordClick={onChordClickMock}
            />
        );

        const input = screen.getByPlaceholderText('e.g., I IV V ii');
        const button = screen.getByText('Set Progression');

        // Enter invalid input
        fireEvent.change(input, { target: { value: 'I IV V INVALID' } });

        await waitFor(() => {
            expect(button).toBeDisabled();
        });
    });

    it('should call onChordClick when a chord preview is clicked', async () => {
        render(
            <ProgressionBuilder
                selectedRoot="F"
                selectedScaleType="major"
                onProgressionSet={onProgressionSetMock}
                onChordClick={onChordClickMock}
            />
        );

        // Wait for parsing
        await waitFor(() => {
            expect(screen.getByText('I')).toBeInTheDocument();
        });

        // Find the chord preview div (it contains both roman and name)
        const chordPreview = screen.getByText('I').closest('.chord-preview');
        
        if (chordPreview) {
            fireEvent.click(chordPreview);
            expect(onChordClickMock).toHaveBeenCalled();
        }
    });

    it('should update preview when input changes', async () => {
        render(
            <ProgressionBuilder
                selectedRoot="F"
                selectedScaleType="major"
                onProgressionSet={onProgressionSetMock}
                onChordClick={onChordClickMock}
            />
        );

        const input = screen.getByPlaceholderText('e.g., I IV V ii');
        
        fireEvent.change(input, { target: { value: 'I IV' } });

        await waitFor(() => {
            expect(screen.getByText('I')).toBeInTheDocument();
            expect(screen.getByText('IV')).toBeInTheDocument();
        });
    });

    it('should handle different scale roots correctly', async () => {
        const { rerender } = render(
            <ProgressionBuilder
                selectedRoot="F"
                selectedScaleType="major"
                onProgressionSet={onProgressionSetMock}
                onChordClick={onChordClickMock}
            />
        );

        rerender(
            <ProgressionBuilder
                selectedRoot="C"
                selectedScaleType="major"
                onProgressionSet={onProgressionSetMock}
                onChordClick={onChordClickMock}
            />
        );

        // Wait for re-parsing
        await waitFor(() => {
            expect(screen.getByText('I')).toBeInTheDocument();
        });
    });
});

    it('should handle minor 7th chords correctly - ii7 vs iimaj7', async () => {
        render(
            <ProgressionBuilder
                selectedRoot="C"
                selectedScaleType="major"
                onProgressionSet={onProgressionSetMock}
                onChordClick={onChordClickMock}
            />
        );

        const input = screen.getByPlaceholderText('e.g., I IV V ii');
        
        // Test ii7 (minor 7th) - should be "D Minor 7"
        fireEvent.change(input, { target: { value: 'ii7' } });
        
        await waitFor(() => {
            const chordName = screen.getByText('D Minor 7');
            expect(chordName).toBeInTheDocument();
        });
        
        // Clear and test iimaj7 (minor-major 7th) - should be different from ii7
        fireEvent.change(input, { target: { value: 'iimaj7' } });
        
        await waitFor(() => {
            const chordElement = screen.getByText('ii');
            expect(chordElement).toBeInTheDocument();
        });
        
        // Get the chord name displayed
        const chordPreview = screen.getByText('ii').closest('.chord-preview');
        const chordNameElement = chordPreview?.querySelector('.alpha');
        const chordName = chordNameElement?.textContent;
        
        // Verify that iimaj7 produces a different result than ii7
        // Current bug: both return "D Minor 7" because ternary always returns 'minor7'
        // After fix: iimaj7 should return "D Minor Major 7" or similar
        expect(chordName).toBeDefined();
        // This test will fail with current bug, pass after fix
        expect(chordName).not.toBe('D Minor 7'); // Should be different for maj7
    });
    
    it('should handle iiM7 (minor-major 7th with capital M)', async () => {
        render(
            <ProgressionBuilder
                selectedRoot="C"
                selectedScaleType="major"
                onProgressionSet={onProgressionSetMock}
                onChordClick={onChordClickMock}
            />
        );

        const input = screen.getByPlaceholderText('e.g., I IV V ii');
        
        // Test iiM7 (minor-major 7th with capital M)
        fireEvent.change(input, { target: { value: 'iiM7' } });
        
        await waitFor(() => {
            const chordElement = screen.getByText('ii');
            expect(chordElement).toBeInTheDocument();
        });
        
        const chordPreview = screen.getByText('ii').closest('.chord-preview');
        const chordNameElement = chordPreview?.querySelector('.alpha');
        const chordName = chordNameElement?.textContent;
        
        // Should be different from regular minor 7th
        expect(chordName).toBeDefined();
        expect(chordName).not.toBe('D Minor 7'); // Should be different for M7
    });
});

