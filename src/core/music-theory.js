// https://github.com/pleabargain/piano-app
import { normalizeChordText } from './chord-text';
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALES = {
  major: { name: 'Major', intervals: [2, 2, 1, 2, 2, 2, 1] },
  natural_minor: { name: 'Natural Minor', intervals: [2, 1, 2, 2, 1, 2, 2] },
  harmonic_minor: { name: 'Harmonic Minor', intervals: [2, 1, 2, 2, 1, 3, 1] },
  melodic_minor: { name: 'Melodic Minor', intervals: [2, 1, 2, 2, 2, 2, 1] },
  lydian: { name: 'Lydian', intervals: [2, 2, 2, 1, 2, 2, 1] }, // Major scale with raised 4th
  blues: { name: 'Blues', intervals: [3, 2, 1, 1, 3, 2] }, // Root, m3, P4, b5, P5, m7, octave
  major_pentatonic: { name: 'Major Pentatonic', intervals: [2, 2, 3, 2, 3] }, // W-W-m3-W-m3 (removes 4th and 7th from major)
  minor_pentatonic: { name: 'Minor Pentatonic', intervals: [3, 2, 2, 3, 2] }, // m3-W-W-m3-W (removes 2nd and 6th from natural minor)
};

export const CHORD_TYPES = {
  major: { name: 'Major', intervals: [4, 7] },
  minor: { name: 'Minor', intervals: [3, 7] },
  diminished: { name: 'Diminished', intervals: [3, 6] },
  augmented: { name: 'Augmented', intervals: [4, 8] },
  sus2: { name: 'Sus2', intervals: [2, 7] },
  sus4: { name: 'Sus4', intervals: [5, 7] },
  major7: { name: 'Major 7', intervals: [4, 7, 11] },
  minor7: { name: 'Minor 7', intervals: [3, 7, 10] },
  dominant7: { name: 'Dominant 7', intervals: [4, 7, 10] },
  diminished7: { name: 'Diminished 7', intervals: [3, 6, 9] },
  half_diminished7: { name: 'Half Diminished 7', intervals: [3, 6, 10] },
  major6: { name: 'Major 6', intervals: [4, 7, 9] },
  add6: { name: 'Add6', intervals: [4, 7, 9] },
  sixNine: { name: '6/9', intervals: [4, 7, 9, 14] },
  add9: { name: 'Add9', intervals: [4, 7, 14] },
  major9: { name: 'Major 9', intervals: [4, 7, 11, 14] },
  minor9: { name: 'Minor 9', intervals: [3, 7, 10, 14] },
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

    // MIDI octave numbering: C-1 = 0, C4 (middle C) = 60.
    // So midi = (octave + 1) * 12 + noteIndex.
    const midiNumber = (currentOctave + 1) * 12 + noteIndex;
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

  // Normalize unicode variants and trim
  let normalized = normalizeChordText(chordName);

  // Support slash chords by ignoring the bass note portion (e.g., "G/B" -> "G")
  // (Inversion handling could be added later; for now, we at least parse reliably.)
  if (normalized.includes('/')) {
    normalized = normalized.split('/')[0].trim();
  }

  // Handle format like "C Major", "D Minor 7", "F# Diminished"
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const root = parts[0];
    const typeName = parts.slice(1).join(' ').toLowerCase();

    // Map type names to chord type keys
    const typeMap = {
      'major': 'major',
      'minor': 'minor',
      'diminished': 'diminished',
      'augmented': 'augmented',
      'sus2': 'sus2',
      'sus 2': 'sus2',
      'suspended 2': 'sus2',
      'sus4': 'sus4',
      'sus 4': 'sus4',
      'suspended 4': 'sus4',
      'major 7': 'major7',
      'minor 7': 'minor7',
      'dominant 7': 'dominant7',
      'diminished 7': 'diminished7',
      'half diminished 7': 'half_diminished7',
      'major 6': 'major6',
      'add6': 'add6',
      'add 6': 'add6',
      '6/9': 'sixNine',
      '6 9': 'sixNine',
      'add9': 'add9',
      'add 9': 'add9',
      'major 9': 'major9',
      'minor 9': 'minor9',
    };

    const chordType = typeMap[typeName] || 'major';
    return { root, chordType };
  }

  // Handle format like "Cm", "Cm7", "Cdim", "Caug", "C7", etc.
  // Extract root note (can be C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
  const match = normalized.match(/^([A-G])([b#]?)(.*)$/);
  if (!match) return null;

  const root = `${match[1]}${match[2] || ''}`;
  const rawSuffix = match[3] || '';
  const suffixLower = rawSuffix.toLowerCase();
  const suffixRaw = rawSuffix; // preserve case for M7 vs m7

  // Map suffixes to chord types
  let chordType = 'major'; // default

  if (suffixLower === '' || suffixLower === 'maj') {
    chordType = 'major';
  } else if (suffixLower === 'm' || suffixLower === 'min') {
    chordType = 'minor';
  } else if (suffixLower === 'dim' || suffixLower === '°') {
    chordType = 'diminished';
  } else if (suffixLower === 'aug' || suffixLower === '+') {
    chordType = 'augmented';
  } else if (suffixLower === 'sus2' || suffixLower === 'sus2nd') {
    chordType = 'sus2';
  } else if (suffixLower === 'sus4' || suffixLower === 'sus4th') {
    chordType = 'sus4';
  } else if (suffixLower === 'm7' || suffixLower === 'min7') {
    chordType = 'minor7';
  } else if (suffixLower === 'maj7' || suffixLower === 'maj 7') {
    chordType = 'major7';
  } else if (suffixRaw === 'M7') {
    // Preserve common jazz-style "CM7" meaning C Major 7 (NOT C minor 7)
    chordType = 'major7';
  } else if (suffixLower === '7') {
    chordType = 'dominant7';
  } else if (suffixLower === 'dim7' || suffixLower === '°7') {
    chordType = 'diminished7';
  } else if (suffixLower === 'm7b5' || suffixLower === 'ø7') {
    chordType = 'half_diminished7';
  } else if (suffixLower === '6' || suffixLower === 'maj6') {
    chordType = 'major6';
  } else if (suffixLower === 'add6') {
    chordType = 'add6';
  } else if (suffixLower === '6/9' || suffixLower === '69') {
    chordType = 'sixNine';
  } else if (suffixLower === 'add9') {
    chordType = 'add9';
  } else if (suffixLower === 'maj9') {
    chordType = 'major9';
  } else if (suffixRaw === 'M9') {
    chordType = 'major9';
  } else if (suffixLower === 'm9' || suffixLower === 'min9') {
    chordType = 'minor9';
  }

  return { root, chordType };
}

// Convert a Roman Numeral (e.g. "I", "iv", "V7", "bVII") into a chord name string
// (e.g. "C Major", "D Minor", "G Dominant 7"), using scaleNotes as context.
// This is intentionally simplified and matches what ProgressionBuilder expects.
export function getChordNameFromRoman(roman, scaleNotes) {
  if (!roman || !scaleNotes || scaleNotes.length === 0) return '?';

  const degreeMap = {
    'i': 0, 'ii': 1, 'iii': 2, 'iv': 3, 'v': 4, 'vi': 5, 'vii': 6,
    'I': 0, 'II': 1, 'III': 2, 'IV': 3, 'V': 4, 'VI': 5, 'VII': 6
  };

  // Extract base degree (case insensitive match for I, II, etc)
  const match = roman.match(/^(b|#)?(VII|III|IV|VI|II|V|I)/i);
  if (!match) return '?';

  const baseRoman = match[2];
  const suffix = roman.substring(match[0].length);

  const degreeIndex = degreeMap[baseRoman];
  if (typeof degreeIndex !== 'number') return '?';

  // NOTE: accidentals (b/#) are not applied chromatically yet; we use scale degree note.
  const rootNote = scaleNotes[degreeIndex];
  if (!rootNote) return '?';

  // Determine quality from case and suffix
  const isLowerCase = baseRoman === baseRoman.toLowerCase();
  let chordType = 'major';

  if (suffix === '°' || suffix === 'dim') chordType = 'diminished';
  else if (suffix === '+'
    || suffix === 'aug') chordType = 'augmented';
  else if (isLowerCase) chordType = 'minor';
  else chordType = 'major';

  // Handle 7th chords
  if (suffix.includes('7')) {
    if (isLowerCase) {
      chordType = suffix.includes('maj7') || suffix.includes('M7') ? 'minor7' : 'minor7';
    } else {
      if (suffix.includes('maj7') || suffix.includes('M7')) chordType = 'major7';
      else if (suffix.includes('dim7')) chordType = 'diminished7';
      else chordType = 'dominant7';
    }
  }

  const chordTypeNames = {
    major: 'Major',
    minor: 'Minor',
    diminished: 'Diminished',
    augmented: 'Augmented',
    major7: 'Major 7',
    minor7: 'Minor 7',
    dominant7: 'Dominant 7',
    diminished7: 'Diminished 7'
  };

  return `${rootNote} ${chordTypeNames[chordType] || 'Major'}`;
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
  console.log('[music-theory] identifyChord called', { activeNotes, length: activeNotes?.length });

  if (!activeNotes || activeNotes.length < 3) {
    console.log('[music-theory] identifyChord: insufficient notes', { activeNotes, length: activeNotes?.length });
    return null;
  }

  // activeNotes are expected to be MIDI numbers.
  // We convert to pitch classes (0-11)
  const pitchClasses = [...new Set(activeNotes.map(n => typeof n === 'number' ? n % 12 : getNoteIndex(n)))];
  console.log('[music-theory] identifyChord: pitch classes', { activeNotes, pitchClasses });

  // Brute force check against all roots and chord types
  for (let root of NOTES) {
    for (let [type, data] of Object.entries(CHORD_TYPES)) {
      const targetNotes = getChordNotes(root, type);
      if (areNotesEqual(pitchClasses, targetNotes)) {
        console.log('[music-theory] identifyChord: MATCH FOUND!', { root, type, pitchClasses, targetNotes });
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
          console.log('[music-theory] identifyChord: inversion calculation', { bassMidi, bassNoteIndex, rootIndex, interval });

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

        const result = { root, type, name: `${root} ${data.name}`, inversion };
        console.log('[music-theory] identifyChord: returning', result);
        return result;
      }
    }
  }

  console.log('[music-theory] identifyChord: NO MATCH found for pitch classes', pitchClasses);
  return null;
}

// Identify all possible chord interpretations for a set of notes
// Returns an array of all matching chords (e.g., Am7 and C6 for notes A, C, E, G)
export function identifyAllChords(activeNotes) {
  console.log('[music-theory] identifyAllChords called', { activeNotes, length: activeNotes?.length });

  if (!activeNotes || activeNotes.length < 3) {
    console.log('[music-theory] identifyAllChords: insufficient notes', { activeNotes, length: activeNotes?.length });
    return [];
  }

  // Convert to pitch classes (0-11)
  const pitchClasses = [...new Set(activeNotes.map(n => typeof n === 'number' ? n % 12 : getNoteIndex(n)))];
  console.log('[music-theory] identifyAllChords: pitch classes', { activeNotes, pitchClasses });

  const matches = [];

  // Check all roots and chord types for matches
  for (let root of NOTES) {
    for (let [type, data] of Object.entries(CHORD_TYPES)) {
      const targetNotes = getChordNotes(root, type);
      if (areNotesEqual(pitchClasses, targetNotes)) {
        console.log('[music-theory] identifyAllChords: MATCH FOUND!', { root, type, pitchClasses, targetNotes });

        // Determine inversion
        let inversion = 'Root Position';

        if (activeNotes.length > 0 && typeof activeNotes[0] === 'number') {
          const sortedNotes = [...activeNotes].sort((a, b) => a - b);
          const bassMidi = sortedNotes[0];
          const bassNoteIndex = bassMidi % 12;
          const rootIndex = getNoteIndex(root);

          // Calculate interval from root to bass (0-11)
          let interval = (bassNoteIndex - rootIndex + 12) % 12;
          console.log('[music-theory] identifyAllChords: inversion calculation', { bassMidi, bassNoteIndex, rootIndex, interval });

          // Map interval to inversion
          if (interval === 0) inversion = 'Root Position';
          else if (data.intervals.includes(interval)) {
            const intervalIndex = data.intervals.indexOf(interval);
            if (intervalIndex === 0) inversion = '1st Inversion';
            else if (intervalIndex === 1) inversion = '2nd Inversion';
            else if (intervalIndex === 2) inversion = '3rd Inversion';
          }
        }

        const chordResult = { root, type, name: `${root} ${data.name}`, inversion };
        matches.push(chordResult);
        console.log('[music-theory] identifyAllChords: added match', chordResult);
      }
    }
  }

  console.log('[music-theory] identifyAllChords: found', matches.length, 'matches');
  return matches;
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
