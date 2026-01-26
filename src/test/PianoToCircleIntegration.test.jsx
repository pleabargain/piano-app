import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { midiManager } from '../core/midi-manager';

// Mock midiManager
vi.mock('../core/midi-manager', () => ({
    midiManager: {
        requestAccess: vi.fn().mockResolvedValue(true),
        getFirstInputName: vi.fn().mockReturnValue('Mock MIDI Device'),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        setRecordingCallback: vi.fn(),
    }
}));

describe('Piano to Circle of Fifths Integration', () => {
    let midiCallback;

    beforeEach(() => {
        // Capture the callback passed to addListener
        midiManager.addListener.mockImplementation((cb) => {
            midiCallback = cb;
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should highlight C Major in Circle of Fifths when C Major chord is played via MIDI', async () => {
        const { container } = render(<BrowserRouter><App /></BrowserRouter>);

        // Wait for MIDI connection
        await screen.findByText(/MIDI Connected/, {}, { timeout: 3000 });

        act(() => {
            midiCallback({ type: 'noteOn', note: 48 }, [48]);
            midiCallback({ type: 'noteOn', note: 52 }, [48, 52]);
            midiCallback({ type: 'noteOn', note: 55 }, [48, 52, 55]);
        });

        // Check if Circle of Fifths highlights C Major
        await waitFor(() => {
            const cSegment = container.querySelector('path[data-key="major-C"]');
            expect(cSegment).not.toBeNull();
            expect(cSegment.classList.contains('active-major')).toBe(true);
        }, { timeout: 3000 });

        // Also check F and G (neighbors)
        const fSegment = container.querySelector('path[data-key="major-F"]');
        const gSegment = container.querySelector('path[data-key="major-G"]');
        expect(fSegment.classList.contains('active-major')).toBe(true);
        expect(gSegment.classList.contains('active-major')).toBe(true);
    });

    it('should highlight E Minor in Circle of Fifths when E Minor chord is played via MIDI', async () => {
        const { container } = render(<BrowserRouter><App /></BrowserRouter>);

        // Wait for MIDI initialization
        await screen.findByText(/MIDI Connected/, {}, { timeout: 3000 });

        // Simulate playing E Minor (E3, G3, B3 -> 52, 55, 59)
        act(() => {
            midiCallback({ type: 'noteOn', note: 52 }, [52]);
            midiCallback({ type: 'noteOn', note: 55 }, [52, 55]);
            midiCallback({ type: 'noteOn', note: 59 }, [52, 55, 59]);
        });

        // Check Em segment (data-key="minor-Em")
        await waitFor(() => {
            const emSegment = container.querySelector('path[data-key="minor-Em"]');
            expect(emSegment).not.toBeNull();
            expect(emSegment.classList.contains('active-minor')).toBe(true);
        }, { timeout: 3000 });
    });
});
