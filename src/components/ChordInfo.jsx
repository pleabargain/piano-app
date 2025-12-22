// https://github.com/pleabargain/piano-app
import React from 'react';
import './ChordInfo.css';

/**
 * ChordInfo Component
 * Displays chord information for the left piano frame
 * Shows locked chord, detected chord(s), and potential chord suggestions
 */
const ChordInfo = ({
    detectedChord,
    detectedChords = [],
    chordSuggestions,
    lockedChord,
    onLockChord,
    onUnlockChord,
    activeNotes,
    hideExtensions = false
}) => {
    const hasActiveNotes = activeNotes && activeNotes.length > 0;
    const hasTwoNotes = activeNotes && activeNotes.length === 2;
    
    // Use detectedChords array if available, otherwise fall back to detectedChord
    const chordsToDisplay = detectedChords.length > 0 ? detectedChords : (detectedChord ? [detectedChord] : []);

    return (
        <div className="chord-info-container">
            <h3>Chord Practice</h3>

            {/* Locked Chord Section */}
            {lockedChord && (
                <div className="locked-chord-section">
                    <div className="locked-chord-header">
                        <span className="lock-icon">🔒</span>
                        <span className="locked-label">Locked Chord</span>
                    </div>
                    <div className="locked-chord-name">{lockedChord.name}</div>
                    <button
                        className="unlock-button"
                        onClick={onUnlockChord}
                        title="Unlock chord"
                    >
                        Unlock
                    </button>
                </div>
            )}

            {/* Detected Chord Section */}
            {!lockedChord && (
                <div className="detected-chord-section">
                    <div className="section-label">Currently Playing</div>
                    {chordsToDisplay.length > 0 ? (
                        <>
                            {chordsToDisplay.length === 1 ? (
                                <>
                                    <div className="detected-chord-name">{chordsToDisplay[0].name}</div>
                                    {chordsToDisplay[0].inversion && (
                                        <div className="detected-chord-inversion">
                                            {chordsToDisplay[0].inversion}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="detected-chord-name multiple-chords">
                                        {chordsToDisplay.map((chord, index) => (
                                            <span key={index} className="chord-variant">
                                                {chord.name}
                                                {index < chordsToDisplay.length - 1 && <span className="chord-separator"> / </span>}
                                            </span>
                                        ))}
                                    </div>
                                    {chordsToDisplay[0].inversion && (
                                        <div className="detected-chord-inversion">
                                            {chordsToDisplay[0].inversion}
                                        </div>
                                    )}
                                    <div className="harmonic-function-note">
                                        Multiple harmonic functions detected
                                    </div>
                                </>
                            )}
                            <button
                                className="lock-button"
                                onClick={() => onLockChord(chordsToDisplay[0])}
                                title="Lock this chord"
                            >
                                🔓 Lock Chord
                            </button>
                        </>
                    ) : hasActiveNotes ? (
                        <div className="no-chord-placeholder">
                            Playing... (no chord detected)
                        </div>
                    ) : (
                        <div className="no-chord-placeholder">
                            Play a chord to detect
                        </div>
                    )}
                </div>
            )}

            {/* Chord Extensions - Only show if hideExtensions is false */}
            {!hideExtensions && detectedChord && chordSuggestions.length > 0 && (
                <div className="chord-extensions-section">
                    <div className="section-label">
                        🎵 Extensions / Variations
                    </div>
                    <div className="suggestions-list">
                        {chordSuggestions.slice(0, 3).map((suggestion, index) => (
                            <div key={index} className="suggestion-item">
                                <span className="suggestion-name">{suggestion.name}</span>
                                <span className="suggestion-missing">
                                    +{suggestion.missingNotes.join(', ')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChordInfo;
