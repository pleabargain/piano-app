// https://github.com/pleabargain/piano-app
/**
 * Data cleanup utilities for handling user input
 * Removes invisible Unicode characters, normalizes whitespace, and provides helpful suggestions
 */

/**
 * Cleans input text by removing zero-width spaces and other invisible Unicode characters
 * @param {string} text - Input text to clean
 * @returns {string} Cleaned text
 */
export function cleanInputText(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }

    // Remove zero-width spaces and other invisible Unicode characters
    // U+200B: zero-width space
    // U+200C: zero-width non-joiner
    // U+200D: zero-width joiner
    // U+FEFF: zero-width no-break space (BOM)
    // U+00AD: soft hyphen
    let cleaned = text.replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '');

    // Replace various Unicode space types with regular space
    // U+2000-U+200A: various space types
    // U+2028: line separator
    // U+2029: paragraph separator
    cleaned = cleaned.replace(/[\u2000-\u200A\u2028\u2029]/g, ' ');

    // Normalize multiple spaces to single space
    cleaned = cleaned.replace(/\s+/g, ' ');

    return cleaned.trim();
}

/**
 * Suggests fixes for common input errors
 * @param {string} originalInput - Original input text
 * @param {string} errorMessage - Error message from parser
 * @returns {string|null} Suggested fix or null if no suggestion
 */
export function suggestFix(originalInput, errorMessage) {
    if (!errorMessage || !originalInput) {
        return null;
    }

    const cleaned = cleanInputText(originalInput);
    
    // If cleaning fixes the issue, suggest using cleaned version
    if (cleaned !== originalInput.trim()) {
        return `Try: "${cleaned}" (removed invisible characters)`;
    }

    // Check for common issues
    if (errorMessage.includes('Invalid symbol')) {
        const invalidSymbol = errorMessage.match(/Invalid symbol: (.+)/)?.[1];
        if (invalidSymbol && invalidSymbol.trim().length === 0) {
            return 'Empty token detected. Make sure chords are separated by spaces only.';
        }
        if (invalidSymbol && /[\u200B-\u200D\uFEFF]/.test(invalidSymbol)) {
            return 'Invisible characters detected. Try copying the text again or typing it manually.';
        }
    }

    return null;
}

/**
 * Provides sample inputs for users to understand what formats work
 * @returns {Object} Object with examples for different input types
 */
export function getSampleInputs() {
    return {
        romanNumerals: [
            'I IV V I',
            'I vi IV V',
            'i bVII bVI V',
            'ii7 V7 I vi',
            'I V vi iii IV I IV V'
        ],
        absoluteChords: [
            'C F G C',
            'C Am F G',
            'A♭ E♭ Fm D♭ B♭m',
            'Ab Eb Fm Db Bbm',
            'Cm Bb Ab G',
            'C Fm G7 Am'
        ],
        mixed: [
            'I IV V C',
            'C F G I'
        ]
    };
}

/**
 * Formats sample inputs for display
 * @returns {string} Formatted HTML string with examples
 */
export function formatSampleInputs() {
    const samples = getSampleInputs();
    let html = '<div class="sample-inputs">';
    
    html += '<div class="sample-section"><strong>Roman Numerals:</strong><ul>';
    samples.romanNumerals.forEach(ex => {
        html += `<li><code>${ex}</code></li>`;
    });
    html += '</ul></div>';

    html += '<div class="sample-section"><strong>Absolute Chords:</strong><ul>';
    samples.absoluteChords.forEach(ex => {
        html += `<li><code>${ex}</code></li>`;
    });
    html += '</ul></div>';

    html += '</div>';
    return html;
}
