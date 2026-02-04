// https://github.com/pleabargain/piano-app
// 2026-01-31: Added Triad Shape-Shifting and 12-Key Interval Sprints
import { NOTES, getNoteIndex, getScaleNotes, getChordNameFromRoman } from './music-theory';
import { parseProgression } from './progression-parser';

// Circle of Fifths order: C, G, D, A, E, B, F#, C#, G#, D#, A#, F
// Using app's note system (sharps): C, G, D, A, E, B, F#, C#, G#, D#, A#, F
export const CIRCLE_OF_FIFTHS_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];

/**
 * Get the V chord root for a given key root
 * V chord is 7 semitones (perfect fifth) above the root
 */
export function getVChordRoot(root) {
  const rootIndex = getNoteIndex(root);
  if (rootIndex === -1) return null;

  // Perfect fifth = 7 semitones
  const vIndex = (rootIndex + 7) % 12;
  return NOTES[vIndex];
}

/**
 * Generate I-V-I progression for a given key
 * Returns array of chord objects: [{name: 'C Major', roman: 'I'}, ...]
 */
export function generateIVIProgression(root) {
  const vRoot = getVChordRoot(root);
  if (!vRoot) return [];

  return [
    { name: `${root} Major`, roman: 'I' },
    { name: `${vRoot} Major`, roman: 'V' },
    { name: `${root} Major`, roman: 'I' }
  ];
}

/**
 * Generate a progression from a Roman numeral pattern for a given key
 * @param {string} romanPattern - Roman numeral progression string (e.g., "I V I", "I IV V I")
 * @param {string} root - Root note of the key (e.g., "C", "G#")
 * @param {string} scaleType - Scale type ('major' or 'natural_minor')
 * @returns {Array} Array of chord objects: [{name: 'C Major', roman: 'I'}, ...]
 */
export function generateProgressionFromRomanPattern(romanPattern, root, scaleType = 'major') {
  if (!romanPattern || !root) return [];

  // Get scale notes for the key
  const scaleNotes = getScaleNotes(root, scaleType);
  if (!scaleNotes || scaleNotes.length === 0) return [];

  // Parse the Roman numeral progression
  const parseResult = parseProgression(romanPattern, scaleNotes);
  if (parseResult.error || !parseResult.chords || parseResult.chords.length === 0) {
    return [];
  }

  // Convert parsed chords to the format expected by Exercise component
  return parseResult.chords.map(chord => ({
    name: chord.name,
    roman: chord.roman
  }));
}

/**
 * Generate a scale progression (ascending + descending) for a given key
 * @param {string} root - Root note of the key
 * @param {string} scaleType - Scale type ('major', etc.)
 * @returns {Array} Array of note objects: [{name: 'C'}, ...]
 */
export function generateScaleProgression(root, scaleType = 'major') {
  const scaleNotes = getScaleNotes(root, scaleType);
  if (!scaleNotes || scaleNotes.length === 0) return [];

  // Full cycle: ascending + descending
  const ascendingPattern = [...scaleNotes, root];
  const descendingPattern = [...scaleNotes].reverse();
  const completeScalePattern = [...ascendingPattern, ...descendingPattern];

  return completeScalePattern.map(note => ({ name: note }));
}

/**
 * Generate interval sprints (root-2nd, root-3rd, etc.) for a given key
 * @param {string} root - Root note of the key
 * @param {string} scaleType - Scale type ('major', etc.)
 * @returns {Array} Array of note objects: [{name: 'C'}, ...]
 */
export function generateIntervalSprints(root, scaleType = 'major') {
  const scaleNotes = getScaleNotes(root, scaleType);
  if (!scaleNotes || scaleNotes.length === 0) return [];

  // root-2nd, root-3rd, ..., root-octave
  const octave = root;
  const allNotes = [...scaleNotes, octave];

  const progression = [];
  // Start from index 1 (the 2nd)
  for (let i = 1; i < allNotes.length; i++) {
    progression.push({ name: root });
    progression.push({ name: allNotes[i] });
  }

  return progression.map(item => ({ name: item.name }));
}

/**
 * Generate a progression of all inversion combinations for each chord
 * This allows users to practice all transitions between inversions (Root->1st, Root->2nd, 1st->Root, etc.)
 * @returns {Array} Array of chord objects with target inversions: [{name: 'C Major', roman: 'I', inversion: 'Root Position'}, ...]
 */
