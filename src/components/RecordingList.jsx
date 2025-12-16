// https://github.com/pleabargain/piano-app
import React, { useState, useEffect } from 'react';
import './RecordingList.css';

const RecordingList = ({
    recordingStorage,
    playbackManager,
    onRecordingSelect,
    onRecordingDelete
}) => {
    const [recordings, setRecordings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        loadRecordings();
    }, [recordingStorage, sortBy, sortOrder]);

    const loadRecordings = async () => {
        if (!recordingStorage) return;

        try {
            setLoading(true);
            const allRecordings = await recordingStorage.getAll(sortBy, sortOrder);
            setRecordings(allRecordings);
        } catch (error) {
            console.error('[RecordingList] Failed to load recordings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (recording) => {
        setSelectedId(recording.id);
        if (playbackManager) {
            playbackManager.loadRecording(recording);
        }
        if (onRecordingSelect) {
            onRecordingSelect(recording);
        }
    };

    const handleDelete = async (id, event) => {
        event.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this recording?')) {
            return;
        }

        if (!recordingStorage) return;

        try {
            await recordingStorage.delete(id);
            if (selectedId === id) {
                setSelectedId(null);
                if (playbackManager) {
                    playbackManager.stop();
                }
            }
            if (onRecordingDelete) {
                onRecordingDelete(id);
            }
            await loadRecordings();
        } catch (error) {
            console.error('[RecordingList] Failed to delete recording:', error);
            alert('Failed to delete recording');
        }
    };

    const handleRenameStart = (recording, event) => {
        event.stopPropagation();
        setEditingId(recording.id);
        setEditingName(recording.name);
    };

    const handleRenameSave = async (id, event) => {
        event.stopPropagation();
        if (!recordingStorage) return;

        try {
            const recording = recordings.find(r => r.id === id);
            if (recording) {
                const updated = { ...recording, name: editingName.trim() || 'Untitled Recording' };
                await recordingStorage.save(updated);
                setEditingId(null);
                setEditingName('');
                await loadRecordings();
            }
        } catch (error) {
            console.error('[RecordingList] Failed to rename recording:', error);
            alert('Failed to rename recording');
        }
    };

    const handleRenameCancel = () => {
        setEditingId(null);
        setEditingName('');
    };

    const handleExport = (recording, event) => {
        event.stopPropagation();
        if (!recordingStorage) return;

        try {
            recordingStorage.downloadRecording(recording);
        } catch (error) {
            console.error('[RecordingList] Failed to export recording:', error);
            alert('Failed to export recording');
        }
    };

    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file || !recordingStorage) return;

        try {
            const recording = await recordingStorage.importFromFile(file);
            await recordingStorage.save(recording);
            await loadRecordings();
            
            // Automatically load the imported recording into playback manager
            if (playbackManager) {
                playbackManager.loadRecording(recording);
                setSelectedId(recording.id);
            }
            if (onRecordingSelect) {
                onRecordingSelect(recording);
            }
            
            // Reset file input
            event.target.value = '';
        } catch (error) {
            console.error('[RecordingList] Failed to import recording:', error);
            alert(`Failed to import recording: ${error.message}`);
        }
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const formatDuration = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="recording-list">
                <h3>Recordings</h3>
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="recording-list">
            <div className="recording-list-header">
                <h3>Recordings ({recordings.length})</h3>
                <div className="recording-list-actions">
                    <label className="btn-import">
                        📥 Import
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            style={{ display: 'none' }}
                        />
                    </label>
                    <select
                        className="sort-select"
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                            const [field, order] = e.target.value.split('-');
                            setSortBy(field);
                            setSortOrder(order);
                        }}
                    >
                        <option value="createdAt-desc">Newest First</option>
                        <option value="createdAt-asc">Oldest First</option>
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                    </select>
                </div>
            </div>

            {recordings.length === 0 ? (
                <div className="no-recordings">
                    No recordings yet. Start recording to create one!
                </div>
            ) : (
                <div className="recording-items">
                    {recordings.map((recording) => (
                        <div
                            key={recording.id}
                            className={`recording-item ${selectedId === recording.id ? 'selected' : ''}`}
                            onClick={() => handleSelect(recording)}
                        >
                            <div className="recording-item-main">
                                {editingId === recording.id ? (
                                    <input
                                        type="text"
                                        className="recording-name-edit"
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        onBlur={(e) => handleRenameSave(recording.id, e)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleRenameSave(recording.id, e);
                                            } else if (e.key === 'Escape') {
                                                handleRenameCancel();
                                            }
                                        }}
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <div className="recording-name">{recording.name}</div>
                                )}
                                <div className="recording-meta">
                                    <span>{formatDuration(recording.duration)}</span>
                                    <span>•</span>
                                    <span>{formatDate(recording.createdAt)}</span>
                                    <span>•</span>
                                    <span>{recording.events.length} events</span>
                                </div>
                            </div>
                            <div className="recording-item-actions">
                                {editingId !== recording.id && (
                                    <>
                                        <button
                                            className="btn-icon"
                                            onClick={(e) => handleRenameStart(recording, e)}
                                            title="Rename"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn-icon"
                                            onClick={(e) => handleExport(recording, e)}
                                            title="Export"
                                        >
                                            💾
                                        </button>
                                        <button
                                            className="btn-icon btn-delete"
                                            onClick={(e) => handleDelete(recording.id, e)}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecordingList;

