// https://github.com/pleabargain/piano-app
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
 * Exercise configuration registry
 */
export const EXERCISES = {
  'i-v-i-circle': {
    id: 'i-v-i-circle',
    name: 'I-V-I Circle of Fifths',
    description: 'Practice I-V-I chord progressions through all 12 keys in Circle of Fifths order',
    mode: 'chord',
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
    config: {
      keyProgression: CIRCLE_OF_FIFTHS_KEYS,
      generateProgression: (root) => generateProgressionFromRomanPattern('I IV V I', root, 'major'),
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
