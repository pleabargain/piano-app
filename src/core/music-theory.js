// https://github.com/pleabargain/piano-app
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALES = {
  major: { name: 'Major', intervals: [2, 2, 1, 2, 2, 2, 1] },
  natural_minor: { name: 'Natural Minor', intervals: [2, 1, 2, 2, 1, 2, 2] },
  harmonic_minor: { name: 'Harmonic Minor', intervals: [2, 1, 2, 2, 1, 3, 1] },
  melodic_minor: { name: 'Melodic Minor', intervals: [2, 1, 2, 2, 2, 2, 1] },
};

export const CHORD_TYPES = {
  major: { name: 'Major', intervals: [4, 7] },
  minor: { name: 'Minor', intervals: [3, 7] },
  diminished: { name: 'Diminished', intervals: [3, 6] },
  augmented: { name: 'Augmented', intervals: [4, 8] },
  major7: { name: 'Major 7', intervals: [4, 7, 11] },
  minor7: { name: 'Minor 7', intervals: [3, 7, 10] },
  dominant7: { name: 'Dominant 7', intervals: [4, 7, 10] },
  diminished7: { name: 'Diminished 7', intervals: [3, 6, 9] },
  half_diminished7: { name: 'Half Diminished 7', intervals: [3, 6, 10] },
};

export function getNoteIndex(note) {
  return NOTES.indexOf(note);
}

export function getScaleNotes(root, scaleType) {
  const rootIndex = getNoteIndex(root);
  if (rootIndex === -1) return [];

  const intervals = SCALES[scaleType].intervals;
  const scaleNotes = [root];
  let currentIndex = rootIndex;

  for (let i = 0; i < intervals.length - 1; i++) {
    currentIndex = (currentIndex + intervals[i]) % 12;
    scaleNotes.push(NOTES[currentIndex]);
  }

  return scaleNotes;
}

export function getChordNotes(root, chordType) {
  const rootIndex = getNoteIndex(root);
  if (rootIndex === -1) return [];

  const intervals = CHORD_TYPES[chordType].intervals;
  const chordNotes = [root];

  intervals.forEach(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    chordNotes.push(NOTES[noteIndex]);
  });

  return chordNotes;
}

// Helper to normalize notes to 0-11 range
function normalizeNotes(notes) {
  return notes.map(n => {
    if (typeof n === 'string') return getNoteIndex(n);
    return n % 12;
  }).sort((a, b) => a - b);
}

// Check if two sets of notes are the same (ignoring octave/inversion for now, just pitch classes)
function areNotesEqual(notesA, notesB) {
  const normA = [...new Set(normalizeNotes(notesA))].sort((a, b) => a - b);
  const normB = [...new Set(normalizeNotes(notesB))].sort((a, b) => a - b);

  if (normA.length !== normB.length) return false;
  return normA.every((val, index) => val === normB[index]);
}

export function identifyChord(activeNotes) {
  if (!activeNotes || activeNotes.length < 3) return null;

  // activeNotes are expected to be MIDI numbers.
  // We convert to pitch classes (0-11)
  const pitchClasses = [...new Set(activeNotes.map(n => typeof n === 'number' ? n % 12 : getNoteIndex(n)))];

  // Brute force check against all roots and chord types
  for (let root of NOTES) {
    for (let [type, data] of Object.entries(CHORD_TYPES)) {
      const targetNotes = getChordNotes(root, type);
      if (areNotesEqual(pitchClasses, targetNotes)) {
        // Match found! Now determine inversion.
        let inversion = 'Root Position';

        // We need the lowest MIDI note to determine the bass
        // Assuming activeNotes contains MIDI numbers
        if (activeNotes.length > 0 && typeof activeNotes[0] === 'number') {
          const sortedNotes = [...activeNotes].sort((a, b) => a - b);
          const bassMidi = sortedNotes[0];
          const bassNoteIndex = bassMidi % 12;
          const rootIndex = getNoteIndex(root);

          // Calculate interval from root to bass (0-11)
          let interval = (bassNoteIndex - rootIndex + 12) % 12;

          // Map interval to inversion
          // This depends on the chord type (triad vs 7th)
          // Simplified logic:
          if (interval === 0) inversion = 'Root Position';
          else if (data.intervals.includes(interval)) {
            // It's one of the chord tones in the bass
            const intervalIndex = data.intervals.indexOf(interval);
            if (intervalIndex === 0) inversion = '1st Inversion'; // 3rd in bass
            else if (intervalIndex === 1) inversion = '2nd Inversion'; // 5th in bass
            else if (intervalIndex === 2) inversion = '3rd Inversion'; // 7th in bass
          }
        }

        return { root, type, name: `${root} ${data.name}`, inversion };
      }
    }
  }

  return null;
}

export function getRomanNumeral(scaleRoot, scaleType, chordRoot, chordType) {
  // Simplified Roman Numeral logic
  const scaleNotes = getScaleNotes(scaleRoot, scaleType);
  const degree = scaleNotes.indexOf(chordRoot);

  if (degree === -1) return '?';

  const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  let numeral = numerals[degree];

  const isMinor = chordType.includes('minor') || chordType.includes('diminished');
  const isDiminished = chordType.includes('diminished');
  const isAugmented = chordType.includes('augmented');

  if (isMinor && !isDiminished) numeral = numeral.toLowerCase();
  if (isDiminished) numeral = numeral.toLowerCase() + '°';
  if (isAugmented) numeral = numeral + '+';

  return numeral;
}
