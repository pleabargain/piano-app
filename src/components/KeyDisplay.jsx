// https://github.com/pleabargain/piano-app
import React from 'react';
import './KeyDisplay.css';
import { NOTES } from '../core/music-theory';

const KeyDisplay = ({ selectedRoot, selectedScaleType, onRootSelect, onScaleTypeSelect }) => {
  // All 12 major keys
  const majorKeys = NOTES;
  
  // All 12 minor keys (natural minor)
  const minorKeys = NOTES;
  
  // Check if a major key is selected (root matches AND scale type is major)
  const isMajorSelected = (note) => {
    return selectedRoot === note && (selectedScaleType === 'major' || selectedScaleType === 'blues');
  };
  
  // Check if a minor key is selected (root matches AND scale type is minor)
  const isMinorSelected = (note) => {
    return selectedRoot === note && (selectedScaleType === 'natural_minor' || selectedScaleType === 'harmonic_minor' || selectedScaleType === 'melodic_minor');
  };
  
  const handleMajorKeyClick = (note) => {
    onRootSelect(note);
    onScaleTypeSelect('major');
  };
  
  const handleMinorKeyClick = (note) => {
    onRootSelect(note);
    onScaleTypeSelect('natural_minor');
  };

  return (
    <div className="key-display-container">
      <div className="keys-section">
        <div className="keys-group">
          <h4>Major Keys</h4>
          <div className="keys-grid">
            {majorKeys.map((note) => (
              <button
                key={`major-${note}`}
                className={`key-button major-key ${isMajorSelected(note) ? 'selected' : ''}`}
                onClick={() => handleMajorKeyClick(note)}
              >
                {note}
              </button>
            ))}
          </div>
        </div>
        
        <div className="keys-group">
          <h4>Minor Keys</h4>
          <div className="keys-grid">
            {minorKeys.map((note) => {
              // Get the relative major for this minor key
              const relativeMajor = NOTES[(NOTES.indexOf(note) + 3) % 12];
              return (
                <button
                  key={`minor-${note}`}
                  className={`key-button minor-key ${isMinorSelected(note) ? 'selected' : ''}`}
                  onClick={() => handleMinorKeyClick(note)}
                  title={`Relative to ${relativeMajor} Major`}
                >
                  {note}m
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyDisplay;

