import { useState, useEffect } from 'react';
import { identifyChord, findPotentialChords } from '../core/music-theory';

export function useChordDetection(activeNotes) {
    const [detectedChord, setDetectedChord] = useState(null);
    const [chordSuggestions, setChordSuggestions] = useState([]);

    useEffect(() => {
        // Identify the chord from active notes
        const chord = identifyChord(activeNotes);
        setDetectedChord(chord);

        // Find potential chords (suggestions)
        if (activeNotes && activeNotes.length >= 2) {
            const suggestions = findPotentialChords(activeNotes);
            // Filter out the detected chord itself from suggestions to avoid redundancy
            const filteredSuggestions = chord
                ? suggestions.filter(s => s.name !== chord.name)
                : suggestions;
            setChordSuggestions(filteredSuggestions);
        } else {
            setChordSuggestions([]);
        }
    }, [activeNotes]);

    return { detectedChord, chordSuggestions };
}
