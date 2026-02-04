import { describe, it, expect } from 'vitest';
import { identifyChord, parseChordName, getNoteIndex } from '../core/music-theory';
import { generateLoungeDrill } from '../core/exercise-config';

describe('Chord Matching Reproduction', () => {
    it('should match actual generator output with detected chord', () => {
        // 1. Get Target Chord from real generator
        const progression = generateLoungeDrill();
        const targetChord = progression[0]; // Should be C Major 6
        console.log('Target Chord from Generator:', targetChord);

        // 2. Simulate the Detected Chord (C-E-G-A)
        const activeNotes = [60, 64, 67, 69];
        const detected = identifyChord(activeNotes);
        console.log('Detected from Theory:', detected);

        expect(detected).not.toBeNull();
        expect(detected.name).toBe("C Major 6");

        // 3. Replicate the matching logic from App.jsx exactly
        const targetParsed = parseChordName(targetChord.name);
        const detectedParsed = detected
            ? (detected.root && detected.type
                ? { root: detected.root, chordType: detected.type }
                : parseChordName(detected.name))
            : null;

        console.log('Target Parsed:', targetParsed);
        console.log('Detected Parsed:', detectedParsed);

        const targetRootIdx = targetParsed ? getNoteIndex(targetParsed.root) : -1;
        const detectedRootIdx = detectedParsed ? getNoteIndex(detectedParsed.root) : -1;

        // Exact match check
        const qualityMatch = targetParsed && detectedParsed && targetParsed.chordType === detectedParsed.chordType;
        const rootMatch = targetRootIdx !== -1 && detectedRootIdx !== -1 && targetRootIdx === detectedRootIdx;

        // Inversion check logic from App.jsx
        const inversionMatch = !targetChord.inversion || (detected && detected.inversion === targetChord.inversion);

        console.log('Comparison:', {
            qualityMatch,
            rootMatch,
            inversionMatch,
            targetChordType: targetParsed?.chordType,
            detectedChordType: detectedParsed?.chordType
        });

        expect(rootMatch).toBe(true);
        expect(qualityMatch).toBe(true);
        expect(inversionMatch).toBe(true);
    });
});
