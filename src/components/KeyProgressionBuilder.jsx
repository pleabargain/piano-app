// https://github.com/pleabargain/piano-app
import React, { useState, useEffect, useRef } from 'react';
import './KeyProgressionBuilder.css';
import { NOTES } from '../core/music-theory';
import KeyProgressionStorage from '../core/key-progression-storage';
import { normalizeToken } from '../core/progression-parser';

const KeyProgressionBuilder = ({ onProgressionSet, onClear, selectedScaleType }) => {
    const [input, setInput] = useState('');
    const [error, setError] = useState('');
    const [savedProgressions, setSavedProgressions] = useState([]);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveName, setSaveName] = useState('');
    const [currentName, setCurrentName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const storageRef = useRef(null);
    const dialogRef = useRef(null);

    useEffect(() => {
        storageRef.current = new KeyProgressionStorage();
        storageRef.current.init().then(() => loadSavedProgressions());
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
            const data = await storageRef.current.getAll();
            setSavedProgressions(data);
        } catch (err) {
            console.error('Failed to load saved key progressions:', err);
        }
    };

    const validateAndParse = (text) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e195f0d9-c6a3-4271-b290-bc8c7ddcceed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyProgressionBuilder.jsx:54',message:'validateAndParse entry',data:{text,textLength:text?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
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

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e195f0d9-c6a3-4271-b290-bc8c7ddcceed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyProgressionBuilder.jsx:60',message:'tokens split',data:{tokens,tokenCount:tokens.length,cleanedText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion

        for (let token of tokens) {
            // Skip empty tokens (shouldn't happen after filter, but double-check)
            if (!token || !token.trim()) {
                continue;
            }

            // Normalize the token (handle flats, etc.)
            const normalizedToken = normalizeNote(token);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/e195f0d9-c6a3-4271-b290-bc8c7ddcceed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyProgressionBuilder.jsx:66',message:'token normalization result',data:{originalToken:token,normalizedToken,isInNotes:NOTES.includes(normalizedToken),notesArray:NOTES},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            if (NOTES.includes(normalizedToken)) {
                validKeys.push(normalizedToken);
            } else {
                invalidKeys.push(token);
            }
        }

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e195f0d9-c6a3-4271-b290-bc8c7ddcceed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyProgressionBuilder.jsx:74',message:'validation results before error check',data:{validKeys,invalidKeys,invalidKeysLength:invalidKeys.length,invalidKeysJoin:invalidKeys.join(', ')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

        if (invalidKeys.length > 0) {
            const errorMsg = `Invalid keys: ${invalidKeys.join(', ')}`;
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/e195f0d9-c6a3-4271-b290-bc8c7ddcceed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyProgressionBuilder.jsx:75',message:'setting error message',data:{errorMsg,invalidKeys,invalidKeysLength:invalidKeys.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            setError(errorMsg);
            console.error('[KeyProgressionBuilder] Validation error:', errorMsg, { input: text, cleanedText, invalidKeys, validKeys });
            return [];
        }

        setError('');
        return validKeys;
    };

    const normalizeNote = (note) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e195f0d9-c6a3-4271-b290-bc8c7ddcceed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyProgressionBuilder.jsx:83',message:'normalizeNote entry',data:{inputNote:note},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        // Use shared normalization for basic cleanup (unicode, etc)
        // PLUS remove chord suffixes to extract root
        let root = normalizeToken(note);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e195f0d9-c6a3-4271-b290-bc8c7ddcceed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyProgressionBuilder.jsx:86',message:'after normalizeToken',data:{inputNote:note,afterNormalizeToken:root},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        // Match note letter (A-G) optionally followed by flat/sharp, then chord suffix
        root = root.replace(/^([A-Ga-g][b#]?)(m|min|maj|dim|aug|sus|7|9|11|13|6).*$/i, '$1');
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e195f0d9-c6a3-4271-b290-bc8c7ddcceed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyProgressionBuilder.jsx:88',message:'after regex removal',data:{inputNote:note,afterRegex:root},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion

        // Handle flats by converting to sharps (if needed for internal logic)
        // Our existing flatToSharp logic:
        const flatToSharp = {
            'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B', 'Fb': 'E'
        };

        const capitalized = root.charAt(0).toUpperCase() + root.slice(1);
        const result = flatToSharp[capitalized] || capitalized;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e195f0d9-c6a3-4271-b290-bc8c7ddcceed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyProgressionBuilder.jsx:97',message:'normalizeNote result',data:{inputNote:note,capitalized,result,flatToSharpMatch:flatToSharp[capitalized]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return result;
    };

    const handleSet = () => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e195f0d9-c6a3-4271-b290-bc8c7ddcceed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyProgressionBuilder.jsx:100',message:'handleSet entry',data:{input},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        const keys = validateAndParse(input);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e195f0d9-c6a3-4271-b290-bc8c7ddcceed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyProgressionBuilder.jsx:101',message:'handleSet after validation',data:{input,keys,keysLength:keys.length,error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        if (keys.length > 0) {
            onProgressionSet(keys);
            setCurrentName('Custom Progression');
        }
    };

    const handleClear = () => {
        setInput('');
        setError('');
        setCurrentName('');
        if (onClear) onClear();
    };

    const handleSave = async () => {
        if (!saveName.trim()) return;
        try {
            setIsLoading(true);
            await storageRef.current.save({
                name: saveName.trim(),
                progression: input.trim(),
                metadata: { scaleType: selectedScaleType }
            });
            setCurrentName(saveName.trim());
            setShowSaveDialog(false);
            setSaveName('');
            await loadSavedProgressions();
        } catch (err) {
            const errorMsg = `Failed to save: ${err.message}`;
            console.error('[KeyProgressionBuilder] Failed to save progression:', err, { saveName, input });
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoad = (prog) => {
        setInput(prog.progression);
        onProgressionSet(validateAndParse(prog.progression));
        setCurrentName(prog.name);
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
        if (window.confirm('Delete this progression?')) {
            await storageRef.current.delete(id);
            if (currentName === savedProgressions.find(p => p.id === id)?.name) {
                setCurrentName('');
            }
            await loadSavedProgressions();
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
                        onClick={() => setShowSaveDialog(true)}
                        disabled={!input.trim()}
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

            <div className="input-group">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => { setInput(e.target.value); setError(''); }}
                    placeholder="e.g., F C G D"
                    onKeyPress={(e) => e.key === 'Enter' && handleSet()}
                />
                <button onClick={handleSet} disabled={!input.trim()}>Set Progression</button>
                <button onClick={handleClear} className="clear-btn">Clear</button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {savedProgressions.length > 0 && (
                <div className="saved-progressions">
                    <h4>Saved:</h4>
                    <div className="saved-list">
                        {savedProgressions.map(p => (
                            <div key={p.id} className="saved-item" onClick={() => handleLoad(p)}>
                                <span className="name">{p.name || 'Untitled Progression'}</span>
                                <span className="preview">{p.progression}</span>
                                <div className="saved-item-actions">
                                    <button 
                                        className="export-small" 
                                        onClick={(e) => handleExport(p, e)}
                                        title="Export to file"
                                    >
                                        ⬇
                                    </button>
                                    <button 
                                        className="delete-small" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(p.id, e);
                                        }}
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

            <div className="sample-link">
                <a href="/sample-progressions/sample-key-progression.json" download>📄 Download Sample</a>
            </div>

            <div className="info-text">
                Practice scales in each key sequentially. Complete a scale to advance to the next key.
            </div>
        </div>
    );
};

export default KeyProgressionBuilder;

