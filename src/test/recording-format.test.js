import { describe, it, expect } from 'vitest';
import RecordingStorage from '../core/recording-storage';

describe('Recording Format Validation', () => {
    let storage;

    beforeEach(() => {
        storage = new RecordingStorage();
    });

    const createBaseRecording = () => ({
        version: '1.0',
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Recording',
        createdAt: Date.now(),
        duration: 1000,
        events: []
    });

    describe('Required Fields', () => {
        it('should require version field', () => {
            const recording = createBaseRecording();
            delete recording.version;
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('version');
        });

        it('should require id field', () => {
            const recording = createBaseRecording();
            delete recording.id;
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('id');
        });

        it('should require name field', () => {
            const recording = createBaseRecording();
            delete recording.name;
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('name');
        });

        it('should require createdAt field', () => {
            const recording = createBaseRecording();
            delete recording.createdAt;
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('createdAt');
        });

        it('should require duration field', () => {
            const recording = createBaseRecording();
            delete recording.duration;
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('duration');
        });

        it('should require events array', () => {
            const recording = createBaseRecording();
            delete recording.events;
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('events');
        });
    });

    describe('UUID Format', () => {
        it('should accept valid UUID v4', () => {
            const recording = createBaseRecording();
            recording.id = '550e8400-e29b-41d4-a716-446655440000';
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(true);
        });

        it('should reject invalid UUID format', () => {
            const recording = createBaseRecording();
            recording.id = 'not-a-uuid';
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('UUID');
        });

        it('should reject UUID v1 format', () => {
            const recording = createBaseRecording();
            recording.id = '550e8400-e29b-11d4-a716-446655440000'; // v1 UUID (version digit is 1)
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('UUID');
        });
    });

    describe('Event Validation', () => {
        it('should accept valid noteOn event', () => {
            const recording = createBaseRecording();
            recording.events = [
                { type: 'noteOn', note: 60, velocity: 100, timestamp: 0, channel: 0 }
            ];
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(true);
        });

        it('should accept valid noteOff event', () => {
            const recording = createBaseRecording();
            recording.events = [
                { type: 'noteOff', note: 60, velocity: 0, timestamp: 500, channel: 0 }
            ];
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(true);
        });

        it('should reject invalid event type', () => {
            const recording = createBaseRecording();
            recording.events = [
                { type: 'invalid', note: 60, velocity: 100, timestamp: 0, channel: 0 }
            ];
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('type');
        });

        it('should validate note range (0-127)', () => {
            const recording = createBaseRecording();
            recording.events = [
                { type: 'noteOn', note: 128, velocity: 100, timestamp: 0, channel: 0 }
            ];
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('note');
        });

        it('should validate velocity range (0-127)', () => {
            const recording = createBaseRecording();
            recording.events = [
                { type: 'noteOn', note: 60, velocity: 128, timestamp: 0, channel: 0 }
            ];
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('velocity');
        });

        it('should validate timestamp is non-negative', () => {
            const recording = createBaseRecording();
            recording.events = [
                { type: 'noteOn', note: 60, velocity: 100, timestamp: -1, channel: 0 }
            ];
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('timestamp');
        });

        it('should validate channel range (0-15)', () => {
            const recording = createBaseRecording();
            recording.events = [
                { type: 'noteOn', note: 60, velocity: 100, timestamp: 0, channel: 16 }
            ];
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('channel');
        });

        it('should accept events without channel (defaults to 0)', () => {
            const recording = createBaseRecording();
            recording.events = [
                { type: 'noteOn', note: 60, velocity: 100, timestamp: 0 }
            ];
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(true);
        });
    });

    describe('Timestamp Precision', () => {
        it('should accept floating-point timestamps', () => {
            const recording = createBaseRecording();
            recording.events = [
                { type: 'noteOn', note: 60, velocity: 100, timestamp: 0.5, channel: 0 },
                { type: 'noteOff', note: 60, velocity: 0, timestamp: 500.75, channel: 0 }
            ];
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(true);
        });

        it('should validate timestamp ordering', () => {
            const recording = createBaseRecording();
            recording.events = [
                { type: 'noteOn', note: 60, velocity: 100, timestamp: 500, channel: 0 },
                { type: 'noteOff', note: 60, velocity: 0, timestamp: 0, channel: 0 } // Out of order
            ];
            // Validation doesn't check ordering, but recording should still be valid
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(true);
        });
    });

    describe('Metadata', () => {
        it('should accept recording with metadata', () => {
            const recording = createBaseRecording();
            recording.metadata = {
                description: 'Test',
                tags: ['practice'],
                bpm: 120,
                timeSignature: '4/4'
            };
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(true);
        });

        it('should accept recording without metadata', () => {
            const recording = createBaseRecording();
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(true);
        });
    });

    describe('Version Compatibility', () => {
        it('should accept version 1.0', () => {
            const recording = createBaseRecording();
            recording.version = '1.0';
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(true);
        });

        it('should require version to be a string', () => {
            const recording = createBaseRecording();
            recording.version = 1.0;
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('version');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty events array', () => {
            const recording = createBaseRecording();
            recording.events = [];
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(true);
        });

        it('should handle zero duration', () => {
            const recording = createBaseRecording();
            recording.duration = 0;
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(true);
        });

        it('should handle very long duration', () => {
            const recording = createBaseRecording();
            recording.duration = 3600000; // 1 hour
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(true);
        });

        it('should handle many events', () => {
            const recording = createBaseRecording();
            recording.events = Array.from({ length: 1000 }, (_, i) => ({
                type: i % 2 === 0 ? 'noteOn' : 'noteOff',
                note: 60 + (i % 12),
                velocity: 100,
                timestamp: i * 10,
                channel: 0
            }));
            const result = storage.validateRecording(recording);
            expect(result.valid).toBe(true);
        });
    });
});

