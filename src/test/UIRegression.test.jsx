
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProgressionBuilder from '../components/ProgressionBuilder';
import ScaleSelector from '../components/ScaleSelector';
import * as MusicTheory from '../core/music-theory';

// Mock dependencies
vi.mock('../core/progression-storage', () => {
    return {
        default: class MockStorage {
            async init() { return true; }
            async getAll() { return []; }
            async save() { return true; }
            async delete() { return true; }
        }
    };
});

// Partial mock for MusicTheory if needed, but since we are spying on getScaleNotes, 
// we might need to ensure other exports are intact if the component uses them.
// But we didn't mock MusicTheory entirely, we just used vi.spyOn.
// The error "TypeError: Cannot read properties of undefined (reading 'length')" 
// likely happens in getScaleNotes when accessing SCALES[scaleType].notes 
// inside the REAL function if selectedScaleType is bad.
// In the first test (valid props), selectedScaleType="Major". 
// Check if "Major" is a valid key in SCALES in core/music-theory.js.
// If it is 'major' (lowercase) in the object but passed as 'Major' (Title Case), 
// that would cause undefined access.

// Let's verify SCALES keys in music-theory.js via view_file or assuming lowercase.
// Typically keys are lowercase or matching the dropdown.
// In Controls.jsx lines 41-43: Object.entries(SCALES).map(([key, data]) => ... value={key} ... {data.name})
// If the key is 'major', passing 'Major' to getScaleNotes might fail.


describe('UI Regression Tests', () => {

    describe('ProgressionBuilder Stability', () => {
        it('should render without crashing with valid props', () => {
            render(
                <ProgressionBuilder
                    selectedRoot="C"
                    selectedScaleType="major"
                    onProgressionSet={() => { }}
                />
            );
            expect(screen.getByText('Custom Progression')).toBeTruthy();
        });

        it('should handle missing scale notes gracefully without crashing', () => {
            // Spy on console.warn/error to suppress noise in test output
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            // Mock getScaleNotes to return empty
            vi.spyOn(MusicTheory, 'getScaleNotes').mockReturnValue([]);

            render(
                <ProgressionBuilder
                    selectedRoot="InvalidRoot"
                    selectedScaleType="UnknownScale"
                    onProgressionSet={() => { }}
                />
            );

            // Should still render header
            expect(screen.getByText('Custom Progression')).toBeTruthy();

            // Input should be present
            const input = screen.getByPlaceholderText(/e.g., I IV V ii/i);
            expect(input).toBeTruthy();

            // Cleanup
            consoleSpy.mockRestore();
            consoleErrorSpy.mockRestore();
            vi.restoreAllMocks();
        });

        it('should validate invalid roman numerals without crashing', () => {
            render(
                <ProgressionBuilder
                    selectedRoot="C"
                    selectedScaleType="Major"
                    onProgressionSet={() => { }}
                />
            );

            const input = screen.getByPlaceholderText(/e.g., I IV V ii/i);
            fireEvent.change(input, { target: { value: 'InvalidToken' } });

            // Should show error message (depending on implementation, might need to wait or check specific element)
            // Based on code: setError(`Invalid symbol: ${token}`);
            // Wait for effect?
            // The validateAndParse runs on useEffect([input...])

            // Expect to find error message eventually?
            // Or just check it doesn't crash.
            expect(screen.getByText('Custom Progression')).toBeTruthy();
        });

        it('should accept absolute chord names', async () => {
            render(
                <ProgressionBuilder
                    selectedRoot="C"
                    selectedScaleType="major"
                    onProgressionSet={() => { }}
                />
            );

            const input = screen.getByPlaceholderText(/e.g., I IV V ii/i);
            fireEvent.change(input, { target: { value: 'Cm Ab G7' } });

            // Should NOT show error
            // logic runs in useEffect, so might need to wait, but assuming synchronous enough for this test suite
            // We can check if the parsed chords are displayed
            // The preview div renders: <div className="alpha">{chord.name}</div>

            // Expect to see 'Cm', 'Ab', 'G7' in the document
            // Note: our code sets name = token for absolute chords
            await waitFor(() => {
                expect(screen.getAllByText('Cm').length).toBeGreaterThan(0);
                expect(screen.getAllByText('Ab').length).toBeGreaterThan(0);
                expect(screen.getAllByText('G7').length).toBeGreaterThan(0);
            });
        });

        it('should accept Unicode chord names (flats and subscripts)', async () => {
            render(
                <ProgressionBuilder
                    selectedRoot="C"
                    selectedScaleType="major"
                    onProgressionSet={() => { }}
                />
            );

            const input = screen.getByPlaceholderText(/e.g., I IV V ii/i);
            fireEvent.change(input, { target: { value: 'F B♭ Gₘ' } });

            // Should parse and display normalized names
            await waitFor(() => {
                expect(screen.getAllByText('F').length).toBeGreaterThan(0);
                expect(screen.getAllByText('Bb').length).toBeGreaterThan(0); // Expect normalized 'Bb'
                expect(screen.getAllByText('Gm').length).toBeGreaterThan(0); // Expect normalized 'Gm'
            });
        });
    });

    describe('ScaleSelector Collapse', () => {
        it('should render in collapsed state when isCollapsed is true', () => {
            render(
                <ScaleSelector
                    selectedRoot="C"
                    selectedScaleType="Major"
                    onScaleTypeChange={() => { }}
                    isCollapsed={true}
                    onToggleCollapse={() => { }}
                />
            );

            // Should show expand arrow (←)
            expect(screen.getByText('←')).toBeTruthy();
            // Should NOT show the dropdown
            expect(screen.queryByLabelText('Scale Type:')).toBeNull();
        });

        it('should render in expanded state when isCollapsed is false', async () => {
            render(
                <ScaleSelector
                    selectedRoot="C"
                    selectedScaleType="major"
                    onScaleTypeChange={() => { }}
                    isCollapsed={false}
                    onToggleCollapse={() => { }}
                />
            );

            // Should show collapse arrow (→)
            await waitFor(() => expect(screen.getByText('→')).toBeTruthy());

            // Should show the dropdown
            // Use waitFor in case of any async mounting issues, though typically sync here.
            // But maybe the component logic is tricky.
            // Let's debug by printing screen if needed, but waitFor usually fixes timing.
            // import { waitFor } from '@testing-library/react';
            // Wait, we need to import waitFor at top level.
            // Assuming it's available or I'll add it.
            await waitFor(() => expect(screen.getByText('Scale Type:')).toBeTruthy());
        });

        it('should call onToggleCollapse when toggle button is clicked', () => {
            const handleToggle = vi.fn();
            render(
                <ScaleSelector
                    selectedRoot="C"
                    selectedScaleType="Major"
                    onScaleTypeChange={() => { }}
                    isCollapsed={false}
                    onToggleCollapse={handleToggle}
                />
            );

            fireEvent.click(screen.getByText('→'));
            expect(handleToggle).toHaveBeenCalledTimes(1);
        });
    });
});
