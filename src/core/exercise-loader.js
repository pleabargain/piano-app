// https://github.com/pleabargain/piano-app
import { getExercise, CIRCLE_OF_FIFTHS_KEYS } from './exercise-config';

/**
 * Parse URL search parameters
 * @param {string} search - URL search string (e.g., "?startKey=C&keys=12")
 * @returns {Object} Parsed parameters
 */
export function parseUrlParams(search) {
  // URLSearchParams requires search string to start with ? or be empty
  // If it doesn't start with ?, treat it as invalid and return nulls
  if (search && !search.startsWith('?')) {
    return {
      startKey: null,
      keys: null,
    };
  }
  const params = new URLSearchParams(search);
  return {
    startKey: params.get('startKey') || null,
    keys: params.get('keys') ? parseInt(params.get('keys'), 10) : null,
  };
}

/**
 * Load exercise configuration from URL
 * @param {string} exerciseId - Exercise identifier from URL
 * @param {string} search - URL search string
 * @returns {Object|null} Exercise configuration with parsed parameters or null if not found
 */
export function loadExerciseFromUrl(exerciseId, search = '') {
  const exercise = getExercise(exerciseId);
  if (!exercise) {
    return null;
  }

  const params = parseUrlParams(search);
  
  // Clone exercise config to avoid mutating original
  const exerciseConfig = {
    ...exercise,
    params: {
      startKey: params.startKey,
      keys: params.keys,
    }
  };

  // Validate and apply startKey parameter
  if (params.startKey) {
    const startKeyIndex = CIRCLE_OF_FIFTHS_KEYS.indexOf(params.startKey);
    if (startKeyIndex !== -1) {
      exerciseConfig.startKeyIndex = startKeyIndex;
    }
  }

  // Validate and apply keys parameter
  if (params.keys && params.keys > 0 && params.keys <= CIRCLE_OF_FIFTHS_KEYS.length) {
    exerciseConfig.maxKeys = params.keys;
  }

  return exerciseConfig;
}

/**
 * Get exercise ID from URL path
 * @param {string} pathname - URL pathname (e.g., "/exercise/i-v-i-circle")
 * @returns {string|null} Exercise ID or null if path doesn't match
 */
export function getExerciseIdFromPath(pathname) {
  const match = pathname.match(/^\/exercise\/([^/]+)$/);
  return match ? match[1] : null;
}
