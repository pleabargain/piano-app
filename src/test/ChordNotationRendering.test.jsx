// 2026-02-13: Unit tests verifying chord notation is rendered (no "Unable to render notation")
// Uses real VexFlow - no mock - to validate the actual notation pipeline.
// The primary assertion: chords render without the error message from the VexFlow catch block.
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SheetMusicDisplay from '../components/SheetMusicDisplay';

describe('Chord notation rendering', () => {
  it('should render G Major chord as notation without showing error', async () => {
    render(
      <SheetMusicDisplay
        mode="chord"
        lockedChord={{ name: 'G Major', inversion: 'Root Position' }}
        selectedRoot="G"
        selectedScaleType="major"
      />
    );

    // Wait for async render (document.fonts.ready + setTimeout 50–100ms)
    await waitFor(
      () => {
        const errorMsg = screen.queryByText(/unable to render notation/i);
        expect(errorMsg).not.toBeInTheDocument();
      },
      { timeout: 500 }
    );

    // Placeholder should not be shown when chord notation is displayed
    const placeholder = screen.queryByText(/play a chord or select a scale/i);
    expect(placeholder).not.toBeInTheDocument();
  });

  it('should render C Major chord from detectedChord as notation', async () => {
    render(
      <SheetMusicDisplay
        mode="free"
        detectedChord={{
          name: 'C Major',
          root: 'C',
          type: 'major',
          inversion: 'Root Position',
        }}
        selectedRoot="C"
        selectedScaleType="major"
      />
    );

    await waitFor(
      () => {
        const errorMsg = screen.queryByText(/unable to render notation/i);
        expect(errorMsg).not.toBeInTheDocument();
      },
      { timeout: 500 }
    );

    const placeholder = screen.queryByText(/play a chord or select a scale/i);
    expect(placeholder).not.toBeInTheDocument();
  });

  it('should render chord from progression target as notation', async () => {
    render(
      <SheetMusicDisplay
        mode="chord"
        progression={[
          { name: 'F Major', roman: 'IV', inversion: 'Root Position' },
        ]}
        currentStepIndex={0}
        selectedRoot="C"
        selectedScaleType="major"
      />
    );

    await waitFor(
      () => {
        const errorMsg = screen.queryByText(/unable to render notation/i);
        expect(errorMsg).not.toBeInTheDocument();
      },
      { timeout: 500 }
    );

    const placeholder = screen.queryByText(/play a chord or select a scale/i);
    expect(placeholder).not.toBeInTheDocument();
  });
});
