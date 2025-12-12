// https://github.com/pleabargain/piano-app
import React, { useState } from 'react';
import './KeyProgressionBuilder.css';
import { NOTES } from '../core/music-theory';

const KeyProgressionBuilder = ({ onProgressionSet, onClear }) => {
    const [input, setInput] = useState('');
    const [error, setError] = useState('');

    const validateAndParse = (text) => {
        if (!text.trim()) {
            setError('');
            return [];
        }

        const tokens = text.trim().split(/\s+/);
        const validKeys = [];
        const invalidKeys = [];

        for (let token of tokens) {
            // Normalize the token (handle flats, etc.)
            const normalizedToken = normalizeNote(token);
            if (NOTES.includes(normalizedToken)) {
                validKeys.push(normalizedToken);
            } else {
                invalidKeys.push(token);
            }
        }

        if (invalidKeys.length > 0) {
            setError(`Invalid keys: ${invalidKeys.join(', ')}`);
            return [];
        }

        setError('');
        return validKeys;
    };

    const normalizeNote = (note) => {
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

        // Handle lowercase
        const capitalized = note.charAt(0).toUpperCase() + note.slice(1);
        return flatToSharp[capitalized] || capitalized;
    };

    const handleSet = () => {
        const keys = validateAndParse(input);
        if (keys.length > 0) {
            onProgressionSet(keys);
        }
    };

    const handleClear = () => {
        setInput('');
        setError('');
        if (onClear) {
            onClear();
        }
    };

    return (
        <div className="key-progression-builder">
            <h3>Key Progression Practice</h3>
            <div className="input-group">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        setError(''); // Clear error on input change
                    }}
                    placeholder="e.g., F C G D"
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleSet();
                        }
                    }}
                />
                <button onClick={handleSet} disabled={!input.trim()}>
                    Set Progression
                </button>
                <button onClick={handleClear} className="clear-btn">
                    Clear
                </button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <div className="info-text">
                Practice scales in each key sequentially. Complete a scale to advance to the next key.
            </div>
        </div>
    );
};

export default KeyProgressionBuilder;

