import { useState, useEffect } from 'react';
import { identifyChord, findPotentialChords } from '../core/music-theory';

export function useChordDetection(activeNotes) {
    const [detectedChord, setDetectedChord] = useState(null);
    const [chordSuggestions, setChordSuggestions] = useState([]);

    useEffect(() => {
        console.log('[useChordDetection] useEffect triggered', { activeNotes, length: activeNotes?.length });
        
        // Identify the chord from active notes
        const chord = identifyChord(activeNotes);
        console.log('[useChordDetection] Chord detected:', chord ? `🎵 ${chord.name} ${chord.inversion ? `(${chord.inversion})` : ''}` : 'null');
        
        if (chord) {
            console.log('[useChordDetection] ✅ CHORD DETECTED:', {
                name: chord.name,
                root: chord.root,
                type: chord.type,
                inversion: chord.inversion,
                activeNotes: activeNotes
            });
        } else {
            console.log('[useChordDetection] ❌ NO CHORD DETECTED', {
                activeNotes: activeNotes,
                activeNotesLength: activeNotes?.length,
                reason: activeNotes?.length < 3 ? 'Insufficient notes (need 3+)' : 'Notes do not form a recognized chord'
            });
        }
        
        setDetectedChord(chord);

        // Find potential chords (suggestions)
        if (activeNotes && activeNotes.length >= 2) {
            const suggestions = findPotentialChords(activeNotes);
            console.log('[useChordDetection] Potential chords found:', suggestions.length);
            // Filter out the detected chord itself from suggestions to avoid redundancy
            const filteredSuggestions = chord
                ? suggestions.filter(s => s.name !== chord.name)
                : suggestions;
            console.log('[useChordDetection] Filtered suggestions:', filteredSuggestions.length);
            setChordSuggestions(filteredSuggestions);
        } else {
            console.log('[useChordDetection] No suggestions (insufficient notes)');
            setChordSuggestions([]);
        }
    }, [activeNotes]);

    return { detectedChord, chordSuggestions };
}
