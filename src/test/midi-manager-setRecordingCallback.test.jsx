// https://github.com/pleabargain/piano-app
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

/**
 * TEST SUITE: midiManager.setRecordingCallback Bug Isolation
 * 
 * PURPOSE: Isolate and test the specific bug where setRecordingCallback is not a function
 * 
 * WHY THESE TESTS ARE IMPORTANT:
 * - App.jsx calls midiManager.setRecordingCallback() during useEffect initialization
 * - If the mock doesn't include this method, the app crashes on render
 * - This test isolates the exact failure point to help prevent regressions
 * 
 * BUG DETAILS:
 * - Error: midiManager.setRecordingCallback is not a function
 * - Location: src/App.jsx:193:17
 * - Impact: Runtime error that crashes the app during initialization
 * 
 * FIX:
 * - Added setRecordingCallback: vi.fn() to the mock in CircleOfFifthsIntegration.test.jsx
 */

// Mock WITH setRecordingCallback (the correct/fixed version)
vi.mock('../core/midi-manager', () => ({
    midiManager: {
        requestAccess: vi.fn(() => Promise.resolve(false)),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        getFirstInputName: vi.fn(),
        setRecordingCallback: vi.fn(), // This fixes the bug
    },
}));

describe('midiManager.setRecordingCallback Bug Isolation', () => {
    describe('Test 1: Verify mock includes setRecordingCallback', () => {
        it('should have setRecordingCallback in the mock object', () => {
            // Import the mocked midiManager to verify
            const { midiManager } = require('../core/midi-manager');
            
            // Verify the method exists
            expect(midiManager.setRecordingCallback).toBeDefined();
            expect(typeof midiManager.setRecordingCallback).toBe('function');
        });
    });

    describe('Test 2: Verify App.jsx can render without crashing', () => {
        it('should render App component successfully when setRecordingCallback exists', () => {
            // This test verifies the bug is fixed - app should render without throwing
            // The original bug would cause: "midiManager.setRecordingCallback is not a function"
            const { container } = render(<BrowserRouter><App /></BrowserRouter>);
            expect(container).toBeTruthy();
            
            // If we get here without throwing, the bug is fixed!
        });
    });

    describe('Test 3: Verify setRecordingCallback can be called', () => {
        it('should allow setRecordingCallback to be called with a function', () => {
            const { midiManager } = require('../core/midi-manager');
            
            // Verify we can call it with a function (should not throw)
            const testCallback = () => {};
            expect(() => {
                midiManager.setRecordingCallback(testCallback);
            }).not.toThrow();
        });

        it('should allow setRecordingCallback to be called with null', () => {
            const { midiManager } = require('../core/midi-manager');
            
            // Verify we can call it with null for cleanup (should not throw)
            expect(() => {
                midiManager.setRecordingCallback(null);
            }).not.toThrow();
        });
    });
});
