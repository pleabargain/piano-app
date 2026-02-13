// https://github.com/pleabargain/piano-app
// 2026-02-11: Added scale-then-chord phased exercises for I-vi-ii-V creative lessons
import React, { useEffect, useState, useRef } from 'react';
import { CIRCLE_OF_FIFTHS_KEYS } from '../core/exercise-config';

const PHASE_SCALE = 0;
const PHASE_CHORD = 1;

/**
 * Exercise component that manages exercise state and progression
 * Handles key advancement when progression completes
 * Supports scale-then-chord phased lessons (standalone per-key exercises)
 */
const Exercise = ({
  exerciseConfig,
  currentStepIndex,
  progression,
  onProgressionUpdate,
  onKeyUpdate,
  onStatusUpdate,
  onModeChange
}) => {
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [phase, setPhase] = useState(PHASE_SCALE);
  const [isComplete, setIsComplete] = useState(false);
  const [progressionLength, setProgressionLength] = useState(3);
  const prevStepIndexRef = useRef(0);
  const prevKeyIndexRef = useRef(0);
  const phasedRef = useRef(false);

  const isPhased = Boolean(
    exerciseConfig?.config?.generateScaleProgression &&
    exerciseConfig?.config?.generateChordProgression
  );

  // Initialize exercise: set starting key and progression
  useEffect(() => {
    const startKeyIndex = exerciseConfig.startKeyIndex || 0;
    const keys = exerciseConfig.config.keyProgression || CIRCLE_OF_FIFTHS_KEYS;
    const maxKeys = exerciseConfig.maxKeys || keys.length;
    const effectiveKeys = keys.slice(0, maxKeys);

    if (startKeyIndex >= 0 && startKeyIndex < effectiveKeys.length) {
      setCurrentKeyIndex(startKeyIndex);
    } else {
      setCurrentKeyIndex(0);
    }

    setIsComplete(false);
    prevStepIndexRef.current = 0;
    prevKeyIndexRef.current = startKeyIndex || 0;
    phasedRef.current = isPhased;
    if (isPhased) {
      setPhase(PHASE_SCALE);
      if (onModeChange) onModeChange('scale');
    }
  }, [exerciseConfig, isPhased, onModeChange]);

  // Update progression when key or phase changes
  useEffect(() => {
    const keys = exerciseConfig.config.keyProgression || CIRCLE_OF_FIFTHS_KEYS;
    const maxKeys = exerciseConfig.maxKeys || keys.length;
    const effectiveKeys = keys.slice(0, maxKeys);

    if (currentKeyIndex < 0 || currentKeyIndex >= effectiveKeys.length) return;

    const currentKey = effectiveKeys[currentKeyIndex];
    const scaleType = exerciseConfig.config.scaleType || 'major';
    const scaleTypeDisplay = scaleType === 'major' ? 'Major' : scaleType === 'natural_minor' ? 'Minor' : scaleType;

    if (isPhased) {
      const genScale = exerciseConfig.config.generateScaleProgression;
      const genChord = exerciseConfig.config.generateChordProgression;
      if (!genScale || !genChord) return;

      const newProgression = phase === PHASE_SCALE
        ? genScale(currentKey)
        : genChord(currentKey);

      if (newProgression && newProgression.length > 0) {
        setProgressionLength(newProgression.length);
        onProgressionUpdate(newProgression);
        onKeyUpdate(currentKey);
        if (onModeChange) {
          onModeChange(phase === PHASE_SCALE ? 'scale' : 'chord');
        }
        if (phase === PHASE_SCALE) {
          const noteStr = newProgression.map(p => p.name).join(' – ');
          onStatusUpdate(`Lesson: ${currentKey} ${scaleTypeDisplay} – Step 1: Play the scale (${noteStr})`);
        } else {
          const chordStr = newProgression.map(c => c.roman || c.name).join(' – ');
          onStatusUpdate(`Lesson: ${currentKey} ${scaleTypeDisplay} – Step 2: Play the chords (${chordStr})`);
        }
      }
      return;
    }

    // Standard single-phase exercise
    const generateProgression = exerciseConfig.config.generateProgression;
    if (!generateProgression || typeof generateProgression !== 'function') {
      console.error('[Exercise] No generateProgression function in config');
      return;
    }

    const newProgression = generateProgression(currentKey);
    if (newProgression && newProgression.length > 0) {
      setProgressionLength(newProgression.length);
      onProgressionUpdate(newProgression);
      onKeyUpdate(currentKey);
      const progressionDisplay = newProgression.map(c => c.roman || c.name).join(' ');
      onStatusUpdate(`Exercise: ${currentKey} ${scaleTypeDisplay} - Play ${progressionDisplay}`);
    }
  }, [currentKeyIndex, phase, exerciseConfig, isPhased, onProgressionUpdate, onKeyUpdate, onStatusUpdate, onModeChange]);

  // Monitor progression completion: advance phase (phased) or key (standard)
  useEffect(() => {
    if (progression.length !== progressionLength || progressionLength === 0) return;

    const currentStepInProgression = currentStepIndex % progressionLength;
    const prevStepInProgression = prevStepIndexRef.current % progressionLength;
    const lastStepIndex = progressionLength - 1;
    const justCompleted = prevStepInProgression === lastStepIndex &&
      currentStepInProgression === 0 &&
      currentStepIndex > prevStepIndexRef.current;

    if (!justCompleted) {
      prevStepIndexRef.current = currentStepIndex;
      return;
    }

    if (isPhased) {
      const keys = exerciseConfig.config.keyProgression || CIRCLE_OF_FIFTHS_KEYS;
      const effectiveKeys = keys.slice(0, exerciseConfig.maxKeys || keys.length);
      const currentKey = effectiveKeys[currentKeyIndex];
      const scaleType = exerciseConfig.config.scaleType || 'major';
      const scaleTypeDisplay = scaleType === 'major' ? 'Major' : scaleType === 'natural_minor' ? 'Minor' : scaleType;

      if (phase === PHASE_SCALE) {
        setPhase(PHASE_CHORD);
        prevStepIndexRef.current = 0;
        const genChord = exerciseConfig.config.generateChordProgression;
        const chordProg = genChord(currentKey);
        setProgressionLength(chordProg.length);
        onProgressionUpdate(chordProg);
        if (onModeChange) onModeChange('chord');
        onStatusUpdate(`✅ Scale complete! Now play the chords: ${chordProg.map(c => c.roman || c.name).join(' – ')}`);
      } else {
        onStatusUpdate(`✅ Lesson complete! You’ve mastered ${currentKey} ${scaleTypeDisplay} — scale and chords. Take a breath, then loop if you’d like another round.`);
        setPhase(PHASE_SCALE);
        prevStepIndexRef.current = 0;
        const genScale = exerciseConfig.config.generateScaleProgression;
        const scaleProg = genScale(currentKey);
        setProgressionLength(scaleProg.length);
        onProgressionUpdate(scaleProg);
        if (onModeChange) onModeChange('scale');
        onStatusUpdate(`Lesson: ${currentKey} ${scaleTypeDisplay} – Step 1: Play the scale again, or take a break!`);
      }
    } else {
      const keys = exerciseConfig.config.keyProgression || CIRCLE_OF_FIFTHS_KEYS;
      const maxKeys = exerciseConfig.maxKeys || keys.length;
      const effectiveKeys = keys.slice(0, maxKeys);
      const nextKeyIndex = (currentKeyIndex + 1) % effectiveKeys.length;
      setCurrentKeyIndex(nextKeyIndex);
      prevKeyIndexRef.current = nextKeyIndex;
      prevStepIndexRef.current = 0;
      const scaleType = exerciseConfig.config.scaleType || 'major';
      const scaleTypeDisplay = scaleType === 'major' ? 'Major' : scaleType === 'natural_minor' ? 'Minor' : scaleType;
      if (nextKeyIndex === 0 && currentKeyIndex === effectiveKeys.length - 1) {
        onStatusUpdate(`✅ Completed all keys! Looping back to ${effectiveKeys[nextKeyIndex]} ${scaleTypeDisplay} - Continue practicing!`);
      } else {
        onStatusUpdate(`✅ Key complete! Moving to next key: ${effectiveKeys[nextKeyIndex]} ${scaleTypeDisplay}`);
      }
    }
  }, [currentStepIndex, progression.length, progressionLength, currentKeyIndex, phase, exerciseConfig, isPhased, onProgressionUpdate, onStatusUpdate, onModeChange]);

  useEffect(() => {
    if (prevKeyIndexRef.current !== currentKeyIndex) {
      prevStepIndexRef.current = 0;
    }
  }, [currentKeyIndex]);

  return null;
};

export default Exercise;
