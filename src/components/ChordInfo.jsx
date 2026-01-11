// https://github.com/pleabargain/piano-app
import React from 'react';
import './ChordInfo.css';
import { parseChordName, CHORD_TYPES } from '../core/music-theory';

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
    hideExtensions = false,
    progression = [],
    currentStepIndex = 0,
    mode = 'free',
    chordAcknowledged = false,
    isPracticeActive = false,
    requireAllInversions = false,
    playedInversions = []
}) => {
    const [isDetectedSectionCollapsed, setIsDetectedSectionCollapsed] = React.useState(false);
    const [isContainerCollapsed, setIsContainerCollapsed] = React.useState(false);
    
    const hasActiveNotes = activeNotes && activeNotes.length > 0;
    const hasTwoNotes = activeNotes && activeNotes.length === 2;
    
    // Use detectedChords array if available, otherwise fall back to detectedChord
    const chordsToDisplay = detectedChords.length > 0 ? detectedChords : (detectedChord ? [detectedChord] : []);
    
    // Get current target and next chord for practice mode
    const isChordPracticeMode = mode === 'chord' && progression.length > 0;
    const currentTargetChord = isChordPracticeMode ? progression[currentStepIndex % progression.length] : null;
    const nextChord = isChordPracticeMode ? progression[(currentStepIndex + 1) % progression.length] : null;
    
    // Helper to get expected inversions for a chord type
    const getExpectedInversions = (chordType) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e195f0d9-c6a3-4271-b290-bc8c7ddcceed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChordInfo.jsx:43',message:'getExpectedInversions called',data:{chordType,hasChordType:!!CHORD_TYPES[chordType]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        try {
            const chordTypeData = CHORD_TYPES[chordType];
            if (!chordTypeData) {
                console.error('[ChordInfo] Invalid chord type:', chordType);
                return [];
            }
            const numInversions = chordTypeData.intervals.length + 1;
            const expectedInversions = ['Root Position'];
            for (let i = 1; i < numInversions; i++) {
                if (i === 1) expectedInversions.push('1st Inversion');
                else if (i === 2) expectedInversions.push('2nd Inversion');
                else if (i === 3) expectedInversions.push('3rd Inversion');
            }
            return expectedInversions;
        } catch (error) {
            console.error('[ChordInfo] Error in getExpectedInversions:', error, { chordType });
            return [];
        }
    };
    
    // Get expected inversions for current target chord if in inversion mode
    // #region agent log
    let expectedInversions = [];
    try {
        if (requireAllInversions && currentTargetChord) {
            const parsed = parseChordName(currentTargetChord.name);
            if (parsed && parsed.chordType) {
                expectedInversions = getExpectedInversions(parsed.chordType);
                fetch('http://127.0.0.1:7242/ingest/e195f0d9-c6a3-4271-b290-bc8c7ddcceed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChordInfo.jsx:60',message:'Got expected inversions',data:{chordName:currentTargetChord.name,chordType:parsed.chordType,expectedInversions:expectedInversions},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            } else {
                console.error('[ChordInfo] Failed to parse chord or missing chordType:', { chordName: currentTargetChord?.name, parsed });
                fetch('http://127.0.0.1:7242/ingest/e195f0d9-c6a3-4271-b290-bc8c7ddcceed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChordInfo.jsx:65',message:'Parse failed',data:{chordName:currentTargetChord?.name,parsed},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            }
        }
    } catch (error) {
        console.error('[ChordInfo] Error getting expected inversions:', error, { currentTargetChord, requireAllInversions });
        fetch('http://127.0.0.1:7242/ingest/e195f0d9-c6a3-4271-b290-bc8c7ddcceed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChordInfo.jsx:70',message:'Exception getting inversions',data:{error:error.message,stack:error.stack,chordName:currentTargetChord?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        expectedInversions = [];
    }
    // #endregion

    return (
        <div className={`chord-info-container ${isContainerCollapsed ? 'collapsed' : ''}`}>
            <div 
                className="chord-info-header-clickable"
                onClick={() => setIsContainerCollapsed(!isContainerCollapsed)}
                title={isContainerCollapsed ? "Expand Chord Practice" : "Collapse Chord Practice"}
            >
                <h3>Chord Practice</h3>
                <span className="collapse-toggle-icon">{isContainerCollapsed ? '▶' : '▼'}</span>
            </div>
            {!isContainerCollapsed && (
                <div className="chord-info-content">

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
                <div className={`detected-chord-section ${isDetectedSectionCollapsed ? 'collapsed' : ''}`}>
                    <div 
                        className="section-header-clickable"
                        onClick={() => setIsDetectedSectionCollapsed(!isDetectedSectionCollapsed)}
                        title={isDetectedSectionCollapsed ? "Expand Currently Playing" : "Collapse Currently Playing"}
                    >
                        <div className="section-label">Currently Playing</div>
                        <span className="collapse-toggle-icon">{isDetectedSectionCollapsed ? '▶' : '▼'}</span>
                    </div>
                    {!isDetectedSectionCollapsed && (
                        <div className="detected-chord-content">
                    {chordsToDisplay.length > 0 ? (
                        <>
                            {chordsToDisplay.length === 1 ? (
                                <>
                                    <div className={`detected-chord-name ${chordAcknowledged ? 'chord-acknowledged' : ''}`}>
                                        {chordsToDisplay[0].name}
                                        {chordAcknowledged && <span className="acknowledgment-icon"> ✅</span>}
                                    </div>
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
                    
                    {/* Practice Mode: Show Target and Next Chord */}
                    {isChordPracticeMode && currentTargetChord && (
                        <div className="practice-chord-info">
                            <div className="target-chord-section">
                                <div className="section-label">Target Chord</div>
                                <div className={`target-chord-name ${chordAcknowledged ? 'chord-correct' : ''}`}>
                                    {currentTargetChord.roman} ({currentTargetChord.name})
                                </div>
                            </div>
                            {nextChord && (
                                <div className="next-chord-section">
                                    <div className="section-label">Next Chord</div>
                                    <div className="next-chord-name">
                                        {nextChord.roman} ({nextChord.name})
                                    </div>
                                </div>
                            )}
                            
                            {/* Inversion Scoreboard */}
                            {requireAllInversions && expectedInversions.length > 0 && (() => {
                                // #region agent log
                                try {
                                    const playedInversionsArray = Array.isArray(playedInversions) ? playedInversions : Array.from(playedInversions || []);
                                    fetch('http://127.0.0.1:7242/ingest/e195f0d9-c6a3-4271-b290-bc8c7ddcceed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChordInfo.jsx:175',message:'Rendering inversion scoreboard',data:{expectedInversions,playedInversionsType:typeof playedInversions,playedInversionsArray},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                                    // #endregion
                                    const playedInversionsSet = new Set(playedInversionsArray);
                                    return (
                                        <div className="inversion-scoreboard">
                                            <div className="section-label">Inversions Progress</div>
                                            <div className="inversions-list">
                                                {expectedInversions.map((inv, index) => {
                                                    const isPlayed = playedInversionsSet.has(inv);
                                                    return (
                                                        <div 
                                                            key={index} 
                                                            className={`inversion-item ${isPlayed ? 'played' : 'remaining'}`}
                                                        >
                                                            <span className="inversion-check">{isPlayed ? '✅' : '⭕'}</span>
                                                            <span className="inversion-name">{inv}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="inversion-progress-text">
                                                {playedInversionsSet.size} / {expectedInversions.length} inversions played
                                            </div>
                                        </div>
                                    );
                                } catch (error) {
                                    console.error('[ChordInfo] Error rendering inversion scoreboard:', error, { playedInversions, expectedInversions });
                                    fetch('http://127.0.0.1:7242/ingest/e195f0d9-c6a3-4271-b290-bc8c7ddcceed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChordInfo.jsx:200',message:'Exception rendering scoreboard',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                                    return null;
                                }
                            })()}
                        </div>
                    )}
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
            )}
        </div>
    );
};

export default ChordInfo;
