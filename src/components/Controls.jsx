// https://github.com/pleabargain/piano-app
import React from 'react';
import './Controls.css';
import { NOTES, SCALES } from '../core/music-theory';

const KEYBOARD_SIZES = [
    { label: '88 Keys (A0-C8)', start: 21, end: 108 },
    { label: '76 Keys (E1-G7)', start: 28, end: 103 },
    { label: '61 Keys (C2-C7)', start: 36, end: 96 },
    { label: '49 Keys (C2-C6)', start: 36, end: 84 },
    { label: '25 Keys (C3-C5)', start: 48, end: 72 },
];

const Controls = ({
    selectedRoot,
    onRootChange,
    selectedScaleType,
    onScaleTypeChange,
    mode,
    onModeChange,
    keyboardSize,
    onKeyboardSizeChange
}) => {
    return (
        <div className="controls-container">
            <div className="control-group">
                <label>Key Center</label>
                <select value={selectedRoot} onChange={(e) => onRootChange(e.target.value)}>
                    {NOTES.map(note => (
                        <option key={note} value={note}>{note}</option>
                    ))}
                </select>
            </div>

            <div className="control-group">
                <label>Scale Type</label>
                <select value={selectedScaleType} onChange={(e) => onScaleTypeChange(e.target.value)}>
                    {Object.entries(SCALES).map(([key, data]) => (
                        <option key={key} value={key}>{data.name}</option>
                    ))}
                </select>
            </div>

            <div className="control-group">
                <label>Mode</label>
                <div className="mode-toggle">
                    <button
                        className={mode === 'scale' ? 'active' : ''}
                        onClick={() => onModeChange('scale')}
                    >
                        Scale Practice
                    </button>
                    <button
                        className={mode === 'chord' ? 'active' : ''}
                        onClick={() => onModeChange('chord')}
                    >
                        Chord Practice
                    </button>
                    <button
                        className={mode === 'free' ? 'active' : ''}
                        onClick={() => onModeChange('free')}
                    >
                        Free Play
                    </button>
                </div>
            </div>

            <div className="control-group">
                <label>Keyboard Size</label>
                <select
                    value={JSON.stringify(keyboardSize)}
                    onChange={(e) => onKeyboardSizeChange(JSON.parse(e.target.value))}
                >
                    {KEYBOARD_SIZES.map((size, idx) => (
                        <option key={idx} value={JSON.stringify({ start: size.start, end: size.end })}>
                            {size.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default Controls;
