// https://github.com/pleabargain/piano-app
import React, { useState, useEffect, useRef } from 'react';
import './KeyProgressionBuilder.css';
import { NOTES } from '../core/music-theory';
import KeyProgressionStorage from '../core/key-progression-storage';

const KeyProgressionBuilder = ({ onProgressionSet, onClear, selectedScaleType }) => {
    const [input, setInput] = useState('');
    const [error, setError] = useState('');
    const [savedProgressions, setSavedProgressions] = useState([]);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveName, setSaveName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const storageRef = useRef(null);

    useEffect(() => {
        storageRef.current = new KeyProgressionStorage();
        storageRef.current.init().then(() => loadSavedProgressions());
    }, []);

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
        if (!text.trim()) {
            setError('');
            return [];
        }

        const tokens = text.trim().split(/\s+/);
        const validKeys = [];
        const invalidKeys = [];

        for (let token of tokens) {
            // Normalize the token (handle flats, etc.)
            const normalizedToken = normalizeNote(token);
            if (NOTES.includes(normalizedToken)) {
                validKeys.push(normalizedToken);
            } else {
                invalidKeys.push(token);
            }
        }

        if (invalidKeys.length > 0) {
            setError(`Invalid keys: ${invalidKeys.join(', ')}`);
            return [];
        }

        setError('');
        return validKeys;
    };

    const normalizeNote = (note) => {
        // Handle flats by converting to sharps
        const flatToSharp = {
            'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B', 'Fb': 'E'
        };
        const capitalized = note.charAt(0).toUpperCase() + note.slice(1);
        return flatToSharp[capitalized] || capitalized;
    };

    const handleSet = () => {
        const keys = validateAndParse(input);
        if (keys.length > 0) {
            onProgressionSet(keys);
        }
    };

    const handleClear = () => {
        setInput('');
        setError('');
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
            setShowSaveDialog(false);
            setSaveName('');
            await loadSavedProgressions();
        } catch (err) {
            setError(`Failed to save: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoad = (prog) => {
        setInput(prog.progression);
        onProgressionSet(validateAndParse(prog.progression));
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Delete this progression?')) {
            await storageRef.current.delete(id);
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
        } catch (err) {
            setError(`Import failed: ${err.message}`);
        }
    };

    return (
        <div className="key-progression-builder">
            <div className="header-row">
                <h3>Key Progression Practice</h3>
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
                                <span className="name">{p.name}</span>
                                <span className="preview">{p.progression}</span>
                                <button className="delete-small" onClick={(e) => handleDelete(p.id, e)}>×</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showSaveDialog && (
                <div className="dialog-overlay">
                    <div className="dialog">
                        <h4>Save Progression</h4>
                        <input
                            type="text"
                            value={saveName}
                            onChange={(e) => setSaveName(e.target.value)}
                            placeholder="Name..."
                            autoFocus
                        />
                        <div className="actions">
                            <button onClick={handleSave} disabled={!saveName.trim()}>Save</button>
                            <button onClick={() => setShowSaveDialog(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="sample-link">
                <a href="/sample-key-progression.json" download>📄 Download Sample</a>
            </div>

            <div className="info-text">
                Practice scales in each key sequentially. Complete a scale to advance to the next key.
            </div>
        </div>
    );
};

export default KeyProgressionBuilder;

