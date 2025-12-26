// https://github.com/pleabargain/piano-app
import React, { useState, useEffect, useRef } from 'react';
import './ProgressionBuilder.css';
import { getScaleNotes, NOTES } from '../core/music-theory';
import ProgressionStorage from '../core/progression-storage';

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
    const [savedProgressions, setSavedProgressions] = useState([]);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveName, setSaveName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [storageError, setStorageError] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [currentLoadedProgressionId, setCurrentLoadedProgressionId] = useState(null);
    
    const storageRef = useRef(null);
    const inputRef = useRef(null);
    const tooltipRef = useRef(null);

    // Initialize storage
    useEffect(() => {
        storageRef.current = new ProgressionStorage();
        storageRef.current.init().catch(err => {
            console.error('[ProgressionBuilder] Failed to initialize storage:', err);
            setStorageError('Failed to initialize storage. Some features may not work.');
        });
        
        loadSavedProgressions();
    }, []);

    // Load saved progressions list
    const loadSavedProgressions = async () => {
        if (!storageRef.current) return;
        
        try {
            setIsLoading(true);
            const progressions = await storageRef.current.getAll('createdAt', 'desc');
            setSavedProgressions(progressions);
            setStorageError(null);
        } catch (err) {
            console.error('[ProgressionBuilder] Failed to load progressions:', err);
            setStorageError('Failed to load saved progressions.');
        } finally {
            setIsLoading(false);
        }
    };

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
            setCurrentLoadedProgressionId(null); // Clear loaded progression indicator
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

    const handleSave = async () => {
        if (!saveName.trim()) {
            setError('Please enter a name for the progression');
            return;
        }

        if (!storageRef.current) {
            setStorageError('Storage not initialized');
            return;
        }

        try {
            setIsLoading(true);
            const progression = {
                version: '1.0.0',
                name: saveName.trim(),
                progression: input.trim(),
                metadata: {
                    key: selectedRoot,
                    scaleType: selectedScaleType
                }
            };

            // Validate progression string can be parsed
            const validation = storageRef.current.validateProgressionString(
                progression.progression,
                progression.metadata.key,
                progression.metadata.scaleType
            );

            if (!validation.valid) {
                setError(validation.error);
                setIsLoading(false);
                return;
            }

            await storageRef.current.save(progression);
            setShowSaveDialog(false);
            setSaveName('');
            setError('');
            await loadSavedProgressions();
        } catch (err) {
            console.error('[ProgressionBuilder] Failed to save progression:', err);
            setError(`Failed to save: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoad = async (progression) => {
        if (!storageRef.current) {
            setStorageError('Storage not initialized');
            return;
        }

        try {
            setIsLoading(true);
            setInput(progression.progression);
            setCurrentLoadedProgressionId(progression.id);
            
            // Update lastUsed timestamp
            if (progression.metadata) {
                progression.metadata.lastUsed = Date.now();
                try {
                    await storageRef.current.save(progression);
                    await loadSavedProgressions();
                } catch (err) {
                    console.warn('[ProgressionBuilder] Failed to update lastUsed:', err);
                }
            }
            
            setError('');
            setStorageError(null);
        } catch (err) {
            console.error('[ProgressionBuilder] Failed to load progression:', err);
            setStorageError(`Failed to load: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        
        if (!window.confirm('Are you sure you want to delete this progression?')) {
            return;
        }

        if (!storageRef.current) {
            setStorageError('Storage not initialized');
            return;
        }

        try {
            setIsLoading(true);
            await storageRef.current.delete(id);
            if (currentLoadedProgressionId === id) {
                setCurrentLoadedProgressionId(null);
            }
            await loadSavedProgressions();
            setError('');
            setStorageError(null);
        } catch (err) {
            console.error('[ProgressionBuilder] Failed to delete progression:', err);
            setStorageError(`Failed to delete: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async (progression, e) => {
        e.stopPropagation();
        
        if (!storageRef.current) {
            setStorageError('Storage not initialized');
            return;
        }

        try {
            storageRef.current.downloadProgression(progression);
        } catch (err) {
            console.error('[ProgressionBuilder] Failed to export progression:', err);
            setStorageError(`Failed to export: ${err.message}`);
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!storageRef.current) {
            setStorageError('Storage not initialized');
            return;
        }

        try {
            setIsLoading(true);
            const progression = await storageRef.current.importFromFile(file);
            
            // Generate new ID to avoid conflicts
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                progression.id = crypto.randomUUID();
            } else {
                // Fallback UUID v4 generator
                progression.id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    const r = Math.random() * 16 | 0;
                    const v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }
            progression.createdAt = Date.now();
            
            await storageRef.current.save(progression);
            await loadSavedProgressions();
            setError('');
            setStorageError(null);
        } catch (err) {
            console.error('[ProgressionBuilder] Failed to import progression:', err);
            setError(`Failed to import: ${err.message}`);
        } finally {
            setIsLoading(false);
            e.target.value = ''; // Reset file input
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

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="progression-builder">
            <div className="progression-header">
                <h3>Custom Progression</h3>
                <div className="header-actions">
                    <button
                        onClick={() => {
                            setShowSaveDialog(true);
                            setSaveName('');
                            setError('');
                        }}
                        disabled={!!error || !input || parsedChords.length === 0 || isLoading}
                        className="header-save-btn"
                        title="Save current progression"
                    >
                        💾 Save
                    </button>
                    <label className="header-open-btn" title="Open/Import progression from file">
                        📂 Open
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>
            </div>
            
            {/* Saved Progressions List */}
            {savedProgressions.length > 0 && (
                <div className="saved-progressions-section">
                    <h4>Saved Progressions</h4>
                    <div className="saved-progressions-list">
                        {savedProgressions.map((prog) => (
                            <div
                                key={prog.id}
                                className={`saved-progression-item ${currentLoadedProgressionId === prog.id ? 'loaded' : ''}`}
                                onClick={() => handleLoad(prog)}
                            >
                                <div className="saved-progression-info">
                                    <span className="saved-progression-name">{prog.name}</span>
                                    <span className="saved-progression-chords">{prog.progression}</span>
                                    {prog.metadata && (
                                        <span className="saved-progression-key">
                                            {prog.metadata.key} {prog.metadata.scaleType}
                                        </span>
                                    )}
                                    <span className="saved-progression-date">{formatDate(prog.createdAt)}</span>
                                </div>
                                <div className="saved-progression-actions">
                                    <button
                                        className="export-btn"
                                        onClick={(e) => handleExport(prog, e)}
                                        title="Export to file"
                                    >
                                        ⬇
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={(e) => handleDelete(prog.id, e)}
                                        title="Delete"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {savedProgressions.length === 0 && !isLoading && (
                <div className="empty-state">
                    No saved progressions. Create one below!
                    <div className="sample-file-link">
                        <a href="/sample-progression.json" download="sample-progression.json">
                            📄 Download sample progression file to test import
                        </a>
                    </div>
                </div>
            )}

            {/* Input Group with Tooltip */}
            <div className="input-group-wrapper">
                <div 
                    className="input-group"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <div className="input-with-tooltip">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                setError('');
                            }}
                            placeholder="e.g., I IV V ii"
                            aria-label="Chord progression input"
                        />
                        {showTooltip && (
                            <div ref={tooltipRef} className="input-tooltip">
                                <div className="tooltip-content">
                                    <strong>Enter chord progressions using Roman numeral notation.</strong>
                                    <div className="tooltip-section">
                                        <strong>BASIC CHORDS:</strong>
                                        <div>• I, II, III, IV, V, VI, VII (uppercase = major)</div>
                                        <div>• i, ii, iii, iv, v, vi, vii (lowercase = minor)</div>
                                    </div>
                                    <div className="tooltip-section">
                                        <strong>ACCIDENTALS:</strong>
                                        <div>• bIII, bVI, bVII (flat - e.g., bIII = flat 3)</div>
                                        <div>• #IV, #V (sharp - e.g., #IV = sharp 4)</div>
                                    </div>
                                    <div className="tooltip-section">
                                        <strong>CHORD QUALITIES:</strong>
                                        <div>• I7, V7 (dominant 7th)</div>
                                        <div>• Imaj7, Vmaj7 (major 7th)</div>
                                        <div>• ii7, vi7 (minor 7th)</div>
                                        <div>• I° or Idim (diminished)</div>
                                        <div>• I+ or Iaug (augmented)</div>
                                    </div>
                                    <div className="tooltip-section">
                                        <strong>EXAMPLES:</strong>
                                        <div>• I IV V I (basic major progression)</div>
                                        <div>• i bVII bVI V (minor progression with flats)</div>
                                        <div>• I vi IV V (major with minor vi)</div>
                                        <div>• I7 IV7 V7 (dominant 7th chords)</div>
                                        <div>• ii7 V7 I (jazz progression)</div>
                                    </div>
                                    <div className="tooltip-footer">
                                        Separate chords with spaces. The progression will transpose to your selected key.
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={(e) => {
                            console.log('[ProgressionBuilder] Button clicked', { error, parsedChords, input, disabled: !!error || !input });
                            e.preventDefault();
                            e.stopPropagation();
                            handleSet();
                        }} 
                        disabled={!!error || !input || parsedChords.length === 0 || isLoading}
                    >
                        Set Progression
                    </button>
                </div>
            </div>

            {/* Loading indicator */}
            {isLoading && <div className="loading-indicator">Loading...</div>}

            {/* Error messages */}
            {error && <div className="error-msg">{error}</div>}
            {storageError && <div className="error-msg storage-error">{storageError}</div>}

            {/* Save Dialog */}
            {showSaveDialog && (
                <div className="save-dialog-overlay" onClick={() => setShowSaveDialog(false)}>
                    <div className="save-dialog" onClick={(e) => e.stopPropagation()}>
                        <h4>Save Progression</h4>
                        <input
                            type="text"
                            value={saveName}
                            onChange={(e) => setSaveName(e.target.value)}
                            placeholder="Enter progression name"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSave();
                                } else if (e.key === 'Escape') {
                                    setShowSaveDialog(false);
                                }
                            }}
                            autoFocus
                        />
                        <div className="save-dialog-actions">
                            <button onClick={handleSave} disabled={!saveName.trim() || isLoading}>
                                Save
                            </button>
                            <button onClick={() => {
                                setShowSaveDialog(false);
                                setSaveName('');
                            }} disabled={isLoading}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
