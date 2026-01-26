
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock child components to isolate App render
// usage of vi.mock to shallow render mainly, or just mock complex parts
vi.mock('./components/Piano', () => ({ default: () => <div data-testid="mock-piano">Piano</div> }));
vi.mock('./components/CircleOfFifths', () => ({ default: () => <div>CircleOfFifths</div> }));

// Helper to mock scrollIntoView which is not in jsdom
window.HTMLElement.prototype.scrollIntoView = function () { };

describe('App Smoke Test', () => {
    it('should render the main application without crashing', async () => {
        render(<App />);

        // Wait for initial effects
        await waitFor(() => {
            // Check for key elements
            expect(screen.getByText(/Piano Trainer/i)).toBeTruthy();
            // Check for Controls
            expect(screen.getByText(/Key Center/i)).toBeTruthy();
            expect(screen.getByText(/Scale Type/i)).toBeTruthy();

            // Check for Layout changes
            // "Detected Chord" should be visible (if in free/chord mode, default is free?)
            // Default mode is usually 'free'
            // expect(screen.getByText(/Detected Chord:/i)).toBeTruthy();
        });
    });
});
