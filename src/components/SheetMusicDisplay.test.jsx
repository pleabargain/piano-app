// 2026-02-01: Unit tests for SheetMusicDisplay component
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SheetMusicDisplay from './SheetMusicDisplay';

// Mock VexFlow to avoid DOM/canvas requirements in test environment
vi.mock('vexflow', () => ({
  Factory: vi.fn().mockImplementation(() => ({
    EasyScore: () => ({
      voice: vi.fn((notes) => notes),
      notes: vi.fn(() => []),
    }),
    System: vi.fn(() => ({
      addStave: vi.fn().mockReturnThis(),
      addClef: vi.fn().mockReturnThis(),
    })),
    draw: vi.fn(),
    getContext: vi.fn(() => ({ clear: vi.fn() })),
  })),
}));

describe('SheetMusicDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render placeholder when no chord or scale to display', () => {
    render(
      <SheetMusicDisplay
        mode="free"
        selectedRoot="C"
        selectedScaleType="major"
      />
    );
    expect(screen.getByText(/play a chord or select a scale/i)).toBeInTheDocument();
  });

  it('should have data-testid for testing', () => {
    render(
      <SheetMusicDisplay
        mode="scale"
        selectedRoot="F"
        selectedScaleType="major_pentatonic"
      />
    );
    expect(screen.getByTestId('sheet-music-display')).toBeInTheDocument();
  });

  it('should render in scale mode with selected root and scale type', () => {
    render(
      <SheetMusicDisplay
        mode="scale"
        selectedRoot="F"
        selectedScaleType="major_pentatonic"
      />
    );
    // Component should render (VexFlow is mocked, so no actual notation)
    expect(screen.getByTestId('sheet-music-display')).toBeInTheDocument();
  });

  it('should render in chord mode with detected chord', () => {
    render(
      <SheetMusicDisplay
        mode="chord"
        detectedChord={{ name: 'C Major', root: 'C', type: 'major', inversion: 'Root Position' }}
        selectedRoot="C"
        selectedScaleType="major"
      />
    );
    expect(screen.getByTestId('sheet-music-display')).toBeInTheDocument();
  });

  it('should render with progression target chord', () => {
    render(
      <SheetMusicDisplay
        mode="chord"
        progression={[
          { name: 'C Major', roman: 'I', inversion: 'Root Position' },
          { name: 'F Major', roman: 'IV', inversion: '1st Inversion' },
        ]}
        currentStepIndex={0}
        selectedRoot="C"
        selectedScaleType="major"
      />
    );
    expect(screen.getByTestId('sheet-music-display')).toBeInTheDocument();
  });
});
