
import { describe, it, expect } from 'vitest';
import { identifyChord, parseChordName, getNoteIndex, CHORD_TYPES } from '../core/music-theory';

describe('Chord Bug Reproduction', () => {
    // Simulate the logic from App.jsx's validation effect
    const checkMatch = (targetChord, detected) => {
        const targetParsed = parseChordName(targetChord.name);
        // In App.jsx, if detected has root/type, it uses that directly.
        // const detectedParsed = detected
        //   ? (detected.root && detected.type
        //     ? { root: detected.root, chordType: detected.type }
        //     : parseChordName(detected.name))
        //   : null;

        // Simulating exactly what App.jsx does:
        const detectedParsed = detected
            ? (detected.root && detected.type
                ? { root: detected.root, chordType: detected.type }
                : parseChordName(detected.name))
            : null;

        const targetRootIdx = targetParsed ? getNoteIndex(targetParsed.root) : -1;
        const detectedRootIdx = detectedParsed ? getNoteIndex(detectedParsed.root) : -1;

        const qualityMatch = targetParsed && detectedParsed && targetParsed.chordType === detectedParsed.chordType;
        const rootMatch = targetRootIdx !== -1 && detectedRootIdx !== -1 && targetRootIdx === detectedRootIdx;

        // This is the tricky part - inversion matching
        const inversionMatch = !targetChord.inversion || (detected && detected.inversion === targetChord.inversion);

        return {
            match: qualityMatch && rootMatch && inversionMatch,
            qualityMatch,
            rootMatch,
            inversionMatch,
            targetInversionFromObj: targetChord.inversion,
            detectedInversion: detected?.inversion
        };
    };

    it('should match C Major (Target: I) with C Major (Played: Root Position)', () => {
        // Scenario from user report
        // Target: { name: 'C Major', roman: 'I' } -> Note: Inversion might be undefined implies Root?
        // Actually, let's test both undefined and explicit 'Root Position'

        const targetChord = { name: 'C Major', roman: 'I' }; // Default format in ProgressionBuilder?

        // Active notes for C Major Root Position (C4, E4, G4)
        const activeNotes = [60, 64, 67];
        const detected = identifyChord(activeNotes);

        console.log('Detected:', detected);
        expect(detected).not.toBeNull();
        expect(detected.name).toBe('C Major');
        expect(detected.inversion).toBe('Root Position');

        const result = checkMatch(targetChord, detected);
        console.log('Match Result (No Inversion Specified):', result);
        expect(result.match).toBe(true);
    });

    it('should match C Major (Target: I, Inv: Root Position) with C Major (Played: Root Position)', () => {
        const targetChord = { name: 'C Major', roman: 'I', inversion: 'Root Position' };

        const activeNotes = [60, 64, 67];
        const detected = identifyChord(activeNotes);

        const result = checkMatch(targetChord, detected);
        console.log('Match Result (Explicit Inversion):', result);
        expect(result.match).toBe(true);
    });

    // Maybe the progression data has weird format?
    it('should match if detected properties are used directly', () => {
        const targetChord = { name: 'C Major', roman: 'I' };

        // Mock a detected object that identifyChord returns
        const detected = {
            root: 'C',
            type: 'major',
            name: 'C Major',
            inversion: 'Root Position'
        };

        const result = checkMatch(targetChord, detected);
        expect(result.match).toBe(true);
    });

    // Test what happens if identifying fails or returns something else
    it('identifyChord should return correct structure for C Major', () => {
        const notes = [60, 64, 67];
        const detected = identifyChord(notes);
        expect(detected).toEqual({
            root: 'C',
            type: 'major',
            name: 'C Major',
            inversion: 'Root Position'
        });
    });
});
