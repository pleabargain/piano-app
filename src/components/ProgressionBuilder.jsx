// https://github.com/pleabargain/piano-app
import React, { useState, useEffect } from 'react';
import './ProgressionBuilder.css';
import { getScaleNotes, NOTES } from '../core/music-theory';

const ROMAN_REGEX = /^(b|#)?(VII|III|IV|VI|II|V|I|vii|iii|iv|vi|ii|v|i)(°|\+|dim|aug|7|maj7|min7)?$/;

const ProgressionBuilder = ({ selectedRoot, selectedScaleType, onProgressionSet, onChordClick }) => {
    const [input, setInput] = useState('I IV V I');
    const [parsedChords, setParsedChords] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        validateAndParse(input);
    }, [input, selectedRoot, selectedScaleType]);

    const validateAndParse = (text) => {
        if (!text.trim()) {
            setParsedChords([]);
            setError('');
            return;
        }

        const tokens = text.trim().split(/\s+/);
        const scaleNotes = getScaleNotes(selectedRoot, selectedScaleType);

        if (scaleNotes.length === 0) return;

        const results = [];
        let isValid = true;

        for (let token of tokens) {
            if (!ROMAN_REGEX.test(token)) {
                isValid = false;
                setError(`Invalid symbol: ${token}`);
                break;
            }

            // Simple mapping logic (can be expanded)
            // This is a basic implementation to show the chord name
            // Real implementation would need a robust Roman Numeral parser
            const chordName = getChordNameFromRoman(token, scaleNotes);
            results.push({ roman: token, name: chordName });
        }

        if (isValid) {
            setError('');
            setParsedChords(results);
        } else {
            setParsedChords([]);
        }
    };

    const handleSet = () => {
        if (!error && parsedChords.length > 0) {
            onProgressionSet(parsedChords);
        }
    };

    return (
        <div className="progression-builder">
            <h3>Custom Progression</h3>
            <div className="input-group">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g., I IV V ii"
                />
                <button onClick={handleSet} disabled={!!error || !input}>
                    Set Progression
                </button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <div className="preview">
                {parsedChords.map((chord, idx) => (
                    <div 
                        key={idx} 
                        className="chord-preview clickable-chord"
                        onClick={() => onChordClick && onChordClick(chord.name)}
                        style={{ cursor: onChordClick ? 'pointer' : 'default' }}
                    >
                        <div className="roman">{chord.roman}</div>
                        <div className="alpha">{chord.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Helper to guess chord name from Roman Numeral
// This is a simplified version.
function getChordNameFromRoman(roman, scaleNotes) {
    const degreeMap = {
        'i': 0, 'ii': 1, 'iii': 2, 'iv': 3, 'v': 4, 'vi': 5, 'vii': 6,
        'I': 0, 'II': 1, 'III': 2, 'IV': 3, 'V': 4, 'VI': 5, 'VII': 6
    };

    // Extract base degree (case insensitive match for I, II, etc)
    const match = roman.match(/^(b|#)?(VII|III|IV|VI|II|V|I)/i);
    if (!match) return '?';

    const accidental = match[1] || '';
    const baseRoman = match[2];
    const suffix = roman.substring(match[0].length);

    let degreeIndex = degreeMap[baseRoman];

    // Handle accidental on the root (e.g. bIII)
    // This is complex because scaleNotes are fixed. 
    // For now, we just grab the note at the degree index.
    // A real implementation would handle chromatic alterations.

    let rootNote = scaleNotes[degreeIndex];

    // Determine quality from case and suffix
    const isLowerCase = baseRoman === baseRoman.toLowerCase();
    let quality = '';

    if (suffix === '°' || suffix === 'dim') quality = 'dim';
    else if (suffix === '+') quality = 'aug';
    else if (isLowerCase) quality = 'm';
    else quality = ''; // Major

    if (suffix.includes('7')) quality += '7';

    return rootNote + quality;
}

export default ProgressionBuilder;
