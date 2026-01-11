
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import KeyProgressionBuilder from '../components/KeyProgressionBuilder';

const storageMocks = {
    init: vi.fn(async () => true),
    getAll: vi.fn(async () => []),
    save: vi.fn(async () => 'mock-id'),
    delete: vi.fn(async () => undefined),
    downloadProgression: vi.fn(async () => undefined),
    importFromFile: vi.fn(async () => ({})),
};

// Mock dependencies
vi.mock('../core/key-progression-storage', () => ({
    default: class MockStorage {
        async init() { return storageMocks.init(); }
        async getAll(...args) { return storageMocks.getAll(...args); }
        async save(...args) { return storageMocks.save(...args); }
        async delete(...args) { return storageMocks.delete(...args); }
        async downloadProgression(...args) { return storageMocks.downloadProgression(...args); }
        async importFromFile(...args) { return storageMocks.importFromFile(...args); }
    }
}));

// Mock normalizeToken to actually normalize (for realistic testing)
vi.mock('../core/progression-parser', () => ({
    normalizeToken: vi.fn((t) => {
        // Simple normalization - just trim for basic tests
        // The actual normalizeToken handles unicode, but for these tests trim is enough
        return String(t).trim();
    })
}));

describe('KeyProgressionBuilder Component', () => {
    // Reset mocks between tests to avoid state bleed
    const resetStorageMocks = () => {
        storageMocks.init.mockClear();
        storageMocks.getAll.mockReset();
        storageMocks.getAll.mockImplementation(async () => []);
        storageMocks.save.mockClear();
        storageMocks.delete.mockClear();
        storageMocks.downloadProgression.mockClear();
        storageMocks.importFromFile.mockClear();
    };

    beforeEach(() => {
        resetStorageMocks();
    });

    it('should render the component', async () => {
        storageMocks.getAll.mockResolvedValueOnce([]);
        
        render(
            <KeyProgressionBuilder
                selectedScaleType="major"
                onProgressionSet={() => {}}
            />
        );

        await waitFor(() => {
            expect(screen.getByText(/Key Progression Practice/i)).toBeTruthy();
        });
    });

    it('should allow user to save progression locally via export button', async () => {
        resetStorageMocks();

        const savedProgression = {
            id: 'test-id-1',
            name: 'Test Progression',
            progression: 'C Em7 G Am7 D G',
            createdAt: Date.now(),
            metadata: { scaleType: 'major' }
        };

        storageMocks.getAll.mockResolvedValueOnce([savedProgression]);
        storageMocks.downloadProgression.mockResolvedValueOnce(undefined);

        render(
            <KeyProgressionBuilder
                selectedScaleType="major"
                onProgressionSet={() => {}}
            />
        );

        // Wait for saved progression to render
        await waitFor(() => {
            expect(screen.getByText('Test Progression')).toBeTruthy();
        });

        // Find and click the export button (⬇)
        const exportButtons = screen.getAllByTitle(/export to file/i);
        expect(exportButtons.length).toBeGreaterThan(0);
        
        const exportButton = exportButtons[0];
        fireEvent.click(exportButton);

        // Verify downloadProgression was called with the correct progression
        await waitFor(() => {
            expect(storageMocks.downloadProgression).toHaveBeenCalledTimes(1);
        });

        const exportCall = storageMocks.downloadProgression.mock.calls[0][0];
        expect(exportCall).toEqual(savedProgression);
    });

    it('should save progression to IndexedDB and then allow export', async () => {
        resetStorageMocks();

        storageMocks.getAll.mockResolvedValueOnce([]); // initial load
        storageMocks.save.mockResolvedValueOnce('new-id-123');
        storageMocks.getAll.mockResolvedValueOnce([{
            id: 'new-id-123',
            name: 'My Saved Progression',
            progression: 'C F G',
            createdAt: Date.now(),
            metadata: { scaleType: 'major' }
        }]);
        storageMocks.downloadProgression.mockResolvedValueOnce(undefined);

        render(
            <KeyProgressionBuilder
                selectedScaleType="major"
                onProgressionSet={() => {}}
            />
        );

        // Enter progression
        const input = screen.getByPlaceholderText(/e.g., F C G D/i);
        fireEvent.change(input, { target: { value: 'C F G' } });

        // Click save button
        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);

        // Enter name in dialog
        const nameInput = await screen.findByPlaceholderText(/name/i);
        fireEvent.change(nameInput, { target: { value: 'My Saved Progression' } });

        // Confirm save
        const confirmButton = screen.getByRole('button', { name: /^save$/i });
        fireEvent.click(confirmButton);

        // Verify save was called
        await waitFor(() => {
            expect(storageMocks.save).toHaveBeenCalledTimes(1);
        });

        // Wait for saved progression to appear
        await waitFor(() => {
            expect(screen.getByText('My Saved Progression')).toBeTruthy();
        });

        // Now export it
        const exportButtons = screen.getAllByTitle(/export to file/i);
        expect(exportButtons.length).toBeGreaterThan(0);
        
        fireEvent.click(exportButtons[0]);

        // Verify downloadProgression was called
        await waitFor(() => {
            expect(storageMocks.downloadProgression).toHaveBeenCalledTimes(1);
        });
    });

    it('should handle export errors gracefully', async () => {
        resetStorageMocks();

        const savedProgression = {
            id: 'test-id-1',
            name: 'Test Progression',
            progression: 'C F G',
            createdAt: Date.now(),
            metadata: { scaleType: 'major' }
        };

        storageMocks.getAll.mockResolvedValueOnce([savedProgression]);
        storageMocks.downloadProgression.mockRejectedValueOnce(new Error('Export failed'));

        render(
            <KeyProgressionBuilder
                selectedScaleType="major"
                onProgressionSet={() => {}}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Test Progression')).toBeTruthy();
        });

        const exportButtons = screen.getAllByTitle(/export to file/i);
        fireEvent.click(exportButtons[0]);

        // Verify error is displayed
        await waitFor(() => {
            expect(screen.getByText(/Failed to export/i)).toBeTruthy();
        });
    });

    it('should call downloadProgression which uses File System Access API for local file saving', async () => {
        resetStorageMocks();

        const savedProgression = {
            id: 'test-id-1',
            name: 'Test Progression',
            progression: 'C Em7 G Am7 D G',
            createdAt: Date.now(),
            metadata: { scaleType: 'major' }
        };

        storageMocks.getAll.mockResolvedValueOnce([savedProgression]);
        storageMocks.downloadProgression.mockResolvedValueOnce(undefined);

        render(
            <KeyProgressionBuilder
                selectedScaleType="major"
                onProgressionSet={() => {}}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Test Progression')).toBeTruthy();
        });

        const exportButtons = screen.getAllByTitle(/export to file/i);
        fireEvent.click(exportButtons[0]);

        // Verify downloadProgression was called with the progression
        // This method uses File System Access API (showSaveFilePicker) which allows
        // user to navigate to root directory and save locally with ISO timestamp filename
        await waitFor(() => {
            expect(storageMocks.downloadProgression).toHaveBeenCalledTimes(1);
            expect(storageMocks.downloadProgression).toHaveBeenCalledWith(savedProgression);
        });
    });

    it('should handle downloadProgression failures when File System Access API fails and fallback also fails', async () => {
        resetStorageMocks();

        const savedProgression = {
            id: 'test-id-1',
            name: 'Test Progression',
            progression: 'C Em7 G Am7 D G',
            createdAt: Date.now(),
            metadata: { scaleType: 'major' }
        };

        storageMocks.getAll.mockResolvedValueOnce([savedProgression]);
        
        // Simulate File System Access API failure followed by fallback failure
        storageMocks.downloadProgression.mockImplementation(async () => {
            throw new Error('File System Access API failed and fallback download also failed');
        });

        render(
            <KeyProgressionBuilder
                selectedScaleType="major"
                onProgressionSet={() => {}}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Test Progression')).toBeTruthy();
        });

        const exportButtons = screen.getAllByTitle(/export to file/i);
        fireEvent.click(exportButtons[0]);

        // Verify error is displayed to user
        await waitFor(() => {
            expect(screen.getByText(/Failed to export/i)).toBeTruthy();
        });

        // Verify the error message is user-friendly
        const errorMessage = screen.getByText(/Failed to export/i);
        expect(errorMessage.textContent).toContain('Failed to export');
    });

    it('should handle invalid progression data gracefully when exporting', async () => {
        resetStorageMocks();

        // Invalid progression (missing required fields)
        const invalidProgression = {
            id: 'test-id-1',
            // Missing 'name' field which is required
            progression: 'C Em7 G',
            createdAt: Date.now()
        };

        storageMocks.getAll.mockResolvedValueOnce([invalidProgression]);
        
        // Mock downloadProgression to throw validation error
        storageMocks.downloadProgression.mockImplementation(async (prog) => {
            if (!prog.name) {
                throw new Error('Invalid progression format: Missing name field');
            }
        });

        render(
            <KeyProgressionBuilder
                selectedScaleType="major"
                onProgressionSet={() => {}}
            />
        );

        await waitFor(() => {
            // The progression should still render even if invalid
            expect(screen.getByText(/C Em7 G/i)).toBeTruthy();
        });

        const exportButtons = screen.getAllByTitle(/export to file/i);
        if (exportButtons.length > 0) {
            fireEvent.click(exportButtons[0]);

            // Verify error is displayed
            await waitFor(() => {
                expect(screen.getByText(/Failed to export/i)).toBeTruthy();
            });
        }
    });

    describe('Chord Parsing and Normalization', () => {
        beforeEach(() => {
            resetStorageMocks();
            storageMocks.getAll.mockResolvedValueOnce([]);
        });

        it('should parse user input "G Am C F Dm Em" correctly', async () => {
            const onProgressionSet = vi.fn();
            
            render(
                <KeyProgressionBuilder
                    selectedScaleType="major"
                    onProgressionSet={onProgressionSet}
                />
            );

            const input = screen.getByPlaceholderText(/e.g., F C G D/i);
            
            // Enter the user's exact input
            fireEvent.change(input, { target: { value: 'G Am C F Dm Em' } });
            
            // Click Set Progression button
            const setButton = screen.getByRole('button', { name: /set progression/i });
            fireEvent.click(setButton);

            // Verify onProgressionSet was called with correct root notes
            await waitFor(() => {
                expect(onProgressionSet).toHaveBeenCalled();
            });

            const callArgs = onProgressionSet.mock.calls[0][0];
            expect(callArgs).toEqual(['G', 'A', 'C', 'F', 'D', 'E']);
        });

        it('should parse various chord formats correctly', async () => {
            const onProgressionSet = vi.fn();
            
            render(
                <KeyProgressionBuilder
                    selectedScaleType="major"
                    onProgressionSet={onProgressionSet}
                />
            );

            const testCases = [
                { input: 'Am', expected: ['A'] },
                { input: 'Dm', expected: ['D'] },
                { input: 'Em', expected: ['E'] },
                { input: 'Bb', expected: ['A#'] }, // Bb converts to A#
                { input: 'F#m', expected: ['F#'] },
                { input: 'Abm', expected: ['G#'] }, // Ab converts to G#
                { input: 'C7', expected: ['C'] },
                { input: 'Gmaj7', expected: ['G'] },
                { input: 'Dmin', expected: ['D'] },
                { input: 'Eaug', expected: ['E'] },
                { input: 'Fsus4', expected: ['F'] },
            ];

            for (const testCase of testCases) {
                onProgressionSet.mockClear();
                const input = screen.getByPlaceholderText(/e.g., F C G D/i);
                
                fireEvent.change(input, { target: { value: testCase.input } });
                
                const setButton = screen.getByRole('button', { name: /set progression/i });
                fireEvent.click(setButton);

                await waitFor(() => {
                    expect(onProgressionSet).toHaveBeenCalled();
                });

                const callArgs = onProgressionSet.mock.calls[0][0];
                expect(callArgs).toEqual(testCase.expected);
            }
        });

        it('should parse mixed chord progression correctly', async () => {
            const onProgressionSet = vi.fn();
            
            render(
                <KeyProgressionBuilder
                    selectedScaleType="major"
                    onProgressionSet={onProgressionSet}
                />
            );

            const input = screen.getByPlaceholderText(/e.g., F C G D/i);
            
            // Test a complex progression with various chord types
            fireEvent.change(input, { target: { value: 'C Am F G7 Dm Bb Em' } });
            
            const setButton = screen.getByRole('button', { name: /set progression/i });
            fireEvent.click(setButton);

            await waitFor(() => {
                expect(onProgressionSet).toHaveBeenCalled();
            });

            const callArgs = onProgressionSet.mock.calls[0][0];
            // C, A (from Am), F, G (from G7), D (from Dm), A# (from Bb), E (from Em)
            expect(callArgs).toEqual(['C', 'A', 'F', 'G', 'D', 'A#', 'E']);
        });

        it('should handle single notes correctly', async () => {
            const onProgressionSet = vi.fn();
            
            render(
                <KeyProgressionBuilder
                    selectedScaleType="major"
                    onProgressionSet={onProgressionSet}
                />
            );

            const testCases = [
                { input: 'C', expected: ['C'] },
                { input: 'G', expected: ['G'] },
                { input: 'F#', expected: ['F#'] },
                { input: 'Bb', expected: ['A#'] },
            ];

            for (const testCase of testCases) {
                onProgressionSet.mockClear();
                const input = screen.getByPlaceholderText(/e.g., F C G D/i);
                
                fireEvent.change(input, { target: { value: testCase.input } });
                
                const setButton = screen.getByRole('button', { name: /set progression/i });
                fireEvent.click(setButton);

                await waitFor(() => {
                    expect(onProgressionSet).toHaveBeenCalled();
                });

                const callArgs = onProgressionSet.mock.calls[0][0];
                expect(callArgs).toEqual(testCase.expected);
            }
        });

        it('should handle mixed case chord names', async () => {
            const onProgressionSet = vi.fn();
            
            render(
                <KeyProgressionBuilder
                    selectedScaleType="major"
                    onProgressionSet={onProgressionSet}
                />
            );

            const input = screen.getByPlaceholderText(/e.g., F C G D/i);
            
            // Test mixed case
            fireEvent.change(input, { target: { value: 'c AM f Dm g' } });
            
            const setButton = screen.getByRole('button', { name: /set progression/i });
            fireEvent.click(setButton);

            await waitFor(() => {
                expect(onProgressionSet).toHaveBeenCalled();
            });

            const callArgs = onProgressionSet.mock.calls[0][0];
            expect(callArgs).toEqual(['C', 'A', 'F', 'D', 'G']);
        });

        it('should handle flats and sharps correctly', async () => {
            const onProgressionSet = vi.fn();
            
            render(
                <KeyProgressionBuilder
                    selectedScaleType="major"
                    onProgressionSet={onProgressionSet}
                />
            );

            const testCases = [
                { input: 'Bb Eb Ab', expected: ['A#', 'D#', 'G#'] },
                { input: 'F# C# G#', expected: ['F#', 'C#', 'G#'] },
                { input: 'Db Gb', expected: ['C#', 'F#'] },
            ];

            for (const testCase of testCases) {
                onProgressionSet.mockClear();
                const input = screen.getByPlaceholderText(/e.g., F C G D/i);
                
                fireEvent.change(input, { target: { value: testCase.input } });
                
                const setButton = screen.getByRole('button', { name: /set progression/i });
                fireEvent.click(setButton);

                await waitFor(() => {
                    expect(onProgressionSet).toHaveBeenCalled();
                });

                const callArgs = onProgressionSet.mock.calls[0][0];
                expect(callArgs).toEqual(testCase.expected);
            }
        });

        it('should show error for invalid inputs', async () => {
            render(
                <KeyProgressionBuilder
                    selectedScaleType="major"
                    onProgressionSet={() => {}}
                />
            );

            const input = screen.getByPlaceholderText(/e.g., F C G D/i);
            
            // Test invalid note names
            fireEvent.change(input, { target: { value: 'X Y Z' } });
            
            const setButton = screen.getByRole('button', { name: /set progression/i });
            fireEvent.click(setButton);

            // Should show error message
            await waitFor(() => {
                expect(screen.getByText(/Invalid keys/i)).toBeTruthy();
            });
        });

        it('should handle empty input gracefully', async () => {
            const onProgressionSet = vi.fn();
            
            render(
                <KeyProgressionBuilder
                    selectedScaleType="major"
                    onProgressionSet={onProgressionSet}
                />
            );

            const input = screen.getByPlaceholderText(/e.g., F C G D/i);
            
            // Clear input
            fireEvent.change(input, { target: { value: '' } });
            
            // Set button should be disabled
            const setButton = screen.getByRole('button', { name: /set progression/i });
            expect(setButton).toBeDisabled();
            
            // onProgressionSet should not be called
            expect(onProgressionSet).not.toHaveBeenCalled();
        });

        it('should extract root notes from chords with various suffixes', async () => {
            const onProgressionSet = vi.fn();
            
            render(
                <KeyProgressionBuilder
                    selectedScaleType="major"
                    onProgressionSet={onProgressionSet}
                />
            );

            const testCases = [
                { input: 'Cm', expected: ['C'] },
                { input: 'Dmin', expected: ['D'] },
                { input: 'Emaj', expected: ['E'] },
                { input: 'Fdim', expected: ['F'] },
                { input: 'Gaug', expected: ['G'] },
                { input: 'Asus2', expected: ['A'] },
                { input: 'Bsus4', expected: ['B'] },
                { input: 'C7', expected: ['C'] },
                { input: 'D9', expected: ['D'] },
                { input: 'E11', expected: ['E'] },
                { input: 'F13', expected: ['F'] },
                { input: 'G6', expected: ['G'] },
            ];

            for (const testCase of testCases) {
                onProgressionSet.mockClear();
                const input = screen.getByPlaceholderText(/e.g., F C G D/i);
                
                fireEvent.change(input, { target: { value: testCase.input } });
                
                const setButton = screen.getByRole('button', { name: /set progression/i });
                fireEvent.click(setButton);

                await waitFor(() => {
                    expect(onProgressionSet).toHaveBeenCalled();
                });

                const callArgs = onProgressionSet.mock.calls[0][0];
                expect(callArgs).toEqual(testCase.expected);
            }
        });

        it('should allow saving progression with chord names', async () => {
            resetStorageMocks();
            
            storageMocks.getAll.mockResolvedValueOnce([]); // initial load
            storageMocks.save.mockResolvedValueOnce('saved-id-123');
            storageMocks.getAll.mockResolvedValueOnce([{
                id: 'saved-id-123',
                name: 'Test Chord Progression',
                progression: 'G Am C F Dm Em',
                createdAt: Date.now(),
                metadata: { scaleType: 'major' }
            }]);

            render(
                <KeyProgressionBuilder
                    selectedScaleType="major"
                    onProgressionSet={() => {}}
                />
            );

            // Enter progression with chord names
            const input = screen.getByPlaceholderText(/e.g., F C G D/i);
            fireEvent.change(input, { target: { value: 'G Am C F Dm Em' } });
            
            // Set the progression first
            const setButton = screen.getByRole('button', { name: /set progression/i });
            fireEvent.click(setButton);

            // Wait a bit for validation
            await waitFor(() => {
                // Check that save button is enabled (progression is valid)
                const saveButton = screen.getByRole('button', { name: /save/i });
                expect(saveButton).not.toBeDisabled();
            });

            // Click save button
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);

            // Enter name in dialog
            const nameInput = await screen.findByPlaceholderText(/name/i);
            fireEvent.change(nameInput, { target: { value: 'Test Chord Progression' } });

            // Confirm save
            const confirmButton = screen.getByRole('button', { name: /^save$/i });
            fireEvent.click(confirmButton);

            // Verify save was called with the progression string (not normalized)
            await waitFor(() => {
                expect(storageMocks.save).toHaveBeenCalledTimes(1);
            });

            const saveCall = storageMocks.save.mock.calls[0][0];
            expect(saveCall.progression).toBe('G Am C F Dm Em');
        });
    });
});
