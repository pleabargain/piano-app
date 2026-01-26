// https://github.com/pleabargain/piano-app
import React, { useEffect, useState, useRef } from 'react';
import { CIRCLE_OF_FIFTHS_KEYS } from '../core/exercise-config';

/**
 * Exercise component that manages exercise state and progression
 * Handles key advancement when progression completes
 */
const Exercise = ({ 
  exerciseConfig, 
  currentStepIndex, 
  progression, 
  onProgressionUpdate,
  onKeyUpdate,
  onStatusUpdate 
}) => {
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [progressionLength, setProgressionLength] = useState(3);
  const prevStepIndexRef = useRef(0);
  const prevKeyIndexRef = useRef(0);

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
  }, [exerciseConfig]);

  // Update progression when key changes
  useEffect(() => {
    const keys = exerciseConfig.config.keyProgression || CIRCLE_OF_FIFTHS_KEYS;
    const maxKeys = exerciseConfig.maxKeys || keys.length;
    const effectiveKeys = keys.slice(0, maxKeys);
    
    if (currentKeyIndex >= 0 && currentKeyIndex < effectiveKeys.length) {
      const currentKey = effectiveKeys[currentKeyIndex];
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
        
        const scaleType = exerciseConfig.config.scaleType || 'major';
        const scaleTypeDisplay = scaleType === 'major' ? 'Major' : scaleType === 'natural_minor' ? 'Minor' : scaleType;
        const progressionDisplay = newProgression.map(c => c.roman || c.name).join(' ');
        onStatusUpdate(`Exercise: ${currentKey} ${scaleTypeDisplay} - Play ${progressionDisplay}`);
      }
    }
  }, [currentKeyIndex, exerciseConfig, onProgressionUpdate, onKeyUpdate, onStatusUpdate]);

  // Monitor progression completion and advance to next key
  useEffect(() => {
    // Only process if we have a valid progression
    if (progression.length !== progressionLength || progressionLength === 0) {
      return;
    }
    
    const keys = exerciseConfig.config.keyProgression || CIRCLE_OF_FIFTHS_KEYS;
    const maxKeys = exerciseConfig.maxKeys || keys.length;
    const effectiveKeys = keys.slice(0, maxKeys);
    
    // Check if we've completed the progression (wrapped around: went from last step back to step 0)
    const currentStepInProgression = currentStepIndex % progressionLength;
    const prevStepInProgression = prevStepIndexRef.current % progressionLength;
    const lastStepIndex = progressionLength - 1;
    
    // If we've wrapped around (went from last step back to step 0), we completed the progression
    if (prevStepInProgression === lastStepIndex && currentStepInProgression === 0 && currentStepIndex > prevStepIndexRef.current) {
      // Loop continuously - wrap around to first key when reaching the end
      const nextKeyIndex = (currentKeyIndex + 1) % effectiveKeys.length;
      
      // Move to next key (or wrap to first if at end)
      setCurrentKeyIndex(nextKeyIndex);
      prevKeyIndexRef.current = nextKeyIndex;
      prevStepIndexRef.current = 0; // Reset step index tracking
      const scaleType = exerciseConfig.config.scaleType || 'major';
      const scaleTypeDisplay = scaleType === 'major' ? 'Major' : scaleType === 'natural_minor' ? 'Minor' : scaleType;
      
      // Show different message when wrapping around
      if (nextKeyIndex === 0 && currentKeyIndex === effectiveKeys.length - 1) {
        onStatusUpdate(`✅ Completed all keys! Looping back to ${effectiveKeys[nextKeyIndex]} ${scaleTypeDisplay} - Continue practicing!`);
      } else {
        onStatusUpdate(`✅ Key complete! Moving to next key: ${effectiveKeys[nextKeyIndex]} ${scaleTypeDisplay}`);
      }
    } else {
      // Update previous step index
      prevStepIndexRef.current = currentStepIndex;
    }
  }, [currentStepIndex, progression.length, progressionLength, currentKeyIndex, exerciseConfig, onStatusUpdate]);

  // Reset step index when key changes (new progression starts)
  useEffect(() => {
    if (prevKeyIndexRef.current !== currentKeyIndex) {
      prevStepIndexRef.current = 0;
    }
  }, [currentKeyIndex]);

  // Don't render anything - this is a logic component
  return null;
};

export default Exercise;
