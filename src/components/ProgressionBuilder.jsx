// https://github.com/pleabargain/piano-app
import React, { useState, useEffect, useRef } from 'react';
import './ProgressionBuilder.css';
import { getScaleNotes, NOTES, getChordNameFromRoman } from '../core/music-theory';
import ProgressionStorage from '../core/progression-storage';
import { parseProgression } from '../core/progression-parser';
import { cleanInputText, suggestFix, getSampleInputs } from '../core/data-cleanup';

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

const ProgressionBuilder = ({ selectedRoot, selectedScaleType, onProgressionSet, onChordClick, currentStepIndex = 0, mode = 'free', isPracticeActive = false }) => {
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
    const [suggestion, setSuggestion] = useState('');
    const [showSamples, setShowSamples] = useState(false);

    const storageRef = useRef(null);
    const inputRef = useRef(null);
    const tooltipRef = useRef(null);
    const saveDialogRef = useRef(null);

    // Initialize storage
    useEffect(() => {
        storageRef.current = new ProgressionStorage();
        storageRef.current.init().catch(err => {
            console.error('[ProgressionBuilder] Failed to initialize storage:', err);
            setStorageError('Failed to initialize storage. Some features may not work.');
        });

        loadSavedProgressions();
    }, []);

    // ESC key handler for closing dialogs/modals
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' || e.keyCode === 27) {
                if (showSaveDialog) {
                    setShowSaveDialog(false);
                    setSaveName('');
                    setError('');
                }
            }
        };

        if (showSaveDialog) {
            document.addEventListener('keydown', handleEscape);
            return () => {
                document.removeEventListener('keydown', handleEscape);
            };
        }
    }, [showSaveDialog]);

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

        // Check for commas and warn user
        if (text && text.includes(',')) {
            const fixedText = text.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
            setSuggestion(`💡 Commas do not work. Use spaces instead. Try: "${fixedText}"`);
        }

        // Clean input before parsing
        const cleanedText = cleanInputText(text);
        
        // If cleaning changed the text, update input and show suggestion
        if (cleanedText !== text.trim() && text.trim() && !text.includes(',')) {
            setSuggestion(`Cleaned input: "${cleanedText}"`);
        } else if (!text.includes(',')) {
            setSuggestion('');
        }

        let scaleNotes = [];
        try {
            scaleNotes = getScaleNotes(selectedRoot, selectedScaleType);
        } catch (err) {
            console.error('[ProgressionBuilder] unexpected error getting scale notes:', err);
            scaleNotes = [];
        }

        const { chords, error: parseError } = parseProgression(cleanedText || text, scaleNotes);

        if (parseError) {
            console.error('[ProgressionBuilder] Parse error:', parseError, { 
                originalInput: text, 
                cleanedInput: cleanedText,
                selectedRoot,
                selectedScaleType 
            });
            const fixSuggestion = suggestFix(text, parseError);
            if (fixSuggestion) {
                // If there's already a comma warning, keep it; otherwise use the fix suggestion
                if (!text.includes(',')) {
                    setSuggestion(fixSuggestion);
                }
            } else if (!text.includes(',')) {
                setSuggestion('');
            }
            setError(parseError);
            setParsedChords([]);
        } else {
            console.log('[ProgressionBuilder] Validation successful:', chords);
            setError('');
            // Clear comma warning if parsing succeeded (commas might have been ignored)
            if (text && text.includes(',')) {
                setSuggestion('💡 Commas do not work. Use spaces to separate chords instead.');
            } else {
                setSuggestion('');
            }
            setParsedChords(chords);
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

            console.log('[ProgressionBuilder] User saving progression:', {
                name: progression.name,
                progression: progression.progression,
                metadata: progression.metadata
            });

            // Validate progression string can be parsed
            const validation = storageRef.current.validateProgressionString(
                progression.progression,
                progression.metadata.key,
                progression.metadata.scaleType
            );

            if (!validation.valid) {
                console.error('[ProgressionBuilder] Validation failed:', validation.error);
                setError(validation.error);
                setIsLoading(false);
                return;
            }

            const savedId = await storageRef.current.save(progression);
            console.log('[ProgressionBuilder] Successfully saved progression:', {
                id: savedId,
                name: progression.name
            });
            
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
            console.log('[ProgressionBuilder] User loading progression:', {
                id: progression.id,
                name: progression.name,
                progression: progression.progression,
                metadata: progression.metadata
            });

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

            console.log('[ProgressionBuilder] Successfully loaded progression:', {
                id: progression.id,
                name: progression.name
            });

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
            await storageRef.current.downloadProgression(progression);
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
            console.log('[ProgressionBuilder] User importing progression file:', {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type
            });

            const progression = await storageRef.current.importFromFile(file);
            console.log('[ProgressionBuilder] Parsed imported progression:', {
                name: progression.name,
                progression: progression.progression,
                metadata: progression.metadata,
                version: progression.version
            });

            // If metadata.key is missing, try to infer it or use default
            if (progression.metadata && !progression.metadata.key) {
                console.warn('[ProgressionBuilder] Imported progression missing metadata.key, using default:', selectedRoot);
                progression.metadata.key = selectedRoot || 'C';
            }

            // If metadata.scaleType is missing, use default
            if (progression.metadata && !progression.metadata.scaleType) {
                console.warn('[ProgressionBuilder] Imported progression missing metadata.scaleType, using default:', selectedScaleType);
                progression.metadata.scaleType = selectedScaleType || 'major';
            }

            // Generate new ID to avoid conflicts
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                progression.id = crypto.randomUUID();
            } else {
                // Fallback UUID v4 generator
                progression.id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    const r = Math.random() * 16 | 0;
                    const v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }
            progression.createdAt = Date.now();

            const savedId = await storageRef.current.save(progression);
            console.log('[ProgressionBuilder] Successfully imported and saved progression:', {
                id: savedId,
                name: progression.name
            });

            await loadSavedProgressions();
            setError('');
            setStorageError(null);
        } catch (err) {
            console.error('[ProgressionBuilder] Failed to import progression:', {
                error: err,
                errorMessage: err.message,
                errorStack: err.stack,
                errorName: err.name,
                fileName: file.name
            });
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
                        <a href="/sample-progressions/sample-progression.json" download="sample-progression.json">
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
                                const rawValue = e.target.value;
                                // Auto-clean on paste/input to remove invisible characters
                                const cleaned = cleanInputText(rawValue);
                                setInput(cleaned !== rawValue.trim() ? cleaned : rawValue);
                                setError('');
                                setSuggestion('');
                            }}
                            placeholder="e.g., I IV V ii or C - F - G - Am"
                            aria-label="Chord progression input"
                        />
                        {showTooltip && (
                            <div ref={tooltipRef} className="input-tooltip">
                                <div className="tooltip-content">
                                    <strong>Enter chord progressions using Roman numeral notation OR absolute chord names.</strong>
                                    
                                    <div className="tooltip-section">
                                        <strong>ROMAN NUMERAL NOTATION:</strong>
                                        <div><strong>Basic Chords:</strong></div>
                                        <div>• I, II, III, IV, V, VI, VII (uppercase = major)</div>
                                        <div>• i, ii, iii, iv, v, vi, vii (lowercase = minor)</div>
                                        <div><strong>Accidentals:</strong></div>
                                        <div>• bIII, bVI, bVII (flat - e.g., bIII = flat 3)</div>
                                        <div>• #IV, #V (sharp - e.g., #IV = sharp 4)</div>
                                        <div><strong>Chord Qualities:</strong></div>
                                        <div>• I7, V7 (dominant 7th)</div>
                                        <div>• Imaj7, Vmaj7 (major 7th)</div>
                                        <div>• ii7, vi7 (minor 7th)</div>
                                        <div>• I° or Idim (diminished)</div>
                                        <div>• I+ or Iaug (augmented)</div>
                                    </div>
                                    
                                    <div className="tooltip-section">
                                        <strong>ABSOLUTE CHORD NAMES:</strong>
                                        <div>• Use note names: C, D, E, F, G, A, B</div>
                                        <div>• Flats: Use 'b' (Bb, Eb, Ab) or Unicode ♭ (B♭, E♭, A♭)</div>
                                        <div>• Sharps: Use '#' (C#, F#, G#) or Unicode ♯ (C♯, F♯, G♯)</div>
                                        <div>• Chord suffixes: m, min, maj, 7, 9, dim, aug, sus, etc.</div>
                                        <div>• Examples: C, Fm, G7, B♭m, A♭, E♭, D♭</div>
                                    </div>
                                    
                                    <div className="tooltip-section">
                                        <strong>EXAMPLES:</strong>
                                        <div><strong>Roman Numerals:</strong></div>
                                        <div>• I IV V I (basic major progression)</div>
                                        <div>• i bVII bVI V (minor progression with flats)</div>
                                        <div>• I vi IV V (major with minor vi)</div>
                                        <div>• I7 IV7 V7 (dominant 7th chords)</div>
                                        <div>• ii7 V7 I (jazz progression)</div>
                                        <div><strong>Absolute Chords:</strong></div>
                                        <div>• C F G C (basic major progression)</div>
                                        <div>• A♭ E♭ Fm D♭ B♭m (with Unicode flats)</div>
                                        <div>• Ab Eb Fm Db Bbm (with ASCII flats)</div>
                                        <div>• C Am F G (major with minor)</div>
                                        <div>• C7 F7 G7 (dominant 7th chords)</div>
                                    </div>
                                    <div className="tooltip-footer">
                                        <strong>Important:</strong> Use spaces or hyphens to separate chords (e.g., "C F G" or "C - F - G"). Commas do not work - use spaces or hyphens instead. Roman numerals transpose to your selected key. Absolute chords use the exact notes specified.
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
            {error && (
                <div className="error-msg">
                    {error}
                    {suggestion && (
                        <div className="suggestion-msg" style={{ marginTop: '8px', fontSize: '0.9em', color: '#666' }}>
                            💡 {suggestion}
                            {suggestion.includes('Cleaned input') && (
                                <button 
                                    onClick={() => {
                                        const cleaned = cleanInputText(input);
                                        setInput(cleaned);
                                        setSuggestion('');
                                    }}
                                    style={{ marginLeft: '8px', padding: '2px 8px', fontSize: '0.85em' }}
                                >
                                    Apply
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
            {storageError && <div className="error-msg storage-error">{storageError}</div>}
            
            {/* Sample inputs */}
            <div className="sample-inputs-section" style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <button 
                    onClick={() => setShowSamples(!showSamples)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}
                >
                    {showSamples ? '▼' : '▶'} Sample Inputs
                </button>
                {showSamples && (
                    <div style={{ marginTop: '8px' }}>
                        <div style={{ marginBottom: '12px' }}>
                            <strong>Roman Numerals:</strong>
                            <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {getSampleInputs().romanNumerals.map((ex, idx) => (
                                    <code 
                                        key={idx}
                                        onClick={() => {
                                            setInput(ex);
                                            setShowSamples(false);
                                        }}
                                        style={{ 
                                            padding: '4px 8px', 
                                            backgroundColor: '#fff', 
                                            border: '1px solid #ddd', 
                                            borderRadius: '3px',
                                            cursor: 'pointer',
                                            fontSize: '0.9em'
                                        }}
                                        title="Click to use"
                                    >
                                        {ex}
                                    </code>
                                ))}
                            </div>
                        </div>
                        <div>
                            <strong>Absolute Chords:</strong>
                            <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {getSampleInputs().absoluteChords.map((ex, idx) => (
                                    <code 
                                        key={idx}
                                        onClick={() => {
                                            setInput(ex);
                                            setShowSamples(false);
                                        }}
                                        style={{ 
                                            padding: '4px 8px', 
                                            backgroundColor: '#fff', 
                                            border: '1px solid #ddd', 
                                            borderRadius: '3px',
                                            cursor: 'pointer',
                                            fontSize: '0.9em'
                                        }}
                                        title="Click to use"
                                    >
                                        {ex}
                                    </code>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Save Dialog */}
            {showSaveDialog && (
                <div 
                    className="save-dialog-overlay" 
                    onClick={() => {
                        setShowSaveDialog(false);
                        setSaveName('');
                        setError('');
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape' || e.keyCode === 27) {
                            setShowSaveDialog(false);
                            setSaveName('');
                            setError('');
                        }
                    }}
                    tabIndex={-1}
                >
                    <div 
                        ref={saveDialogRef}
                        className="save-dialog" 
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="save-dialog-title"
                    >
                        <div className="save-dialog-header">
                            <h4 id="save-dialog-title">Save Progression</h4>
                            <button
                                className="save-dialog-close-btn"
                                onClick={() => {
                                    setShowSaveDialog(false);
                                    setSaveName('');
                                    setError('');
                                }}
                                aria-label="Close dialog"
                                title="Close (ESC)"
                            >
                                ×
                            </button>
                        </div>
                        <input
                            type="text"
                            value={saveName}
                            onChange={(e) => setSaveName(e.target.value)}
                            placeholder="Enter progression name"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSave();
                                } else if (e.key === 'Escape' || e.keyCode === 27) {
                                    setShowSaveDialog(false);
                                    setSaveName('');
                                    setError('');
                                }
                            }}
                            autoFocus
                            aria-label="Progression name"
                        />
                        <div className="save-dialog-actions">
                            <button onClick={handleSave} disabled={!saveName.trim() || isLoading}>
                                Save
                            </button>
                            <button onClick={() => {
                                setShowSaveDialog(false);
                                setSaveName('');
                                setError('');
                            }} disabled={isLoading}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="preview">
                {parsedChords.map((chord, idx) => {
                    const isCurrentChord = mode === 'chord' && isPracticeActive && idx === (currentStepIndex % parsedChords.length);
                    const isNextChord = mode === 'chord' && isPracticeActive && idx === ((currentStepIndex + 1) % parsedChords.length);
                    const chordClass = `chord-preview clickable-chord ${isCurrentChord ? 'current-chord' : ''} ${isNextChord ? 'next-chord' : ''}`;
                    
                    return (
                        <div
                            key={idx}
                            className={chordClass}
                            onClick={() => onChordClick && onChordClick(chord.name)}
                            style={{ cursor: onChordClick ? 'pointer' : 'default' }}
                        >
                            <div className="roman">{chord.roman}</div>
                            <div className="alpha">{chord.name}</div>
                        </div>
                    );
                })}
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

export default ProgressionBuilder;
