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
 * Generate a progression of triad inversions for specific keys
 * @returns {Array} Array of chord objects with target inversions: [{name: 'C Major', roman: 'I', inversion: 'Root Position'}, ...]
 */
export function generateTriadInversions() {
  const keys = ['C', 'F', 'G'];
  const inversions = ['Root Position', '1st Inversion', '2nd Inversion', 'Root Position'];
  const progression = [];

  keys.forEach(key => {
    const scaleNotes = getScaleNotes(key, 'major');
    inversions.forEach(inv => {
      progression.push({
        name: `${key} Major`,
        roman: 'I', // In these specific keys, they are the I chord of their own major scale
        inversion: inv
      });
    });
  });

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
    description: 'Cycle through C, F, and G Major triad inversions: Root -> 1st -> 2nd -> Root. 💎 Keep the "glue" note (common tone) held down!',
    mode: 'chord',
    benefits: 'Builds chord visualization fluency and smooth hand movement (voice leading) across the keyboard.',
    config: {
      keyProgression: ['C'], // Just one "key cycle" since the generator handles C, F, G internal to its sequence
      generateProgression: generateTriadInversions,
      scaleType: 'major'
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
