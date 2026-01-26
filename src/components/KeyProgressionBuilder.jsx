// https://github.com/pleabargain/piano-app
// 2026-01-11: Enhanced scale progression UI with rich saved progressions display, predefined progressions, and improved load functionality
import React, { useState, useEffect, useRef } from 'react';
import './KeyProgressionBuilder.css';
import { NOTES } from '../core/music-theory';
import KeyProgressionStorage from '../core/key-progression-storage';
import { normalizeToken } from '../core/progression-parser';

// Predefined scale progressions - Circle of Fifths patterns
const PREDEFINED_SCALE_PROGRESSIONS = [
    { name: 'Circle of Fifths F→E→F', progression: 'F C G D A E B E A D G C F', length: 13 },
    { name: 'Full Circle F→F', progression: 'F C G D A E B F# C# G# D# A# F', length: 12 },
    { name: 'Circle of Fifths F→E', progression: 'F C G D A E B', length: 7 },
    { name: 'Circle of Fifths E→F', progression: 'E A D G C F', length: 6 },
    { name: 'Circle of Fifths C→B', progression: 'C G D A E B F# C# G# D# A# F', length: 12 },
    { name: 'All Major Keys', progression: 'C C# D D# E F F# G G# A A# B', length: 12 },
];

const KeyProgressionBuilder = ({ onProgressionSet, onClear, selectedScaleType }) => {
    const [input, setInput] = useState('');
    const [error, setError] = useState('');
    const [savedProgressions, setSavedProgressions] = useState([]);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveName, setSaveName] = useState('');
    const [currentName, setCurrentName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentLoadedProgressionId, setCurrentLoadedProgressionId] = useState(null);
    const [storageError, setStorageError] = useState(null);

    const storageRef = useRef(null);
    const dialogRef = useRef(null);

    useEffect(() => {
        storageRef.current = new KeyProgressionStorage();
        storageRef.current.init().then(() => loadSavedProgressions()).catch(err => {
            console.error('[KeyProgressionBuilder] Failed to initialize storage:', err);
            setStorageError('Failed to initialize storage. Some features may not work.');
        });
    }, []);

    // ESC key handler for closing dialogs/modals
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' || e.keyCode === 27) {
                if (showSaveDialog) {
                    setShowSaveDialog(false);
                    setSaveName('');
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

    const loadSavedProgressions = async () => {
        if (!storageRef.current) return;
        try {
            setIsLoading(true);
            const data = await storageRef.current.getAll('createdAt', 'desc');
            setSavedProgressions(data);
            setStorageError(null);
        } catch (err) {
            console.error('[KeyProgressionBuilder] Failed to load saved key progressions:', err);
            setStorageError('Failed to load saved progressions.');
        } finally {
            setIsLoading(false);
        }
    };

    // Format date for display
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const validateAndParse = (text) => {
        if (!text || !text.trim()) {
            setError('');
            return [];
        }

        // Clean input: remove zero-width spaces and other invisible Unicode characters
        // Replace zero-width space (U+200B), zero-width non-breaking space (U+FEFF), and other invisible chars
        const cleanedText = text
            .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '') // Remove zero-width spaces and soft hyphens
            .replace(/[\u2000-\u200A\u2028\u2029]/g, ' ') // Replace various space types with regular space
            .trim();

        // Split on whitespace and filter out empty tokens
        const tokens = cleanedText.split(/\s+/).filter(token => token.length > 0);
        const validKeys = [];
        const invalidKeys = [];

        for (let token of tokens) {
            // Skip empty tokens (shouldn't happen after filter, but double-check)
            if (!token || !token.trim()) {
                continue;
            }

            // Normalize the token (handle flats, etc.)
            const normalizedToken = normalizeNote(token);
            if (NOTES.includes(normalizedToken)) {
                validKeys.push(normalizedToken);
            } else {
                invalidKeys.push(token);
            }
        }

        if (invalidKeys.length > 0) {
            const errorMsg = `Invalid keys: ${invalidKeys.join(', ')}`;
            setError(errorMsg);
            console.error('[KeyProgressionBuilder] Validation error:', errorMsg, { input: text, cleanedText, invalidKeys, validKeys });
            return [];
        }

        setError('');
        return validKeys;
    };

    const normalizeNote = (note) => {
        // Use shared normalization for basic cleanup (unicode, etc)
        // PLUS remove chord suffixes to extract root
        let root = normalizeToken(note);
        // Match note letter (A-G) optionally followed by flat/sharp, then chord suffix
        root = root.replace(/^([A-Ga-g][b#]?)(m|min|maj|dim|aug|sus|7|9|11|13|6).*$/i, '$1');

        // Handle flats by converting to sharps (if needed for internal logic)
        // Our existing flatToSharp logic:
        const flatToSharp = {
            'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B', 'Fb': 'E'
        };

        const capitalized = root.charAt(0).toUpperCase() + root.slice(1);
        const result = flatToSharp[capitalized] || capitalized;
        return result;
    };

    const handleSet = () => {
        const keys = validateAndParse(input);
        if (keys.length > 0) {
            onProgressionSet(keys);
            setCurrentName('Custom Progression');
            setCurrentLoadedProgressionId(null); // Clear loaded indicator when setting custom progression
        }
    };

    const handleClear = () => {
        setInput('');
        setError('');
        setCurrentName('');
        setCurrentLoadedProgressionId(null);
        if (onClear) onClear();
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
                metadata: { scaleType: selectedScaleType }
            };

            console.log('[KeyProgressionBuilder] User saving progression:', {
                name: progression.name,
                progression: progression.progression,
                metadata: progression.metadata
            });

            const savedId = await storageRef.current.save(progression);
            console.log('[KeyProgressionBuilder] Successfully saved progression:', {
                id: savedId,
                name: progression.name
            });

            setCurrentName(saveName.trim());
            setShowSaveDialog(false);
            setSaveName('');
            setError('');
            await loadSavedProgressions();
        } catch (err) {
            console.error('[KeyProgressionBuilder] Failed to save progression:', err);
            setError(`Failed to save: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePredefinedClick = (progressionText) => {
        console.log('[KeyProgressionBuilder] Predefined progression clicked:', progressionText);
        setInput(progressionText);
        const keys = validateAndParse(progressionText);
        if (keys.length > 0) {
            onProgressionSet(keys);
            setCurrentName('Custom Progression');
            setCurrentLoadedProgressionId(null);
        }
    };

    const handleLoad = async (progression) => {
        if (!storageRef.current) {
            setStorageError('Storage not initialized');
            return;
        }

        try {
            setIsLoading(true);
            console.log('[KeyProgressionBuilder] User loading progression:', {
                id: progression.id,
                name: progression.name,
                progression: progression.progression,
                metadata: progression.metadata
            });

            setInput(progression.progression);
            setCurrentLoadedProgressionId(progression.id);
            setCurrentName(progression.name);

            // Set the progression immediately
            const keys = validateAndParse(progression.progression);
            if (keys.length > 0) {
                onProgressionSet(keys);
            }

            // Update lastUsed timestamp if metadata exists
            if (progression.metadata) {
                progression.metadata.lastUsed = Date.now();
                try {
                    await storageRef.current.save(progression);
                    await loadSavedProgressions();
                } catch (err) {
                    console.warn('[KeyProgressionBuilder] Failed to update lastUsed:', err);
                }
            }

            console.log('[KeyProgressionBuilder] Successfully loaded progression:', {
                id: progression.id,
                name: progression.name
            });

            setError('');
            setStorageError(null);
        } catch (err) {
            console.error('[KeyProgressionBuilder] Failed to load progression:', err);
            setStorageError(`Failed to load: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async (progression, e) => {
        e.stopPropagation();

        if (!storageRef.current) {
            const errorMsg = 'Storage not initialized';
            console.error('[KeyProgressionBuilder] Storage not initialized during export');
            setError(errorMsg);
            return;
        }

        try {
            await storageRef.current.downloadProgression(progression);
        } catch (err) {
            console.error('[KeyProgressionBuilder] Failed to export progression:', err);
            setError(`Failed to export: ${err.message}`);
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
                setCurrentName('');
                setInput('');
                if (onClear) onClear();
            }
            await loadSavedProgressions();
            setError('');
            setStorageError(null);
        } catch (err) {
            console.error('[KeyProgressionBuilder] Failed to delete progression:', err);
            setStorageError(`Failed to delete: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const prog = await storageRef.current.importFromFile(file);
            await storageRef.current.save(prog);
            await loadSavedProgressions();
            handleLoad(prog);
        } catch (err) {
            const errorMsg = `Import failed: ${err.message}`;
            console.error('[KeyProgressionBuilder] Import failed:', err);
            setError(errorMsg);
        }
    };

    return (
        <div className="key-progression-builder">
            <div className="header-row">
                <h3>Key Progression Practice {currentName && <small className="current-badge">({currentName})</small>}</h3>
                <div className="header-actions">
                    <button
                        className="save-btn"
                        onClick={() => {
                            setShowSaveDialog(true);
                            setSaveName('');
                            setError('');
                        }}
                        disabled={!!error || !input.trim() || isLoading}
                        title="Save current progression"
                    >
                        💾 Save
                    </button>
                    <label className="open-btn" title="Import from file">
                        📂 Open
                        <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                    </label>
                </div>
            </div>

            {/* Saved Progressions List - Moved to top */}
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
                                    <span className="saved-progression-name">{prog.name || 'Untitled Progression'}</span>
                                    <span className="saved-progression-keys">{prog.progression}</span>
                                    {prog.metadata && prog.metadata.scaleType && (
                                        <span className="saved-progression-scale-type">
                                            {prog.metadata.scaleType}
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
                        <a href="/sample-progressions/sample-key-progression.json" download="sample-key-progression.json">
                            📄 Download sample progression file to test import
                        </a>
                    </div>
                </div>
            )}

            {/* Loading indicator */}
            {isLoading && <div className="loading-indicator">Loading...</div>}

            {/* Input Group */}
            <div className="input-group">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => { setInput(e.target.value); setError(''); }}
                    placeholder="e.g., F C G D"
                    onKeyPress={(e) => e.key === 'Enter' && handleSet()}
                />
                <button onClick={handleSet} disabled={!!error || !input.trim() || isLoading}>Set Progression</button>
                <button onClick={handleClear} className="clear-btn">Clear</button>
            </div>

            {/* Error messages */}
            {error && <div className="error-msg">{error}</div>}
            {storageError && <div className="error-msg storage-error">{storageError}</div>}

            {/* Predefined Progressions */}
            <div className="predefined-progressions">
                <h4>Predefined Progressions</h4>
                <div className="progression-list">
                    {PREDEFINED_SCALE_PROGRESSIONS.map((prog, idx) => (
                        <div
                            key={idx}
                            className="progression-item"
                            onClick={() => handlePredefinedClick(prog.progression)}
                        >
                            <span className="progression-play-icon">▶</span>
                            <span className="progression-name">{prog.name}:</span>
                            <span className="progression-keys">{prog.progression.replace(/\s+/g, '-')}</span>
                            <span className="progression-length">({prog.length})</span>
                        </div>
                    ))}
                </div>
            </div>

            {showSaveDialog && (
                <div
                    className="dialog-overlay"
                    onClick={() => {
                        setShowSaveDialog(false);
                        setSaveName('');
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape' || e.keyCode === 27) {
                            setShowSaveDialog(false);
                            setSaveName('');
                        }
                    }}
                    tabIndex={-1}
                >
                    <div
                        ref={dialogRef}
                        className="dialog"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="key-save-dialog-title"
                    >
                        <div className="dialog-header">
                            <h4 id="key-save-dialog-title">Save Progression</h4>
                            <button
                                className="dialog-close-btn"
                                onClick={() => {
                                    setShowSaveDialog(false);
                                    setSaveName('');
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
                            placeholder="Name..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSave();
                                } else if (e.key === 'Escape' || e.keyCode === 27) {
                                    setShowSaveDialog(false);
                                    setSaveName('');
                                }
                            }}
                            autoFocus
                            aria-label="Progression name"
                        />
                        <div className="actions">
                            <button onClick={handleSave} disabled={!saveName.trim() || isLoading}>Save</button>
                            <button onClick={() => {
                                setShowSaveDialog(false);
                                setSaveName('');
                            }} disabled={isLoading}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="info-text">
                Practice scales in each key sequentially. Complete a scale to advance to the next key.
            </div>
        </div>
    );
};

export default KeyProgressionBuilder;

