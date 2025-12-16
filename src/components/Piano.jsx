// https://github.com/pleabargain/piano-app
import React from 'react';
import './Piano.css';
import { NOTES } from '../core/music-theory';

const Piano = ({
    startNote = 36, // C2
    endNote = 96,   // C7
    activeNotes = [],
    highlightedNotes = [], // Notes to show as part of scale/chord (pitch classes)
    chordMidiNotes = [], // Specific MIDI notes to highlight for chord display
    lavaKeys = [], // MIDI numbers that are "lava" (bad keys) in lava game mode
    mode = 'free', // Current mode to determine styling
    feedbackState = {}, // { noteNumber: 'correct' | 'incorrect' }
    expectedNotes = [] // MIDI note numbers that should be played (from playback)
}) => {
    const keys = [];

    // Generate keys
    for (let i = startNote; i <= endNote; i++) {
        const noteName = NOTES[i % 12];
        const isBlack = noteName.includes('#');
        const isLavaKey = lavaKeys.includes(i);
        const isLavaGoodKey = mode === 'lava' && highlightedNotes.includes(i % 12) && !isLavaKey;

        keys.push({
            midi: i,
            noteName,
            isBlack,
            isActive: activeNotes.includes(i),
            // Don't apply 'highlighted' class in lava mode - use lava-good-key instead
            isHighlighted: mode !== 'lava' && (highlightedNotes.includes(i % 12) || chordMidiNotes.includes(i)), // Compare pitch class or exact MIDI
            isChordNote: chordMidiNotes.includes(i), // Specific chord note highlighting
            isLavaKey: isLavaKey, // Lava key (bad key) in lava game
            isLavaGoodKey: isLavaGoodKey, // Good key in lava game (ice blue)
            status: feedbackState[i] || null,
            isExpected: expectedNotes.includes(i) // Expected note from playback
        });
    }

    return (
        <div className={`piano-container ${mode === 'lava' ? 'lava-mode' : ''}`}>
            <div className="piano">
                {keys.map((key) => (
                    <div
                        key={key.midi}
                        className={`key ${key.isBlack ? 'black' : 'white'} 
              ${key.isActive ? 'active' : ''} 
              ${key.isHighlighted ? 'highlighted' : ''}
              ${key.isChordNote ? 'chord-note' : ''}
              ${key.isLavaKey ? 'lava-key' : ''}
              ${key.isLavaGoodKey ? 'lava-good-key' : ''}
              ${key.isExpected ? 'expected' : ''}
              ${key.status ? key.status : ''}
            `}
                        data-note={key.noteName}
                    >
                        <span className="note-label">{key.noteName}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Piano;
