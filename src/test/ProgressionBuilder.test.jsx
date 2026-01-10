
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProgressionBuilder from '../components/ProgressionBuilder';
import * as Parser from '../core/progression-parser';
import * as MusicTheory from '../core/music-theory';

const storageMocks = {
    init: vi.fn(async () => true),
    getAll: vi.fn(async () => []),
    save: vi.fn(async () => 'mock-id'),
    delete: vi.fn(async () => undefined),
    downloadProgression: vi.fn(() => undefined),
    importFromFile: vi.fn(async () => ({})),
    validateProgressionString: vi.fn(() => ({ valid: true })),
};

// Mock dependencies
vi.mock('../core/progression-storage', () => ({
    default: class MockStorage {
        async init() { return storageMocks.init(); }
        async getAll(...args) { return storageMocks.getAll(...args); }
        async save(...args) { return storageMocks.save(...args); }
        async delete(...args) { return storageMocks.delete(...args); }
        downloadProgression(...args) { return storageMocks.downloadProgression(...args); }
        async importFromFile(...args) { return storageMocks.importFromFile(...args); }
        validateProgressionString(...args) { return storageMocks.validateProgressionString(...args); }
    }
}));

// Mock parseProgression
vi.mock('../core/progression-parser', () => ({
    parseProgression: vi.fn(),
    normalizeToken: vi.fn((t) => t)
}));

