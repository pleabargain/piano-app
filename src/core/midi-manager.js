// https://github.com/pleabargain/piano-app
class MIDIManager {
    constructor() {
        this.access = null;
        this.inputs = [];
        this.listeners = new Set();
        this.activeNotes = new Set(); // Keep track of currently active MIDI note numbers
        this.recordingCallback = null; // Optional callback for recording MIDI events
    }

    async requestAccess() {
        if (!navigator.requestMIDIAccess) {
            console.error('Web MIDI API not supported');
            return false;
        }

        try {
            this.access = await navigator.requestMIDIAccess();
            this.updateInputs();

            this.access.onstatechange = (e) => {
                console.log('MIDI State Change:', e.port.name, e.port.state);
                this.updateInputs();
            };

            return true;
        } catch (err) {
            console.error('MIDI Access Failed:', err);
            return false;
        }
    }

    updateInputs() {
        if (!this.access) return;

        this.inputs = Array.from(this.access.inputs.values());
        console.log('Connected MIDI Inputs:', this.inputs.map(i => i.name));

        this.inputs.forEach(input => {
            // Re-binding ensures we don't lose listeners on reconnect, 
            // but we should be careful not to double-bind if the object persists.
            // Usually input objects are stable or new ones are created.
            input.onmidimessage = this.handleMessage.bind(this);
        });
        
        // Notify listeners about input changes
        this.notifyListeners({ type: 'inputsChanged', inputs: this.inputs });
    }

    handleMessage(message) {
        const [status, note, velocity] = message.data;
        const command = status & 0xf0; // Mask channel
        const channel = status & 0x0f; // Extract channel
        console.log('[MIDIManager] handleMessage', { status, note, velocity, command, activeNotes: Array.from(this.activeNotes) });

        // Note On: 144 (0x90), Note Off: 128 (0x80)
        if (command === 144 && velocity > 0) {
            console.log('[MIDIManager] Note ON', { note, velocity });
            this.activeNotes.add(note);
            const activeNotesArray = Array.from(this.activeNotes);
            console.log('[MIDIManager] Active notes after add:', activeNotesArray);
            const event = { type: 'noteOn', note, velocity, channel };
            this.notifyListeners(event);
            // Call recording callback if set
            if (this.recordingCallback) {
                this.recordingCallback(event);
            }
        } else if (command === 128 || (command === 144 && velocity === 0)) {
            console.log('[MIDIManager] Note OFF', { note });
            this.activeNotes.delete(note);
            const activeNotesArray = Array.from(this.activeNotes);
            console.log('[MIDIManager] Active notes after delete:', activeNotesArray);
            const event = { type: 'noteOff', note, velocity: 0, channel };
            this.notifyListeners(event);
            // Call recording callback if set
            if (this.recordingCallback) {
                this.recordingCallback(event);
            }
        }
    }

    notifyListeners(event) {
        const activeNotesArray = Array.from(this.activeNotes);
        console.log('[MIDIManager] notifyListeners', { eventType: event.type, activeNotes: activeNotesArray, listenerCount: this.listeners.size });
        this.listeners.forEach(cb => {
            console.log('[MIDIManager] Calling listener callback', { eventType: event.type, activeNotes: activeNotesArray });
            cb(event, activeNotesArray);
        });
    }

    addListener(cb) {
        this.listeners.add(cb);
    }

    removeListener(cb) {
        this.listeners.delete(cb);
    }

    getActiveNotes() {
        return Array.from(this.activeNotes).sort((a, b) => a - b);
    }

    getInputNames() {
        return this.inputs.map(input => input.name);
    }

    getFirstInputName() {
        return this.inputs.length > 0 ? this.inputs[0].name : null;
    }

    /**
     * Set optional recording callback
     * @param {Function|null} callback - Callback function that receives MIDI events { type, note, velocity, channel }
     */
    setRecordingCallback(callback) {
        this.recordingCallback = callback;
    }
}

export const midiManager = new MIDIManager();
