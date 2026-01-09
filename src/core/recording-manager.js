// https://github.com/pleabargain/piano-app
class RecordingManager {
    constructor() {
        this.state = 'idle'; // 'idle', 'recording', 'paused'
        this.events = [];
        this.startTime = null;
        this.pauseTime = null;
        this.totalPauseDuration = 0;
    }

    /**
     * Start recording MIDI events
     */
    startRecording() {
        if (this.state === 'recording') {
            console.warn('[RecordingManager] Already recording');
            return;
        }

        this.state = 'recording';
        this.events = [];
        this.startTime = performance.now();
        this.pauseTime = null;
        this.totalPauseDuration = 0;
    }

    /**
     * Record a MIDI event (noteOn or noteOff)
     * @param {Object} event - MIDI event { type: 'noteOn'|'noteOff', note: number, velocity: number, channel?: number }
     */
    recordEvent(event) {
        if (this.state !== 'recording') {
            console.warn('[RecordingManager] Not recording, ignoring event');
            return;
        }

        if (!event || !event.type || typeof event.note !== 'number') {
            console.warn('[RecordingManager] Invalid event format', event);
            return;
        }

        if (event.type !== 'noteOn' && event.type !== 'noteOff') {
            console.warn('[RecordingManager] Invalid event type', event.type);
            return;
        }

        const currentTime = performance.now();
        const relativeTimestamp = currentTime - this.startTime - this.totalPauseDuration;

        const recordedEvent = {
            type: event.type,
            note: event.note,
            velocity: event.velocity !== undefined ? event.velocity : (event.type === 'noteOn' ? 100 : 0),
            timestamp: relativeTimestamp,
            channel: event.channel !== undefined ? event.channel : 0
        };

        this.events.push(recordedEvent);
    }

    /**
     * Pause recording
     */
    pauseRecording() {
        if (this.state !== 'recording') {
            console.warn('[RecordingManager] Not recording, cannot pause');
            return;
        }

        this.state = 'paused';
        this.pauseTime = performance.now();
    }

    /**
     * Resume recording after pause
     */
    resumeRecording() {
        if (this.state !== 'paused') {
            console.warn('[RecordingManager] Not paused, cannot resume');
            return;
        }

        if (this.pauseTime) {
            const pauseDuration = performance.now() - this.pauseTime;
            this.totalPauseDuration += pauseDuration;
            this.pauseTime = null;
        }

        this.state = 'recording';
    }

    /**
     * Stop recording and return the recording data
     * @param {string} name - Name for the recording
     * @param {Object} metadata - Optional metadata
     * @returns {Object} Recording object in JSON format
     */
    stopRecording(name = 'Untitled Recording', metadata = {}) {
        if (this.state === 'idle') {
            console.warn('[RecordingManager] Not recording, nothing to stop');
            return null;
        }

        // Generate UUID v4
        const id = this.generateUUID();

        // Normalize timestamps to start at 0
        const normalizedEvents = this.normalizeTimestamps(this.events);

        // Calculate duration from last event timestamp (normalized)
        const duration = normalizedEvents.length > 0
            ? Math.max(...normalizedEvents.map(e => e.timestamp))
            : 0;

        const recording = {
            version: '1.0',
            id: id,
            name: name,
            createdAt: Date.now(),
            duration: duration,
            metadata: metadata,
            events: normalizedEvents
        };

        // Reset state
        this.state = 'idle';
        this.events = [];
        this.startTime = null;
        this.pauseTime = null;
        this.totalPauseDuration = 0;

        return recording;
    }

    /**
     * Normalize timestamps so first event starts at 0.0
     * @param {Array} events - Array of events with timestamps
     * @returns {Array} Events with normalized timestamps
     */
    normalizeTimestamps(events) {
        if (events.length === 0) return [];

        const firstTimestamp = Math.min(...events.map(e => e.timestamp));

        return events.map(event => ({
            ...event,
            timestamp: event.timestamp - firstTimestamp
        }));
    }

    /**
     * Get current recording state
     * @returns {string} Current state ('idle', 'recording', 'paused')
     */
    getState() {
        return this.state;
    }

    /**
     * Get current recording duration (in milliseconds)
     * @returns {number} Duration in milliseconds
     */
    getCurrentDuration() {
        if (this.state === 'idle') return 0;
        if (this.state === 'paused' && this.pauseTime) {
            return this.pauseTime - this.startTime - this.totalPauseDuration;
        }
        return performance.now() - this.startTime - this.totalPauseDuration;
    }

    /**
     * Get number of events recorded so far
     * @returns {number} Event count
     */
    getEventCount() {
        return this.events.length;
    }

    /**
     * Generate UUID v4
     * @returns {string} UUID v4 string
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Cancel current recording without saving
     */
    cancelRecording() {
        this.state = 'idle';
        this.events = [];
        this.startTime = null;
        this.pauseTime = null;
        this.totalPauseDuration = 0;
    }
}

export default RecordingManager;

