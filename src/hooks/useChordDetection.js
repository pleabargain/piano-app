import { useState, useEffect } from 'react';
import { identifyChord, identifyAllChords, findPotentialChords } from '../core/music-theory';

export function useChordDetection(activeNotes) {
    const [detectedChord, setDetectedChord] = useState(null);
    const [detectedChords, setDetectedChords] = useState([]);
    const [chordSuggestions, setChordSuggestions] = useState([]);

    useEffect(() => {
        console.log('[useChordDetection] useEffect triggered', { activeNotes, length: activeNotes?.length });
        
        // Identify all possible chord interpretations
        const allChords = identifyAllChords(activeNotes);
        console.log('[useChordDetection] All chords detected:', allChords.length, allChords.map(c => c.name).join(', '));
        
        // Set the array of all detected chords
        setDetectedChords(allChords);
        
        // For backward compatibility, also set the first detected chord
        const firstChord = allChords.length > 0 ? allChords[0] : null;
        setDetectedChord(firstChord);
        
        if (allChords.length > 0) {
            console.log('[useChordDetection] ✅ CHORDS DETECTED:', {
                count: allChords.length,
                chords: allChords.map(c => ({
                    name: c.name,
                    root: c.root,
                    type: c.type,
                    inversion: c.inversion
                })),
                activeNotes: activeNotes
            });
        } else {
            console.log('[useChordDetection] ❌ NO CHORD DETECTED', {
                activeNotes: activeNotes,
                activeNotesLength: activeNotes?.length,
                reason: activeNotes?.length < 3 ? 'Insufficient notes (need 3+)' : 'Notes do not form a recognized chord'
            });
        }

        // Find potential chords (suggestions)
        if (activeNotes && activeNotes.length >= 2) {
            const suggestions = findPotentialChords(activeNotes);
            console.log('[useChordDetection] Potential chords found:', suggestions.length);
            // Filter out detected chords from suggestions to avoid redundancy
            const detectedChordNames = new Set(allChords.map(c => c.name));
            const filteredSuggestions = suggestions.filter(s => !detectedChordNames.has(s.name));
            console.log('[useChordDetection] Filtered suggestions:', filteredSuggestions.length);
            setChordSuggestions(filteredSuggestions);
        } else {
            console.log('[useChordDetection] No suggestions (insufficient notes)');
            setChordSuggestions([]);
        }
    }, [activeNotes]);

    return { detectedChord, detectedChords, chordSuggestions };
}