export function generateTriadInversions() {
  const keys = ['C', 'F', 'G'];
  const inversions = ['Root Position', '1st Inversion', '2nd Inversion'];
  const progression = [];

  // For each key, generate all possible transitions between inversions
  // This creates: Root->1st, Root->2nd, 1st->Root, 1st->2nd, 2nd->Root, 2nd->1st
  keys.forEach(key => {
    // Generate all pairs of inversions (from -> to)
    for (let i = 0; i < inversions.length; i++) {
      for (let j = 0; j < inversions.length; j++) {
        // Skip same inversion transitions (Root->Root, etc.) as they're not useful for learning
        if (i !== j) {
          progression.push({
            name: `${key} Major`,
            roman: 'I', // In these specific keys, they are the I chord of their own major scale
            inversion: inversions[j] // Target inversion to play
          });
        }
      }
    }
  });

  return progression;
}

/**
 * Generate all inversion combinations for I-IV-V progression in a given key
 * For each chord (I, IV, V), generates all 6 inversion transitions
 * @param {string} root - Root note of the key (e.g., 'C', 'G', 'D')
 * @returns {Array} Array of chord objects with target inversions: [{name: 'C Major', roman: 'I', inversion: 'Root Position'}, ...]
 */
export function generateI4V5Inversions(root) {
  if (!root) return [];

  const inversions = ['Root Position', '1st Inversion', '2nd Inversion'];
  const progression = [];

  // Get I, IV, V chords for this key
  const scaleNotes = getScaleNotes(root, 'major');
  if (!scaleNotes || scaleNotes.length === 0) return [];

  // Get chord names for I, IV, V
  const iChord = getChordNameFromRoman('I', scaleNotes);
  const ivChord = getChordNameFromRoman('IV', scaleNotes);
  const vChord = getChordNameFromRoman('V', scaleNotes);

  // For each chord (I, IV, V), generate all inversion transitions
  const chords = [
    { name: iChord, roman: 'I' },
    { name: ivChord, roman: 'IV' },
    { name: vChord, roman: 'V' }
  ];

  chords.forEach(chord => {
    // Generate all pairs of inversions (from -> to)
    for (let i = 0; i < inversions.length; i++) {
      for (let j = 0; j < inversions.length; j++) {
        // Skip same inversion transitions
        if (i !== j) {
          progression.push({
            name: chord.name,
            roman: chord.roman,
            inversion: inversions[j] // Target inversion to play
          });
        }
      }
    }
  });

  return progression;
}

/**
 * Generate a drill for the "2 Chord Lounge Piano" style (C Major 6 and D Diminished)
 * Covers all inversions of both chords to master the positions.
 * @returns {Array} Progression array
 */
export function generateLoungeDrill() {
  const progression = [];

  // C Major 6 Inversions (4 notes = 4 inversions)
  const c6Inversions = ['Root Position', '1st Inversion', '2nd Inversion', '3rd Inversion'];

  // D Diminished Inversions (3 notes = 3 inversions)
  const dDimInversions = ['Root Position', '1st Inversion', '2nd Inversion'];

  // Interleave them: C6(inv) -> Ddim(inv) -> C6(next inv) -> ...
  // Since they have different counts (4 vs 3), we'll loop enough times to cover both.
  // LCM of 4 and 3 is 12, so 12 pairs would cover perfectly, but that's too long.
  // Let's just do one pass of C6 inversions and pair them with Ddim inversions (looping Ddim if needed).

  for (let i = 0; i < c6Inversions.length; i++) {
    const cInv = c6Inversions[i];
    const dInv = dDimInversions[i % dDimInversions.length]; // Wrap around D dim inversions

    // Step 1: C Major 6
    progression.push({
      name: 'C Major 6',
      roman: 'I6',
      inversion: cInv
    });

    // Step 2: D Diminished
    progression.push({
      name: 'D Diminished',
      roman: 'ii°',
      inversion: dInv
    });
  }

  // Add the Vamp for good measure (already interleaved)
  progression.push({ name: 'C Major 6', roman: 'I6', inversion: 'Root Position' });
  progression.push({ name: 'D Diminished', roman: 'ii°', inversion: 'Root Position' });
  progression.push({ name: 'C Major 6', roman: 'I6', inversion: 'Root Position' });
  progression.push({ name: 'D Diminished', roman: 'ii°', inversion: '1st Inversion' }); // Smooth movement?

  return progression;
}

