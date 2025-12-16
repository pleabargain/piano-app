// https://github.com/pleabargain/piano-app
class PlaybackManager {
    constructor() {
        this.state = 'idle'; // 'idle', 'playing', 'paused', 'waitingForInput'
        this.recording = null;
        this.currentEventIndex = 0;
        this.startTime = null;
        this.pauseTime = null;
        this.totalPauseDuration = 0;
        this.scheduledTimeouts = [];
        this.listeners = new Map();
        this.playbackRate = 1.0;
        this.waitForInput = false; // If true, wait for user to play correct note before advancing
        this.currentExpectedNote = null; // The note currently expected from user
        this.loop = false; // If true, loop playback when it reaches the end
    }

    /**
     * Add event listener
     * @param {string} eventType - Event type ('event', 'progress', 'complete', 'error')
     * @param {Function} callback - Callback function
     */
    on(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType).push(callback);
    }

    /**
     * Remove event listener
     * @param {string} eventType - Event type
     * @param {Function} callback - Callback function to remove
     */
    off(eventType, callback) {
        if (this.listeners.has(eventType)) {
            const callbacks = this.listeners.get(eventType);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit event to listeners
     * @param {string} eventType - Event type
     * @param {*} data - Event data
     */
    emit(eventType, data) {
        if (this.listeners.has(eventType)) {
            this.listeners.get(eventType).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[PlaybackManager] Error in listener for ${eventType}:`, error);
                }
            });
        }
    }

    /**
     * Load recording for playback
     * @param {Object} recording - Recording object
     */
    loadRecording(recording) {
        if (!recording || !recording.events || !Array.isArray(recording.events)) {
            throw new Error('Invalid recording format');
        }

        console.log('[PlaybackManager] Loading recording:', recording.name, 'with', recording.events.length, 'events');
        this.recording = recording;
        this.currentEventIndex = 0;
        this.state = 'idle';
    }

    /**
     * Start playback
     */
    play() {
        if (!this.recording) {
            throw new Error('No recording loaded');
        }

        if (this.state === 'playing') {
            console.warn('[PlaybackManager] Already playing');
            return;
        }

        if (this.state === 'paused') {
            // Resume from pause
            if (this.pauseTime) {
                const pauseDuration = performance.now() - this.pauseTime;
                this.totalPauseDuration += pauseDuration;
                this.pauseTime = null;
            }
            this.state = 'playing';
            this.scheduleRemainingEvents();
            return;
        }

        // Start from beginning
        this.state = 'playing';
        this.currentEventIndex = 0;
        this.startTime = performance.now();
        this.pauseTime = null;
        this.totalPauseDuration = 0;
        this.currentExpectedNote = null;
        console.log('[PlaybackManager] Starting playback, recording has', this.recording.events.length, 'events, waitForInput:', this.waitForInput);
        this.scheduleRemainingEvents();
    }

    /**
     * Schedule remaining events for playback
     */
    scheduleRemainingEvents() {
        if (!this.recording || (this.state !== 'playing' && this.state !== 'waitingForInput')) {
            console.log('[PlaybackManager] Cannot schedule events - no recording or not playing/waiting');
            return;
        }

        const events = this.recording.events;
        const now = performance.now();
        const effectiveStartTime = this.startTime - this.totalPauseDuration;

        console.log('[PlaybackManager] Scheduling events from index', this.currentEventIndex, 'to', events.length - 1);
        console.log('[PlaybackManager] Effective start time:', effectiveStartTime, 'Current time:', now);

        // If we've already processed all events, complete
        if (this.currentEventIndex >= events.length) {
            console.log('[PlaybackManager] All events processed, completing');
            this.complete();
            return;
        }

        // Schedule all remaining events
        for (let i = this.currentEventIndex; i < events.length; i++) {
            // If we're already waiting for input, stop scheduling more events
            if (this.state === 'waitingForInput') {
                console.log('[PlaybackManager] Already waiting for input, stopping event scheduling at index', i);
                break;
            }

            const event = events[i];
            const adjustedTimestamp = event.timestamp / this.playbackRate;
            const targetTime = effectiveStartTime + adjustedTimestamp;
            const delay = Math.max(0, targetTime - now);

            if (delay <= 0) {
                // Event should fire immediately
                console.log('[PlaybackManager] Firing immediate event at index', i, 'type:', event.type, 'note:', event.note);
                const wasWaitingForInput = this.state === 'waitingForInput';
                this.fireEvent(event, i);
                
                // If we're now waiting for input, don't increment yet (wait for user) and stop scheduling
                if (this.state === 'waitingForInput' && !wasWaitingForInput) {
                    // Event is waiting for user input, don't increment index yet
                    // The index will be incremented when user plays correct note
                    console.log('[PlaybackManager] Now waiting for input, stopping event scheduling');
                    break; // Stop scheduling more events
                } else {
                    this.currentEventIndex = i + 1;
                    
                    // Check if this was the last event (only if not waiting for input)
                    if (i === events.length - 1 && this.state !== 'waitingForInput') {
                        this.complete();
                    }
                }
            } else {
                console.log('[PlaybackManager] Scheduling event at index', i, 'with delay', delay, 'ms');
                const timeoutId = setTimeout(() => {
                    // Don't process if we're already waiting for input (user needs to play first)
                    if (this.state === 'waitingForInput') {
                        console.log('[PlaybackManager] Skipping scheduled event at index', i, '- waiting for user input');
                        return;
                    }
                    
                    // Check if we're still in a valid state and haven't advanced past this event
                    if (this.state === 'playing' && this.currentEventIndex === i) {
                        const wasWaitingForInput = this.state === 'waitingForInput';
                        this.fireEvent(event, i);
                        
                        // If we're now waiting for input, don't increment yet (wait for user)
                        if (this.state === 'waitingForInput' && !wasWaitingForInput) {
                            // Event is waiting for user input, don't increment index yet
                            // The index will be incremented when user plays correct note
                            console.log('[PlaybackManager] Now waiting for input from scheduled event');
                        } else {
                            this.currentEventIndex = i + 1;

                            // Check if this was the last event (only if not waiting for input)
                            if (i === events.length - 1 && this.state !== 'waitingForInput') {
                                this.complete();
                            }
                        }
                    }
                }, delay);

                this.scheduledTimeouts.push(timeoutId);
            }
        }
        
        // After scheduling, check if we've processed all events
        // This handles the case where all remaining events fired immediately
        if (this.currentEventIndex >= events.length && this.state !== 'waitingForInput') {
            console.log('[PlaybackManager] All events processed after scheduling, completing');
            this.complete();
        }
    }

    /**
     * Fire a playback event
     * @param {Object} event - Event to fire
     * @param {number} index - Event index
     */
    fireEvent(event, index) {
        console.log('[PlaybackManager] Firing event:', { type: event.type, note: event.note, index });
        this.emit('event', {
            type: event.type,
            note: event.note,
            velocity: event.velocity,
            channel: event.channel,
            timestamp: event.timestamp,
            index: index
        });

        // If waiting for input and this is a noteOn event, pause and wait
        if (this.waitForInput && event.type === 'noteOn') {
            this.currentExpectedNote = event.note;
            this.state = 'waitingForInput';
            this.emit('waitingForInput', {
                expectedNote: event.note,
                eventIndex: index
            });
            // Still emit progress even when waiting for input
            const progress = ((index + 1) / this.recording.events.length) * 100;
            const currentTime = event.timestamp;
            this.emit('progress', {
                progress: progress,
                currentTime: currentTime,
                duration: this.recording.duration,
                eventIndex: index,
                totalEvents: this.recording.events.length
            });
            return; // Don't advance yet, wait for user input
        }

        // Emit progress
        const progress = ((index + 1) / this.recording.events.length) * 100;
        const currentTime = event.timestamp;
        this.emit('progress', {
            progress: progress,
            currentTime: currentTime,
            duration: this.recording.duration,
            eventIndex: index,
            totalEvents: this.recording.events.length
        });
    }

    /**
     * Check if user played the correct note and advance if so
     * @param {number} note - MIDI note number played by user
     * @returns {boolean} True if correct note was played
     */
    checkUserInput(note) {
        if (!this.waitForInput || this.state !== 'waitingForInput') {
            return false;
        }

        if (note === this.currentExpectedNote) {
            console.log('[PlaybackManager] Correct note played:', note);
            this.currentExpectedNote = null;
            this.state = 'playing';
            
            // Advance to next event
            const previousIndex = this.currentEventIndex;
            this.currentEventIndex++;
            
            // Check if this was the last event
            if (previousIndex === this.recording.events.length - 1) {
                this.complete();
            } else {
                // Continue scheduling remaining events
                this.scheduleRemainingEvents();
            }
            
            this.emit('correctNote', { note });
            return true;
        } else {
            console.log('[PlaybackManager] Incorrect note played:', note, 'expected:', this.currentExpectedNote);
            this.emit('incorrectNote', { 
                played: note, 
                expected: this.currentExpectedNote 
            });
            return false;
        }
    }

    /**
     * Set wait-for-input mode
     * @param {boolean} wait - Whether to wait for user input
     */
    setWaitForInput(wait) {
        this.waitForInput = wait;
        if (!wait && this.state === 'waitingForInput') {
            // Resume normal playback
            this.state = 'playing';
            this.currentExpectedNote = null;
            this.scheduleRemainingEvents();
        }
    }

    /**
     * Set loop mode
     * @param {boolean} loop - Whether to loop playback
     */
    setLoop(loop) {
        this.loop = loop;
    }

    /**
     * Get loop mode
     * @returns {boolean} Current loop setting
     */
    getLoop() {
        return this.loop;
    }

    /**
     * Pause playback
     */
    pause() {
        if (this.state !== 'playing') {
            console.warn('[PlaybackManager] Not playing, cannot pause');
            return;
        }

        this.state = 'paused';
        this.pauseTime = performance.now();
        this.clearScheduledTimeouts();
    }

    /**
     * Stop playback
     */
    stop() {
        this.state = 'idle';
        this.currentEventIndex = 0;
        this.startTime = null;
        this.pauseTime = null;
        this.totalPauseDuration = 0;
        this.clearScheduledTimeouts();
        this.emit('stop', {});
    }

    /**
     * Complete playback
     */
    complete() {
        // If looping is enabled and we're still in playing state, restart
        if (this.loop && this.state === 'playing') {
            console.log('[PlaybackManager] Looping playback');
            this.currentEventIndex = 0;
            this.startTime = performance.now();
            this.pauseTime = null;
            this.totalPauseDuration = 0;
            this.currentExpectedNote = null;
            this.emit('loop', {
                duration: this.recording.duration,
                totalEvents: this.recording.events.length
            });
            // Restart playback
            this.scheduleRemainingEvents();
            return;
        }

        // Normal completion
        this.state = 'idle';
        this.currentEventIndex = 0;
        this.startTime = null;
        this.pauseTime = null;
        this.totalPauseDuration = 0;
        this.clearScheduledTimeouts();
        this.emit('complete', {
            duration: this.recording.duration,
            totalEvents: this.recording.events.length
        });
    }

    /**
     * Clear all scheduled timeouts
     */
    clearScheduledTimeouts() {
        this.scheduledTimeouts.forEach(timeoutId => {
            clearTimeout(timeoutId);
        });
        this.scheduledTimeouts = [];
    }

    /**
     * Set playback rate (speed multiplier)
     * @param {number} rate - Playback rate (1.0 = normal, 2.0 = double speed, 0.5 = half speed)
     */
    setPlaybackRate(rate) {
        if (rate <= 0) {
            throw new Error('Playback rate must be greater than 0');
        }

        const wasPlaying = this.state === 'playing';
        if (wasPlaying) {
            this.pause();
        }

        this.playbackRate = rate;

        if (wasPlaying) {
            // Adjust timing for new rate
            if (this.recording && this.currentEventIndex > 0) {
                const currentEvent = this.recording.events[this.currentEventIndex - 1];
                const elapsedTime = currentEvent.timestamp;
                this.totalPauseDuration = performance.now() - this.startTime - (elapsedTime / this.playbackRate);
            }
            this.play();
        }
    }

    /**
     * Get current playback state
     * @returns {string} Current state ('idle', 'playing', 'paused')
     */
    getState() {
        return this.state;
    }

    /**
     * Get current playback progress (0-100)
     * @returns {number} Progress percentage
     */
    getProgress() {
        if (!this.recording || this.recording.events.length === 0) {
            return 0;
        }

        return (this.currentEventIndex / this.recording.events.length) * 100;
    }

    /**
     * Get current playback time in milliseconds
     * @returns {number} Current time
     */
    getCurrentTime() {
        if (!this.recording || this.state === 'idle') {
            return 0;
        }

        if (this.currentEventIndex === 0) {
            return 0;
        }

        const lastFiredEvent = this.recording.events[this.currentEventIndex - 1];
        return lastFiredEvent ? lastFiredEvent.timestamp : 0;
    }

    /**
     * Seek to a specific time in the recording
     * @param {number} time - Time in milliseconds
     */
    seek(time) {
        if (!this.recording) {
            return;
        }

        const wasPlaying = this.state === 'playing';
        if (wasPlaying) {
            this.pause();
        }

        // Find the event index at or before this time
        let targetIndex = 0;
        for (let i = 0; i < this.recording.events.length; i++) {
            if (this.recording.events[i].timestamp <= time) {
                targetIndex = i + 1;
            } else {
                break;
            }
        }

        this.currentEventIndex = targetIndex;
        this.startTime = performance.now();
        this.totalPauseDuration = 0;

        if (wasPlaying) {
            this.play();
        }
    }
}

export default PlaybackManager;

