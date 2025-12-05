// https://github.com/pleabargain/piano-app
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALES = {
  major: { name: 'Major', intervals: [2, 2, 1, 2, 2, 2, 1] },
  natural_minor: { name: 'Natural Minor', intervals: [2, 1, 2, 2, 1, 2, 2] },
  harmonic_minor: { name: 'Harmonic Minor', intervals: [2, 1, 2, 2, 1, 3, 1] },
  melodic_minor: { name: 'Melodic Minor', intervals: [2, 1, 2, 2, 2, 2, 1] },
  blues: { name: 'Blues', intervals: [3, 1, 2, 1, 3, 2] }, // Root, m3, P4, d5, P5, m7, octave
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
  if (!note) return -1;

  // Handle flats by converting to sharps
  const flatToSharp = {
    'Db': 'C#',
    'Eb': 'D#',
    'Gb': 'F#',
    'Ab': 'G#',
    'Bb': 'A#',
    'Cb': 'B',
    'Fb': 'E'
  };

  const normalizedNote = flatToSharp[note] || note;
  return NOTES.indexOf(normalizedNote);
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

// Get chord notes as MIDI numbers for a specific inversion
// Returns array of MIDI note numbers (e.g., [60, 64, 67] for C Major in middle C octave)
// inversion: 0 = Root Position, 1 = 1st Inversion, 2 = 2nd Inversion, 3 = 3rd Inversion
export function getChordNotesAsMidi(root, chordType, inversion = 0, baseOctave = 4) {
  const rootIndex = getNoteIndex(root);
  if (rootIndex === -1) return [];

  const intervals = CHORD_TYPES[chordType].intervals;
  const allIntervals = [0, ...intervals]; // Root + intervals (e.g., [0, 4, 7] for major)

  // Apply inversion: rotate the intervals
  const rotatedIntervals = [];
  for (let i = 0; i < allIntervals.length; i++) {
    const intervalIndex = (i + inversion) % allIntervals.length;
    rotatedIntervals.push(allIntervals[intervalIndex]);
  }

  // Calculate MIDI numbers
  // For inversions, we need to ensure notes are placed in ascending order
  // The bass note (first in rotated array) is in baseOctave
  // Subsequent notes go up, wrapping to next octave if needed
  const midiNotes = [];
  let currentOctave = baseOctave;
  let prevNoteIndex = -1;

  rotatedIntervals.forEach((interval, index) => {
    const noteIndex = (rootIndex + interval) % 12;

    // If this note is lower than the previous one (wrapped around), move to next octave
    if (index > 0 && noteIndex < prevNoteIndex) {
      currentOctave = baseOctave + 1;
    } else if (index === 0) {
      // First note (bass) stays in base octave
      currentOctave = baseOctave;
    }

    const midiNumber = currentOctave * 12 + noteIndex;
    midiNotes.push(midiNumber);
    prevNoteIndex = noteIndex;
  });

  // Sort to ensure proper order (lowest to highest)
  return midiNotes.sort((a, b) => a - b);
}

// Parse chord name to get root and type
// Handles formats like "C Major", "Cm", "Cm7", "Cdim", "C Major 7", etc.
export function parseChordName(chordName) {
  if (!chordName || chordName === '?') return null;

  // Handle format like "C Major", "D Minor 7", "F# Diminished"
  const parts = chordName.split(' ');
  if (parts.length >= 2) {
    const root = parts[0];
    const typeName = parts.slice(1).join(' ').toLowerCase();

    // Map type names to chord type keys
    const typeMap = {
      'major': 'major',
      'minor': 'minor',
      'diminished': 'diminished',
      'augmented': 'augmented',
      'major 7': 'major7',
      'minor 7': 'minor7',
      'dominant 7': 'dominant7',
      'diminished 7': 'diminished7',
      'half diminished 7': 'half_diminished7',
    };

    const chordType = typeMap[typeName] || 'major';
    return { root, chordType };
  }

  // Handle format like "Cm", "Cm7", "Cdim", "Caug", "C7", etc.
  // Extract root note (can be C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
  const match = chordName.match(/^([A-G]#?)(.*)$/);
  if (!match) return null;

  const root = match[1];
  const suffix = match[2].toLowerCase();

  // Map suffixes to chord types
  let chordType = 'major'; // default

  if (suffix === '' || suffix === 'maj') {
    chordType = 'major';
  } else if (suffix === 'm' || suffix === 'min') {
    chordType = 'minor';
  } else if (suffix === 'dim' || suffix === '°') {
    chordType = 'diminished';
  } else if (suffix === 'aug' || suffix === '+') {
    chordType = 'augmented';
  } else if (suffix === 'm7' || suffix === 'min7') {
    chordType = 'minor7';
  } else if (suffix === 'maj7' || suffix === 'M7') {
    chordType = 'major7';
  } else if (suffix === '7') {
    chordType = 'dominant7';
  } else if (suffix === 'dim7' || suffix === '°7') {
    chordType = 'diminished7';
  } else if (suffix === 'm7b5' || suffix === 'ø7') {
    chordType = 'half_diminished7';
  }

  return { root, chordType };
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

// Find potential chords based on a subset of notes
// activeNotes: array of MIDI numbers
export function findPotentialChords(activeNotes) {
  if (!activeNotes || activeNotes.length < 2) return [];

  // Convert to pitch classes (0-11) and remove duplicates
  const pitchClasses = [...new Set(activeNotes.map(n => typeof n === 'number' ? n % 12 : getNoteIndex(n)))];

  const suggestions = [];

  // Check all roots and chord types
  for (let root of NOTES) {
    for (let [type, data] of Object.entries(CHORD_TYPES)) {
      const targetNotes = getChordNotes(root, type);
      const targetPitchClasses = normalizeNotes(targetNotes);

      // Check if active notes are a subset of this chord
      // Every active note must be in the target chord
      const isSubset = pitchClasses.every(pc => targetPitchClasses.includes(pc));

      if (isSubset) {
        // Calculate missing notes
        const missingNotes = targetNotes.filter(note => !pitchClasses.includes(getNoteIndex(note)));

        // We only want suggestions where we are missing 1 or 2 notes, 
        // otherwise we get too many complex chords for just 2 notes input
        if (missingNotes.length > 0 && missingNotes.length <= 2) {
          suggestions.push({
            root,
            type,
            name: `${root} ${data.name}`,
            missingNotes,
            complexity: data.intervals.length // Prefer simpler chords
          });
        }
      }
    }
  }

  // Sort suggestions:
  // 1. By complexity (triads first)
  // 2. By root (alphabetical)
  return suggestions.sort((a, b) => {
    if (a.complexity !== b.complexity) return a.complexity - b.complexity;
    return a.root.localeCompare(b.root);
  }).slice(0, 5); // Limit to top 5
}