/**
 * Exercise configuration registry
 */
export const EXERCISES = {
  'i-v-i-circle': {
    id: 'i-v-i-circle',
    name: 'I-V-I Circle of Fifths',
    description: 'Practice I-V-I chord progressions through all 12 keys in Circle of Fifths order',
    mode: 'chord',
    benefits: 'Master the "5-1" connection, the most powerful resolution in Western music.',
    config: {
      keyProgression: CIRCLE_OF_FIFTHS_KEYS,
      generateProgression: generateIVIProgression,
      scaleType: 'major'
    }
  },
  'i-v-i': {
    id: 'i-v-i',
    name: 'I-V-I Circle of Fifths',
    description: 'Practice I-V-I chord progressions through all 12 keys in Circle of Fifths order',
    mode: 'chord',
    benefits: 'Practice the fundamental I-V-I progression using Roman numeral theory.',
    config: {
      keyProgression: CIRCLE_OF_FIFTHS_KEYS,
      generateProgression: (root) => generateProgressionFromRomanPattern('I V I', root, 'major'),
      scaleType: 'major'
    }
  },
  'i-iv-v-i-circle': {
    id: 'i-iv-v-i-circle',
    name: 'I-IV-V-I Circle of Fifths',
    description: 'Practice I-IV-V-I chord progressions through all 12 keys in Circle of Fifths order',
    mode: 'chord',
    benefits: 'Builds muscle memory for the most fundamental harmonic relationship and common tone voice leading.',
    config: {
      keyProgression: CIRCLE_OF_FIFTHS_KEYS,
      generateProgression: (root) => generateProgressionFromRomanPattern('I IV V I', root, 'major'),
      scaleType: 'major'
    }
  },
  'major-scales-circle': {
    id: 'major-scales-circle',
    name: '12 Major Scales Journey',
    description: 'Master all 12 major scales starting from C Major. ⚠️ Remember to stretch your hands before playing to avoid injury!',
    mode: 'scale',
    benefits: 'Internalizes the sound and layout of all 12 major keys, essential for improvisation and theory.',
    config: {
      keyProgression: CIRCLE_OF_FIFTHS_KEYS,
      generateProgression: (root) => generateScaleProgression(root, 'major'),
      scaleType: 'major'
    }
  },
  'major-pentatonic-circle': {
    id: 'major-pentatonic-circle',
    name: 'Major Pentatonic Circle',
    description: 'Practice the Major Pentatonic scale through all 12 keys in Circle of Fifths order.',
    mode: 'scale',
    benefits: 'The major pentatonic is a versatile scale that works over major and dominant chords. Practicing it through the Circle of Fifths builds foundational soloing skills and finger agility.',
    config: {
      keyProgression: CIRCLE_OF_FIFTHS_KEYS,
      generateProgression: (root) => generateScaleProgression(root, 'major_pentatonic'),
      scaleType: 'major_pentatonic'
    }
  },
  'interval-sprints': {
    id: 'interval-sprints',
    name: 'Interval Sprints',
    description: 'Practice every interval from the root in a major key (e.g., C-D, C-E, C-F...).',
    mode: 'scale',
    benefits: 'Develops ear recognition for different intervals and strengthens finger independence by anchoring to the root.',
    config: {
      generateProgression: (root) => generateIntervalSprints(root, 'major'),
      scaleType: 'major'
    }
  },
  'interval-sprints-circle': {
    id: 'interval-sprints-circle',
    name: '12-Key Interval Sprints',
    description: 'Master interval sprints across all 12 major keys in Circle of Fifths order.',
    mode: 'scale',
    benefits: 'Challenges mental agility and finger precision across the entire keyboard through Systematic interval practice.',
    config: {
      keyProgression: CIRCLE_OF_FIFTHS_KEYS,
      generateProgression: (root) => generateIntervalSprints(root, 'major'),
      scaleType: 'major'
    }
  },
  'vi-iv-i-v-circle': {
    id: 'vi-iv-i-v-circle',
    name: 'vi-IV-I-V Circle of Fifths',
    description: 'Practice the classic vi-IV-I-V chord progression (50s progression) through all 12 keys in Circle of Fifths order',
    mode: 'chord',
    benefits: 'Master one of the most popular chord progressions in pop music, used in countless songs from the 1950s to today.',
    config: {
      keyProgression: CIRCLE_OF_FIFTHS_KEYS,
      generateProgression: (root) => generateProgressionFromRomanPattern('vi IV I V', root, 'major'),
      scaleType: 'major'
    }
  },
  'triad-shape-shifting': {
    id: 'triad-shape-shifting',
    name: 'Triad Shape-Shifting',
    description: 'Master ALL inversion combinations for C, F, and G Major: Root↔1st, Root↔2nd, 1st↔2nd. Practice every possible transition between inversions! 💎',
    mode: 'chord',
    benefits: 'Builds complete mastery of all triad inversions by practicing every possible transition, not just linear progressions. Develops chord visualization fluency and smooth hand movement (voice leading).',
    config: {
      keyProgression: ['C'], // Just one "key cycle" since the generator handles C, F, G internal to its sequence
      generateProgression: generateTriadInversions,
      scaleType: 'major'
    }
  },
  // I-IV-V Inversion exercises for all 12 keys
  'i4v5-inversions-c': {
    id: 'i4v5-inversions-c',
    name: 'I-IV-V Inversions: C Major',
    description: 'Master all inversion combinations for I-IV-V in C Major (C-F-G). Practice every possible transition between inversions!',
    mode: 'chord',
    benefits: 'Builds complete mastery of I-IV-V inversions in C Major. Develops smooth voice leading and chord visualization.',
    config: {
      keyProgression: ['C'],
      generateProgression: () => generateI4V5Inversions('C'),
      scaleType: 'major'
    }
  },
  'i4v5-inversions-g': {
    id: 'i4v5-inversions-g',
    name: 'I-IV-V Inversions: G Major',
    description: 'Master all inversion combinations for I-IV-V in G Major (G-C-D). Practice every possible transition between inversions!',
    mode: 'chord',
    benefits: 'Builds complete mastery of I-IV-V inversions in G Major. Develops smooth voice leading and chord visualization.',
    config: {
      keyProgression: ['G'],
      generateProgression: () => generateI4V5Inversions('G'),
      scaleType: 'major'
    }
  },
  'i4v5-inversions-d': {
    id: 'i4v5-inversions-d',
    name: 'I-IV-V Inversions: D Major',
    description: 'Master all inversion combinations for I-IV-V in D Major (D-G-A). Practice every possible transition between inversions!',
    mode: 'chord',
    benefits: 'Builds complete mastery of I-IV-V inversions in D Major. Develops smooth voice leading and chord visualization.',
    config: {
      keyProgression: ['D'],
      generateProgression: () => generateI4V5Inversions('D'),
      scaleType: 'major'
    }
  },
  'i4v5-inversions-a': {
    id: 'i4v5-inversions-a',
    name: 'I-IV-V Inversions: A Major',
    description: 'Master all inversion combinations for I-IV-V in A Major (A-D-E). Practice every possible transition between inversions!',
    mode: 'chord',
    benefits: 'Builds complete mastery of I-IV-V inversions in A Major. Develops smooth voice leading and chord visualization.',
    config: {
      keyProgression: ['A'],
      generateProgression: () => generateI4V5Inversions('A'),
      scaleType: 'major'
    }
  },
  'i4v5-inversions-e': {
    id: 'i4v5-inversions-e',
    name: 'I-IV-V Inversions: E Major',
    description: 'Master all inversion combinations for I-IV-V in E Major (E-A-B). Practice every possible transition between inversions!',
    mode: 'chord',
    benefits: 'Builds complete mastery of I-IV-V inversions in E Major. Develops smooth voice leading and chord visualization.',
    config: {
      keyProgression: ['E'],
      generateProgression: () => generateI4V5Inversions('E'),
      scaleType: 'major'
    }
  },
  'i4v5-inversions-b': {
    id: 'i4v5-inversions-b',
    name: 'I-IV-V Inversions: B Major',
    description: 'Master all inversion combinations for I-IV-V in B Major (B-E-F#). Practice every possible transition between inversions!',
    mode: 'chord',
    benefits: 'Builds complete mastery of I-IV-V inversions in B Major. Develops smooth voice leading and chord visualization.',
    config: {
      keyProgression: ['B'],
      generateProgression: () => generateI4V5Inversions('B'),
      scaleType: 'major'
    }
  },
  'i4v5-inversions-f#': {
    id: 'i4v5-inversions-f#',
    name: 'I-IV-V Inversions: F# Major',
    description: 'Master all inversion combinations for I-IV-V in F# Major (F#-B-C#). Practice every possible transition between inversions!',
    mode: 'chord',
    benefits: 'Builds complete mastery of I-IV-V inversions in F# Major. Develops smooth voice leading and chord visualization.',
    config: {
      keyProgression: ['F#'],
      generateProgression: () => generateI4V5Inversions('F#'),
      scaleType: 'major'
    }
  },
  'i4v5-inversions-c#': {
    id: 'i4v5-inversions-c#',
    name: 'I-IV-V Inversions: C# Major',
    description: 'Master all inversion combinations for I-IV-V in C# Major (C#-F#-G#). Practice every possible transition between inversions!',
    mode: 'chord',
    benefits: 'Builds complete mastery of I-IV-V inversions in C# Major. Develops smooth voice leading and chord visualization.',
    config: {
      keyProgression: ['C#'],
      generateProgression: () => generateI4V5Inversions('C#'),
      scaleType: 'major'
    }
  },
  'i4v5-inversions-g#': {
    id: 'i4v5-inversions-g#',
    name: 'I-IV-V Inversions: G# Major',
    description: 'Master all inversion combinations for I-IV-V in G# Major (G#-C#-D#). Practice every possible transition between inversions!',
    mode: 'chord',
    benefits: 'Builds complete mastery of I-IV-V inversions in G# Major. Develops smooth voice leading and chord visualization.',
    config: {
      keyProgression: ['G#'],
      generateProgression: () => generateI4V5Inversions('G#'),
      scaleType: 'major'
    }
  },
  'i4v5-inversions-d#': {
    id: 'i4v5-inversions-d#',
    name: 'I-IV-V Inversions: D# Major',
    description: 'Master all inversion combinations for I-IV-V in D# Major (D#-G#-A#). Practice every possible transition between inversions!',
    mode: 'chord',
    benefits: 'Builds complete mastery of I-IV-V inversions in D# Major. Develops smooth voice leading and chord visualization.',
    config: {
      keyProgression: ['D#'],
      generateProgression: () => generateI4V5Inversions('D#'),
      scaleType: 'major'
    }
  },
  'i4v5-inversions-a#': {
    id: 'i4v5-inversions-a#',
    name: 'I-IV-V Inversions: A# Major',
    description: 'Master all inversion combinations for I-IV-V in A# Major (A#-D#-F). Practice every possible transition between inversions!',
    mode: 'chord',
    benefits: 'Builds complete mastery of I-IV-V inversions in A# Major. Develops smooth voice leading and chord visualization.',
    config: {
      keyProgression: ['A#'],
      generateProgression: () => generateI4V5Inversions('A#'),
      scaleType: 'major'
    }
  },
  'i4v5-inversions-f': {
    id: 'i4v5-inversions-f',
    name: 'I-IV-V Inversions: F Major',
    description: 'Master all inversion combinations for I-IV-V in F Major (F-A#-C). Practice every possible transition between inversions!',
    mode: 'chord',
    benefits: 'Builds complete mastery of I-IV-V inversions in F Major. Develops smooth voice leading and chord visualization.',
    config: {
      keyProgression: ['F'],
      generateProgression: () => generateI4V5Inversions('F'),
      scaleType: 'major'
    }
  },
  '2-chord-lounge': {
    id: '2-chord-lounge',
    name: '2 Chord Lounge Piano',
    description: 'Master the C Major 6 and D Diminished connection for that classic lounge sound.',
    mode: 'chord',
    benefits: 'Learn the two chords that unlock the "cocktail piano" sound. Practice all inversions to play them anywhere on the keyboard.',
    config: {
      keyProgression: ['C'], // Fixed key for this specific stylistic lesson
      generateProgression: generateLoungeDrill,
      scaleType: 'major',
      requireAllInversions: false // Explicitly disable strict inversion tracking
    }
  }
};

/**
 * Get exercise configuration by ID
 * @param {string} exerciseId - Exercise identifier
 * @returns {Object|null} Exercise configuration or null if not found
 */
export function getExercise(exerciseId) {
  return EXERCISES[exerciseId] || null;
}

/**
 * Get all available exercises
 * @returns {Array} Array of exercise configurations
 */
export function getAllExercises() {
  return Object.values(EXERCISES);
}
