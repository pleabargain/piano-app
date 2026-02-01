// 2026-02-01: Sheet music display for chord/scale notation (VexFlow)
import React, { useEffect, useRef } from 'react';
import { Factory } from 'vexflow';
import { getScaleNotes, getChordNotesAsMidi, parseChordName, getNoteIndex, NOTES } from '../core/music-theory';
import './SheetMusicDisplay.css';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** Convert MIDI number to VexFlow note string (e.g., 60 -> "C4") */
function midiToVexFlowNote(midi) {
  const pitchClass = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  const noteName = NOTE_NAMES[pitchClass];
  return `${noteName}${octave}`;
}

/** Map inversion string to number */
function inversionStringToNumber(inv) {
  if (!inv) return 0;
  if (inv === 'Root Position') return 0;
  if (inv === '1st Inversion') return 1;
  if (inv === '2nd Inversion') return 2;
  if (inv === '3rd Inversion') return 3;
  const m = String(inv).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

/** Build scale notes for display - one octave ascending with sensible octave assignment */
function getScaleNotesForNotation(root, scaleType, startOctave = 4) {
  const scaleNotes = getScaleNotes(root, scaleType);
  if (!scaleNotes || scaleNotes.length === 0) return [];

  const flatToSharp = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#', Cb: 'B', Fb: 'E' };
  const result = [];
  let currentOctave = startOctave;
  let prevIndex = -1;

  for (const note of scaleNotes) {
    const norm = flatToSharp[note] || note;
    const idx = getNoteIndex(note);
    if (idx === -1) continue;
    if (prevIndex >= 0 && idx <= prevIndex) currentOctave++;
    result.push({ name: norm, octave: currentOctave });
    prevIndex = idx;
  }
  return result;
}

export default function SheetMusicDisplay({
  detectedChord,
  selectedRoot,
  selectedScaleType,
  mode,
  lockedChord,
  progression = [],
  currentStepIndex = 0,
  keyProgression = [],
  currentKeyIndex = 0,
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous content
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    const div = document.createElement('div');
    div.id = 'sheet-music-output-' + Date.now();
    div.className = 'sheet-music-vexflow-output';
    div.style.width = '100%';
    div.style.minHeight = '100px';
    containerRef.current.appendChild(div);

    let chordToShow = null;
    let scaleToShow = null;

    if (mode === 'scale') {
      const currentKey = keyProgression.length > 0 ? keyProgression[currentKeyIndex] : selectedRoot;
      scaleToShow = currentKey && selectedScaleType ? { root: currentKey, scaleType: selectedScaleType } : null;
      if (!scaleToShow && selectedRoot && selectedScaleType) {
        scaleToShow = { root: selectedRoot, scaleType: selectedScaleType };
      }
    } else if (mode === 'chord' || mode === 'free') {
      if (lockedChord) {
        const parsed = parseChordName(lockedChord.name);
        if (parsed) chordToShow = { ...parsed, inversion: lockedChord.inversion };
      } else if (progression.length > 0) {
        const target = progression[currentStepIndex % progression.length];
        if (target && target.name) {
          const parsed = parseChordName(target.name);
          if (parsed) chordToShow = { ...parsed, inversion: target.inversion };
        }
      }
      if (!chordToShow && detectedChord) {
        chordToShow = {
          root: detectedChord.root,
          chordType: detectedChord.type,
          inversion: detectedChord.inversion,
        };
      }
    }

    if (!chordToShow && !scaleToShow) {
      div.innerHTML = '<p class="sheet-music-placeholder">Play a chord or select a scale</p>';
      return;
    }

    const renderNotation = () => {
      try {
        // Ensure div is still in DOM (e.g. after fast re-renders in tests)
        if (!div.id || !document.getElementById(div.id)) {
          return;
        }
        const width = Math.max(containerRef.current?.offsetWidth || 400, 400);
        const height = 120;

        const vf = new Factory({
          renderer: { elementId: div.id, width, height },
        });

        const score = vf.EasyScore();
        const system = vf.System({ x: 0, y: 0, width });

        let notesStr = '';

        if (chordToShow) {
          const invNum = inversionStringToNumber(chordToShow.inversion);
          const midiNotes = getChordNotesAsMidi(chordToShow.root, chordToShow.chordType, invNum, 4);
          if (midiNotes.length > 0) {
            const noteStrs = midiNotes.map(midiToVexFlowNote);
            notesStr = `(${noteStrs.join(' ')})/w`;
          }
        } else if (scaleToShow) {
          const scaleNotesForNotation = getScaleNotesForNotation(scaleToShow.root, scaleToShow.scaleType);
          if (scaleNotesForNotation.length > 0) {
            const noteStrs = scaleNotesForNotation.map((n) => `${n.name}${n.octave}`);
            notesStr = noteStrs.map((s, i) => (i === 0 ? `${s}/q` : s)).join(', ');
          }
        }

        if (!notesStr) {
          div.innerHTML = '<p class="sheet-music-placeholder">Play a chord or select a scale</p>';
          return;
        }

        const numNotes = chordToShow ? 1 : (scaleToShow ? getScaleNotes(scaleToShow.root, scaleToShow.scaleType).length : 4);
        const timeSig = numNotes <= 4 ? '4/4' : `${numNotes}/4`;
        system
          .addStave({
            voices: [score.voice(score.notes(notesStr, { stem: 'up' }))],
          })
          .addClef('treble')
          .addTimeSignature(timeSig);

        vf.draw();
        rendererRef.current = vf;
      } catch (err) {
        console.error('[SheetMusicDisplay] VexFlow render error:', err);
        div.innerHTML = '<p class="sheet-music-placeholder">Unable to render notation</p>';
      }
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => setTimeout(renderNotation, 50));
    } else {
      setTimeout(renderNotation, 100);
    }

    return () => {
      if (rendererRef.current) {
        try {
          rendererRef.current.getContext().clear();
        } catch (_) {}
      }
    };
  }, [
    detectedChord?.name,
    detectedChord?.root,
    detectedChord?.type,
    detectedChord?.inversion,
    selectedRoot,
    selectedScaleType,
    mode,
    lockedChord?.name,
    lockedChord?.inversion,
    progression,
    currentStepIndex,
    keyProgression,
    currentKeyIndex,
  ]);

  return (
    <div className="sheet-music-display" data-testid="sheet-music-display">
      <div ref={containerRef} className="sheet-music-container" />
    </div>
  );
}
