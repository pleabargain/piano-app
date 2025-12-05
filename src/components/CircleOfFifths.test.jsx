import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CircleOfFifths from './CircleOfFifths';
import React from 'react';

describe('CircleOfFifths', () => {
    it('should apply active-minor class to C Minor segment when C Minor is detected', () => {
        const detectedChord = { root: 'C', type: 'minor', name: 'C Minor' };
        const { container } = render(
            <CircleOfFifths
                selectedRoot="C"
                onRootSelect={() => { }}
                detectedChord={detectedChord}
            />
        );

        // C Minor corresponds to Eb Major key (3 flats).
        // In our CIRCLE_OF_FIFTHS array:
        // Index 9 is { major: 'Eb', minor: 'Cm' }
        // So we expect the minor segment at index 9 to have 'active-minor'.

        // We added data-key attributes in the previous step.
        const cmSegment = container.querySelector('path[data-key="minor-Cm"]');
        expect(cmSegment).toBeTruthy();
        expect(cmSegment.classList.contains('active-minor')).toBe(true);

        // Neighbors should also be active
        // Neighbors of Cm (Eb) are Fm (Ab) and Gm (Bb) -> Indices 8 and 10
        const fmSegment = container.querySelector('path[data-key="minor-Fm"]');
        expect(fmSegment.classList.contains('active-minor')).toBe(true);

        const gmSegment = container.querySelector('path[data-key="minor-Gm"]');
        expect(gmSegment.classList.contains('active-minor')).toBe(true);
    });

    it('should apply active-minor class to F Minor segment when F Minor is detected', () => {
        const detectedChord = { root: 'F', type: 'minor', name: 'F Minor' };
        const { container } = render(
            <CircleOfFifths
                selectedRoot="C"
                onRootSelect={() => { }}
                detectedChord={detectedChord}
            />
        );

        // F Minor -> Ab Major (4 flats). Index 8.
        const fmSegment = container.querySelector('path[data-key="minor-Fm"]');
        expect(fmSegment).toBeTruthy();
        expect(fmSegment.classList.contains('active-minor')).toBe(true);
    });
    it('should call onChordClick with correct chord name when segment is clicked', async () => {
        const onChordClick = vi.fn();
        const { container } = render(
            <CircleOfFifths
                selectedRoot="C"
                onRootSelect={() => { }}
                detectedChord={null}
                onChordClick={onChordClick}
            />
        );

        // Click C Major segment
        const cMajorSegment = container.querySelector('path[data-key="major-C"]');
        await userEvent.click(cMajorSegment);
        expect(onChordClick).toHaveBeenCalledWith('C Major');

        // Click A Minor segment
        const amSegment = container.querySelector('path[data-key="minor-Am"]');
        await userEvent.click(amSegment);
        expect(onChordClick).toHaveBeenCalledWith('A Minor');
    });
});
