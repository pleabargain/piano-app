// https://github.com/pleabargain/piano-app
/**
 * Shared text normalization for chord symbols.
 *
 * Goals:
 * - Accept common unicode variants (♭, ♯, ₘ, superscript digits/maj letters)
 * - Produce a consistent ASCII-ish representation for parsing
 */
const SUPERSCRIPT_DIGITS = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
};

/**
 * Normalize a chord token / chord name string.
 * Examples:
 * - "Eₘ⁷" -> "Em7"
 * - "Fᵐᵃʲ⁷" -> "Fmaj7"
 * - "D/F♯" -> "D/F#"
 * - "B♭m7" -> "Bbm7"
 */
export function normalizeChordText(input) {
  if (!input) return '';
  return String(input)
    .replace(/♭/g, 'b')
    .replace(/♯/g, '#')
    .replace(/ₘ/g, 'm')
    // Superscript letters (commonly used in "maj")
    .replace(/ᵐ/g, 'm')
    .replace(/ᵃ/g, 'a')
    .replace(/ʲ/g, 'j')
    // Superscript digits
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (ch) => SUPERSCRIPT_DIGITS[ch] ?? ch)
    .trim();
}

