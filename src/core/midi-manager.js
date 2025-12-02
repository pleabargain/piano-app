// https://github.com/pleabargain/piano-app
class MIDIManager {
    constructor() {
        this.access = null;
        this.inputs = [];
        this.listeners = new Set();
        this.activeNotes = new Set(); // Keep track of currently active MIDI note numbers
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
    }

    handleMessage(message) {
        const [status, note, velocity] = message.data;
        const command = status & 0xf0; // Mask channel

        // Note On: 144 (0x90), Note Off: 128 (0x80)
        if (command === 144 && velocity > 0) {
            this.activeNotes.add(note);
            this.notifyListeners({ type: 'noteOn', note, velocity });
        } else if (command === 128 || (command === 144 && velocity === 0)) {
            this.activeNotes.delete(note);
            this.notifyListeners({ type: 'noteOff', note, velocity: 0 });
        }
    }

    notifyListeners(event) {
        this.listeners.forEach(cb => cb(event, Array.from(this.activeNotes)));
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
}

export const midiManager = new MIDIManager();
