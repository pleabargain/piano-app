// https://github.com/pleabargain/piano-app
import React from 'react';
import './CircleOfFifths.css';

// Circle of Fifths data: [major, minor, enharmonic major, enharmonic minor]
// Order: C, G, D, A, E, B, F#/Gb, Db/C#, Ab, Eb, Bb, F
const CIRCLE_OF_FIFTHS = [
  { major: 'C', minor: 'Am', enharmonicMajor: null, enharmonicMinor: null },
  { major: 'G', minor: 'Em', enharmonicMajor: null, enharmonicMinor: null },
  { major: 'D', minor: 'Bm', enharmonicMajor: null, enharmonicMinor: null },
  { major: 'A', minor: 'F#m', enharmonicMajor: null, enharmonicMinor: null },
  { major: 'E', minor: 'C#m', enharmonicMajor: null, enharmonicMinor: null },
  { major: 'B', minor: 'G#m', enharmonicMajor: null, enharmonicMinor: 'Abm' },
  { major: 'F#', minor: 'D#m', enharmonicMajor: 'Gb', enharmonicMinor: 'Ebm' },
  { major: 'Db', minor: 'A#m', enharmonicMajor: 'C#', enharmonicMinor: 'Bbm' },
  { major: 'Ab', minor: 'Fm', enharmonicMajor: null, enharmonicMinor: null },
  { major: 'Eb', minor: 'Cm', enharmonicMajor: null, enharmonicMinor: null },
  { major: 'Bb', minor: 'Gm', enharmonicMajor: null, enharmonicMinor: null },
  { major: 'F', minor: 'Dm', enharmonicMajor: null, enharmonicMinor: null },
];

// Map to app's note names (using sharps)
const NOTE_MAP = {
  'C': 'C',
  'G': 'G',
  'D': 'D',
  'A': 'A',
  'E': 'E',
  'B': 'B',
  'F#': 'F#',
  'Gb': 'F#',
  'C#': 'C#',
  'Db': 'C#',
  'Ab': 'G#',
  'Eb': 'D#',
  'Bb': 'A#',
  'F': 'F',
};

const CircleOfFifths = ({ selectedRoot, onRootSelect }) => {
  const handleSegmentClick = (majorNote) => {
    // Map the circle of fifths note to app's note system
    const mappedNote = NOTE_MAP[majorNote] || majorNote;
    onRootSelect(mappedNote);
  };

  // Check if a segment is selected
  const isSelected = (majorNote) => {
    const mappedNote = NOTE_MAP[majorNote] || majorNote;
    return mappedNote === selectedRoot;
  };

  // Calculate position for segment edges (for path drawing)
  const getSegmentPosition = (index, total, radius) => {
    const angle = (index * 360) / total - 90; // Start from top
    const angleRad = (angle * Math.PI) / 180;
    return {
      x: Math.cos(angleRad) * radius,
      y: Math.sin(angleRad) * radius,
      angle: angle,
    };
  };

  // Calculate position for text at center of segment
  const getSegmentCenterPosition = (index, total, radius) => {
    const segmentAngle = 360 / total; // 30 degrees for 12 segments
    const centerAngle = (index + 0.5) * segmentAngle - 90; // Center of segment
    const angleRad = (centerAngle * Math.PI) / 180;
    return {
      x: Math.cos(angleRad) * radius,
      y: Math.sin(angleRad) * radius,
    };
  };

  return (
    <div className="circle-of-fifths-container">
      <h3>Circle of Fifths</h3>
      <div className="circle-of-fifths">
        <svg viewBox="-200 -200 400 400" className="circle-svg">
          {/* Draw outer ring (major keys) */}
          {CIRCLE_OF_FIFTHS.map((key, index) => {
            const isLight = index % 2 === 0;
            const selected = isSelected(key.major);
            const outerPos = getSegmentPosition(index, 12, 160);
            const innerPos = getSegmentPosition(index, 12, 100);
            const nextOuterPos = getSegmentPosition((index + 1) % 12, 12, 160);
            const nextInnerPos = getSegmentPosition((index + 1) % 12, 12, 100);
            
            // Create path for segment
            const pathData = `
              M ${outerPos.x} ${outerPos.y}
              A 160 160 0 0 1 ${nextOuterPos.x} ${nextOuterPos.y}
              L ${nextInnerPos.x} ${nextInnerPos.y}
              A 100 100 0 0 0 ${innerPos.x} ${innerPos.y}
              Z
            `;

            return (
              <g key={index}>
                <path
                  d={pathData}
                  className={`segment ${isLight ? 'light' : 'dark'} ${selected ? 'selected' : ''}`}
                  onClick={() => handleSegmentClick(key.major)}
                  style={{ cursor: 'pointer' }}
                />
                
                {/* Major key label (outer ring) - centered in segment */}
                {(() => {
                  const majorPos = getSegmentCenterPosition(index, 12, 130);
                  return (
                    <text
                      x={majorPos.x}
                      y={majorPos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`major-label ${selected ? 'selected-text' : ''}`}
                      onClick={() => handleSegmentClick(key.major)}
                      style={{ cursor: 'pointer', pointerEvents: 'none' }}
                    >
                      {key.major}
                      {key.enharmonicMajor && (
                        <tspan x={majorPos.x} dy="12" className="enharmonic">
                          {key.enharmonicMajor}
                        </tspan>
                      )}
                    </text>
                  );
                })()}
                
                {/* Minor key label (inner ring) - centered in segment */}
                {(() => {
                  const minorPos = getSegmentCenterPosition(index, 12, 70);
                  return (
                    <text
                      x={minorPos.x}
                      y={minorPos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`minor-label ${selected ? 'selected-text' : ''}`}
                      onClick={() => handleSegmentClick(key.major)}
                      style={{ cursor: 'pointer', pointerEvents: 'none' }}
                    >
                      {key.minor}
                      {key.enharmonicMinor && (
                        <tspan x={minorPos.x} dy="10" className="enharmonic">
                          {key.enharmonicMinor}
                        </tspan>
                      )}
                    </text>
                  );
                })()}
              </g>
            );
          })}
          
          {/* Center circle */}
          <circle cx="0" cy="0" r="50" className="center-circle" />
        </svg>
      </div>
    </div>
  );
};

export default CircleOfFifths;
