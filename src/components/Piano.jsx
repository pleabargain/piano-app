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
    feedbackState = {} // { noteNumber: 'correct' | 'incorrect' }
}) => {
    const keys = [];

    // Generate keys
    for (let i = startNote; i <= endNote; i++) {
        const noteName = NOTES[i % 12];
        const isBlack = noteName.includes('#');

        keys.push({
            midi: i,
            noteName,
            isBlack,
            isActive: activeNotes.includes(i),
            isHighlighted: highlightedNotes.includes(i % 12) || chordMidiNotes.includes(i), // Compare pitch class or exact MIDI
            isChordNote: chordMidiNotes.includes(i), // Specific chord note highlighting
            status: feedbackState[i] || null
        });
    }

    return (
        <div className="piano-container">
            <div className="piano">
                {keys.map((key) => (
                    <div
                        key={key.midi}
                        className={`key ${key.isBlack ? 'black' : 'white'} 
              ${key.isActive ? 'active' : ''} 
              ${key.isHighlighted ? 'highlighted' : ''}
              ${key.isChordNote ? 'chord-note' : ''}
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
