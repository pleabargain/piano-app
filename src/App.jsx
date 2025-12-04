// https://github.com/pleabargain/piano-app
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Piano from './components/Piano';
import Controls from './components/Controls';
import ProgressionBuilder from './components/ProgressionBuilder';
import CircleOfFifths from './components/CircleOfFifths';
import KeyDisplay from './components/KeyDisplay';
import { midiManager } from './core/midi-manager';
import { getScaleNotes, getChordNotes, identifyChord, getChordNotesAsMidi, parseChordName, findPotentialChords, NOTES, CHORD_TYPES } from './core/music-theory';
import './App.css';

function App() {
  // Settings State
  const [selectedRoot, setSelectedRoot] = useState('C');
  const [selectedScaleType, setSelectedScaleType] = useState('major');
  const [mode, setMode] = useState('scale'); // 'scale', 'chord', 'free', 'lava'
  const [keyboardSize, setKeyboardSize] = useState({ start: 36, end: 96 }); // 61 keys default

  // MIDI State
  const [activeNotes, setActiveNotes] = useState([]);
  const [midiEnabled, setMidiEnabled] = useState(false);
  const [midiDeviceName, setMidiDeviceName] = useState(null);

  // Practice State
  const [progression, setProgression] = useState([]); // Array of { name: 'C Major', roman: 'I' }
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [feedbackState, setFeedbackState] = useState({}); // { midiNumber: 'correct' | 'incorrect' }
  const [statusMessage, setStatusMessage] = useState('Connect MIDI keyboard to start');
  const [detectedChord, setDetectedChord] = useState(null);

  // Chord display state
  const [clickedChord, setClickedChord] = useState(null); // { name: 'C Major', inversion: 0 }
  const [chordMidiNotes, setChordMidiNotes] = useState([]); // MIDI numbers to highlight
  const [chordSuggestions, setChordSuggestions] = useState([]); // Array of potential chords

  // Lava Game state
  const [lavaScore, setLavaScore] = useState({ good: 0, bad: 0 });
  const [lavaKeys, setLavaKeys] = useState([]); // MIDI numbers that are "lava" (bad keys)

  // Clear clicked chord when mode changes
  useEffect(() => {
    if (mode !== 'chord') {
      setClickedChord(null);
      setChordMidiNotes([]);
      setChordSuggestions([]);
    }
    // Reset lava game score when switching modes
    if (mode !== 'lava') {
      setLavaScore({ good: 0, bad: 0 });
    }
  }, [mode]);

  // Initialize lava keys when mode or key/scale changes
  useEffect(() => {
    if (mode === 'lava') {
      const scaleNotes = getScaleNotes(selectedRoot, selectedScaleType);
      const scaleNoteIndices = scaleNotes.map(n => NOTES.indexOf(n));

      // All keys in the keyboard range
      const allKeys = [];
      const lavaKeyIndices = [];

      for (let i = keyboardSize.start; i <= keyboardSize.end; i++) {
        const pitchClass = i % 12;
        if (scaleNoteIndices.includes(pitchClass)) {
          // Good key - in scale
          allKeys.push(i);
        } else {
          // Bad key - lava key
          lavaKeyIndices.push(i);
        }
      }

      setLavaKeys(lavaKeyIndices);
    }
  }, [mode, selectedRoot, selectedScaleType, keyboardSize]);

  // Refs for state access in callbacks to avoid stale closures
  const modeRef = useRef(mode);
  const selectedRootRef = useRef(selectedRoot);
  const selectedScaleTypeRef = useRef(selectedScaleType);

  // Update refs when state changes
  useEffect(() => {
    modeRef.current = mode;
    selectedRootRef.current = selectedRoot;
    selectedScaleTypeRef.current = selectedScaleType;
  }, [mode, selectedRoot, selectedScaleType]);

  const handleMidiMessage = useCallback((event, activeNotesList) => {
    setActiveNotes(activeNotesList);

    // Update device name if inputs changed
    if (event.type === 'inputsChanged') {
      const deviceName = midiManager.getFirstInputName();
      setMidiDeviceName(deviceName);
      if (deviceName && midiEnabled) {
        setStatusMessage(`MIDI Connected: ${deviceName}`);
      } else if (midiEnabled) {
        setStatusMessage('MIDI Connected. Select a mode to play.');
      }
    }

    // Track lava game scoring - use refs to get latest values
    if (modeRef.current === 'lava' && event.type === 'noteOn') {
      const scaleNotes = getScaleNotes(selectedRootRef.current, selectedScaleTypeRef.current);
      const scaleNoteIndices = scaleNotes.map(n => NOTES.indexOf(n));
      const note = event.note;
      const pitchClass = note % 12;

      if (scaleNoteIndices.includes(pitchClass)) {
        // Good key - increment good score
        setLavaScore(prev => ({ ...prev, good: prev.good + 1 }));
      } else {
        // Bad key (lava) - increment bad score
        setLavaScore(prev => ({ ...prev, bad: prev.bad + 1 }));
      }
    }
  }, []);

  useEffect(() => {
    // Initialize MIDI
    midiManager.requestAccess().then(success => {
      setMidiEnabled(success);
      if (success) {
        const deviceName = midiManager.getFirstInputName();
        setMidiDeviceName(deviceName);
        if (deviceName) {
          setStatusMessage(`MIDI Connected: ${deviceName}`);
        } else {
          setStatusMessage('MIDI Connected. Select a mode to play.');
        }
        midiManager.addListener(handleMidiMessage);
      } else {
        setStatusMessage('Web MIDI API not supported or no device found.');
        setMidiDeviceName(null);
      }
    });

    return () => {
      midiManager.removeListener(handleMidiMessage);
    };
  }, [handleMidiMessage]);

  // Logic for Practice Modes
  useEffect(() => {
    if (mode === 'free') {
      handleFreePlay();
    } else if (mode === 'scale') {
      handleScalePractice();
    } else if (mode === 'chord') {
      handleChordPractice();
    } else if (mode === 'lava') {
      handleLavaGame();
    }
  }, [activeNotes, mode, selectedRoot, selectedScaleType, currentStepIndex, progression, lavaScore]);

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
    // Detect the chord being played
    const detected = identifyChord(activeNotes);

    // Clear suggestions by default, we'll set them if needed
    setChordSuggestions([]);

    if (progression.length > 0) {
      const target = progression[currentStepIndex % progression.length];
      if (detected) {
        setStatusMessage(`Target: ${target.name} (${target.roman}) | Playing: ${detected.name} ${detected.inversion ? `(${detected.inversion})` : ''}`);
        setDetectedChord(detected);
      } else if (activeNotes.length > 0) {
        setStatusMessage(`Target: ${target.name} (${target.roman}) | Playing...`);
        setDetectedChord(null);

        // If 2+ notes, suggest chords
        if (activeNotes.length >= 2) {
          const suggestions = findPotentialChords(activeNotes);
          setChordSuggestions(suggestions);
        }
      } else {
        setStatusMessage(`Target: ${target.name} (${target.roman})`);
        setDetectedChord(null);
      }
    } else {
      if (detected) {
        setStatusMessage(`Playing: ${detected.name} ${detected.inversion ? `(${detected.inversion})` : ''}`);
        setDetectedChord(detected);

        // Suggest extensions if it's a triad (or any chord really, logic handles it)
        const suggestions = findPotentialChords(activeNotes);
        // Filter out the detected chord itself from suggestions
        const filteredSuggestions = suggestions.filter(s => s.name !== detected.name);
        setChordSuggestions(filteredSuggestions);

      } else if (activeNotes.length > 0) {
        setStatusMessage('Playing... (no chord detected)');
        setDetectedChord(null);

        // If 2+ notes, suggest chords
        if (activeNotes.length >= 2) {
          const suggestions = findPotentialChords(activeNotes);
          setChordSuggestions(suggestions);
        }
      } else {
        setStatusMessage('Set a progression to start');
        setDetectedChord(null);
      }
    }
  };

  const handleFreePlay = () => {
    const chord = identifyChord(activeNotes);
    if (chord) {
      setStatusMessage(`Detected: ${chord.name} ${chord.inversion ? `(${chord.inversion})` : ''}`);
      setDetectedChord(chord);
    } else if (activeNotes.length > 0) {
      setStatusMessage('Playing... (no chord detected)');
      setDetectedChord(null);
    } else {
      setStatusMessage('Free Play - Play any chord to see detection');
      setDetectedChord(null);
    }
    setFeedbackState({});
  };

  const handleLavaGame = () => {
    setStatusMessage(`🔥 Lava Game - ${selectedRoot} ${selectedScaleType} | Good: ${lavaScore.good} | Bad: ${lavaScore.bad}`);
    setDetectedChord(null);
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
    else if (mode === 'lava') {
      // In lava mode, highlight good keys (scale notes) - they'll be blue
      const scaleNotes = getScaleNotes(selectedRoot, selectedScaleType);
      return scaleNotes.map(n => NOTES.indexOf(n));
    }
    else {
      // Free play: Highlight scale notes
      return getScaleNotes(selectedRoot, selectedScaleType).map(n => NOTES.indexOf(n));
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Piano Trainer {midiDeviceName && <span className="midi-device-name">({midiDeviceName})</span>}</h1>
      </header>

      <div className="main-content">
        <Piano
          startNote={keyboardSize.start}
          endNote={keyboardSize.end}
          activeNotes={activeNotes}
          highlightedNotes={getHighlightedNotes()}
          chordMidiNotes={chordMidiNotes}
          lavaKeys={mode === 'lava' ? lavaKeys : []}
          feedbackState={feedbackState}
        />

        <div className="controls-section">
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

          <div className="circle-and-chord-container">
            <CircleOfFifths
              selectedRoot={selectedRoot}
              onRootSelect={setSelectedRoot}
            />
            <KeyDisplay
              selectedRoot={selectedRoot}
              selectedScaleType={selectedScaleType}
              onRootSelect={setSelectedRoot}
              onScaleTypeSelect={setSelectedScaleType}
            />
            {(mode === 'free' || mode === 'chord') && (
              <div className="chord-display-in-controls">
                <div className="chord-label">Detected Chord:</div>
                {detectedChord ? (
                  <>
                    <div className="chord-name-in-controls">{detectedChord.name}</div>
                    {detectedChord.inversion && (
                      <div className="chord-inversion-in-controls">{detectedChord.inversion}</div>
                    )}
                  </>
                ) : (
                  <div className="chord-placeholder">
                    {activeNotes.length > 0 ? 'Playing...' : 'No chord detected'}
                  </div>
                )}

                {mode === 'chord' && chordSuggestions.length > 0 && (
                  <div className="chord-suggestions">
                    <div className="suggestions-label">
                      {detectedChord ? 'Extensions / Variations:' : 'Possible Chords:'}
                    </div>
                    <div className="suggestions-list">
                      {chordSuggestions.map((s, i) => (
                        <div key={i} className="suggestion-item">
                          <span className="suggestion-name">{s.name}</span>
                          <span className="suggestion-missing"> (add {s.missingNotes.join(', ')})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {mode === 'lava' && (
              <div className="lava-game-score">
                <h3>🔥 Lava Game Score 🔥</h3>
                <div className="score-display">
                  <div className="score-item good-keys">
                    <span className="score-label">Good Keys:</span>
                    <span className="score-value">{lavaScore.good}</span>
                  </div>
                  <div className="score-item bad-keys">
                    <span className="score-label">Lava Keys Hit:</span>
                    <span className="score-value">{lavaScore.bad}</span>
                  </div>
                </div>
                <div className="lava-instructions">
                  <p>🎹 Ice Blue keys = Good (in {selectedRoot} {selectedScaleType})</p>
                  <p>🔥 Red keys = Lava (avoid these!)</p>
                  <p>Play continuously - no time limit!</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {mode === 'chord' && (
          <>
            <ProgressionBuilder
              selectedRoot={selectedRoot}
              selectedScaleType={selectedScaleType}
              onProgressionSet={(p) => {
                setProgression(p);
                setCurrentStepIndex(0);
                // Clear clicked chord when progression changes
                setClickedChord(null);
                setChordMidiNotes([]);
              }}
              onChordClick={(chordName) => {
                // Handle chord click - cycle through inversions
                const parsed = parseChordName(chordName);
                if (!parsed) return;

                // Check if this is the same chord that was clicked before
                if (clickedChord && clickedChord.name === chordName) {
                  // Cycle to next inversion
                  const maxInversions = CHORD_TYPES[parsed.chordType].intervals.length + 1;
                  const nextInversion = (clickedChord.inversion + 1) % maxInversions;
                  setClickedChord({ name: chordName, inversion: nextInversion });

                  // Calculate MIDI notes for this inversion (use middle C octave = 4)
                  const midiNotes = getChordNotesAsMidi(parsed.root, parsed.chordType, nextInversion, 4);
                  setChordMidiNotes(midiNotes);
                } else {
                  // New chord clicked - start with root position
                  setClickedChord({ name: chordName, inversion: 0 });
                  const midiNotes = getChordNotesAsMidi(parsed.root, parsed.chordType, 0, 4);
                  setChordMidiNotes(midiNotes);
                }
              }}
            />
            {clickedChord && (
              <div className="clicked-chord-display">
                <div className="clicked-chord-label">Showing on Piano:</div>
                <div className="clicked-chord-name">{clickedChord.name}</div>
                <div className="clicked-chord-inversion">
                  {clickedChord.inversion === 0 ? 'Root Position' :
                    clickedChord.inversion === 1 ? '1st Inversion' :
                      clickedChord.inversion === 2 ? '2nd Inversion' :
                        clickedChord.inversion === 3 ? '3rd Inversion' :
                          `${clickedChord.inversion}th Inversion`}
                </div>
                <div className="clicked-chord-hint">Click chord again to cycle inversions</div>
              </div>
            )}
          </>
        )}

        {mode === 'chord' && progression.length > 0 && (
          <div className="current-target">
            <h2>Target: {progression[currentStepIndex % progression.length].roman}</h2>
            <h3>{progression[currentStepIndex % progression.length].name}</h3>
            {detectedChord && (
              <div className="detected-chord-info">
                <div className="detected-label">Playing:</div>
                <div className="detected-chord-name">{detectedChord.name}</div>
                {detectedChord.inversion && (
                  <div className="detected-chord-inversion">{detectedChord.inversion}</div>
                )}
              </div>
            )}
          </div>
        )}

        {mode === 'free' && detectedChord && (
          <div className="current-target detected-chord-card">
            <h2 className="chord-name-display">{detectedChord.name}</h2>
            <h3 className="chord-inversion-display">{detectedChord.inversion}</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
