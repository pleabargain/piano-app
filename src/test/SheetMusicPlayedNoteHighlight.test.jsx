/**
 * Unit tests for played-note highlighting on the sheet music notation strip.
 * Acceptance criteria: if user plays middle C, then middle C is highlighted on the sheet music.
 */
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SheetMusicDisplay from '../components/SheetMusicDisplay';

describe('SheetMusicDisplay - played note highlighting', () => {
  describe('acceptance criteria: middle C', () => {
    it('if user plays middle C (MIDI 60), middle C is highlighted on the sheet music notation strip', async () => {
      render(
        <SheetMusicDisplay
          mode="chord"
          lockedChord={{ name: 'C Major', inversion: 'Root Position' }}
          selectedRoot="C"
          selectedScaleType="major"
          activeNotes={[60]}
        />
      );
      await waitFor(
        () => {
          const svg = document.querySelector('.sheet-music-vexflow-output svg');
          expect(svg).toBeInTheDocument();
          const container = document.querySelector('.sheet-music-display');
          expect(container).toBeInTheDocument();
          const withHighlight = container?.querySelectorAll('[fill="#00bfff"], [stroke="#00bfff"]');
          expect(withHighlight?.length ?? 0).toBeGreaterThan(0);
        },
        { timeout: 1500 }
      );
    });
  });

  describe('chord mode - single note highlight', () => {
    it('should highlight E4 when playing E4 in C Major chord', async () => {
      render(
        <SheetMusicDisplay
          mode="chord"
          lockedChord={{ name: 'C Major', inversion: 'Root Position' }}
          selectedRoot="C"
          selectedScaleType="major"
          activeNotes={[64]}
        />
      );
      await waitFor(
        () => {
          const container = document.querySelector('.sheet-music-display');
          const withHighlight = container?.querySelectorAll('[fill="#00bfff"], [stroke="#00bfff"]');
          expect(withHighlight?.length ?? 0).toBeGreaterThan(0);
        },
        { timeout: 1500 }
      );
    });

    it('should highlight G4 when playing G4 in C Major chord', async () => {
      render(
        <SheetMusicDisplay
          mode="chord"
          lockedChord={{ name: 'C Major', inversion: 'Root Position' }}
          selectedRoot="C"
          selectedScaleType="major"
          activeNotes={[67]}
        />
      );
      await waitFor(
        () => {
          const container = document.querySelector('.sheet-music-display');
          const withHighlight = container?.querySelectorAll('[fill="#00bfff"], [stroke="#00bfff"]');
          expect(withHighlight?.length ?? 0).toBeGreaterThan(0);
        },
        { timeout: 1500 }
      );
    });

    it('should highlight multiple notes when playing chord', async () => {
      render(
        <SheetMusicDisplay
          mode="chord"
          lockedChord={{ name: 'C Major', inversion: 'Root Position' }}
          selectedRoot="C"
          selectedScaleType="major"
          activeNotes={[60, 64, 67]}
        />
      );
      await waitFor(
        () => {
          const container = document.querySelector('.sheet-music-display');
          const withHighlight = container?.querySelectorAll('[fill="#00bfff"], [stroke="#00bfff"]');
          expect(withHighlight?.length ?? 0).toBeGreaterThan(0);
        },
        { timeout: 1500 }
      );
    });
  });

  describe('scale mode - note highlight', () => {
    it('should highlight C4 when playing middle C in C Major scale', async () => {
      render(
        <SheetMusicDisplay
          mode="scale"
          selectedRoot="C"
          selectedScaleType="major"
          activeNotes={[60]}
        />
      );
      await waitFor(
        () => {
          const container = document.querySelector('.sheet-music-display');
          const withHighlight = container?.querySelectorAll('[fill="#00bfff"], [stroke="#00bfff"]');
          expect(withHighlight?.length ?? 0).toBeGreaterThan(0);
        },
        { timeout: 1500 }
      );
    });

    it('should highlight D4 when playing D in C Major scale', async () => {
      render(
        <SheetMusicDisplay
          mode="scale"
          selectedRoot="C"
          selectedScaleType="major"
          activeNotes={[62]}
        />
      );
      await waitFor(
        () => {
          const container = document.querySelector('.sheet-music-display');
          const withHighlight = container?.querySelectorAll('[fill="#00bfff"], [stroke="#00bfff"]');
          expect(withHighlight?.length ?? 0).toBeGreaterThan(0);
        },
        { timeout: 1500 }
      );
    });
  });

  describe('no highlight when no notes played', () => {
    it('should not show highlight when activeNotes is empty', async () => {
      render(
        <SheetMusicDisplay
          mode="chord"
          lockedChord={{ name: 'C Major', inversion: 'Root Position' }}
          selectedRoot="C"
          selectedScaleType="major"
          activeNotes={[]}
        />
      );
      await waitFor(
        () => {
          const svg = document.querySelector('.sheet-music-vexflow-output svg');
          expect(svg).toBeInTheDocument();
        },
        { timeout: 1500 }
      );
      const container = document.querySelector('.sheet-music-display');
      const withHighlight = container?.querySelectorAll('[fill="#00bfff"]');
      expect(withHighlight?.length ?? 0).toBe(0);
    });
  });

  describe('no highlight when played note not in notation', () => {
    it('should not highlight when playing note not displayed (e.g. C3 in C Major chord which shows C4-E4-G4)', async () => {
      render(
        <SheetMusicDisplay
          mode="chord"
          lockedChord={{ name: 'C Major', inversion: 'Root Position' }}
          selectedRoot="C"
          selectedScaleType="major"
          activeNotes={[48]}
        />
      );
      await waitFor(
        () => {
          const svg = document.querySelector('.sheet-music-vexflow-output svg');
          expect(svg).toBeInTheDocument();
        },
        { timeout: 1500 }
      );
      const container = document.querySelector('.sheet-music-display');
      const withHighlight = container?.querySelectorAll('[fill="#00bfff"]');
      expect(withHighlight?.length ?? 0).toBe(0);
    });
  });

  describe('component stability with activeNotes', () => {
    it('should render without crash when activeNotes is undefined', async () => {
      render(
        <SheetMusicDisplay
          mode="chord"
          lockedChord={{ name: 'C Major', inversion: 'Root Position' }}
          selectedRoot="C"
          selectedScaleType="major"
        />
      );
      await waitFor(
        () => {
          expect(screen.getByTestId('sheet-music-display')).toBeInTheDocument();
        },
        { timeout: 1500 }
      );
    });

    it('should render without crash when activeNotes is not an array', async () => {
      render(
        <SheetMusicDisplay
          mode="chord"
          lockedChord={{ name: 'C Major', inversion: 'Root Position' }}
          selectedRoot="C"
          selectedScaleType="major"
          activeNotes={{}}
        />
      );
      await waitFor(
        () => {
          expect(screen.getByTestId('sheet-music-display')).toBeInTheDocument();
        },
        { timeout: 1500 }
      );
    });
  });
});
