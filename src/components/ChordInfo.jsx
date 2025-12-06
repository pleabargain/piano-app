// https://github.com/pleabargain/piano-app
import React from 'react';
import './ChordInfo.css';

/**
 * ChordInfo Component
 * Displays chord information for the left piano frame
 * Shows locked chord, detected chord, and potential chord suggestions
 */
const ChordInfo = ({
    detectedChord,
    chordSuggestions,
    lockedChord,
    onLockChord,
    onUnlockChord,
    activeNotes,
    hideExtensions = false
}) => {
    const hasActiveNotes = activeNotes && activeNotes.length > 0;
    const hasTwoNotes = activeNotes && activeNotes.length === 2;

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
                    {detectedChord ? (
                        <>
                            <div className="detected-chord-name">{detectedChord.name}</div>
                            {detectedChord.inversion && (
                                <div className="detected-chord-inversion">
                                    {detectedChord.inversion}
                                </div>
                            )}
                            <button
                                className="lock-button"
                                onClick={() => onLockChord(detectedChord)}
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
