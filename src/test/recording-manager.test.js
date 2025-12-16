import { describe, it, expect, beforeEach, vi } from 'vitest';
import RecordingManager from '../core/recording-manager';

describe('RecordingManager', () => {
    let manager;
    let mockPerformanceNow;

    beforeEach(() => {
        mockPerformanceNow = vi.fn();
        vi.stubGlobal('performance', { now: mockPerformanceNow });
        manager = new RecordingManager();
    });

    describe('State Management', () => {
        it('should start in idle state', () => {
            expect(manager.getState()).toBe('idle');
        });

        it('should start recording', () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            manager.startRecording();
            expect(manager.getState()).toBe('recording');
        });

        it('should not start recording if already recording', () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            manager.startRecording();
            manager.startRecording(); // Second call should be ignored
            expect(manager.getState()).toBe('recording');
        });

        it('should stop recording and return recording object', () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            manager.startRecording();
            mockPerformanceNow.mockReturnValue(2000.0);
            const recording = manager.stopRecording('Test Recording');
            
            expect(manager.getState()).toBe('idle');
            expect(recording).toBeDefined();
            expect(recording.name).toBe('Test Recording');
            expect(recording.version).toBe('1.0');
            expect(recording.events).toEqual([]);
        });

        it('should cancel recording without saving', () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            manager.startRecording();
            manager.recordEvent({ type: 'noteOn', note: 60, velocity: 100 });
            manager.cancelRecording();
            
            expect(manager.getState()).toBe('idle');
            expect(manager.getEventCount()).toBe(0);
        });
    });

    describe('Event Recording', () => {
        it('should start recording and capture events', () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            manager.startRecording();
            
            mockPerformanceNow.mockReturnValue(1001.5);
            manager.recordEvent({ type: 'noteOn', note: 60, velocity: 100 });
            
            mockPerformanceNow.mockReturnValue(1500.2);
            manager.recordEvent({ type: 'noteOff', note: 60, velocity: 0 });
            
            const recording = manager.stopRecording();
            
            expect(recording.events).toHaveLength(2);
            expect(recording.events[0].timestamp).toBe(0.0);
            expect(recording.events[1].timestamp).toBe(499.7);
        });

        it('should normalize timestamps to start at 0', () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            manager.startRecording();
            
            mockPerformanceNow.mockReturnValue(1500.0);
            manager.recordEvent({ type: 'noteOn', note: 60, velocity: 100 });
            
            mockPerformanceNow.mockReturnValue(2000.0);
            manager.recordEvent({ type: 'noteOff', note: 60, velocity: 0 });
            
            const recording = manager.stopRecording();
            
            expect(recording.events[0].timestamp).toBe(0.0);
            expect(recording.events[1].timestamp).toBe(500.0);
        });

        it('should ignore events when not recording', () => {
            manager.recordEvent({ type: 'noteOn', note: 60, velocity: 100 });
            expect(manager.getEventCount()).toBe(0);
        });

        it('should record noteOn events with correct format', () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            manager.startRecording();
            
            mockPerformanceNow.mockReturnValue(1001.0);
            manager.recordEvent({ type: 'noteOn', note: 60, velocity: 100, channel: 0 });
            
            const recording = manager.stopRecording();
            const event = recording.events[0];
            
            expect(event.type).toBe('noteOn');
            expect(event.note).toBe(60);
            expect(event.velocity).toBe(100);
            expect(event.channel).toBe(0);
            expect(typeof event.timestamp).toBe('number');
        });

        it('should record noteOff events with correct format', () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            manager.startRecording();
            
            mockPerformanceNow.mockReturnValue(1001.0);
            manager.recordEvent({ type: 'noteOff', note: 60, velocity: 0, channel: 0 });
            
            const recording = manager.stopRecording();
            const event = recording.events[0];
            
            expect(event.type).toBe('noteOff');
            expect(event.note).toBe(60);
            expect(event.velocity).toBe(0);
            expect(event.channel).toBe(0);
        });

        it('should use default velocity for noteOn if not provided', () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            manager.startRecording();
            
            mockPerformanceNow.mockReturnValue(1001.0);
            manager.recordEvent({ type: 'noteOn', note: 60 });
            
            const recording = manager.stopRecording();
            expect(recording.events[0].velocity).toBe(100);
        });

        it('should use default velocity for noteOff if not provided', () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            manager.startRecording();
            
            mockPerformanceNow.mockReturnValue(1001.0);
            manager.recordEvent({ type: 'noteOff', note: 60 });
            
            const recording = manager.stopRecording();
            expect(recording.events[0].velocity).toBe(0);
        });

        it('should use default channel 0 if not provided', () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            manager.startRecording();
            
            mockPerformanceNow.mockReturnValue(1001.0);
            manager.recordEvent({ type: 'noteOn', note: 60, velocity: 100 });
            
            const recording = manager.stopRecording();
            expect(recording.events[0].channel).toBe(0);
        });

        it('should handle rapid note sequences', () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            manager.startRecording();
            
            for (let i = 0; i < 10; i++) {
                mockPerformanceNow.mockReturnValue(1000 + i * 10);
                manager.recordEvent({ type: 'noteOn', note: 60 + i, velocity: 100 });
            }
            
            const recording = manager.stopRecording();
            expect(recording.events).toHaveLength(10);
        });

        it('should maintain event ordering', () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            manager.startRecording();
            
            mockPerformanceNow.mockReturnValue(1001.0);
            manager.recordEvent({ type: 'noteOn', note: 60, velocity: 100 });
            
            mockPerformanceNow.mockReturnValue(1002.0);
            manager.recordEvent({ type: 'noteOn', note: 64, velocity: 100 });
            
            mockPerformanceNow.mockReturnValue(1003.0);
            manager.recordEvent({ type: 'noteOff', note: 60, velocity: 0 });
            
            const recording = manager.stopRecording();
            
            expect(recording.events[0].note).toBe(60);
            expect(recording.events[1].note).toBe(64);
            expect(recording.events[2].note).toBe(60);
            expect(recording.events[2].type).toBe('noteOff');
        });
    });

    describe('Pause/Resume', () => {
        it('should pause recording', () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            manager.startRecording();
            
            mockPerformanceNow.mockReturnValue(1500.0);
            manager.pauseRecording();
            
            expect(manager.getState()).toBe('paused');
        });

        it('should resume recording after pause', () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            manager.startRecording();
            
            mockPerformanceNow.mockReturnValue(1500.0);
            manager.pauseRecording();
            
            mockPerformanceNow.mockReturnValue(2000.0);
            manager.resumeRecording();
            
            expect(manager.getState()).toBe('recording');
        });

        it('should account for pause duration in timestamps', () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            manager.startRecording();
            
            mockPerformanceNow.mockReturnValue(1500.0);
            manager.recordEvent({ type: 'noteOn', note: 60, velocity: 100 });
            
            mockPerformanceNow.mockReturnValue(2000.0);
            manager.pauseRecording();
            
            // Pause for 1000ms
            mockPerformanceNow.mockReturnValue(3000.0);
            manager.resumeRecording();
            
            mockPerformanceNow.mockReturnValue(3500.0);
            manager.recordEvent({ type: 'noteOff', note: 60, velocity: 0 });
            
            const recording = manager.stopRecording();
            
            // Second event should be at 500ms (3500 - 3000 + 500 pause = 500ms relative)
            expect(recording.events[1].timestamp).toBeCloseTo(500, 1);
        });
    });

    describe('Duration Calculation', () => {
        it('should calculate duration correctly', () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            manager.startRecording();
            
            mockPerformanceNow.mockReturnValue(1500.0);
            manager.recordEvent({ type: 'noteOn', note: 60, velocity: 100 });
            
            mockPerformanceNow.mockReturnValue(2000.0);
            manager.recordEvent({ type: 'noteOff', note: 60, velocity: 0 });
            
            const duration = manager.getCurrentDuration();
            expect(duration).toBe(1000);
        });

        it('should return 0 duration for empty recording', () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            manager.startRecording();
            
            const duration = manager.getCurrentDuration();
            expect(duration).toBeGreaterThanOrEqual(0);
        });

        it('should calculate recording duration from events', () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            manager.startRecording();
            
            mockPerformanceNow.mockReturnValue(1500.0);
            manager.recordEvent({ type: 'noteOn', note: 60, velocity: 100 });
            
            mockPerformanceNow.mockReturnValue(5000.0);
            manager.recordEvent({ type: 'noteOff', note: 60, velocity: 0 });
            
            const recording = manager.stopRecording();
            expect(recording.duration).toBe(3500);
        });
    });

    describe('UUID Generation', () => {
        it('should generate valid UUID v4 format', () => {
            const uuid = manager.generateUUID();
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            expect(uuid).toMatch(uuidRegex);
        });

        it('should generate unique UUIDs', () => {
            const uuid1 = manager.generateUUID();
            const uuid2 = manager.generateUUID();
            expect(uuid1).not.toBe(uuid2);
        });
    });

    describe('Recording Object Format', () => {
        it('should create recording with all required fields', () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            manager.startRecording();
            
            mockPerformanceNow.mockReturnValue(1500.0);
            manager.recordEvent({ type: 'noteOn', note: 60, velocity: 100 });
            
            const recording = manager.stopRecording('Test', { bpm: 120 });
            
            expect(recording).toHaveProperty('version');
            expect(recording).toHaveProperty('id');
            expect(recording).toHaveProperty('name');
            expect(recording).toHaveProperty('createdAt');
            expect(recording).toHaveProperty('duration');
            expect(recording).toHaveProperty('metadata');
            expect(recording).toHaveProperty('events');
            expect(recording.metadata.bpm).toBe(120);
        });

        it('should use default name if not provided', () => {
            mockPerformanceNow.mockReturnValue(1000.0);
            manager.startRecording();
            const recording = manager.stopRecording();
            expect(recording.name).toBe('Untitled Recording');
        });
    });
});

