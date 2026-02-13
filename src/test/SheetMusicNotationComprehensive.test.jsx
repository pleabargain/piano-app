// 2026-02-13: Comprehensive unit tests for notation rendering - catch ALL cases that could show "Unable to render notation"
// Covers: chord types, roots, inversions, scale mode, i-vi-ii-v progression, detected chord, locked chord
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SheetMusicDisplay from '../components/SheetMusicDisplay';
import { generateProgressionFromRomanPattern } from '../core/exercise-config';

const assertNoNotationError = async (timeout = 600) => {
  await waitFor(
    () => {
      const errorMsg = screen.queryByText(/unable to render notation/i);
      expect(errorMsg).not.toBeInTheDocument();
    },
    { timeout }
  );
};

describe('SheetMusicDisplay notation - comprehensive coverage', () => {
  describe('Chord types (all must render)', () => {
    const chordNames = [
      'C Major', 'C Minor', 'C Diminished', 'C Augmented',
      'C Sus2', 'C Sus4', 'C Major 7', 'C Minor 7', 'C Dominant 7',
    ];
    chordNames.forEach((chordName) => {
      it(`should render ${chordName} as notation`, async () => {
        render(
          <SheetMusicDisplay
            mode="chord"
            lockedChord={{ name: chordName, inversion: 'Root Position' }}
            selectedRoot="C"
            selectedScaleType="major"
          />
        );
        await assertNoNotationError();
      });
    });
  });

  describe('All 12 roots (sharps)', () => {
    const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    roots.forEach((root) => {
      it(`should render ${root} Major chord as notation`, async () => {
        render(
          <SheetMusicDisplay
            mode="chord"
            lockedChord={{ name: `${root} Major`, inversion: 'Root Position' }}
            selectedRoot={root}
            selectedScaleType="major"
          />
        );
        await assertNoNotationError();
      });
    });
  });

  describe('Inversions (0, 1, 2, 3)', () => {
    const inversions = ['Root Position', '1st Inversion', '2nd Inversion', '3rd Inversion'];
    inversions.forEach((inv) => {
      it(`should render G Major ${inv} as notation`, async () => {
        render(
          <SheetMusicDisplay
            mode="chord"
            lockedChord={{ name: 'G Major', inversion: inv }}
            selectedRoot="G"
            selectedScaleType="major"
          />
        );
        await assertNoNotationError();
      });
    });
  });

  describe('I-vi-ii-V chords (i-vi-ii-v-lesson-g: G–Em–Am–D)', () => {
    const iViIiVChords = [
      { name: 'G Major', inversion: 'Root Position' },
      { name: 'E Minor', inversion: 'Root Position' },
      { name: 'A Minor', inversion: 'Root Position' },
      { name: 'D Major', inversion: 'Root Position' },
    ];
    iViIiVChords.forEach((chord) => {
      it(`should render ${chord.name} ${chord.inversion} as notation`, async () => {
        render(
          <SheetMusicDisplay
            mode="chord"
            lockedChord={chord}
            selectedRoot="G"
            selectedScaleType="major"
          />
        );
        await assertNoNotationError();
      });
    });
  });

  describe('B Minor (reported failure case)', () => {
    it('should render B Minor Root Position as notation', async () => {
      render(
        <SheetMusicDisplay
          mode="chord"
          lockedChord={{ name: 'B Minor', inversion: 'Root Position' }}
          selectedRoot="G"
          selectedScaleType="major"
        />
      );
      await assertNoNotationError();
    });
    it('should render B Minor 1st Inversion as notation', async () => {
      render(
        <SheetMusicDisplay
          mode="chord"
          lockedChord={{ name: 'B Minor', inversion: '1st Inversion' }}
          selectedRoot="G"
          selectedScaleType="major"
        />
      );
      await assertNoNotationError();
    });
  });

  describe('Progression from i-vi-ii-v-lesson-g', () => {
    it('should render all chords from generateProgressionFromRomanPattern I vi ii V G', async () => {
      const progression = generateProgressionFromRomanPattern('I vi ii V', 'G', 'major');
      expect(progression.length).toBeGreaterThan(0);
      for (let i = 0; i < progression.length; i++) {
        const { container, unmount } = render(
          <SheetMusicDisplay
            mode="chord"
            progression={progression}
            currentStepIndex={i}
            selectedRoot="G"
            selectedScaleType="major"
          />
        );
        await assertNoNotationError();
        unmount();
      }
    });
  });

  describe('Scale mode', () => {
    const scaleTypes = ['major', 'natural_minor', 'major_pentatonic', 'minor_pentatonic', 'blues'];
    scaleTypes.forEach((scaleType) => {
      it(`should render G ${scaleType} scale as notation`, async () => {
        render(
          <SheetMusicDisplay
            mode="scale"
            selectedRoot="G"
            selectedScaleType={scaleType}
          />
        );
        await assertNoNotationError();
      });
    });
  });

  describe('detectedChord (free/chord mode)', () => {
    const detectedCases = [
      { name: 'F# Minor', root: 'F#', type: 'minor', inversion: 'Root Position' },
      { name: 'Ab Major', root: 'Ab', type: 'major', inversion: '2nd Inversion' },
      { name: 'D Dominant 7', root: 'D', type: 'dominant7', inversion: 'Root Position' },
    ];
    detectedCases.forEach((chord) => {
      it(`should render detected ${chord.name} as notation`, async () => {
        render(
          <SheetMusicDisplay
            mode="free"
            detectedChord={{
              name: chord.name,
              root: chord.root,
              type: chord.type,
              inversion: chord.inversion,
            }}
            selectedRoot="C"
            selectedScaleType="major"
          />
        );
        await assertNoNotationError();
      });
    });
  });

  describe('Progression target (chord mode)', () => {
    it('should render progression chord with inversion', async () => {
      render(
        <SheetMusicDisplay
          mode="chord"
          progression={[
            { name: 'F Minor', roman: 'iv', inversion: '1st Inversion' },
          ]}
          currentStepIndex={0}
          selectedRoot="C"
          selectedScaleType="major"
        />
      );
      await assertNoNotationError();
    });
  });

  describe('3rd inversion (4-note chords)', () => {
    it('should render C Major 7 3rd Inversion as notation', async () => {
      render(
        <SheetMusicDisplay
          mode="chord"
          lockedChord={{ name: 'C Major 7', inversion: '3rd Inversion' }}
          selectedRoot="C"
          selectedScaleType="major"
        />
      );
      await assertNoNotationError();
    });
  });

  describe('Scale mode with keyProgression', () => {
    it('should render scale when keyProgression is set', async () => {
      render(
        <SheetMusicDisplay
          mode="scale"
          selectedRoot="G"
          selectedScaleType="major"
          keyProgression={['G']}
          currentKeyIndex={0}
        />
      );
      await assertNoNotationError();
    });
  });

  describe('Error handling - should not crash, show placeholder or error', () => {
    it('should show placeholder when no chord or scale', () => {
      render(
        <SheetMusicDisplay mode="free" selectedRoot="C" selectedScaleType="major" />
      );
      expect(screen.getByText(/play a chord or select a scale/i)).toBeInTheDocument();
    });
    it('should not show "Unable to render notation" when given valid unknown chord format - fallback gracefully', async () => {
      // Chord that parseChordName might not fully support - should not throw
      render(
        <SheetMusicDisplay
          mode="chord"
          lockedChord={{ name: 'X Major', inversion: 'Root Position' }}
          selectedRoot="C"
          selectedScaleType="major"
        />
      );
      await waitFor(
        () => {
          const errorMsg = screen.queryByText(/unable to render notation/i);
          const placeholder = screen.queryByText(/play a chord or select a scale/i);
          expect(errorMsg).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });
  });

  describe('i-vi-ii-v-lesson-g integration (scale_then_chord)', () => {
    it('should render G Major scale in scale phase', async () => {
      render(
        <SheetMusicDisplay
          mode="scale"
          selectedRoot="G"
          selectedScaleType="major"
          keyProgression={['G']}
          currentKeyIndex={0}
        />
      );
      await assertNoNotationError();
    });
    it('should render I vi ii V chords when in chord phase', async () => {
      const progression = generateProgressionFromRomanPattern('I vi ii V', 'G', 'major');
      for (let i = 0; i < progression.length; i++) {
        const { unmount } = render(
          <SheetMusicDisplay
            mode="chord"
            progression={progression}
            currentStepIndex={i}
            selectedRoot="G"
            selectedScaleType="major"
            keyProgression={['G']}
            currentKeyIndex={0}
          />
        );
        await assertNoNotationError();
        unmount();
      }
    });
    it('should render first chord (G Major) without progression index overflow', async () => {
      render(
        <SheetMusicDisplay
          mode="chord"
          progression={generateProgressionFromRomanPattern('I vi ii V', 'G', 'major')}
          currentStepIndex={999}
          selectedRoot="G"
          selectedScaleType="major"
        />
      );
      await assertNoNotationError();
    });
  });

  describe('Edge cases - chord names from progression parser', () => {
    const progressionParserOutputs = [
      'G Major', 'Em', 'A Minor', 'D Major',  // i-vi-ii-v-lesson-g (roman gives full names)
      'C# Major', 'A# Minor', 'F# Minor',      // sharp keys
      'Bb Major', 'Eb Major',                   // flat keys (normalized to sharps internally)
    ];
    progressionParserOutputs.forEach((name) => {
      it(`should render "${name}" as notation`, async () => {
        render(
          <SheetMusicDisplay
            mode="chord"
            lockedChord={{ name, inversion: 'Root Position' }}
            selectedRoot="C"
            selectedScaleType="major"
          />
        );
        await assertNoNotationError();
      });
    });
  });
});
