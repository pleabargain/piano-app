import { describe, it, expect, vi, beforeEach } from 'vitest';
import { identifyChord, getScaleNotes } from '../core/music-theory';

describe('Chord Detection Flow - End-to-End', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Full Chord Detection Flow', () => {
        it('should detect F Major from MIDI notes and match progression target', () => {
            const progression = [
                { name: 'F Major', roman: 'I' },
                { name: 'A# Major', roman: 'IV' },
                { name: 'C Major', roman: 'V' }
            ];

            const targetChord = progression[0];
            const activeNotes = [53, 57, 60]; // F3, A3, C4

            console.log('[Test] Testing F Major detection', { targetChord, activeNotes });
            const detected = identifyChord(activeNotes);
            console.log('[Test] Detected chord', detected);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe('F Major');
            expect(detected.name).toBe(targetChord.name);
        });

        it('should detect A# Major from MIDI notes and match progression target', () => {
            const progression = [
                { name: 'F Major', roman: 'I' },
                { name: 'A# Major', roman: 'IV' },
                { name: 'C Major', roman: 'V' }
            ];

            const targetChord = progression[1];
            const activeNotes = [58, 62, 65]; // A#3, D4, F4

            console.log('[Test] Testing A# Major detection', { targetChord, activeNotes });
            const detected = identifyChord(activeNotes);
            console.log('[Test] Detected chord', detected);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe('A# Major');
            expect(detected.name).toBe(targetChord.name);
        });

        it('should detect C Major from MIDI notes and match progression target', () => {
            const progression = [
                { name: 'F Major', roman: 'I' },
                { name: 'A# Major', roman: 'IV' },
                { name: 'C Major', roman: 'V' }
            ];

            const targetChord = progression[2];
            const activeNotes = [60, 64, 67]; // C4, E4, G4

            console.log('[Test] Testing C Major detection', { targetChord, activeNotes });
            const detected = identifyChord(activeNotes);
            console.log('[Test] Detected chord', detected);

            expect(detected).not.toBeNull();
            expect(detected.name).toBe('C Major');
            expect(detected.name).toBe(targetChord.name);
        });
    });

    describe('Chord Name Normalization', () => {
        it('should normalize chord names correctly for comparison', () => {
            const normalizeChordName = (name) => {
                if (!name) return '';
                if (name.includes('Major') || name.includes('Minor') || name.includes('Diminished') || name.includes('Augmented')) {
                    return name;
                }
                if (name.endsWith('m')) {
                    return name.slice(0, -1) + ' Minor';
                }
                return name + ' Major';
            };

            expect(normalizeChordName('F Major')).toBe('F Major');
            expect(normalizeChordName('F')).toBe('F Major');
            expect(normalizeChordName('Dm')).toBe('D Minor');
            expect(normalizeChordName('D Minor')).toBe('D Minor');
        });

        it('should match normalized chord names', () => {
            const normalizeChordName = (name) => {
                if (!name) return '';
                if (name.includes('Major') || name.includes('Minor') || name.includes('Diminished') || name.includes('Augmented')) {
                    return name;
                }
                if (name.endsWith('m')) {
                    return name.slice(0, -1) + ' Minor';
                }
                return name + ' Major';
            };

            const targetChord = { name: 'F Major' };
            const detected = identifyChord([53, 57, 60]); // F Major

            expect(detected).not.toBeNull();
            const normalizedTarget = normalizeChordName(targetChord.name);
            const normalizedDetected = normalizeChordName(detected.name);
            expect(normalizedDetected).toBe(normalizedTarget);
        });
    });

    describe('Progression Advancement Logic', () => {
        it('should correctly identify when to advance to next chord', () => {
            const progression = [
                { name: 'F Major', roman: 'I' },
                { name: 'A# Major', roman: 'IV' },
                { name: 'C Major', roman: 'V' }
            ];

            let currentStepIndex = 0;
            const targetChord = progression[currentStepIndex];
            const activeNotes = [53, 57, 60]; // F Major

            const detected = identifyChord(activeNotes);
            const normalizeChordName = (name) => {
                if (!name) return '';
                if (name.includes('Major') || name.includes('Minor') || name.includes('Diminished') || name.includes('Augmented')) {
                    return name;
                }
                if (name.endsWith('m')) {
                    return name.slice(0, -1) + ' Minor';
                }
                return name + ' Major';
            };

            const normalizedTarget = normalizeChordName(targetChord.name);
            const normalizedDetected = detected ? normalizeChordName(detected.name) : '';

            const shouldAdvance = detected && normalizedDetected === normalizedTarget;
            expect(shouldAdvance).toBe(true);
        });

        it('should not advance when wrong chord is played', () => {
            const progression = [
                { name: 'F Major', roman: 'I' },
                { name: 'A# Major', roman: 'IV' }
            ];

            let currentStepIndex = 0;
            const targetChord = progression[currentStepIndex];
            const activeNotes = [60, 64, 67]; // C Major (wrong chord)

            const detected = identifyChord(activeNotes);
            const normalizeChordName = (name) => {
                if (!name) return '';
                if (name.includes('Major') || name.includes('Minor') || name.includes('Diminished') || name.includes('Augmented')) {
                    return name;
                }
                if (name.endsWith('m')) {
                    return name.slice(0, -1) + ' Minor';
                }
                return name + ' Major';
            };

            const normalizedTarget = normalizeChordName(targetChord.name);
            const normalizedDetected = detected ? normalizeChordName(detected.name) : '';

            const shouldAdvance = detected && normalizedDetected === normalizedTarget;
            expect(shouldAdvance).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        it('should handle insufficient notes gracefully', () => {
            const activeNotes = [53, 57]; // Only 2 notes
            const detected = identifyChord(activeNotes);
            expect(detected).toBeNull();
        });

        it('should handle empty activeNotes array', () => {
            const activeNotes = [];
            const detected = identifyChord(activeNotes);
            expect(detected).toBeNull();
        });

        it('should handle null activeNotes', () => {
            const detected = identifyChord(null);
            expect(detected).toBeNull();
        });

        it('should detect chords in different octaves', () => {
            // F Major in different octaves
            const fMajorLow = identifyChord([41, 45, 48]); // F2, A2, C3
            const fMajorMid = identifyChord([53, 57, 60]); // F3, A3, C4
            const fMajorHigh = identifyChord([65, 69, 72]); // F4, A4, C5

            expect(fMajorLow).not.toBeNull();
            expect(fMajorMid).not.toBeNull();
            expect(fMajorHigh).not.toBeNull();

            expect(fMajorLow.name).toBe('F Major');
            expect(fMajorMid.name).toBe('F Major');
            expect(fMajorHigh.name).toBe('F Major');
        });
    });
});

