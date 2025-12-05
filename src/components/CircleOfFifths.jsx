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

const CircleOfFifths = ({ selectedRoot, onRootSelect, detectedChord }) => {
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

  // Determine active keys based on detected chord
  const getActiveKeys = () => {
    if (!detectedChord || typeof detectedChord !== 'object') return { major: [], minor: [] };

    // Use root and type directly if available, otherwise fallback to parsing name
    let root, isMinor;

    if (detectedChord.root && detectedChord.type) {
      root = detectedChord.root;
      const type = detectedChord.type.toLowerCase();
      isMinor = type.includes('minor') || type.includes('diminished');
    } else {
      const { name } = detectedChord;
      if (typeof name !== 'string') return { major: [], minor: [] };
      const parts = name.split(' ');
      root = parts[0];
      const quality = parts.slice(1).join(' ').toLowerCase();
      isMinor = quality.includes('minor');
    }

    // Helper to map circle notes to app notes (sharps)
    const getAppNote = (circleNote) => NOTE_MAP[circleNote] || circleNote;

    // Find the center index
    let centerIndex = -1;

    if (isMinor) {
      centerIndex = CIRCLE_OF_FIFTHS.findIndex(k => {
        // Check primary minor key
        const minorRoot = k.minor.slice(0, -1); // Remove 'm'
        if (getAppNote(minorRoot) === root) return true;

        // Check enharmonic minor key
        if (k.enharmonicMinor) {
          const enhMinorRoot = k.enharmonicMinor.slice(0, -1);
          if (getAppNote(enhMinorRoot) === root) return true;
        }
        return false;
      });
    } else {
      centerIndex = CIRCLE_OF_FIFTHS.findIndex(k => {
        // Check primary major key
        if (getAppNote(k.major) === root) return true;

        // Check enharmonic major key
        if (k.enharmonicMajor) {
          if (getAppNote(k.enharmonicMajor) === root) return true;
        }
        return false;
      });
    }

    if (centerIndex === -1) return { major: [], minor: [] };

    // Neighbors: center, center-1, center+1 (handling wrap-around)
    const indices = [
      (centerIndex - 1 + 12) % 12,
      centerIndex,
      (centerIndex + 1) % 12
    ];

    return {
      major: indices, // All neighbors active for major ring
      minor: indices  // All neighbors active for minor ring
    };
  };

  const activeKeys = getActiveKeys();

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
          {/* Draw rings */}
          {CIRCLE_OF_FIFTHS.map((key, index) => {
            const isLight = index % 2 === 0;
            const selected = isSelected(key.major);

            // Positions
            const outerPos = getSegmentPosition(index, 12, 160);
            const middlePos = getSegmentPosition(index, 12, 100); // Boundary between major/minor
            const innerPos = getSegmentPosition(index, 12, 50);  // Inner boundary of minor ring

            const nextOuterPos = getSegmentPosition((index + 1) % 12, 12, 160);
            const nextMiddlePos = getSegmentPosition((index + 1) % 12, 12, 100);
            const nextInnerPos = getSegmentPosition((index + 1) % 12, 12, 50);

            // Major Ring Path (160 -> 100)
            const majorPathData = `
              M ${outerPos.x} ${outerPos.y}
              A 160 160 0 0 1 ${nextOuterPos.x} ${nextOuterPos.y}
              L ${nextMiddlePos.x} ${nextMiddlePos.y}
              A 100 100 0 0 0 ${middlePos.x} ${middlePos.y}
              Z
            `;

            // Minor Ring Path (100 -> 50)
            const minorPathData = `
              M ${middlePos.x} ${middlePos.y}
              A 100 100 0 0 1 ${nextMiddlePos.x} ${nextMiddlePos.y}
              L ${nextInnerPos.x} ${nextInnerPos.y}
              A 50 50 0 0 0 ${innerPos.x} ${innerPos.y}
              Z
            `;

            const isMajorActive = activeKeys.major.includes(index);
            const isMinorActive = activeKeys.minor.includes(index);

            return (
              <g key={index}>
                {/* Major Segment */}
                <path
                  d={majorPathData}
                  data-key={`major-${key.major}`}
                  className={`segment major-segment ${isLight ? 'light' : 'dark'} ${selected ? 'selected' : ''} ${isMajorActive ? 'active-major' : ''}`}
                  onClick={() => handleSegmentClick(key.major)}
                  style={{ cursor: 'pointer' }}
                />

                {/* Minor Segment */}
                <path
                  d={minorPathData}
                  data-key={`minor-${key.minor}`}
                  className={`segment minor-segment ${isLight ? 'light' : 'dark'} ${selected ? 'selected' : ''} ${isMinorActive ? 'active-minor' : ''}`}
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
                  const minorPos = getSegmentCenterPosition(index, 12, 75); // Adjusted slightly for 100-50 range
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
