// https://github.com/pleabargain/piano-app
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Piano from './components/Piano';
import Controls from './components/Controls';
import ProgressionBuilder from './components/ProgressionBuilder';
import KeyProgressionBuilder from './components/KeyProgressionBuilder';
import CircleOfFifths from './components/CircleOfFifths';
import KeyDisplay from './components/KeyDisplay';
import ChordInfo from './components/ChordInfo';
import ScaleSelector from './components/ScaleSelector';
import RecordingControls from './components/RecordingControls';
import RecordingList from './components/RecordingList';
import { midiManager } from './core/midi-manager';
import RecordingManager from './core/recording-manager';
import PlaybackManager from './core/playback-manager';
import RecordingStorage from './core/recording-storage';
import { getScaleNotes, getChordNotes, identifyChord, getChordNotesAsMidi, parseChordName, findPotentialChords, NOTES, CHORD_TYPES } from './core/music-theory';
import { useChordDetection } from './hooks/useChordDetection';
import './App.css';

function App() {
  // Settings State
  const [selectedRoot, setSelectedRoot] = useState('C');
  const [selectedScaleType, setSelectedScaleType] = useState('major');
  const [mode, setMode] = useState('scale'); // 'scale', 'chord', 'free', 'lava'
  const [keyboardSize, setKeyboardSize] = useState({ start: 21, end: 108 }); // 88 keys default

  // MIDI State
  const [activeNotes, setActiveNotes] = useState([]);
  const [midiEnabled, setMidiEnabled] = useState(false);
  const [midiDeviceName, setMidiDeviceName] = useState(null);

  // Practice State
  const [progression, setProgression] = useState([]); // Array of { name: 'C Major', roman: 'I' }
  const [keyProgression, setKeyProgression] = useState([]); // Array of note names, e.g., ['F', 'C', 'G', 'D']
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0); // Index in keyProgression
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [feedbackState, setFeedbackState] = useState({}); // { midiNumber: 'correct' | 'incorrect' }
  const [statusMessage, setStatusMessage] = useState('Connect MIDI keyboard to start');

  // Use custom hook for chord detection
  const { detectedChord, detectedChords, chordSuggestions } = useChordDetection(activeNotes);

  // Log detected chord changes with maximum verbosity
  useEffect(() => {
    if (detectedChord) {
      console.log('[App] 🎵🎵🎵 CHORD DETECTED AND AVAILABLE:', {
        name: detectedChord.name,
        root: detectedChord.root,
        type: detectedChord.type,
        inversion: detectedChord.inversion,
        activeNotes: activeNotes
      });
      console.log(`[App] 🎵 CHORD NAME: ${detectedChord.name} ${detectedChord.inversion ? `(${detectedChord.inversion})` : ''}`);
    } else {
      console.log('[App] ⚠️ No chord detected', { activeNotes, activeNotesLength: activeNotes?.length });
    }
  }, [detectedChord, activeNotes]);

  // Chord display state
  const [clickedChord, setClickedChord] = useState(null); // { name: 'C Major', inversion: 0 }
  const [chordMidiNotes, setChordMidiNotes] = useState([]); // MIDI numbers to highlight

  // Locked chord state (for left frame)
  const [lockedChord, setLockedChord] = useState(null); // { name: 'C Major', root: 'C', notes: [...] }

  // Lava Game state
  const [lavaScore, setLavaScore] = useState({ good: 0, bad: 0 });
  const [lavaKeys, setLavaKeys] = useState([]); // MIDI numbers that are "lava" (bad keys)

  // Recording/Playback state
  const recordingManagerRef = useRef(null);
  const playbackManagerRef = useRef(null);
  const recordingStorageRef = useRef(null);
  const [expectedNotes, setExpectedNotes] = useState([]); // Notes expected from playback
  const [isPlayAlongMode, setIsPlayAlongMode] = useState(false);
  const [isWaitForInputMode, setIsWaitForInputMode] = useState(false);
  const [isLoopMode, setIsLoopMode] = useState(false);
  const [currentRecording, setCurrentRecording] = useState(null);

  // Practice Settings
  const [rejectErrors, setRejectErrors] = useState(false);

  // Clear clicked chord when mode changes
  useEffect(() => {
    if (mode !== 'chord') {
      setClickedChord(null);
      setChordMidiNotes([]);
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

  // Initialize recording/playback managers
  useEffect(() => {
    recordingManagerRef.current = new RecordingManager();
    playbackManagerRef.current = new PlaybackManager();
    recordingStorageRef.current = new RecordingStorage();

    // Initialize storage
    recordingStorageRef.current.init().catch(err => {
      console.error('[App] Failed to initialize recording storage:', err);
    });

    // Set up recording callback
    const handleRecordingEvent = (event) => {
      if (recordingManagerRef.current && recordingManagerRef.current.getState() === 'recording') {
        recordingManagerRef.current.recordEvent(event);
      }
    };
    midiManager.setRecordingCallback(handleRecordingEvent);

    // Set up playback event listeners
    const handlePlaybackEvent = (data) => {
      console.log('[App] Playback event received:', data);
      // Update expected notes based on playback (only if not in wait-for-input mode)
      // In wait-for-input mode, expected notes are managed by handleWaitingForInput
      if (!playbackManagerRef.current?.waitForInput) {
        if (data.type === 'noteOn') {
          setExpectedNotes(prev => {
            const updated = [...prev.filter(n => n !== data.note), data.note];
            console.log('[App] Expected notes after noteOn:', updated);
            return updated;
          });
        } else if (data.type === 'noteOff') {
          setExpectedNotes(prev => {
            const updated = prev.filter(n => n !== data.note);
            console.log('[App] Expected notes after noteOff:', updated);
            return updated;
          });
        }
      }
    };

    const handlePlaybackComplete = () => {
      setExpectedNotes([]);
    };

    const handlePlaybackStop = () => {
      setExpectedNotes([]);
    };

    const handleWaitingForInput = (data) => {
      console.log('[App] Waiting for input, expected note:', data.expectedNote);
      // Show only the current expected note when waiting for input
      setExpectedNotes([data.expectedNote]);
    };

    const handleCorrectNote = () => {
      console.log('[App] Correct note played!');
      // Visual feedback could be added here
    };

    const handleIncorrectNote = (data) => {
      console.log('[App] Incorrect note played:', data.played, 'expected:', data.expected);
      // Visual feedback could be added here
    };

    playbackManagerRef.current.on('event', handlePlaybackEvent);
    playbackManagerRef.current.on('complete', handlePlaybackComplete);
    playbackManagerRef.current.on('stop', handlePlaybackStop);
    playbackManagerRef.current.on('waitingForInput', handleWaitingForInput);
    playbackManagerRef.current.on('correctNote', handleCorrectNote);
    playbackManagerRef.current.on('incorrectNote', handleIncorrectNote);

    return () => {
      midiManager.setRecordingCallback(null);
      playbackManagerRef.current.off('event', handlePlaybackEvent);
      playbackManagerRef.current.off('complete', handlePlaybackComplete);
      playbackManagerRef.current.off('stop', handlePlaybackStop);
      playbackManagerRef.current.off('waitingForInput', handleWaitingForInput);
      playbackManagerRef.current.off('correctNote', handleCorrectNote);
      playbackManagerRef.current.off('incorrectNote', handleIncorrectNote);
    };
  }, []);

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
    console.log('[App] 🎹 MIDI MESSAGE RECEIVED:', {
      eventType: event.type,
      activeNotesList,
      activeNotesCount: activeNotesList?.length,
      event,
      note: event.note,
      velocity: event.velocity
    });
    setActiveNotes(activeNotesList);
    console.log('[App] ✅ activeNotes state updated to:', activeNotesList);

    // Check if we're in wait-for-input mode and user played a note
    if (isWaitForInputMode && playbackManagerRef.current && event.type === 'noteOn' && event.note !== undefined) {
      const correct = playbackManagerRef.current.checkUserInput(event.note);
      if (correct) {
        console.log('[App] ✅ Correct note played, advancing playback');
      } else {
        console.log('[App] ❌ Incorrect note played');
      }
    }

    // Immediately try to detect chord for logging
    if (activeNotesList && activeNotesList.length >= 3) {
      const immediateChord = identifyChord(activeNotesList);
      if (immediateChord) {
        console.log('[App] 🎵 IMMEDIATE CHORD DETECTION:', immediateChord.name, immediateChord.inversion);
      } else {
        console.log('[App] ⚠️ No chord detected from active notes:', activeNotesList);
      }
    } else {
      console.log('[App] ⚠️ Insufficient notes for chord detection:', { count: activeNotesList?.length, notes: activeNotesList });
    }

    // Update device name if inputs changed
    if (event.type === 'inputsChanged') {
      console.log('[App] handleMidiMessage: inputs changed');
      const deviceName = midiManager.getFirstInputName();
      console.log('[App] handleMidiMessage: device name', deviceName);
      setMidiDeviceName(deviceName);
      if (deviceName && midiEnabled) {
        setStatusMessage(`MIDI Connected: ${deviceName}`);
      } else if (midiEnabled) {
        setStatusMessage('MIDI Connected. Select a mode to play.');
      }
    }

    // Track lava game scoring - use refs to get latest values
    if (modeRef.current === 'lava' && event.type === 'noteOn') {
      console.log('[App] handleMidiMessage: lava game noteOn', { note: event.note });
      const scaleNotes = getScaleNotes(selectedRootRef.current, selectedScaleTypeRef.current);
      const scaleNoteIndices = scaleNotes.map(n => NOTES.indexOf(n));
      const note = event.note;
      const pitchClass = note % 12;

      if (scaleNoteIndices.includes(pitchClass)) {
        console.log('[App] handleMidiMessage: good key hit', { note, pitchClass });
        // Good key - increment good score
        setLavaScore(prev => ({ ...prev, good: prev.good + 1 }));
      } else {
        console.log('[App] handleMidiMessage: lava key hit', { note, pitchClass });
        // Bad key (lava) - increment bad score
        setLavaScore(prev => ({ ...prev, bad: prev.bad + 1 }));
      }
    }
  }, [midiEnabled, isWaitForInputMode]);

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
    // detectedChord is now managed by hook, no need to reset manually
    if (mode === 'scale') {
      const displayRoot = keyProgression.length > 0 ? keyProgression[currentKeyIndex] : selectedRoot;
      setStatusMessage(`Practice ${displayRoot} ${selectedScaleType} Scale`);
    } else if (mode === 'chord') {
      setStatusMessage('Set a progression or practice chords');
    } else {
      setStatusMessage('Free Play - Play anything!');
    }
  }, [mode, selectedRoot, selectedScaleType, keyProgression, currentKeyIndex]);

  // Update selectedRoot when key progression changes or advances
  useEffect(() => {
    if (keyProgression.length > 0 && mode === 'scale') {
      const currentKey = keyProgression[currentKeyIndex];
      if (currentKey && currentKey !== selectedRoot) {
        setSelectedRoot(currentKey);
      }
    }
  }, [keyProgression, currentKeyIndex, mode]);

  const handleChordPractice = () => {
    console.log('[App] handleChordPractice called', {
      activeNotes,
      activeNotesLength: activeNotes?.length,
      progression,
      progressionLength: progression?.length,
      currentStepIndex,
      mode
    });
    // We use identifyChord locally for synchronous status message updates relative to activeNotes
    const detected = identifyChord(activeNotes);
    if (detected) {
      console.log('[App] 🎵 CHORD DETECTED IN handleChordPractice:', detected.name, detected.inversion);
    } else {
      console.log('[App] ❌ NO CHORD in handleChordPractice', { activeNotes, activeNotesLength: activeNotes?.length });
    }
    console.log('[App] handleChordPractice: detected chord', detected);

    if (progression.length > 0) {
      const target = progression[currentStepIndex % progression.length];
      console.log('[App] handleChordPractice: target chord', target);
      if (detected) {
        const message = `Target: ${target.name} (${target.roman}) | Playing: ${detected.name} ${detected.inversion ? `(${detected.inversion})` : ''}`;
        console.log('[App] handleChordPractice: status message', message);
        setStatusMessage(message);
      } else if (activeNotes.length > 0) {
        const message = `Target: ${target.name} (${target.roman}) | Playing...`;
        console.log('[App] handleChordPractice: status message (playing)', message);
        setStatusMessage(message);
      } else {
        const message = `Target: ${target.name} (${target.roman})`;
        console.log('[App] handleChordPractice: status message (idle)', message);
        setStatusMessage(message);
      }
    } else {
      console.log('[App] handleChordPractice: no progression set');
      if (detected) {
        const message = `Playing: ${detected.name} ${detected.inversion ? `(${detected.inversion})` : ''}`;
        console.log('[App] handleChordPractice: status message (no progression)', message);
        setStatusMessage(message);
      } else if (activeNotes.length > 0) {
        console.log('[App] handleChordPractice: playing but no chord detected');
        setStatusMessage('Playing... (no chord detected)');
      } else {
        console.log('[App] handleChordPractice: idle, no progression');
        setStatusMessage('Set a progression to start');
      }
    }
  };

  const handleFreePlay = () => {
    const chord = identifyChord(activeNotes);

    if (chord) {
      setStatusMessage(`Detected: ${chord.name} ${chord.inversion ? `(${chord.inversion})` : ''}`);
    } else if (activeNotes.length > 0) {
      setStatusMessage('Playing... (no chord detected)');
    } else {
      setStatusMessage('Free Play - Play any chord to see detection');
    }
    setFeedbackState({});
  };

  const handleLavaGame = () => {
    setStatusMessage(`🔥 Lava Game - ${selectedRoot} ${selectedScaleType} | Good: ${lavaScore.good} | Bad: ${lavaScore.bad}`);
  };

  const handleScalePractice = () => {
    // Use current key from progression if available, otherwise use selectedRoot
    const currentKey = keyProgression.length > 0 ? keyProgression[currentKeyIndex] : selectedRoot;
    const scaleNotes = getScaleNotes(currentKey, selectedScaleType);
    if (scaleNotes.length === 0) return;

    // For piano scales: create full octave pattern (ascending + descending)
    // Ascending: C D E F G A B C (8 notes)
    // Descending: C B A G F E D C (8 notes, starting from octave C)
    // Full cycle: 15 notes total (C D E F G A B C B A G F E D C)
    const ascendingPattern = [...scaleNotes, currentKey]; // C D E F G A B C
    const descendingPattern = [...scaleNotes].reverse(); // B A G F E D C
    const completeScalePattern = [...ascendingPattern, ...descendingPattern]; // Full cycle

    const targetNoteName = completeScalePattern[currentStepIndex % completeScalePattern.length];
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
  }, [activeNotes, mode, keyProgression, currentKeyIndex, currentStepIndex, selectedRoot, selectedScaleType]);

  const handleNoteOn = (newNotes) => {
    if (mode === 'scale') {
      // Use refs to get current values to avoid stale closures
      const currentKeyProgression = keyProgression.length > 0 ? keyProgression : [];
      const currentKeyIdx = currentKeyProgression.length > 0 ? currentKeyIndex : 0;
      const currentStepIdx = currentStepIndex;

      // Use current key from progression if available, otherwise use selectedRoot
      const currentKey = currentKeyProgression.length > 0 ? currentKeyProgression[currentKeyIdx] : selectedRoot;
      const scaleNotes = getScaleNotes(currentKey, selectedScaleType);
      if (scaleNotes.length === 0) return;

      // For piano scales: create full octave pattern (ascending + descending)
      // Ascending: C D E F G A B C (8 notes)
      // Descending: C B A G F E D C (8 notes, starting from octave C)
      // Full cycle: 15 notes total (C D E F G A B C B A G F E D C)
      const ascendingPattern = [...scaleNotes, currentKey]; // C D E F G A B C
      const descendingPattern = [...scaleNotes].reverse(); // B A G F E D C
      const completeScalePattern = [...ascendingPattern, ...descendingPattern]; // Full cycle

      const targetNoteName = completeScalePattern[currentStepIdx % completeScalePattern.length];

      // Check if any of the new notes match the target
      const hit = newNotes.some(midi => NOTES[midi % 12] === targetNoteName);

      if (hit) {
        const nextStepIndex = currentStepIdx + 1;
        const scaleLength = completeScalePattern.length;

        // Check if full scale cycle is complete
        if (nextStepIndex >= scaleLength) {
          // Scale completed! Advance to next key in progression
          if (currentKeyProgression.length > 0) {
            const nextKeyIndex = (currentKeyIdx + 1) % currentKeyProgression.length;
            setCurrentKeyIndex(nextKeyIndex);
            setCurrentStepIndex(0);
            const nextKey = currentKeyProgression[nextKeyIndex];
            setStatusMessage(`Scale complete! Next key: ${nextKey} ${selectedScaleType}`);
          } else {
            // No progression, just wrap around
            setCurrentStepIndex(0);
            setStatusMessage(`Scale complete! Starting over: ${completeScalePattern[0]}`);
          }
        } else {
          // Continue with current scale
          setCurrentStepIndex(nextStepIndex);
          setStatusMessage(`Good! Next: ${completeScalePattern[nextStepIndex]}`);
        }
      } else if (rejectErrors) {
        // WRONG NOTE and rejectErrors is on: Reset to beginning
        setCurrentStepIndex(0);
        setStatusMessage(`Wrong note! Restarting ${currentKey} ${selectedScaleType} scale. Target: ${completeScalePattern[0]}`);
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
    console.log('[App] Chord validation useEffect triggered', {
      mode,
      progressionLength: progression.length,
      activeNotesLength: activeNotes.length,
      currentStepIndex,
      activeNotes
    });

    if (mode === 'chord' && progression.length > 0 && activeNotes.length >= 3) {
      const targetChord = progression[currentStepIndex % progression.length];
      console.log('[App] Chord validation: target chord', targetChord);

      const detected = identifyChord(activeNotes);
      console.log('[App] Chord validation: detected chord', detected);

      // Normalize chord names for comparison (handle both "C Major" and "C" formats)
      const normalizeChordName = (name) => {
        if (!name) {
          console.log('[App] normalizeChordName: empty name');
          return '';
        }
        // If it's already in full format (e.g., "C Major"), return as is
        if (name.includes('Major') || name.includes('Minor') || name.includes('Diminished') || name.includes('Augmented') || name.includes('Sus2') || name.includes('Sus4')) {
          console.log('[App] normalizeChordName: already full format', name);
          return name;
        }
        // If it's short format (e.g., "C", "Cm"), convert to full format
        if (name.endsWith('m')) {
          const result = name.slice(0, -1) + ' Minor';
          console.log('[App] normalizeChordName: converted minor', { name, result });
          return result;
        }
        const result = name + ' Major';
        console.log('[App] normalizeChordName: converted major', { name, result });
        return result;
      };

      const normalizedTarget = normalizeChordName(targetChord.name);
      const normalizedDetected = detected ? normalizeChordName(detected.name) : '';

      console.log('[App] Chord validation: name comparison', {
        targetChordName: targetChord.name,
        detectedName: detected?.name,
        normalizedTarget,
        normalizedDetected,
        match: detected && normalizedDetected === normalizedTarget
      });

      if (detected && normalizedDetected === normalizedTarget) {
        console.log('[App] Chord validation: MATCH! Advancing to next chord');
        // Correct chord held!
        // Advance after a short delay to let them hear/see it
        // This prevents rapid skipping if the user holds the chord

        // Use a ref to track if we've already advanced for this chord detection
        const timer = setTimeout(() => {
          console.log('[App] Chord validation: timeout fired, advancing step index');
          setCurrentStepIndex(prev => {
            const next = prev + 1;
            console.log('[App] Chord validation: step index', { prev, next });
            return next;
          });
        }, 500);

        return () => {
          console.log('[App] Chord validation: cleanup timeout');
          clearTimeout(timer);
        };
      } else {
        console.log('[App] Chord validation: NO MATCH', {
          detected: !!detected,
          normalizedDetected,
          normalizedTarget,
          areEqual: normalizedDetected === normalizedTarget
        });

        if (rejectErrors && detected) {
          // WRONG CHORD and rejectErrors is on: Reset to beginning
          console.log('[App] Chord validation: Rejecting error, resetting progression');
          setCurrentStepIndex(0);
          setStatusMessage(`Wrong chord! Restarting progression. Target: ${progression[0].roman} (${progression[0].name})`);
        }
      }
    } else {
      console.log('[App] Chord validation: conditions not met', {
        modeIsChord: mode === 'chord',
        hasProgression: progression.length > 0,
        hasEnoughNotes: activeNotes.length >= 3
      });
    }
  }, [activeNotes, mode, progression, currentStepIndex]);




  // Helper to get highlighted notes for Left Piano (Chords)
  const getChordHighlights = () => {
    // If a chord is clicked in Circle of Fifths, show that regardless of mode
    if (chordMidiNotes.length > 0) return chordMidiNotes;

    // In chord mode, show target chord from progression if available
    if (mode === 'chord' && progression.length > 0) {
      // Could show target chord from progression here if needed
      return [];
    }
    return [];
  };

  // Helper to get highlighted notes for Right Piano (Scales)
  const getScaleHighlights = () => {
    // Only use progression if we are actually in scale practice mode
    const currentKey = (mode === 'scale' && keyProgression.length > 0)
      ? keyProgression[currentKeyIndex]
      : (lockedChord ? lockedChord.root : selectedRoot);
    const scaleNotes = getScaleNotes(currentKey, selectedScaleType);
    return scaleNotes.map(n => NOTES.indexOf(n));
  };



  const handleChordClick = (chordName) => {
    console.log('[App] handleChordClick called', { chordName, currentClickedChord: clickedChord });
    // Handle chord click - cycle through inversions
    const parsed = parseChordName(chordName);
    console.log('[App] handleChordClick: parsed chord', parsed);
    if (!parsed) {
      console.warn('[App] handleChordClick: failed to parse chord name', chordName);
      return;
    }

    // Check if this is the same chord that was clicked before
    if (clickedChord && clickedChord.name === chordName) {
      console.log('[App] handleChordClick: same chord clicked, cycling inversion');
      // Cycle to next inversion
      const maxInversions = CHORD_TYPES[parsed.chordType].intervals.length + 1;
      const nextInversion = (clickedChord.inversion + 1) % maxInversions;
      console.log('[App] handleChordClick: next inversion', { current: clickedChord.inversion, next: nextInversion, max: maxInversions });
      setClickedChord({ name: chordName, inversion: nextInversion });

      // Calculate MIDI notes for this inversion (use octave 3 to fit in Left Piano 36-60)
      const midiNotes = getChordNotesAsMidi(parsed.root, parsed.chordType, nextInversion, 3);
      console.log('[App] handleChordClick: MIDI notes for inversion', midiNotes);
      setChordMidiNotes(midiNotes);
    } else {
      console.log('[App] handleChordClick: new chord clicked, starting with root position');
      // New chord clicked - start with root position
      setClickedChord({ name: chordName, inversion: 0 });
      const midiNotes = getChordNotesAsMidi(parsed.root, parsed.chordType, 0, 3);
      console.log('[App] handleChordClick: MIDI notes for root position', midiNotes);
      setChordMidiNotes(midiNotes);
    }
  };

  // Lock/Unlock chord handlers
  const handleLockChord = (chord) => {
    if (!chord) return;
    const parsed = parseChordName(chord.name);
    if (!parsed) return;

    const chordNotes = getChordNotes(parsed.root, parsed.chordType);
    setLockedChord({
      name: chord.name,
      root: parsed.root,
      notes: chordNotes,
    });

    // Also update selectedRoot to match locked chord root
    setSelectedRoot(parsed.root);
  };

  const handleUnlockChord = () => {
    setLockedChord(null);
  };

  // Recording/Playback handlers
  const handleRecordingStart = () => {
    console.log('[App] Recording started');
  };

  const handleRecordingStop = async (recording) => {
    console.log('[App] Recording stopped', recording);
    if (recording && recordingStorageRef.current) {
      try {
        await recordingStorageRef.current.save(recording);
        console.log('[App] Recording saved');
      } catch (error) {
        console.error('[App] Failed to save recording:', error);
        alert('Failed to save recording');
      }
    }
  };

  const handlePlaybackStart = () => {
    console.log('[App] Playback started');
  };

  const handlePlaybackStop = () => {
    console.log('[App] Playback stopped');
    setExpectedNotes([]);
  };

  const handlePlaybackPause = () => {
    console.log('[App] Playback paused');
  };

  const handlePlaybackResume = () => {
    console.log('[App] Playback resumed');
  };

  const handleRecordingSelect = (recording) => {
    console.log('[App] Recording selected', recording);
    setCurrentRecording(recording);
  };

  const handleRecordingDelete = (id) => {
    console.log('[App] Recording deleted', id);
    if (currentRecording && currentRecording.id === id) {
      setCurrentRecording(null);
    }
  };

  const handlePlayAlongToggle = (enabled) => {
    setIsPlayAlongMode(enabled);
    if (!enabled) {
      setExpectedNotes([]);
    }
  };

  const handleWaitForInputToggle = (enabled) => {
    setIsWaitForInputMode(enabled);
    if (playbackManagerRef.current) {
      playbackManagerRef.current.setWaitForInput(enabled);
    }
    if (!enabled) {
      setExpectedNotes([]);
    }
  };

  const handleLoopToggle = (enabled) => {
    setIsLoopMode(enabled);
    if (playbackManagerRef.current) {
      playbackManagerRef.current.setLoop(enabled);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>
          Piano Trainer {midiDeviceName && <span className="midi-device-name">({midiDeviceName})</span>}
          {' '}
          <a href="/usage-ideas.md" target="_blank" rel="noopener noreferrer" className="usage-ideas-link">usage ideas</a>
        </h1>
      </header>

      <div className="main-content">

        {/* Pyramid Layout */}
        <div className="pyramid-container">

          {/* Top: Circle of Fifths */}
          <div className="pyramid-top">
            <CircleOfFifths
              selectedRoot={lockedChord ? lockedChord.root : selectedRoot}
              onRootSelect={setSelectedRoot}
              detectedChord={detectedChord}
              onChordClick={handleChordClick}
              hideTitle={true}
            />
          </div>

          {/* Middle Row: Extensions, ChordInfo, and ScaleSelector */}
          <div className="pyramid-middle">
            {/* Extensions Panel (left) */}
            <div className="extensions-panel">
              <h3>Extensions</h3>
              {chordSuggestions.length > 0 ? (
                <>
                  <div className="section-label">
                    {detectedChord
                      ? `🎵 Add to ${detectedChord.name.split(' ')[0]}`
                      : `💡 Potential Chords`
                    }
                  </div>
                  {chordSuggestions.slice(0, 4).map((suggestion, index) => (
                    <div key={index} className="suggestion-item">
                      <span className="suggestion-name">{suggestion.name}</span>
                      <span className="suggestion-missing">+{suggestion.missingNotes.join(', ')}</span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="extensions-placeholder">
                  Play 2+ notes to see chord suggestions
                </div>
              )}
            </div>

            {/* ChordInfo (center) */}
            <ChordInfo
              detectedChord={detectedChord}
              detectedChords={detectedChords}
              chordSuggestions={chordSuggestions}
              lockedChord={lockedChord}
              onLockChord={handleLockChord}
              onUnlockChord={handleUnlockChord}
              activeNotes={activeNotes}
              hideExtensions={true}
            />

            {/* ScaleSelector (right) */}
            <ScaleSelector
              selectedRoot={lockedChord ? lockedChord.root : selectedRoot}
              selectedScaleType={selectedScaleType}
              onScaleTypeChange={setSelectedScaleType}
              lockedChordRoot={lockedChord ? lockedChord.root : null}
            />
          </div>

          {/* Bottom Row: Unified Piano */}
          <div className="pyramid-bottom">
            <div className="piano-section unified-piano">
              <Piano
                startNote={36}
                endNote={84}
                activeNotes={activeNotes}
                highlightedNotes={getScaleHighlights()}
                chordMidiNotes={getChordHighlights()}
                lavaKeys={mode === 'lava' ? lavaKeys : []}
                mode={mode}
                feedbackState={feedbackState}
                expectedNotes={isPlayAlongMode ? expectedNotes : []}
              />
            </div>
          </div>

        </div>

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
            rejectErrors={rejectErrors}
            onRejectErrorsChange={setRejectErrors}
          />

          <RecordingControls
            recordingManager={recordingManagerRef.current}
            playbackManager={playbackManagerRef.current}
            onRecordingStart={handleRecordingStart}
            onRecordingStop={handleRecordingStop}
            onPlaybackStart={handlePlaybackStart}
            onPlaybackStop={handlePlaybackStop}
            onPlaybackPause={handlePlaybackPause}
            onPlaybackResume={handlePlaybackResume}
            isPlayAlongMode={isPlayAlongMode}
            onPlayAlongToggle={handlePlayAlongToggle}
            isWaitForInput={isWaitForInputMode}
            onWaitForInputToggle={handleWaitForInputToggle}
            isLoop={isLoopMode}
            onLoopToggle={handleLoopToggle}
          />

          <RecordingList
            recordingStorage={recordingStorageRef.current}
            playbackManager={playbackManagerRef.current}
            onRecordingSelect={handleRecordingSelect}
            onRecordingDelete={handleRecordingDelete}
          />

          <div className="circle-and-chord-container">
            {/* CircleOfFifths moved up */}

            <KeyDisplay
              selectedRoot={selectedRoot}
              selectedScaleType={selectedScaleType}
              onRootSelect={setSelectedRoot}
              onScaleTypeSelect={setSelectedScaleType}
            />
            {(mode === 'free' || mode === 'chord') && (
              <div className="chord-detection-wrapper">
                <div className="chord-display-in-controls">
                  <div className="chord-label">Detected Chord:</div>
                  {detectedChord ? (
                    <>
                      <div className="chord-name-in-controls">
                        {(() => {
                          const chordName = detectedChord.name;
                          console.log('[App] 🎵 DISPLAYING CHORD IN UI:', chordName, detectedChord.inversion);
                          return chordName;
                        })()}
                      </div>
                      {detectedChord.inversion && (
                        <div className="chord-inversion-in-controls">{detectedChord.inversion}</div>
                      )}
                    </>
                  ) : (
                    <div className="chord-placeholder">
                      {(() => {
                        const status = activeNotes.length > 0 ? 'Playing...' : 'No chord detected';
                        console.log('[App] Chord display status:', status, { activeNotes, activeNotesLength: activeNotes.length });
                        return status;
                      })()}
                    </div>
                  )}

                  {(mode === 'chord' || mode === 'free') && chordSuggestions.length > 0 && (
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
                {mode === 'chord' && (
                  <ProgressionBuilder
                    selectedRoot={selectedRoot}
                    selectedScaleType={selectedScaleType}
                    onProgressionSet={(p) => {
                      console.log('[App] onProgressionSet called (chord progression)', p);
                      setProgression(p);
                      setCurrentStepIndex(0);
                      // Clear clicked chord when progression changes
                      setClickedChord(null);
                      setChordMidiNotes([]);
                      console.log('[App] Chord progression set, step index reset to 0');
                    }}
                    onChordClick={handleChordClick}
                  />
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

        {mode === 'scale' && (
          <KeyProgressionBuilder
            onProgressionSet={(keys) => {
              setKeyProgression(keys);
              setCurrentKeyIndex(0);
              setCurrentStepIndex(0);
              if (keys.length > 0) {
                setSelectedRoot(keys[0]);
              }
            }}
            onClear={() => {
              setKeyProgression([]);
              setCurrentKeyIndex(0);
              setCurrentStepIndex(0);
            }}
            selectedScaleType={selectedScaleType}
          />
        )}

        {mode === 'chord' && (
          <>
            {clickedChord && (
              <div className="chord-practice-wrapper">
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
                <h3 className="chord-practice-title">Chord Practice</h3>
              </div>
            )}
          </>
        )}

        {mode === 'scale' && keyProgression.length > 0 && (
          <div className="current-target">
            <h2>Key Progression Practice</h2>
            <h3>Current Key: {keyProgression[currentKeyIndex]} {selectedScaleType}</h3>
            <div className="progression-display">
              {keyProgression.map((key, idx) => (
                <span
                  key={idx}
                  className={idx === currentKeyIndex ? 'current-key' : 'upcoming-key'}
                >
                  {key}
                </span>
              ))}
            </div>
          </div>
        )}

        {mode === 'chord' && progression.length > 0 && (
          <div className="current-target">
            <h2>Target: {progression[currentStepIndex % progression.length].roman}</h2>
            <h3>{progression[currentStepIndex % progression.length].name}</h3>
          </div>
        )}

        {(mode === 'free' || mode === 'chord') && detectedChord && (
          <div className="current-target detected-chord-card">
            <h2 className="chord-name-display">{detectedChord.name}</h2>
            <h3 className="chord-inversion-display">{detectedChord.inversion}</h3>
          </div>
        )}
      </div>
    </div >
  );
}

export default App;
