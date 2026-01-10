
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

// Mock normalizeToken
vi.mock('../core/progression-parser', () => ({
    normalizeToken: vi.fn((t) => t)
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
});
