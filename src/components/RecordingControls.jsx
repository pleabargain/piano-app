// https://github.com/pleabargain/piano-app
import React, { useState, useEffect } from 'react';
import './RecordingControls.css';

const RecordingControls = ({
    recordingManager,
    playbackManager,
    onRecordingStart,
    onRecordingStop,
    onPlaybackStart,
    onPlaybackStop,
    onPlaybackPause,
    onPlaybackResume,
    isPlayAlongMode = false,
    onPlayAlongToggle,
    isWaitForInput = false,
    onWaitForInputToggle,
    isLoop = false,
    onLoopToggle
}) => {
    const [recordingName, setRecordingName] = useState('');
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [playbackProgress, setPlaybackProgress] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Update recording duration display
    useEffect(() => {
        let interval;
        if (isRecording && recordingManager) {
            interval = setInterval(() => {
                const duration = recordingManager.getCurrentDuration();
                setRecordingDuration(duration);
            }, 100);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRecording, recordingManager]);

    // Listen to playback events
    useEffect(() => {
        if (!playbackManager) return;

        const handleProgress = (data) => {
            setPlaybackProgress(data.progress);
        };

        const handleComplete = () => {
            setIsPlaying(false);
            setIsPaused(false);
            setPlaybackProgress(0);
        };

        const handleStop = () => {
            setIsPlaying(false);
            setIsPaused(false);
            setPlaybackProgress(0);
        };

        playbackManager.on('progress', handleProgress);
        playbackManager.on('complete', handleComplete);
        playbackManager.on('stop', handleStop);

        return () => {
            playbackManager.off('progress', handleProgress);
            playbackManager.off('complete', handleComplete);
            playbackManager.off('stop', handleStop);
        };
    }, [playbackManager]);

    // Update playback state
    useEffect(() => {
        if (!playbackManager) return;

        const checkState = () => {
            const state = playbackManager.getState();
            setIsPlaying(state === 'playing');
            setIsPaused(state === 'paused');
        };

        const interval = setInterval(checkState, 100);
        return () => clearInterval(interval);
    }, [playbackManager]);

    const handleStartRecording = () => {
        if (recordingManager) {
            recordingManager.startRecording();
            setIsRecording(true);
            setRecordingDuration(0);
            if (onRecordingStart) {
                onRecordingStart();
            }
        }
    };

    const handleStopRecording = () => {
        if (recordingManager && recordingManager.getState() === 'recording') {
            const name = recordingName.trim() || 'Untitled Recording';
            const recording = recordingManager.stopRecording(name);
            setIsRecording(false);
            setRecordingName('');
            setRecordingDuration(0);
            if (onRecordingStop && recording) {
                onRecordingStop(recording);
            }
        }
    };

    const handlePlay = () => {
        if (!playbackManager) {
            console.warn('[RecordingControls] No playback manager available');
            return;
        }
        
        // Check if a recording is loaded
        if (!playbackManager.recording) {
            console.warn('[RecordingControls] No recording loaded. Please select a recording from the list first.');
            alert('Please select a recording from the list first.');
            return;
        }
        
        if (isPaused) {
            playbackManager.play();
            if (onPlaybackResume) {
                onPlaybackResume();
            }
        } else {
            playbackManager.play();
            if (onPlaybackStart) {
                onPlaybackStart();
            }
        }
    };

    const handlePause = () => {
        if (playbackManager) {
            playbackManager.pause();
            if (onPlaybackPause) {
                onPlaybackPause();
            }
        }
    };

    const handleStop = () => {
        if (playbackManager) {
            playbackManager.stop();
            if (onPlaybackStop) {
                onPlaybackStop();
            }
        }
    };

    const formatDuration = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="recording-controls">
            <div className="recording-playback-container">
                <div className="recording-section">
                    <div className="recording-controls-row">
                        <h3>Recording</h3>
                        {!isRecording ? (
                            <button
                                className="btn btn-record"
                                onClick={handleStartRecording}
                                disabled={isPlaying}
                            >
                                ⏺ Record
                            </button>
                        ) : (
                            <button
                                className="btn btn-stop"
                                onClick={handleStopRecording}
                            >
                                ⏹ Stop
                            </button>
                        )}
                        {isRecording && (
                            <div className="recording-indicator">
                                <span className="recording-dot"></span>
                                <span>{formatDuration(recordingDuration)}</span>
                            </div>
                        )}
                    </div>
                    {isRecording && (
                        <input
                            type="text"
                            className="recording-name-input"
                            placeholder="Recording name..."
                            value={recordingName}
                            onChange={(e) => setRecordingName(e.target.value)}
                        />
                    )}
                </div>

                <div className="playback-section">
                <div className="playback-controls-row">
                    <h3>Playback</h3>
                    {!isPlaying && !isPaused ? (
                        <button
                            className="btn btn-play"
                            onClick={handlePlay}
                            disabled={isRecording}
                        >
                            ▶ Play
                        </button>
                    ) : (
                        <>
                            {isPlaying && (
                                <button
                                    className="btn btn-pause"
                                    onClick={handlePause}
                                >
                                    ⏸ Pause
                                </button>
                            )}
                            {isPaused && (
                                <button
                                    className="btn btn-play"
                                    onClick={handlePlay}
                                >
                                    ▶ Resume
                                </button>
                            )}
                            <button
                                className="btn btn-stop"
                                onClick={handleStop}
                            >
                                ⏹ Stop
                            </button>
                        </>
                    )}
                </div>
                {(isPlaying || isPaused) && (
                    <div className="playback-progress">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${playbackProgress}%` }}
                            ></div>
                        </div>
                        <span className="progress-text">{Math.round(playbackProgress)}%</span>
                    </div>
                )}
                </div>
            </div>

            <div className="toggle-controls-row">
                <div className="toggle-control-item">
                    <label className="play-along-toggle">
                        <input
                            type="checkbox"
                            checked={isPlayAlongMode}
                            onChange={(e) => {
                                if (onPlayAlongToggle) {
                                    onPlayAlongToggle(e.target.checked);
                                }
                            }}
                        />
                        <span>Play-Along Mode</span>
                    </label>
                    {isPlayAlongMode && (
                        <div className="play-along-hint">
                            Play the highlighted keys along with the recording
                        </div>
                    )}
                </div>
                
                <div className="toggle-control-item">
                    <label className="play-along-toggle">
                        <input
                            type="checkbox"
                            checked={isWaitForInput}
                            onChange={(e) => {
                                if (onWaitForInputToggle) {
                                    onWaitForInputToggle(e.target.checked);
                                }
                            }}
                        />
                        <span>Wait for Input Mode</span>
                    </label>
                    {isWaitForInput && (
                        <div className="play-along-hint">
                            Playback will wait for you to play the correct note before advancing
                        </div>
                    )}
                </div>
                
                <div className="toggle-control-item">
                    <label className="play-along-toggle">
                        <input
                            type="checkbox"
                            checked={isLoop}
                            onChange={(e) => {
                                if (onLoopToggle) {
                                    onLoopToggle(e.target.checked);
                                }
                            }}
                        />
                        <span>Loop Playback</span>
                    </label>
                    {isLoop && (
                        <div className="play-along-hint">
                            Recording will automatically repeat until stopped
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecordingControls;

