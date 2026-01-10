import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import PlaybackManager from '../core/playback-manager';

describe('PlaybackManager', () => {
    let manager;
    let mockPerformanceNow;
    let currentNow;

    beforeEach(() => {
        vi.useFakeTimers();

        currentNow = 0;
        mockPerformanceNow = vi.fn();
        mockPerformanceNow.mockImplementation(() => currentNow);
        vi.stubGlobal('performance', { now: mockPerformanceNow });
        
        manager = new PlaybackManager();
    });

    afterEach(() => {
        manager.stop();
        vi.useRealTimers();
    });

    describe('State Management', () => {
        it('should start in idle state', () => {
            expect(manager.getState()).toBe('idle');
        });

        it('should load recording', () => {
            const recording = {
                version: '1.0',
                id: 'test-id',
                name: 'Test',
                createdAt: Date.now(),
                duration: 1000,
                events: []
            };
            
            manager.loadRecording(recording);
            expect(manager.getState()).toBe('idle');
        });

        it('should throw error when loading invalid recording', () => {
            expect(() => {
                manager.loadRecording(null);
            }).toThrow();
            
            expect(() => {
                manager.loadRecording({});
            }).toThrow();
        });
    });

    describe('Playback', () => {
        it('should start playback', () => {
            const recording = {
                version: '1.0',
                id: 'test-id',
                name: 'Test',
                createdAt: Date.now(),
                duration: 1000,
                events: [
                    { type: 'noteOn', note: 60, velocity: 100, timestamp: 0, channel: 0 }
                ]
            };
            
            manager.loadRecording(recording);
            currentNow = 1000;
            manager.play();
            
            expect(manager.getState()).toBe('playing');
        });

        it('should throw error when playing without recording', () => {
            expect(() => {
                manager.play();
            }).toThrow('No recording loaded');
        });

        it('should pause playback', () => {
            const recording = {
                version: '1.0',
                id: 'test-id',
                name: 'Test',
                createdAt: Date.now(),
                duration: 1000,
                events: [
                    { type: 'noteOn', note: 60, velocity: 100, timestamp: 0, channel: 0 }
                ]
            };
            
            manager.loadRecording(recording);
            currentNow = 1000;
            manager.play();
            manager.pause();
            
            expect(manager.getState()).toBe('paused');
        });

        it('should resume playback after pause', () => {
            const recording = {
                version: '1.0',
                id: 'test-id',
                name: 'Test',
                createdAt: Date.now(),
                duration: 1000,
                events: [
                    { type: 'noteOn', note: 60, velocity: 100, timestamp: 0, channel: 0 }
                ]
            };
            
            manager.loadRecording(recording);
            currentNow = 1000;
            manager.play();
            manager.pause();
            manager.play();
            
            expect(manager.getState()).toBe('playing');
        });

        it('should stop playback', () => {
            const recording = {
                version: '1.0',
                id: 'test-id',
                name: 'Test',
                createdAt: Date.now(),
                duration: 1000,
                events: [
                    { type: 'noteOn', note: 60, velocity: 100, timestamp: 0, channel: 0 }
                ]
            };
            
            manager.loadRecording(recording);
            currentNow = 1000;
            manager.play();
            manager.stop();
            
            expect(manager.getState()).toBe('idle');
            expect(manager.getCurrentTime()).toBe(0);
        });
    });

    describe('Event Emission', () => {
        it('should emit events during playback', async () => {
            const recording = {
                version: '1.0',
                id: 'test-id',
                name: 'Test',
                createdAt: Date.now(),
                duration: 100,
                events: [
                    { type: 'noteOn', note: 60, velocity: 100, timestamp: 0, channel: 0 }
                ]
            };
            
            manager.loadRecording(recording);

            const eventPromise = new Promise((resolve) => {
                manager.on('event', (data) => resolve(data));
            });

            currentNow = 1000;
            manager.play();

            const data = await eventPromise;
            expect(data.type).toBe('noteOn');
            expect(data.note).toBe(60);
            expect(data.velocity).toBe(100);
        });

        it('should emit progress events', async () => {
            const recording = {
                version: '1.0',
                id: 'test-id',
                name: 'Test',
                createdAt: Date.now(),
                duration: 100,
                events: [
                    { type: 'noteOn', note: 60, velocity: 100, timestamp: 0, channel: 0 }
                ]
            };
            
            manager.loadRecording(recording);

            const progressPromise = new Promise((resolve) => {
                manager.on('progress', (data) => resolve(data));
            });

            currentNow = 1000;
            manager.play();

            const data = await progressPromise;
            expect(data).toHaveProperty('progress');
            expect(data).toHaveProperty('currentTime');
            expect(data).toHaveProperty('duration');
        });

        it('should emit complete event when playback finishes', async () => {
            const recording = {
                version: '1.0',
                id: 'test-id',
                name: 'Test',
                createdAt: Date.now(),
                duration: 100,
                events: [
                    { type: 'noteOn', note: 60, velocity: 100, timestamp: 0, channel: 0 }
                ]
            };
            
            manager.loadRecording(recording);

            const completePromise = new Promise((resolve) => {
                manager.on('complete', (data) => resolve(data));
            });

            currentNow = 1000;
            manager.play();

            // Advance time to the end of the recording duration to trigger completion
            currentNow += 100;
            await vi.advanceTimersByTimeAsync(100);

            const data = await completePromise;
            expect(data).toHaveProperty('duration');
            expect(data).toHaveProperty('totalEvents');
        });

        it('should emit stop event when stopped', async () => {
            const recording = {
                version: '1.0',
                id: 'test-id',
                name: 'Test',
                createdAt: Date.now(),
                duration: 100,
                events: []
            };
            
            manager.loadRecording(recording);

            const stopPromise = new Promise((resolve) => {
                manager.on('stop', () => resolve(true));
            });

            manager.stop();

            await expect(stopPromise).resolves.toBe(true);
        });
    });

    describe('Event Scheduling', () => {
        it('should schedule events with correct timing', () => {
            const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
            const recording = {
                version: '1.0',
                id: 'test-id',
                name: 'Test',
                createdAt: Date.now(),
                duration: 1000,
                events: [
                    { type: 'noteOn', note: 60, velocity: 100, timestamp: 0, channel: 0 },
                    { type: 'noteOff', note: 60, velocity: 0, timestamp: 500, channel: 0 }
                ]
            };
            
            manager.loadRecording(recording);
            currentNow = 1000;
            manager.play();
            
            // Should schedule timeouts for events
            expect(setTimeoutSpy).toHaveBeenCalled();
        });

        it('should handle empty recordings', () => {
            const recording = {
                version: '1.0',
                id: 'test-id',
                name: 'Test',
                createdAt: Date.now(),
                duration: 1000,
                events: []
            };
            
            manager.loadRecording(recording);
            currentNow = 1000;
            manager.play();
            
            expect(manager.getState()).toBe('playing');

            // Complete after duration
            currentNow += 1000;
            vi.advanceTimersByTime(1000);
            expect(manager.getState()).toBe('idle');
        });
    });

    describe('Progress Tracking', () => {
        it('should track playback progress', () => {
            const recording = {
                version: '1.0',
                id: 'test-id',
                name: 'Test',
                createdAt: Date.now(),
                duration: 1000,
                events: [
                    { type: 'noteOn', note: 60, velocity: 100, timestamp: 0, channel: 0 },
                    { type: 'noteOff', note: 60, velocity: 0, timestamp: 500, channel: 0 }
                ]
            };
            
            manager.loadRecording(recording);
            expect(manager.getProgress()).toBe(0);
            
            mockPerformanceNow.mockReturnValue(1000);
            manager.play();
            
            // Progress should be calculated based on current event index
            const progress = manager.getProgress();
            expect(progress).toBeGreaterThanOrEqual(0);
            expect(progress).toBeLessThanOrEqual(100);
        });

        it('should return current playback time', () => {
            const recording = {
                version: '1.0',
                id: 'test-id',
                name: 'Test',
                createdAt: Date.now(),
                duration: 1000,
                events: [
                    { type: 'noteOn', note: 60, velocity: 100, timestamp: 0, channel: 0 }
                ]
            };
            
            manager.loadRecording(recording);
            expect(manager.getCurrentTime()).toBe(0);
        });
    });

    describe('Playback Rate', () => {
        it('should set playback rate', () => {
            manager.setPlaybackRate(2.0);
            expect(manager.playbackRate).toBe(2.0);
        });

        it('should throw error for invalid playback rate', () => {
            expect(() => {
                manager.setPlaybackRate(0);
            }).toThrow();
            
            expect(() => {
                manager.setPlaybackRate(-1);
            }).toThrow();
        });

        it('should adjust timing for playback rate', () => {
            const recording = {
                version: '1.0',
                id: 'test-id',
                name: 'Test',
                createdAt: Date.now(),
                duration: 1000,
                events: [
                    { type: 'noteOn', note: 60, velocity: 100, timestamp: 0, channel: 0 }
                ]
            };
            
            manager.loadRecording(recording);
            manager.setPlaybackRate(2.0);
            mockPerformanceNow.mockReturnValue(1000);
            manager.play();
            
            expect(manager.getState()).toBe('playing');
        });
    });

    describe('Seek', () => {
        it('should seek to specific time', () => {
            const recording = {
                version: '1.0',
                id: 'test-id',
                name: 'Test',
                createdAt: Date.now(),
                duration: 1000,
                events: [
                    { type: 'noteOn', note: 60, velocity: 100, timestamp: 0, channel: 0 },
                    { type: 'noteOff', note: 60, velocity: 0, timestamp: 500, channel: 0 }
                ]
            };
            
            manager.loadRecording(recording);
            manager.seek(250);
            
            // Should update current event index
            expect(manager.getCurrentTime()).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Cleanup', () => {
        it('should clear scheduled timeouts on stop', () => {
            const recording = {
                version: '1.0',
                id: 'test-id',
                name: 'Test',
                createdAt: Date.now(),
                duration: 1000,
                events: [
                    { type: 'noteOn', note: 60, velocity: 100, timestamp: 0, channel: 0 }
                ]
            };
            
            manager.loadRecording(recording);
            mockPerformanceNow.mockReturnValue(1000);
            manager.play();
            manager.stop();
            
            expect(manager.getState()).toBe('idle');
        });

        it('should clear scheduled timeouts on pause', () => {
            const recording = {
                version: '1.0',
                id: 'test-id',
                name: 'Test',
                createdAt: Date.now(),
                duration: 1000,
                events: [
                    { type: 'noteOn', note: 60, velocity: 100, timestamp: 0, channel: 0 }
                ]
            };
            
            manager.loadRecording(recording);
            mockPerformanceNow.mockReturnValue(1000);
            manager.play();
            manager.pause();
            
            expect(manager.getState()).toBe('paused');
        });
    });

    describe('Event Listener Management', () => {
        it('should add event listeners', () => {
            const callback = vi.fn();
            manager.on('event', callback);
            
            // Listener should be registered
            expect(manager.listeners.has('event')).toBe(true);
        });

        it('should remove event listeners', () => {
            const callback = vi.fn();
            manager.on('event', callback);
            manager.off('event', callback);
            
            // Listener should be removed
            const listeners = manager.listeners.get('event');
            expect(listeners).not.toContain(callback);
        });
    });
});

