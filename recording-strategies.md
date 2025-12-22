# MIDI Recording Strategies

## Overview

This document outlines strategies for recording MIDI keyboard input and saving it as files for playback, with a focus on capturing note durations and chord structures. The information is particularly relevant for web-based applications using the Web MIDI API.

## Table of Contents

1. [Recording Note Durations](#recording-note-durations)
2. [Recording Chords](#recording-chords)
3. [MIDI File Format Structure](#midi-file-format-structure)
4. [Web-Based Implementation Strategies](#web-based-implementation-strategies)
5. [Libraries and Tools](#libraries-and-tools)
6. [Best Practices](#best-practices)
7. [Implementation Recommendations](#implementation-recommendations)

---

## Recording Note Durations

### Understanding MIDI Note Events

MIDI captures note durations through **note-on** and **note-off** events:

- **Note-On Event**: Triggered when a key is pressed (status byte `0x90` or `144` decimal)
  - Contains: note number (pitch), velocity (0-127)
  - Marks the start time of a note

- **Note-Off Event**: Triggered when a key is released (status byte `0x80` or `128` decimal)
  - Contains: note number, velocity (usually 0)
  - Marks the end time of a note

- **Duration Calculation**: Note duration = (note-off timestamp) - (note-on timestamp)

### Recording Methods

#### 1. Real-Time Recording

Real-time recording captures MIDI events as they occur, preserving the exact timing and duration of each note:

- **Advantages**:
  - Preserves natural performance timing
  - Captures expressive nuances
  - Accurate note durations based on actual key press/release times

- **Implementation**:
  - Use Web MIDI API's `onmidimessage` event handler
  - Record timestamps for each note-on and note-off event
  - Calculate durations during playback or when saving to file

#### 2. Semi-Real-Time Recording

Some applications use semi-real-time recording where notes are transcribed as you play, but without strict tempo constraints:

- **Advantages**:
  - More forgiving of mistakes
  - Allows for corrections without disrupting the recording
  - Useful for users who prefer not to adhere to strict tempo

- **Example**: Music Jotter uses this approach, calculating note durations based on keypress lengths and a set tempo

#### 3. Step Input Recording

Step input recording allows inserting MIDI notes without real-time performance:

- **Advantages**:
  - Precise control over note placement and duration
  - Useful for complex passages that are difficult to play in real-time
  - Can replicate sheet music accurately

- **Example**: Logic Pro's step input recording feature

---

## Recording Chords

### How Chords Are Recorded in MIDI

Chords are recorded by capturing **multiple simultaneous note-on events**. Each note in the chord has its own independent:

- Note-on event (with its own timestamp)
- Note-off event (with its own timestamp)
- Velocity value
- Duration

### Key Characteristics

1. **Simultaneous Note-On Events**: When playing a chord, multiple note-on messages are sent at nearly the same time (within milliseconds)

2. **Independent Note-Off Events**: Each note in a chord can be released independently, allowing for:
   - Staggered chord releases
   - Arpeggiated endings
   - Complex voicing changes

3. **Polyphonic Recording**: MIDI supports up to 16 channels, and each channel can play multiple notes simultaneously (polyphony)

### Chord Detection and Analysis

Many DAWs and software tools offer chord detection capabilities:

- **Cubase**: Can analyze recorded MIDI and identify chord names
- **Logic Pro**: Features a Chord Track that analyzes MIDI regions to detect chords
- **Implementation**: Typically involves analyzing groups of notes played within a time window and matching them to known chord patterns

### Chord Triggering

Some tools allow triggering entire chords with a single key:

- **Logic Pro's Chord Trigger MIDI Plug-in**: Assigns chords to individual keys
- **Use Cases**: Live performance, simplified chord input, consistent voicings
- **Implementation**: Maps single note-on events to multiple note-on events

---

## MIDI File Format Structure

### Standard MIDI File (SMF) Format

MIDI files (`.mid`) use a binary format that stores:

1. **Header Chunk**: Contains file format type, number of tracks, and timing division
2. **Track Chunks**: Each track contains a sequence of MIDI events

### MIDI Events Structure

Each MIDI event in a file contains:

- **Delta Time**: Time elapsed since the previous event (in ticks or milliseconds)
- **Event Type**: Note-on, note-off, control change, etc.
- **Event Data**: Note number, velocity, channel, etc.

### Note Duration Representation

In MIDI files, note durations are represented implicitly:

- **Note-On Event**: Recorded with a delta time from the previous event
- **Note-Off Event**: Recorded with a delta time from the note-on event
- **Duration**: Calculated as the difference between note-on and note-off timestamps

### Example MIDI Event Sequence

```
Delta Time: 0        Event: Note-On  (C4, velocity 100)
Delta Time: 480      Event: Note-On  (E4, velocity 100)  // Chord note
Delta Time: 0        Event: Note-On  (G4, velocity 100)  // Chord note (simultaneous)
Delta Time: 960      Event: Note-Off (C4, velocity 0)
Delta Time: 0        Event: Note-Off (E4, velocity 0)
Delta Time: 0        Event: Note-Off (G4, velocity 0)
```

---

## Web-Based Implementation Strategies

### Using Web MIDI API

The Web MIDI API provides direct access to MIDI devices in the browser:

#### 1. Requesting MIDI Access

```javascript
async function requestMIDIAccess() {
    if (!navigator.requestMIDIAccess) {
        console.error('Web MIDI API not supported');
        return null;
    }
    
    try {
        const access = await navigator.requestMIDIAccess();
        return access;
    } catch (err) {
        console.error('MIDI Access Failed:', err);
        return null;
    }
}
```

#### 2. Recording MIDI Events

```javascript
class MIDIRecorder {
    constructor() {
        this.events = [];
        this.startTime = null;
        this.activeNotes = new Map(); // Map note number to note-on timestamp
    }
    
    handleMIDIMessage(message) {
        const [status, note, velocity] = message.data;
        const command = status & 0xf0;
        const timestamp = performance.now();
        
        if (!this.startTime) {
            this.startTime = timestamp;
        }
        
        const deltaTime = timestamp - this.startTime;
        
        if (command === 0x90 && velocity > 0) {
            // Note On
            this.activeNotes.set(note, timestamp);
            this.events.push({
                deltaTime: deltaTime,
                type: 'noteOn',
                note: note,
                velocity: velocity,
                timestamp: timestamp
            });
        } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
            // Note Off
            const noteOnTime = this.activeNotes.get(note);
            const duration = timestamp - noteOnTime;
            
            this.activeNotes.delete(note);
            this.events.push({
                deltaTime: deltaTime,
                type: 'noteOff',
                note: note,
                velocity: 0,
                timestamp: timestamp,
                duration: duration
            });
        }
    }
    
    startRecording() {
        this.events = [];
        this.startTime = null;
        this.activeNotes.clear();
    }
    
    stopRecording() {
        // Ensure all active notes are closed
        const finalTimestamp = performance.now();
        this.activeNotes.forEach((noteOnTime, note) => {
            const duration = finalTimestamp - noteOnTime;
            this.events.push({
                deltaTime: finalTimestamp - this.startTime,
                type: 'noteOff',
                note: note,
                velocity: 0,
                timestamp: finalTimestamp,
                duration: duration
            });
        });
        this.activeNotes.clear();
    }
}
```

#### 3. Recording Chords

Chords are automatically captured when multiple note-on events occur within a short time window:

```javascript
class ChordRecorder extends MIDIRecorder {
    constructor() {
        super();
        this.chordWindow = 50; // milliseconds - notes within this window are considered a chord
    }
    
    detectChords() {
        const chords = [];
        let currentChord = null;
        let lastNoteTime = null;
        
        this.events.forEach(event => {
            if (event.type === 'noteOn') {
                if (!currentChord || (event.timestamp - lastNoteTime) > this.chordWindow) {
                    // Start new chord
                    if (currentChord) {
                        chords.push(currentChord);
                    }
                    currentChord = {
                        notes: [event.note],
                        startTime: event.timestamp,
                        velocities: [event.velocity]
                    };
                } else {
                    // Add to current chord
                    currentChord.notes.push(event.note);
                    currentChord.velocities.push(event.velocity);
                }
                lastNoteTime = event.timestamp;
            }
        });
        
        if (currentChord) {
            chords.push(currentChord);
        }
        
        return chords;
    }
}
```

---

## Libraries and Tools

### JavaScript MIDI Libraries

#### 1. **midi-writer-js**
- **Purpose**: Create and write MIDI files in JavaScript
- **Features**: 
  - Note-on/note-off events
  - Chord support
  - Multiple tracks
  - Tempo and time signature control
- **Usage**: Write MIDI files from recorded events

#### 2. **tonejs/midi**
- **Purpose**: MIDI file parsing and writing
- **Features**: 
  - Read and write Standard MIDI Files
  - Event-based API
  - Supports all MIDI event types

#### 3. **jsmidgen**
- **Purpose**: Lightweight MIDI file generator
- **Features**: 
  - Simple API for creating MIDI files
  - Supports note durations
  - Multiple tracks

### Online Tools

1. **Soundation**: Browser-based MIDI recorder with export capabilities
2. **LyricsToSong AI MIDI Recorder**: Features piano roll visualization and MIDI export
3. **Music Jotter**: Semi-realtime MIDI recording with transcription

### Desktop Software

1. **Logic Pro**: Comprehensive MIDI recording with step input and chord detection
2. **Ardour**: Open-source DAW with MIDI recording capabilities
3. **Cubase**: Professional DAW with advanced chord detection features

---

## Best Practices

### 1. Timestamp Accuracy

- Use `performance.now()` for high-resolution timestamps
- Consider using `requestAnimationFrame` for consistent timing
- Account for MIDI latency (typically 1-5ms)

### 2. Note Duration Handling

- Always pair note-on events with note-off events
- Handle cases where notes are still active when recording stops
- Consider minimum note duration thresholds to filter out accidental key presses

### 3. Chord Detection

- Define a time window (typically 20-100ms) for grouping simultaneous notes
- Handle cases where chord notes are not perfectly simultaneous
- Consider velocity differences when analyzing chord voicings

### 4. File Format Considerations

- Choose appropriate timing resolution (ticks per quarter note)
- Consider file size vs. precision trade-offs
- Use delta time encoding for efficient file storage

### 5. Error Handling

- Handle MIDI device disconnections gracefully
- Validate MIDI messages before processing
- Provide user feedback for recording state

### 6. Performance Optimization

- Buffer MIDI events during recording
- Process events asynchronously when saving files
- Consider using Web Workers for file generation

---

## Implementation Recommendations

### For Web-Based Piano Applications

Based on the current codebase structure (using Web MIDI API directly), here are recommended implementation steps:

#### Phase 1: Basic Recording

1. **Extend MIDIManager**:
   - Add recording state management
   - Track timestamps for all MIDI events
   - Store events in a structured format

2. **Event Storage Structure**:
```javascript
{
    timestamp: number,        // Absolute timestamp
    deltaTime: number,        // Time since last event
    type: 'noteOn' | 'noteOff',
    note: number,             // MIDI note number (0-127)
    velocity: number,         // 0-127
    channel: number          // MIDI channel (0-15)
}
```

#### Phase 2: Duration Calculation

1. **Track Active Notes**:
   - Maintain a map of active notes with their start times
   - Calculate duration when note-off is received
   - Handle edge cases (recording stopped with active notes)

2. **Duration Storage**:
   - Store duration with note-off events
   - Or create note objects with start time and duration

#### Phase 3: MIDI File Export

1. **Choose a Library**:
   - `midi-writer-js` for simplicity
   - `tonejs/midi` for comprehensive features

2. **Convert Events to MIDI Format**:
   - Convert absolute timestamps to delta times
   - Group events by track/channel
   - Set appropriate tempo and time signature

3. **File Download**:
   - Generate MIDI file blob
   - Create download link
   - Trigger browser download

#### Phase 4: Chord Analysis

1. **Detect Chord Groups**:
   - Analyze note-on events within time windows
   - Group simultaneous notes
   - Identify chord names (optional, requires music theory library)

2. **Store Chord Metadata**:
   - Mark events as part of chords
   - Store chord information separately
   - Enable chord-based editing/playback

### Example Implementation Structure

```javascript
class MIDIRecordingManager {
    constructor() {
        this.isRecording = false;
        this.events = [];
        this.activeNotes = new Map();
        this.startTime = null;
    }
    
    startRecording() {
        this.isRecording = true;
        this.events = [];
        this.activeNotes.clear();
        this.startTime = performance.now();
    }
    
    stopRecording() {
        this.isRecording = false;
        // Close all active notes
        this.closeAllActiveNotes();
    }
    
    recordEvent(message) {
        if (!this.isRecording) return;
        
        const [status, note, velocity] = message.data;
        const command = status & 0xf0;
        const timestamp = performance.now();
        const deltaTime = timestamp - this.startTime;
        
        if (command === 0x90 && velocity > 0) {
            // Note On
            this.activeNotes.set(note, {
                startTime: timestamp,
                startDelta: deltaTime,
                velocity: velocity
            });
            
            this.events.push({
                deltaTime,
                timestamp,
                type: 'noteOn',
                note,
                velocity
            });
        } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
            // Note Off
            const noteData = this.activeNotes.get(note);
            if (noteData) {
                const duration = timestamp - noteData.startTime;
                
                this.events.push({
                    deltaTime,
                    timestamp,
                    type: 'noteOff',
                    note,
                    velocity: 0,
                    duration
                });
                
                this.activeNotes.delete(note);
            }
        }
    }
    
    closeAllActiveNotes() {
        const finalTime = performance.now();
        this.activeNotes.forEach((noteData, note) => {
            const duration = finalTime - noteData.startTime;
            this.events.push({
                deltaTime: finalTime - this.startTime,
                timestamp: finalTime,
                type: 'noteOff',
                note,
                velocity: 0,
                duration
            });
        });
        this.activeNotes.clear();
    }
    
    exportToMIDI() {
        // Use midi-writer-js or similar library
        // Convert events to MIDI file format
        // Return blob for download
    }
    
    detectChords(timeWindow = 50) {
        // Analyze events to detect chord groups
        // Return array of chord objects
    }
}
```

---

## Conclusion

Recording MIDI keyboard input with accurate note durations and chord structures is achievable through various methods:

1. **Real-time recording** using Web MIDI API captures precise timing
2. **Note durations** are calculated from note-on/note-off event pairs
3. **Chords** are recorded as multiple simultaneous note-on events
4. **MIDI file export** requires converting events to Standard MIDI File format
5. **Libraries** like `midi-writer-js` simplify file creation

The key to successful implementation is:
- Accurate timestamp tracking
- Proper handling of note-on/note-off pairs
- Efficient event storage and processing
- Appropriate MIDI file format encoding

For web-based applications, the Web MIDI API provides all necessary functionality for recording, and JavaScript libraries can handle MIDI file generation and export.

---

## References

- [Web MIDI API - MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API)
- [MIDI.org Specifications](https://www.midi.org/specifications)
- [Standard MIDI File Format Specification](https://www.midi.org/specifications-old/item/standard-midi-files-smf)
- Soundation MIDI Recording Guide
- Logic Pro Documentation
- Cubase Chord Detection Features

---

*Report generated: 2025-12-16*



