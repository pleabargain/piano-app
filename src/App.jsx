import React, { useState, useEffect, useRef } from 'react';
import Piano from './components/Piano';
import Controls from './components/Controls';
import ProgressionBuilder from './components/ProgressionBuilder';
import { midiManager } from './core/midi-manager';
import { getScaleNotes, getChordNotes, identifyChord, NOTES } from './core/music-theory';
import './App.css';

function App() {
  // Settings State
  const [selectedRoot, setSelectedRoot] = useState('C');
  const [selectedScaleType, setSelectedScaleType] = useState('major');
  const [mode, setMode] = useState('scale'); // 'scale', 'chord', 'free'
  const [keyboardSize, setKeyboardSize] = useState({ start: 36, end: 96 }); // 61 keys default

  // MIDI State
  const [activeNotes, setActiveNotes] = useState([]);
  const [midiEnabled, setMidiEnabled] = useState(false);

  // Practice State
  const [progression, setProgression] = useState([]); // Array of { name: 'C Major', roman: 'I' }
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [feedbackState, setFeedbackState] = useState({}); // { midiNumber: 'correct' | 'incorrect' }
  const [statusMessage, setStatusMessage] = useState('Connect MIDI keyboard to start');
  const [detectedChord, setDetectedChord] = useState(null);

  // Refs for state access in callbacks if needed (though we use functional updates)

  useEffect(() => {
    // Initialize MIDI
    midiManager.requestAccess().then(success => {
      setMidiEnabled(success);
      if (success) {
        setStatusMessage('MIDI Connected. Select a mode to play.');
        midiManager.addListener(handleMidiMessage);
      } else {
        setStatusMessage('Web MIDI API not supported or no device found.');
      }
    });

    return () => {
      midiManager.removeListener(handleMidiMessage);
    };
  }, []);

  const handleMidiMessage = (event, activeNotesList) => {
    setActiveNotes(activeNotesList);
  };

  // Logic for Practice Modes
  useEffect(() => {
    if (mode === 'free') {
      handleFreePlay();
    } else if (mode === 'scale') {
      handleScalePractice();
    } else if (mode === 'chord') {
      handleChordPractice();
    }
  }, [activeNotes, mode, selectedRoot, selectedScaleType, currentStepIndex, progression]);

  // Reset practice state when settings change
  useEffect(() => {
    setCurrentStepIndex(0);
    setFeedbackState({});
    setDetectedChord(null);
    if (mode === 'scale') {
      setStatusMessage(`Practice ${selectedRoot} ${selectedScaleType} Scale`);
    } else if (mode === 'chord') {
      setStatusMessage('Set a progression or practice chords');
    } else {
      setStatusMessage('Free Play - Play anything!');
    }
  }, [mode, selectedRoot, selectedScaleType]);

  const handleChordPractice = () => {
    if (progression.length > 0) {
      const target = progression[currentStepIndex % progression.length];
      setStatusMessage(`Target: ${target.name} (${target.roman})`);
    } else {
      setStatusMessage('Set a progression to start');
    }
  };

  const handleFreePlay = () => {
    const chord = identifyChord(activeNotes);
    if (chord) {
      setStatusMessage(`Detected: ${chord.name}`);
      setDetectedChord(chord);
    } else if (activeNotes.length > 0) {
      setStatusMessage('Playing...');
      setDetectedChord(null);
    } else {
      setStatusMessage('Free Play');
      setDetectedChord(null);
    }
    setFeedbackState({});
  };

  const handleScalePractice = () => {
    const scaleNotes = getScaleNotes(selectedRoot, selectedScaleType);
    if (scaleNotes.length === 0) return;

    // In scale practice, we might want to play notes sequentially
    // For simplicity V1: Highlight all scale notes, user plays them.
    // Better V2 (Strict): User must play scaleNotes[currentStepIndex]

    const targetNoteName = scaleNotes[currentStepIndex % scaleNotes.length];
    // Find the MIDI number for this note that is closest to the middle or just allow any octave
    // For strict mode, let's allow any octave of the target note

    const isCorrect = activeNotes.some(midi => NOTES[midi % 12] === targetNoteName);

    // Visuals
    const newFeedback = {};

    // Highlight target notes (all octaves)
    // We can't easily highlight "all octaves" in the Piano component without passing a list
    // So we'll just pass pitch classes to Piano via highlightedNotes prop

    if (isCorrect) {
      // User played the correct note
      // Advance step
      // Debounce or wait for release?
      // For "Wait-for-Input", as soon as they hit it, we can move on.
      // But if they hold it, it might trigger next if next is same note (unlikely in scale)

      // To prevent rapid firing, we might require all notes released or just edge trigger.
      // Since activeNotes is state, this runs on every update.
      // We need to ensure we don't advance multiple times for one press.
      // But activeNotes updates on NoteOn and NoteOff.

      // Simple approach: Advance, but require release before next?
      // Or just advance.

      // Let's add a small delay or check if it's a *new* press?
      // For now, just advance.

      // WAIT: If I hold C, and next is D, I play D.
      // If next was C again, I'd need to re-press.

      // Let's just advance index.
      // But we need to avoid infinite loop if they hold the key.
      // We can check if the key was *just* pressed?
      // activeNotes doesn't tell us history.

      // Alternative: Only advance if the *only* active note is the correct one?
      // Or just wait for a moment.

      // Let's try: Advance immediately.
      // If the user holds the key, and the next note is DIFFERENT, it's fine.
      // If the next note is the SAME, it will auto-advance.

      // For scales, notes are distinct usually.

      // We need to use a timeout to avoid instant skipping if React updates fast.
      // Actually, we should probably wait for Note Off before accepting same note again?
      // For V1, let's just advance.

      // ISSUE: This effect runs on every render. If isCorrect is true, it will increment index endlessly.
      // FIX: We need to trigger ONLY when `activeNotes` changes.
      // We are in useEffect([activeNotes...]).

      // We need to check if we ALREADY advanced for this specific key press.
      // We can use a ref to store "last processed note".

      // Actually, let's just check if the target note is present.
      // If it is, and we haven't marked it as "done" for this step.

      // Let's use a "waitingForRelease" state?
      // Or just:

      // If (correct note is pressed) {
      //    setCurrentStepIndex(prev => prev + 1);
      // }

      // This will loop if we don't block it.
      // We can check if the previous activeNotes did NOT have the note?
      // But we don't have previous state easily in useEffect.

      // Let's use a ref for `prevActiveNotes`.
    }
  };

  // Ref to track previous active notes for edge detection
  const prevActiveNotesRef = useRef([]);

  useEffect(() => {
    // Edge detection logic
    const prevActive = prevActiveNotesRef.current;
    const currentActive = activeNotes;

    // Find newly pressed notes
    const newNotes = currentActive.filter(n => !prevActive.includes(n));

    if (newNotes.length > 0) {
      handleNoteOn(newNotes);
    }

    prevActiveNotesRef.current = currentActive;
  }, [activeNotes]);

  const handleNoteOn = (newNotes) => {
    if (mode === 'scale') {
      const scaleNotes = getScaleNotes(selectedRoot, selectedScaleType);
      const targetNoteName = scaleNotes[currentStepIndex % scaleNotes.length];

      // Check if any of the new notes match the target
      const hit = newNotes.some(midi => NOTES[midi % 12] === targetNoteName);

      if (hit) {
        setCurrentStepIndex(prev => prev + 1);
        setStatusMessage(`Good! Next: ${scaleNotes[(currentStepIndex + 1) % scaleNotes.length]}`);
      } else {
        // Optional: Feedback for wrong note
      }
    } else if (mode === 'chord') {
      // Logic for chord progression
      if (progression.length === 0) return;

      const targetChord = progression[currentStepIndex % progression.length];
      // targetChord has { name: 'C Major', roman: 'I' }
      // We need to know the expected notes.
      // We can re-derive or store them.
      // For now, let's just check if the detected chord matches the name.

      const detected = identifyChord(activeNotes);
      // Note: identifyChord might return inversions.
      // If target is "C Major", and detected is "C Major", we are good.

      // However, `identifyChord` needs ALL notes to be present usually.
      // If I play C, then E, then G... I trigger NoteOn 3 times.
      // I should check if the *current set of active notes* forms the chord.

      // So this shouldn't be in handleNoteOn, but in the main effect or check after update.
    }
  };

  // Separate effect for Chord validation (state-based, not edge-based)
  useEffect(() => {
    if (mode === 'chord' && progression.length > 0) {
      const targetChord = progression[currentStepIndex % progression.length];
      const detected = identifyChord(activeNotes);

      if (detected && detected.name === targetChord.name) {
        // Correct chord held!
        // Advance after a short delay to let them hear/see it?
        // Or wait for release?
        // Let's advance immediately but debounce?

        // Issue: If I hold the chord, it might skip through if the next chord is the same (rare).
        // If next chord is different, it won't match.

        // Let's add a small timeout to prevent double-skipping
        const timer = setTimeout(() => {
          setCurrentStepIndex(prev => prev + 1);
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  }, [activeNotes, mode, progression, currentStepIndex]);


  // Helper to get highlighted notes for Piano
  const getHighlightedNotes = () => {
    if (mode === 'scale') {
      const scaleNotes = getScaleNotes(selectedRoot, selectedScaleType);
      // Highlight all notes in scale? Or just the target?
      // User asked for "Wait-for-Input", implying guidance.
      // Let's highlight the TARGET note in a specific color, and others in scale in background?
      // For now, just highlight the target pitch class.
      const target = scaleNotes[currentStepIndex % scaleNotes.length];
      return [NOTES.indexOf(target)];
    }
    else if (mode === 'chord') {
      if (progression.length === 0) return [];
      const targetChord = progression[currentStepIndex % progression.length];
      // We need notes for this chord.
      // We can parse the name "C Major" -> root: C, type: major
      const [root, ...rest] = targetChord.name.split(' ');
      const typeName = rest.join(' ');
      // Map typeName back to type key? 'Major' -> 'major'
      // This is a bit reverse.
      // Better to store structured data in progression.

      // For now, let's just highlight nothing or try to parse.
      // Actually, the ProgressionBuilder returns { roman, name }.
      // We can re-calculate notes if we know the scale context?
      // Yes, we have selectedRoot/ScaleType.

      // Let's just highlight the scale notes for context?
      return getScaleNotes(selectedRoot, selectedScaleType).map(n => NOTES.indexOf(n));
    }
    else {
      // Free play: Highlight scale notes
      return getScaleNotes(selectedRoot, selectedScaleType).map(n => NOTES.indexOf(n));
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Piano Trainer</h1>
        <div className="status-bar">{statusMessage}</div>
      </header>

      <div className="main-content">
        <Piano
          startNote={keyboardSize.start}
          endNote={keyboardSize.end}
          activeNotes={activeNotes}
          highlightedNotes={getHighlightedNotes()}
          feedbackState={feedbackState}
        />

        <Controls
          selectedRoot={selectedRoot}
          onRootChange={setSelectedRoot}
          selectedScaleType={selectedScaleType}
          onScaleTypeChange={setSelectedScaleType}
          mode={mode}
          onModeChange={setMode}
          keyboardSize={keyboardSize}
          onKeyboardSizeChange={setKeyboardSize}
        />

        {mode === 'chord' && (
          <ProgressionBuilder
            selectedRoot={selectedRoot}
            selectedScaleType={selectedScaleType}
            onProgressionSet={(p) => {
              setProgression(p);
              setCurrentStepIndex(0);
            }}
          />
        )}

        {mode === 'chord' && progression.length > 0 && (
          <div className="current-target">
            <h2>Current: {progression[currentStepIndex % progression.length].roman}</h2>
            <h3>{progression[currentStepIndex % progression.length].name}</h3>
          </div>
        )}

        {mode === 'free' && detectedChord && (
          <div className="current-target">
            <h2>{detectedChord.name}</h2>
            <h3>{detectedChord.inversion}</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
