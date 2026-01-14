
import { getChordNameFromRoman } from './music-theory';
import { normalizeChordText } from './chord-text';
import { cleanInputText } from './data-cleanup';

const ROMAN_REGEX = /^(b|#)?(VII|III|IV|VI|II|V|I|vii|iii|iv|vi|ii|v|i)(°|\+|dim|aug|7|maj7|min7)?$/;

/**
 * Normalizes a chord token to standard format.
 * Handles Unicode flats (♭) -> b, sharps (♯) -> #, etc.
 * Handles subscript m (ₘ) -> m
 * Handles superscript digits (⁷) -> 7 and superscript letters (ᵐᵃʲ) -> maj
 */
export function normalizeToken(token) {
    return normalizeChordText(token);
}

/**
 * Parses a progression string into an array of chord objects.
 * Supports Roman Numerals (with context of scaleNotes) and Absolute Chords.
 * @param {string} text - The input string (e.g. "I IV V" or "C Fm G7")
 * @param {Array} scaleNotes - Array of notes in the current key (needed for Roman numerals)
 * @returns {object} { chords: Array, error: string|null }
 */
export function parseProgression(text, scaleNotes = []) {
    if (!text || !text.trim()) {
        return { chords: [], error: null };
    }

    // Clean input: remove zero-width spaces and other invisible Unicode characters
    const cleanedText = cleanInputText(text);
    
    if (!cleanedText) {
        return { chords: [], error: null };
    }

    // Treat lead-sheet bars and hyphens as separators
    const normalizedText = cleanedText.replace(/\|/g, ' ').replace(/-/g, ' ');
    const tokens = normalizedText.trim().split(/\s+/).filter(Boolean);
    const results = [];

    for (let rawToken of tokens) {
        // Skip empty tokens
        if (!rawToken || !rawToken.trim()) {
            continue;
        }

        const token = normalizeToken(rawToken);

        // 1. Try Roman Numeral Parsing
        if (ROMAN_REGEX.test(token)) {
            if (!scaleNotes || scaleNotes.length === 0) {
                // Warn but maybe continue or fail? 
                // If mixed input, we might want to fail if context is missing for Roman
                // But for now, let's assume if it looks Roman and we have no scale, it's an error/warning
                // or we just pass it through as a raw string if possible?
                // The original code warned.
                // let's return error if roman is strict
            } else {
                try {
                    // We need to import getChordNameFromRoman or pass it in. 
                    // Assuming we import it from music-theory or similar.
                    const chordName = getChordNameFromRoman(token, scaleNotes);
                    results.push({ roman: rawToken, name: chordName, type: 'roman' });
                    continue;
                } catch (err) {
                    // Fall through to absolute
                }
            }
        }

        // 2. Try Absolute Chord Parsing
        // Regex for [A-G] followed by optional b/#, then anything
        if (/^[A-G][b#]?/i.test(token)) {
            // We use the normalized token as the name, 
            // but we might want to standardize format (e.g. Cm instead of cm)
            // For now, simple pass-through with normalized chars
            results.push({ roman: rawToken, name: token, type: 'absolute' });
            continue;
        }

        return { chords: [], error: `Invalid symbol: ${rawToken}` };
    }

    return { chords: results, error: null };
}