describe('ProgressionBuilder Component', () => {
    let consoleLogSpy, consoleWarnSpy, consoleErrorSpy;

    // Reset mocks between tests to avoid state bleed
    const resetStorageMocks = () => {
        storageMocks.init.mockClear();
        storageMocks.getAll.mockReset();
        storageMocks.getAll.mockImplementation(async () => []);
        storageMocks.save.mockClear();
        storageMocks.delete.mockClear();
        storageMocks.downloadProgression.mockClear();
        storageMocks.importFromFile.mockClear();
        storageMocks.validateProgressionString.mockReset();
        storageMocks.validateProgressionString.mockImplementation(() => ({ valid: true }));
    };

    beforeEach(() => {
        resetStorageMocks();
        // Spy on console methods to verify logging
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        if (consoleLogSpy) consoleLogSpy.mockRestore();
        if (consoleWarnSpy) consoleWarnSpy.mockRestore();
        if (consoleErrorSpy) consoleErrorSpy.mockRestore();
    });

    it('should render parsed chords from user input', async () => {
        resetStorageMocks();
        // Setup mock return
        const mockChords = [
            { roman: 'I', name: 'C Major', type: 'roman' },
            { roman: 'IV', name: 'F Major', type: 'roman' }
        ];
        Parser.parseProgression.mockReturnValue({ chords: mockChords, error: null });

        render(
            <ProgressionBuilder
                selectedRoot="C"
                selectedScaleType="major"
                onProgressionSet={() => { }}
            />
        );

        const input = screen.getByPlaceholderText(/e.g., I IV V ii/i);
        fireEvent.change(input, { target: { value: 'I IV' } });

        await waitFor(() => {
            expect(screen.getByText('C Major')).toBeTruthy();
            expect(screen.getByText('F Major')).toBeTruthy();
        });
    });

    it('should handle absolute chords via parser', async () => {
        resetStorageMocks();
        // Setup mock return for absolute chords
        // The component trusts the parser's return value
        const mockChords = [
            { roman: 'Cm', name: 'Cm', type: 'absolute' },
            { roman: 'Ab', name: 'Ab', type: 'absolute' }
        ];
        Parser.parseProgression.mockReturnValue({ chords: mockChords, error: null });

        render(
            <ProgressionBuilder
                selectedRoot="C"
                selectedScaleType="major"
                onProgressionSet={() => { }}
            />
        );

        const input = screen.getByPlaceholderText(/e.g., I IV V ii/i);
        fireEvent.change(input, { target: { value: 'Cm Ab' } });

        await waitFor(() => {
            // Absolute chords show name in both roman and alpha fields (or just repeating)
            // So we expect multiple elements
            expect(screen.getAllByText('Cm').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Ab').length).toBeGreaterThan(0);
        });
    });

    it('should display errors from parser', async () => {
        resetStorageMocks();
        Parser.parseProgression.mockReturnValue({ chords: [], error: 'Invalid something' });

        render(
            <ProgressionBuilder
                selectedRoot="C"
                selectedScaleType="major"
                onProgressionSet={() => { }}
            />
        );

        const input = screen.getByPlaceholderText(/e.g., I IV V ii/i);
        fireEvent.change(input, { target: { value: 'BadInput' } });

        await waitFor(() => {
            expect(screen.getByText('Invalid something')).toBeTruthy();
        });
    });

    it('should accept lead-sheet style chords input and enable Set Progression', async () => {
        resetStorageMocks();
        const inputText = 'C | Eₘ⁷ | G/B | Aₘ⁷ | D | G | Eₘ | Dₘ | D/F♯ | Aₘ | E | Cₘ | Fᵐᵃʲ⁷ | F';

        const mockChords = [
            { roman: 'C', name: 'C', type: 'absolute' },
            { roman: 'Eₘ⁷', name: 'Em7', type: 'absolute' },
            { roman: 'G/B', name: 'G/B', type: 'absolute' },
            { roman: 'Aₘ⁷', name: 'Am7', type: 'absolute' },
            { roman: 'D', name: 'D', type: 'absolute' },
            { roman: 'G', name: 'G', type: 'absolute' },
            { roman: 'Eₘ', name: 'Em', type: 'absolute' },
            { roman: 'Dₘ', name: 'Dm', type: 'absolute' },
            { roman: 'D/F♯', name: 'D/F#', type: 'absolute' },
            { roman: 'Aₘ', name: 'Am', type: 'absolute' },
            { roman: 'E', name: 'E', type: 'absolute' },
            { roman: 'Cₘ', name: 'Cm', type: 'absolute' },
            { roman: 'Fᵐᵃʲ⁷', name: 'Fmaj7', type: 'absolute' },
            { roman: 'F', name: 'F', type: 'absolute' },
        ];

        // Default: keep things valid so the component doesn't start in an error state.
        Parser.parseProgression.mockImplementation((text) => {
            if (text === inputText) {
                return { chords: mockChords, error: null };
            }
            return { chords: [{ roman: 'I', name: 'C Major', type: 'roman' }], error: null };
        });

        const onProgressionSet = vi.fn();

        render(
            <ProgressionBuilder
                selectedRoot="C"
                selectedScaleType="major"
                onProgressionSet={onProgressionSet}
            />
        );

        const input = screen.getByPlaceholderText(/e.g., I IV V ii/i);
        fireEvent.change(input, { target: { value: inputText } });

        const setButton = screen.getByRole('button', { name: /set progression/i });

        await waitFor(() => {
            expect(setButton).not.toBeDisabled();
            expect(screen.queryByText(/invalid/i)).toBeNull();
        });

        // Also verify clicking triggers onProgressionSet
        fireEvent.click(setButton);
        expect(onProgressionSet).toHaveBeenCalledTimes(1);
        expect(onProgressionSet).toHaveBeenCalledWith(mockChords);
    });

    it('should open save dialog and save progression with name and key metadata', async () => {
        resetStorageMocks();

        // Start: valid parse so save button is enabled
        Parser.parseProgression.mockReturnValue({
            chords: [{ roman: 'I', name: 'C Major', type: 'roman' }],
            error: null
        });

        storageMocks.getAll.mockResolvedValueOnce([]); // initial load
        storageMocks.validateProgressionString.mockReturnValue({ valid: true });

        render(
            <ProgressionBuilder
                selectedRoot="C"
                selectedScaleType="major"
                onProgressionSet={() => { }}
            />
        );

        const saveButton = screen.getByRole('button', { name: /save/i });
        await waitFor(() => {
            // Save is disabled while loading and until parsedChords is populated
            expect(saveButton).not.toBeDisabled();
        });

        fireEvent.click(saveButton);

        const nameInput = await screen.findByPlaceholderText(/enter progression name/i);
        fireEvent.change(nameInput, { target: { value: 'My Test Progression' } });

        const confirmSave = screen.getByRole('button', { name: /^save$/i });
        fireEvent.click(confirmSave);

        await waitFor(() => {
            expect(storageMocks.save).toHaveBeenCalledTimes(1);
        });

        const savedArg = storageMocks.save.mock.calls[0][0];
        expect(savedArg.name).toBe('My Test Progression');
        expect(savedArg.progression).toBe('I IV V I');
        expect(savedArg.version).toBe('1.0.0');
        expect(savedArg.metadata).toEqual({ key: 'C', scaleType: 'major' });

        // Verify console logging for save operation
        expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('[ProgressionBuilder] User saving progression:'),
            expect.objectContaining({
                name: 'My Test Progression',
                progression: 'I IV V I',
                metadata: { key: 'C', scaleType: 'major' }
            })
        );
        expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('[ProgressionBuilder] Successfully saved progression:'),
            expect.objectContaining({
                id: 'mock-id',
                name: 'My Test Progression'
            })
        );
    });

    it('should allow saving progression with absolute chord names like C Em7 G Am7 D G', async () => {
        resetStorageMocks();

        // Mock parseProgression to handle absolute chords
        Parser.parseProgression.mockReturnValue({
            chords: [
                { roman: 'C', name: 'C', type: 'absolute' },
                { roman: 'Em7', name: 'Em7', type: 'absolute' },
                { roman: 'G', name: 'G', type: 'absolute' },
                { roman: 'Am7', name: 'Am7', type: 'absolute' },
                { roman: 'D', name: 'D', type: 'absolute' },
                { roman: 'G', name: 'G', type: 'absolute' }
            ],
            error: null
        });

        storageMocks.getAll.mockResolvedValueOnce([]);
        storageMocks.validateProgressionString.mockReturnValue({ valid: true });
        storageMocks.save.mockResolvedValue('test-id-123');

        render(
            <ProgressionBuilder
                selectedRoot="C"
                selectedScaleType="major"
                onProgressionSet={() => { }}
            />
        );

        // Enter absolute chord progression
        const input = screen.getByPlaceholderText(/e.g., I IV V ii/i);
        fireEvent.change(input, { target: { value: 'C Em7 G Am7 D G' } });

        // Wait for parsing
        await waitFor(() => {
            expect(Parser.parseProgression).toHaveBeenCalled();
        });

        // Save button should be enabled
        const saveButton = screen.getByRole('button', { name: /save/i });
        await waitFor(() => {
            expect(saveButton).not.toBeDisabled();
        });

        // Click save
        fireEvent.click(saveButton);

        // Enter name and confirm
        const nameInput = await screen.findByPlaceholderText(/enter progression name/i);
        fireEvent.change(nameInput, { target: { value: 'Unicode Test' } });

        const confirmSave = screen.getByRole('button', { name: /^save$/i });
        fireEvent.click(confirmSave);

        // Verify save was called
        await waitFor(() => {
            expect(storageMocks.save).toHaveBeenCalledTimes(1);
        });

        const savedArg = storageMocks.save.mock.calls[0][0];
        expect(savedArg.progression).toBe('C Em7 G Am7 D G');
        expect(savedArg.name).toBe('Unicode Test');
    });

    it('should display saved progressions and load into input when clicked', async () => {
        resetStorageMocks();

        Parser.parseProgression.mockReturnValue({
            chords: [{ roman: 'I', name: 'C Major', type: 'roman' }],
            error: null
        });

        const saved = [
            {
                id: 'p1',
                name: 'Loaded One',
                progression: 'I vi IV V',
                createdAt: Date.now(),
                metadata: { key: 'C', scaleType: 'major' }
            }
        ];
        storageMocks.getAll.mockResolvedValue(saved);
        storageMocks.save.mockResolvedValue('p1');

        render(
            <ProgressionBuilder
                selectedRoot="C"
                selectedScaleType="major"
                onProgressionSet={() => { }}
            />
        );

        // Wait for saved list to render
        await waitFor(() => {
            expect(screen.getByText('Loaded One')).toBeTruthy();
        });

        fireEvent.click(screen.getByText('Loaded One'));

        const input = screen.getByPlaceholderText(/e.g., I IV V ii/i);
        await waitFor(() => {
            expect(input.value).toBe('I vi IV V');
        });

        // Verify console logging for load operation
        const loadLogCalls = consoleLogSpy.mock.calls.filter(call => 
            call[0] && call[0].includes && call[0].includes('[ProgressionBuilder] User loading progression:')
        );
        expect(loadLogCalls.length).toBeGreaterThan(0);
        expect(loadLogCalls[0][1]).toMatchObject({
            id: 'p1',
            name: 'Loaded One',
            progression: 'I vi IV V',
            metadata: { key: 'C', scaleType: 'major' }
        });

        const successLoadCalls = consoleLogSpy.mock.calls.filter(call => 
            call[0] && call[0].includes && call[0].includes('[ProgressionBuilder] Successfully loaded progression:')
        );
        expect(successLoadCalls.length).toBeGreaterThan(0);
        expect(successLoadCalls[0][1]).toMatchObject({
            id: 'p1',
            name: 'Loaded One'
        });
    });

    it('should delete a saved progression when delete button is clicked and user confirms', async () => {
        resetStorageMocks();

        Parser.parseProgression.mockReturnValue({
            chords: [{ roman: 'I', name: 'C Major', type: 'roman' }],
            error: null
        });

        const saved = [
            {
                id: 'p1',
                name: 'To Delete',
                progression: 'I IV V I',
                createdAt: Date.now(),
                metadata: { key: 'C', scaleType: 'major' }
            }
        ];

        // First render: list has one; after delete: list empty
        storageMocks.getAll
            .mockResolvedValueOnce(saved)
            .mockResolvedValueOnce([]);

        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(
            <ProgressionBuilder
                selectedRoot="C"
                selectedScaleType="major"
                onProgressionSet={() => { }}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('To Delete')).toBeTruthy();
        });

        // There is an "×" delete button inside the saved item actions
        const deleteButtons = screen.getAllByRole('button', { name: '×' });
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
            expect(storageMocks.delete).toHaveBeenCalledWith('p1');
        });

        confirmSpy.mockRestore();
    });

    it('should log console messages when importing a progression file', async () => {
        resetStorageMocks();

        Parser.parseProgression.mockReturnValue({
            chords: [{ roman: 'C', name: 'C', type: 'absolute' }],
            error: null
        });

        const importedProgression = {
            name: 'Imported Progression',
            progression: 'C F G',
            metadata: { scaleType: 'major' }, // Missing key
            version: '1.0.0'
        };

        storageMocks.getAll.mockResolvedValueOnce([]);
        storageMocks.importFromFile.mockResolvedValueOnce(importedProgression);
        storageMocks.save.mockResolvedValueOnce('imported-id');
        storageMocks.getAll.mockResolvedValueOnce([{ ...importedProgression, id: 'imported-id' }]);

        render(
            <ProgressionBuilder
                selectedRoot="C"
                selectedScaleType="major"
                onProgressionSet={() => {}}
            />
        );

        // Create a mock file
        const file = new File([JSON.stringify(importedProgression)], 'test-progression.json', {
            type: 'application/json'
        });

        const fileInput = screen.getByTitle(/open/i).querySelector('input[type="file"]');
        expect(fileInput).toBeTruthy();
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(storageMocks.importFromFile).toHaveBeenCalled();
        });

        // Verify console logging for import operation
        expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('[ProgressionBuilder] User importing progression file:'),
            expect.objectContaining({
                fileName: 'test-progression.json',
                fileType: 'application/json'
            })
        );
        expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('[ProgressionBuilder] Parsed imported progression:'),
            expect.objectContaining({
                name: 'Imported Progression',
                progression: 'C F G'
            })
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining('[ProgressionBuilder] Imported progression missing metadata.key'),
            'C'
        );
        expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('[ProgressionBuilder] Successfully imported and saved progression:'),
            expect.objectContaining({
                id: 'imported-id',
                name: 'Imported Progression'
            })
        );
    });

    it('should successfully import the specific progression file from public/2026-01-10-13-06-59.json', async () => {
        resetStorageMocks();

        // Mock the actual file content
        const fileContent = {
            name: 'ac',
            progression: 'C  Eₘ⁷  G  Aₘ⁷  D  G',
            metadata: {
                scaleType: 'major'
            },
            id: '1454096b-1095-4f53-8bfc-b3ab30298ab9',
            createdAt: 1768035699202,
            version: '1.0.0'
        };

        Parser.parseProgression.mockReturnValue({
            chords: [
                { roman: 'C', name: 'C', type: 'absolute' },
                { roman: 'Em7', name: 'Em7', type: 'absolute' },
                { roman: 'G', name: 'G', type: 'absolute' },
                { roman: 'Am7', name: 'Am7', type: 'absolute' },
                { roman: 'D', name: 'D', type: 'absolute' },
                { roman: 'G', name: 'G', type: 'absolute' }
            ],
            error: null
        });

        storageMocks.getAll.mockResolvedValueOnce([]);
        storageMocks.importFromFile.mockResolvedValueOnce(fileContent);
        storageMocks.save.mockResolvedValueOnce('new-imported-id');
        storageMocks.getAll.mockResolvedValueOnce([{ ...fileContent, id: 'new-imported-id' }]);
        storageMocks.validateProgressionString.mockReturnValue({ valid: true });

        render(
            <ProgressionBuilder
                selectedRoot="C"
                selectedScaleType="major"
                onProgressionSet={() => {}}
            />
        );

        // Create a mock file with the actual content
        const file = new File([JSON.stringify(fileContent)], '2026-01-10-13-06-59.json', {
            type: 'application/json'
        });

        const fileInput = screen.getByTitle(/open/i).querySelector('input[type="file"]');
        expect(fileInput).toBeTruthy();
        fireEvent.change(fileInput, { target: { files: [file] } });

        // Wait for import to complete
        await waitFor(() => {
            expect(storageMocks.importFromFile).toHaveBeenCalledTimes(1);
        });

        // Verify the progression was imported and saved with metadata.key added
        await waitFor(() => {
            expect(storageMocks.save).toHaveBeenCalledTimes(1);
        });

        const savedProgression = storageMocks.save.mock.calls[0][0];
        expect(savedProgression.name).toBe('ac');
        expect(savedProgression.progression).toBe('C  Eₘ⁷  G  Aₘ⁷  D  G');
        expect(savedProgression.metadata.scaleType).toBe('major');
        // Verify that metadata.key was added (defaults to selectedRoot)
        expect(savedProgression.metadata.key).toBe('C');
        expect(savedProgression.version).toBe('1.0.0');
        expect(savedProgression.id).toBeDefined();
        expect(savedProgression.createdAt).toBeDefined();

        // Verify console logging
        expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('[ProgressionBuilder] User importing progression file:'),
            expect.objectContaining({
                fileName: '2026-01-10-13-06-59.json'
            })
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining('[ProgressionBuilder] Imported progression missing metadata.key'),
            'C'
        );
        // Verify success log was called (check if any call contains the success message)
        const successLogCalls = consoleLogSpy.mock.calls.filter(call => 
            call[0] && call[0].includes && call[0].includes('[ProgressionBuilder] Successfully imported and saved progression:')
        );
        expect(successLogCalls.length).toBeGreaterThan(0);
    });
});
