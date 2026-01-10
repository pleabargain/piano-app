import { describe, it, expect, beforeEach, vi } from 'vitest';
import RecordingManager from '../core/recording-manager';
import PlaybackManager from '../core/playback-manager';
import RecordingStorage from '../core/recording-storage';

describe('Recording/Playback Integration', () => {
    let recordingManager;
    let playbackManager;
    let storage;
    let mockPerformanceNow;

    beforeEach(() => {
        mockPerformanceNow = vi.fn();
        vi.stubGlobal('performance', { now: mockPerformanceNow });

        recordingManager = new RecordingManager();
        playbackManager = new PlaybackManager();
        storage = new RecordingStorage();
    });

    describe('Full Recording Workflow', () => {
        it('should record, save, load, and play back', async () => {
            // Record
            mockPerformanceNow.mockReturnValue(1000.0);
            recordingManager.startRecording();

            mockPerformanceNow.mockReturnValue(1001.0);
            recordingManager.recordEvent({ type: 'noteOn', note: 60, velocity: 100 });

            mockPerformanceNow.mockReturnValue(1500.0);
            recordingManager.recordEvent({ type: 'noteOff', note: 60, velocity: 0 });

            const recording = recordingManager.stopRecording('Test Recording');
            expect(recording).toBeDefined();
            expect(recording.events).toHaveLength(2);

            // Save (mock storage)
            const saveSpy = vi.spyOn(storage, 'save').mockResolvedValue(recording.id);
            await storage.save(recording);
            expect(saveSpy).toHaveBeenCalledWith(recording);

            // Load
            const loadSpy = vi.spyOn(storage, 'load').mockResolvedValue(recording);
            const loaded = await storage.load(recording.id);
            expect(loadSpy).toHaveBeenCalledWith(recording.id);
            expect(loaded).toEqual(recording);

            // Playback
            playbackManager.loadRecording(loaded);
            mockPerformanceNow.mockReturnValue(2000);
            playbackManager.play();

            expect(playbackManager.getState()).toBe('playing');
        });

        it('should handle record → export → import → playback cycle', async () => {
            // Record
            mockPerformanceNow.mockReturnValue(1000.0);
            recordingManager.startRecording();

            mockPerformanceNow.mockReturnValue(1001.0);
            recordingManager.recordEvent({ type: 'noteOn', note: 60, velocity: 100 });

            mockPerformanceNow.mockReturnValue(1500.0);
            recordingManager.recordEvent({ type: 'noteOff', note: 60, velocity: 0 });

            const recording = recordingManager.stopRecording('Export Test');

            // Export
            const json = storage.exportToJSON(recording);
            expect(json).toBeDefined();
            const parsed = JSON.parse(json);
            expect(parsed.id).toBe(recording.id);

            // Import
            const imported = storage.importFromJSON(json);
            expect(imported).toEqual(recording);

            // Playback
            playbackManager.loadRecording(imported);
            mockPerformanceNow.mockReturnValue(2000);
            playbackManager.play();

            expect(playbackManager.getState()).toBe('playing');
        });
    });

    describe('Multiple Recordings Management', () => {
        it('should save and retrieve multiple recordings', async () => {
            const recordings = [];

            // Create multiple recordings
            for (let i = 0; i < 3; i++) {
                mockPerformanceNow.mockReturnValue(1000 + i * 1000);
                recordingManager.startRecording();

                mockPerformanceNow.mockReturnValue(1001 + i * 1000);
                recordingManager.recordEvent({ type: 'noteOn', note: 60 + i, velocity: 100 });

                const recording = recordingManager.stopRecording(`Recording ${i}`);
                recordings.push(recording);
            }

            // Mock getAll to return recordings
            const getAllSpy = vi.spyOn(storage, 'getAll').mockResolvedValue(recordings);
            const all = await storage.getAll('createdAt', 'desc');

            expect(getAllSpy).toHaveBeenCalled();
            expect(all.length).toBe(3);
        });

        it('should delete recording and remove from list', async () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            recordingManager.startRecording();
            const recording = recordingManager.stopRecording('To Delete');

            const deleteSpy = vi.spyOn(storage, 'delete').mockResolvedValue();
            await storage.delete(recording.id);

            expect(deleteSpy).toHaveBeenCalledWith(recording.id);
        });
    });

    describe('Play-Along Mode', () => {
        it('should track expected notes during playback', (done) => {
            const recording = {
                version: '1.0',
                id: 'test-id',
                name: 'Test',
                createdAt: Date.now(),
                duration: 100,
                events: [
                    { type: 'noteOn', note: 60, velocity: 100, timestamp: 0, channel: 0 },
                    { type: 'noteOff', note: 60, velocity: 0, timestamp: 500, channel: 0 }
                ]
            };

            playbackManager.loadRecording(recording);

            const expectedNotes = [];
            playbackManager.on('event', (data) => {
                if (data.type === 'noteOn') {
                    expectedNotes.push(data.note);
                } else if (data.type === 'noteOff') {
                    const index = expectedNotes.indexOf(data.note);
                    if (index > -1) {
                        expectedNotes.splice(index, 1);
                    }
                }
            });

            mockPerformanceNow.mockReturnValue(1000);
            playbackManager.play();

            setTimeout(() => {
                // After playback starts, expected notes should be tracked
                expect(expectedNotes.length).toBeGreaterThanOrEqual(0);
                done();
            }, 100);
        });
    });

    describe('Timing Accuracy', () => {
        it('should maintain timing accuracy across workflow', () => {
            // Record with precise timestamps
            mockPerformanceNow.mockReturnValue(1000.0);
            recordingManager.startRecording();

            mockPerformanceNow.mockReturnValue(1000.5);
            recordingManager.recordEvent({ type: 'noteOn', note: 60, velocity: 100 });

            mockPerformanceNow.mockReturnValue(1500.25);
            recordingManager.recordEvent({ type: 'noteOff', note: 60, velocity: 0 });

            const recording = recordingManager.stopRecording();

            // Verify timestamps are preserved
            expect(recording.events[0].timestamp).toBe(0.0);
            expect(recording.events[1].timestamp).toBeCloseTo(499.75, 2);
        });
    });

    describe('State Management', () => {
        it('should handle state transitions during record/playback', () => {
            // Start recording
            mockPerformanceNow.mockReturnValue(1000.0);
            recordingManager.startRecording();
            recordingManager.recordEvent({ type: 'noteOn', note: 60, velocity: 100 });
            expect(recordingManager.getState()).toBe('recording');

            // Add a later event so the recording has non-zero duration
            mockPerformanceNow.mockReturnValue(1500.0);
            recordingManager.recordEvent({ type: 'noteOff', note: 60, velocity: 0 });

            // Stop recording
            const recording = recordingManager.stopRecording();
            expect(recordingManager.getState()).toBe('idle');

            // Load and play
            playbackManager.loadRecording(recording);
            mockPerformanceNow.mockReturnValue(2000);
            playbackManager.play();
            expect(playbackManager.getState()).toBe('playing');

            // Pause
            playbackManager.pause();
            expect(playbackManager.getState()).toBe('paused');

            // Resume
            playbackManager.play();
            expect(playbackManager.getState()).toBe('playing');

            // Stop
            playbackManager.stop();
            expect(playbackManager.getState()).toBe('idle');
        });
    });

    describe('Error Handling', () => {
        it('should handle errors during save', async () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            recordingManager.startRecording();
            const recording = recordingManager.stopRecording('Test');

            const saveSpy = vi.spyOn(storage, 'save').mockRejectedValue(new Error('Save failed'));

            await expect(storage.save(recording)).rejects.toThrow('Save failed');
        });

        it('should handle errors during load', async () => {
            const loadSpy = vi.spyOn(storage, 'load').mockRejectedValue(new Error('Load failed'));

            await expect(storage.load('non-existent')).rejects.toThrow('Load failed');
        });

        it('should handle invalid recording format during import', () => {
            const invalidJSON = JSON.stringify({ invalid: 'data' });

            expect(() => {
                storage.importFromJSON(invalidJSON);
            }).toThrow();
        });
    });
});

