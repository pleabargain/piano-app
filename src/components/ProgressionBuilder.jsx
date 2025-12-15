// https://github.com/pleabargain/piano-app
import React, { useState, useEffect } from 'react';
import './ProgressionBuilder.css';
import { getScaleNotes, NOTES } from '../core/music-theory';

const ROMAN_REGEX = /^(b|#)?(VII|III|IV|VI|II|V|I|vii|iii|iv|vi|ii|v|i)(°|\+|dim|aug|7|maj7|min7)?$/;

// Predefined chord progressions from screenshots
const PREDEFINED_PROGRESSIONS = [
    // First set of 16 progressions
    { name: 'Epic Pop progression', progression: 'I V vi IV', length: 4 },
    { name: 'Doo-Wop progression', progression: 'I vi IV V', length: 4 },
    { name: 'Heartfelt progression', progression: 'vi IV I V', length: 4 },
    { name: 'Passion progression', progression: 'i bVII bVI V', length: 4 },
    { name: 'Wandering progression', progression: 'i bVII bVI bVII', length: 4 },
    { name: 'Sunrise Hope progression', progression: 'I V vi iii IV I IV V', length: 8 },
    { name: 'Heartbreak progression', progression: 'i bVI bIII bVII', length: 4 },
    { name: 'Circle progression', progression: 'vi ii V I', length: 4 },
    { name: 'Sentimental progression', progression: 'I vi ii V', length: 4 },
    { name: 'Dreamy progression', progression: 'I IV vi V', length: 4 },
    { name: 'Bittersweet progression', progression: 'I III IV iv', length: 4 },
    { name: 'Bassline Bounce progression', progression: 'I ii I IV', length: 4 },
    { name: 'Surprise progression', progression: 'V vi IV I', length: 4 },
    { name: 'Rhythm Changes progression', progression: 'I VI II V', length: 4 },
    { name: 'Rock Vamp progression', progression: 'I bVII I bVII', length: 4 },
    { name: 'Shifting Shades progression', progression: 'IV iv I I', length: 4 },
    // Second set of 16 progressions
    { name: 'Cyclical progression', progression: 'IV I V vi', length: 4 },
    { name: 'Weeping progression', progression: 'i i IV VI', length: 4 },
    { name: 'Dark Vamp progression', progression: 'i bVII i bVII', length: 4 },
    { name: 'Uplifting progression', progression: 'IV V vi I', length: 4 },
    { name: 'Royal Road progression', progression: 'IV V iii vi', length: 4 },
    { name: 'Resolution progression', progression: 'vi IV V I', length: 4 },
    { name: 'Jukebox progression', progression: 'I VI IV V', length: 4 },
    { name: 'Grunge progression', progression: 'i iv bIII bVI', length: 4 },
    { name: 'Hard Rock progression', progression: 'I V bVII IV', length: 4 },
    { name: 'Dramatic progression', progression: 'vi V IV III', length: 4 },
    { name: 'Soul Journey progression', progression: 'I IV vi V iii vi ii V', length: 8 },
    { name: 'Endless Anthem progression', progression: 'vi IV I V vi IV I V', length: 8 },
    { name: 'Heroic Circle progression', progression: 'I IV bVII III vi ii V I', length: 8 },
    { name: 'Storyteller progression', progression: 'I ii iii IV V vi V I', length: 8 },
    { name: 'Emotional Wave progression', progression: 'I III IV iv V vi ii V', length: 8 },
];

const ProgressionBuilder = ({ selectedRoot, selectedScaleType, onProgressionSet, onChordClick }) => {
    const [input, setInput] = useState('I IV V I');
    const [parsedChords, setParsedChords] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        validateAndParse(input);
    }, [input, selectedRoot, selectedScaleType]);

    const validateAndParse = (text) => {
        console.log('[ProgressionBuilder] validateAndParse called', { text, selectedRoot, selectedScaleType });
        if (!text.trim()) {
            console.log('[ProgressionBuilder] Empty input, clearing parsedChords');
            setParsedChords([]);
            setError('');
            return;
        }

        const tokens = text.trim().split(/\s+/);
        console.log('[ProgressionBuilder] Tokens:', tokens);
        const scaleNotes = getScaleNotes(selectedRoot, selectedScaleType);
        console.log('[ProgressionBuilder] Scale notes:', scaleNotes);

        if (scaleNotes.length === 0) {
            console.warn('[ProgressionBuilder] No scale notes found for', { selectedRoot, selectedScaleType });
            return;
        }

        const results = [];
        let isValid = true;

        for (let token of tokens) {
            console.log('[ProgressionBuilder] Processing token:', token);
            if (!ROMAN_REGEX.test(token)) {
                console.error('[ProgressionBuilder] Invalid token:', token);
                isValid = false;
                setError(`Invalid symbol: ${token}`);
                break;
            }

            // Simple mapping logic (can be expanded)
            // This is a basic implementation to show the chord name
            // Real implementation would need a robust Roman Numeral parser
            const chordName = getChordNameFromRoman(token, scaleNotes);
            console.log('[ProgressionBuilder] Token -> Chord:', { token, chordName });
            results.push({ roman: token, name: chordName });
        }

        if (isValid) {
            console.log('[ProgressionBuilder] Validation successful, parsed chords:', results);
            setError('');
            setParsedChords(results);
        } else {
            console.warn('[ProgressionBuilder] Validation failed');
            setParsedChords([]);
        }
    };

    const handleSet = () => {
        console.log('[ProgressionBuilder] handleSet called', { error, parsedChords, input, parsedChordsLength: parsedChords.length });
        if (!error && parsedChords.length > 0) {
            console.log('[ProgressionBuilder] Setting progression:', parsedChords);
            onProgressionSet(parsedChords);
        } else {
            console.warn('[ProgressionBuilder] Cannot set progression:', { 
                hasError: !!error, 
                parsedChordsLength: parsedChords.length,
                error,
                parsedChords,
                input
            });
        }
    };

    const handlePredefinedClick = (progressionText) => {
        console.log('[ProgressionBuilder] Predefined progression clicked:', progressionText);
        setInput(progressionText);
        // Parse the progression immediately
        const tokens = progressionText.trim().split(/\s+/);
        const scaleNotes = getScaleNotes(selectedRoot, selectedScaleType);
        
        if (scaleNotes.length === 0) {
            console.warn('[ProgressionBuilder] No scale notes found');
            return;
        }

        const results = [];
        let isValid = true;

        for (let token of tokens) {
            if (!ROMAN_REGEX.test(token)) {
                isValid = false;
                setError(`Invalid symbol: ${token}`);
                break;
            }
            const chordName = getChordNameFromRoman(token, scaleNotes);
            results.push({ roman: token, name: chordName });
        }

        if (isValid && results.length > 0) {
            setError('');
            setParsedChords(results);
            // Automatically set the progression
            onProgressionSet(results);
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
                <button 
                    onClick={(e) => {
                        console.log('[ProgressionBuilder] Button clicked', { error, parsedChords, input, disabled: !!error || !input });
                        e.preventDefault();
                        e.stopPropagation();
                        handleSet();
                    }} 
                    disabled={!!error || !input || parsedChords.length === 0}
                >
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

            <div className="predefined-progressions">
                <h4>Predefined Progressions</h4>
                <div className="progression-list">
                    {PREDEFINED_PROGRESSIONS.map((prog, idx) => (
                        <div
                            key={idx}
                            className="progression-item"
                            onClick={() => handlePredefinedClick(prog.progression)}
                        >
                            <span className="progression-play-icon">▶</span>
                            <span className="progression-name">{prog.name}:</span>
                            <span className="progression-chords">{prog.progression.replace(/\s+/g, '-')}</span>
                            <span className="progression-length">({prog.length})</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Helper to guess chord name from Roman Numeral
// This is a simplified version.
function getChordNameFromRoman(roman, scaleNotes) {
    console.log('[ProgressionBuilder] getChordNameFromRoman called', { roman, scaleNotes });
    const degreeMap = {
        'i': 0, 'ii': 1, 'iii': 2, 'iv': 3, 'v': 4, 'vi': 5, 'vii': 6,
        'I': 0, 'II': 1, 'III': 2, 'IV': 3, 'V': 4, 'VI': 5, 'VII': 6
    };

    // Extract base degree (case insensitive match for I, II, etc)
    const match = roman.match(/^(b|#)?(VII|III|IV|VI|II|V|I)/i);
    if (!match) {
        console.warn('[ProgressionBuilder] No match for roman:', roman);
        return '?';
    }

    const accidental = match[1] || '';
    const baseRoman = match[2];
    const suffix = roman.substring(match[0].length);

    let degreeIndex = degreeMap[baseRoman];
    console.log('[ProgressionBuilder] Parsed roman:', { roman, accidental, baseRoman, suffix, degreeIndex });

    // Handle accidental on the root (e.g. bIII)
    // This is complex because scaleNotes are fixed. 
    // For now, we just grab the note at the degree index.
    // A real implementation would handle chromatic alterations.

    let rootNote = scaleNotes[degreeIndex];
    console.log('[ProgressionBuilder] Root note:', rootNote);

    // Determine quality from case and suffix
    const isLowerCase = baseRoman === baseRoman.toLowerCase();
    let chordType = 'major';

    if (suffix === '°' || suffix === 'dim') chordType = 'diminished';
    else if (suffix === '+') chordType = 'augmented';
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

    // Return full name format to match identifyChord output: "C Major", "D Minor", etc.
    const chordTypeNames = {
      'major': 'Major',
      'minor': 'Minor',
      'diminished': 'Diminished',
      'augmented': 'Augmented',
      'major7': 'Major 7',
      'minor7': 'Minor 7',
      'dominant7': 'Dominant 7',
      'diminished7': 'Diminished 7'
    };

    const result = `${rootNote} ${chordTypeNames[chordType] || 'Major'}`;
    console.log('[ProgressionBuilder] Final chord name:', result);
    return result;
}

export default ProgressionBuilder;
