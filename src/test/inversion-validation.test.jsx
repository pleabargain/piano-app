// https://github.com/pleabargain/piano-app
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import { midiManager } from '../core/midi-manager';
import * as musicTheory from '../core/music-theory';

// Mock MIDI Manager
vi.mock('../core/midi-manager', () => ({
    midiManager: {
        requestAccess: vi.fn(() => Promise.resolve(true)),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        setRecordingCallback: vi.fn(),
        getFirstInputName: vi.fn(() => 'Mock MIDI'),
    },
}));

describe('Triad Shape-Shifting UI Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show "Keep trying!" if the correct chord is played in the wrong inversion', async () => {
        // 1. Render App with the exercise route
        render(
            <MemoryRouter initialEntries={['/exercise/triad-shape-shifting']}>
                <App />
            </MemoryRouter>
        );

        // 2. Wait for the status message to show the target (C Major Root)
        await waitFor(() => {
            expect(screen.getByText(/Target: C Major \(Root Position\)/i)).toBeInTheDocument();
        });

        // 3. Simulate playing C Major but in 1st Inversion (E, G, C) instead of Root (C, E, G)
        const midiCallback = midiManager.addListener.mock.calls[0][0];

        // Act: simulate newly pressed notes
        // 64 (E4), 67 (G4), 72 (C5) = C Major 1st Inversion
        const notes = [64, 67, 72];

        // Trigger the callback
        midiCallback({ type: 'noteOn', note: 64, velocity: 64 }, notes);

        // 4. Verify the status message shows the "wrong inversion" feedback
        await waitFor(() => {
            const status = screen.getByTestId('status-message');
            expect(status.textContent).toMatch(/You played: 1st Inversion. Keep trying!/i);
        }, { timeout: 3000 });
    });
});
