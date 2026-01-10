// https://github.com/pleabargain/piano-app
import React from 'react';
import './ScaleSelector.css';
import { SCALES } from '../core/music-theory';

/**
 * ScaleSelector Component
 * Displays scale selection dropdown for the right piano frame
 * Filters scales based on locked chord's root note
 */
const ScaleSelector = ({
    selectedRoot,
    selectedScaleType,
    onScaleTypeChange,
    lockedChordRoot,
    showAllScales = false,
    isCollapsed = false,
    onToggleCollapse
}) => {
    // Determine which root to use for display
    const displayRoot = lockedChordRoot || selectedRoot;

    // Get available scale types
    const availableScales = Object.entries(SCALES).map(([key, data]) => ({
        key,
        name: data.name
    }));

    if (isCollapsed) {
        return (
            <div className="scale-selector-container collapsed">
                <button
                    className="collapse-toggle-btn"
                    onClick={onToggleCollapse}
                    title="Show Scale Selector"
                >
                    ←
                </button>
                <div className="collapsed-label">Scale</div>
            </div>
        );
    }

    return (
        <div className="scale-selector-container">
            <button
                className="collapse-toggle-btn"
                onClick={onToggleCollapse}
                title="Collapse Scale Selector"
            >
                →
            </button>
            <div className="scale-selector-header">
                <h3>Scale Practice</h3>
                {lockedChordRoot && (
                    <div className="locked-root-indicator">
                        <span className="lock-icon-small">🔒</span>
                        <span className="locked-root-text">Root: {lockedChordRoot}</span>
                    </div>
                )}
            </div>

            <div className="current-scale-display">
                <div className="scale-label">Current Scale:</div>
                <div className="scale-name">
                    {displayRoot} {(SCALES[selectedScaleType]?.name) || selectedScaleType}
                </div>
            </div>

            <div className="scale-type-selector">
                <label htmlFor="scale-type-select">Scale Type:</label>
                <select
                    id="scale-type-select"
                    value={selectedScaleType}
                    onChange={(e) => onScaleTypeChange(e.target.value)}
                    className="scale-dropdown"
                >
                    {availableScales.map(scale => (
                        <option key={scale.key} value={scale.key}>
                            {scale.name}
                        </option>
                    ))}
                </select>
            </div>

            {lockedChordRoot && (
                <div className="scale-info-box">
                    <div className="info-icon">ℹ️</div>
                    <div className="info-text">
                        Scales filtered to <strong>{lockedChordRoot}</strong> root.
                        Unlock the chord on the left to change the root note.
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScaleSelector;
