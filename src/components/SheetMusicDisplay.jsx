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

/** Convert VexFlow key string to MIDI number (e.g., "C/4" or "c/4" -> 60). Middle C = 60. */
export function vexFlowKeyToMidi(keyStr) {
  if (!keyStr || typeof keyStr !== 'string') return null;
  const flatToSharp = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#', Cb: 'B', Fb: 'E' };
  const normalized = keyStr.trim();
  const match = normalized.match(/^([A-Ga-g][#b]?)(?:\/)?(\d+)$/);
  if (!match) return null;
  const notePart = match[1].charAt(0).toUpperCase() + (match[1].length > 1 ? match[1].slice(1).toLowerCase() : '');
  const noteName = flatToSharp[notePart] || notePart;
  const pitchClass = NOTE_NAMES.indexOf(noteName);
  if (pitchClass === -1) return null;
  const octave = parseInt(match[2], 10);
  return (octave + 1) * 12 + pitchClass;
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

const HIGHLIGHT_STYLE = { fillStyle: '#00bfff', strokeStyle: '#00bfff' };
const DEFAULT_STYLE = { fillStyle: '#ffffff', strokeStyle: '#ffffff' };

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
  activeNotes = [],
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Append new content first, then remove old - avoids flash when activeNotes updates
    const oldChild = containerRef.current.firstChild;
    const div = document.createElement('div');
    div.id = 'sheet-music-output-' + Date.now();
    div.className = 'sheet-music-vexflow-output';
    div.style.width = '100%';
    div.style.minHeight = '100px';
    containerRef.current.appendChild(div);

    const removeOldChild = () => {
      if (oldChild && oldChild.parentNode === containerRef.current) {
        containerRef.current.removeChild(oldChild);
      }
    };

    let chordToShow = null;
    let scaleToShow = null;

    if (mode === 'scale') {
      const currentKey = keyProgression.length > 0 ? keyProgression[currentKeyIndex] : selectedRoot;
      scaleToShow = currentKey && selectedScaleType ? { root: currentKey, scaleType: selectedScaleType } : null;
      if (!scaleToShow && selectedRoot && selectedScaleType) {
        scaleToShow = { root: selectedRoot, scaleType: selectedScaleType };
      }
    } else if (mode === 'chord' || mode === 'free') {
      // Priority: locked > progression target > detected. In chord practice, show TARGET inversion to play.
      if (lockedChord) {
        const parsed = parseChordName(lockedChord.name);
        if (parsed) chordToShow = { ...parsed, inversion: lockedChord.inversion };
      } else if (progression.length > 0) {
        const target = progression[currentStepIndex % progression.length];
        if (target && target.name) {
          const parsed = parseChordName(target.name);
          if (parsed) chordToShow = { ...parsed, inversion: target.inversion || 'Root Position' };
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
      removeOldChild();
      return;
    }

    let vfRetryCount = 0;
    const renderNotation = (retryCount = 0) => {
      try {
        // Ensure div is still in DOM (e.g. after fast re-renders in tests)
        if (!div.id || !document.getElementById(div.id)) {
          return;
        }
        const containerWidth = containerRef.current?.offsetWidth || 0;
        // If container has no width yet (layout not ready), retry up to 3 times
        if (containerWidth === 0 && retryCount < 3) {
          setTimeout(() => renderNotation(retryCount + 1), 80);
          return;
        }
        const width = Math.max(containerWidth, 400);
        const height = 120;

        const vf = new Factory({
          renderer: { elementId: div.id, width, height },
        });

        const score = vf.EasyScore();
        const activeSet = new Set(Array.isArray(activeNotes) ? activeNotes : []);
        score.addCommitHook((_options, note) => {
          if (!note || typeof note.setStyle !== 'function') return;
          note.setStyle(DEFAULT_STYLE);
          if (activeSet.size === 0) return;
          const keys = typeof note.getKeys === 'function' ? note.getKeys() : [];
          for (let i = 0; i < keys.length; i++) {
            const midi = vexFlowKeyToMidi(keys[i]);
            if (midi != null && activeSet.has(midi) && typeof note.setKeyStyle === 'function') {
              note.setKeyStyle(i, HIGHLIGHT_STYLE);
            }
          }
        });
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
            // Use eighth notes (/8) - 8 eighths fill 4/4; pad with rests (B4/8/r) if needed
            const noteStrs = scaleNotesForNotation.map((n) => `${n.name}${n.octave}/8`);
            const numRests = Math.max(0, 8 - noteStrs.length);
            const restStrs = Array(numRests).fill('B4/8/r');
            notesStr = [...noteStrs, ...restStrs].join(', ');
          }
        }

        if (!notesStr) {
          div.innerHTML = '<p class="sheet-music-placeholder">Play a chord or select a scale</p>';
          removeOldChild();
          return;
        }

        // Use 4/4 for all - avoids potential VexFlow issues with 8/4, 9/4 etc.
        const timeSig = '4/4';
        system
          .addStave({
            voices: [score.voice(score.notes(notesStr, { stem: 'up' }))],
          })
          .addClef('treble')
          .addTimeSignature(timeSig);

        vf.draw();
        rendererRef.current = vf;
        removeOldChild();
      } catch (err) {
        const msg = err?.message || String(err);
        console.error('[SheetMusicDisplay] VexFlow render error:', err);
        // Expose error for E2E debugging (data attribute, not visible to user)
        vfRetryCount += 1;
        if (vfRetryCount < 2) {
          setTimeout(() => renderNotation(retryCount), 400);
        } else {
          const p = document.createElement('p');
          p.className = 'sheet-music-placeholder';
          p.textContent = 'Unable to render notation';
          p.dataset.debugError = msg;
          div.innerHTML = '';
          div.appendChild(p);
          removeOldChild();
        }
      }
    };

    // Wait for fonts then render; use longer delay in browser for VexFlow glyph resolution
    const delay = typeof window !== 'undefined' && window.document?.fonts?.ready ? 200 : 50;
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => setTimeout(renderNotation, delay));
    } else {
      setTimeout(renderNotation, delay);
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
    activeNotes,
  ]);

  return (
    <div className="sheet-music-display" data-testid="sheet-music-display">
      <div ref={containerRef} className="sheet-music-container" />
    </div>
  );
}
