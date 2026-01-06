// https://github.com/pleabargain/piano-app
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App.jsx'
import { NOTES } from '../core/music-theory'

// Mock MIDI Manager to avoid browser API dependencies
vi.mock('../core/midi-manager', () => ({
    midiManager: {
        requestAccess: vi.fn(() => Promise.resolve(true)),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        setRecordingCallback: vi.fn(),
        getFirstInputName: vi.fn(() => 'Test MIDI Device'),
    },
}))

describe('Lava Mode Functionality', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should initialize lavaKeys correctly when entering Lava mode', async () => {
        const { container } = render(<App />)

        // Switch to Lava Mode
        const lavaModeButton = screen.getByText('Lava Game')
        await userEvent.click(lavaModeButton)

        await waitFor(() => {
            expect(screen.getByText(/Lava Game - C major/i)).toBeInTheDocument()

            // Check for lava-key classes on the piano
            const lavaKeys = container.querySelectorAll('.lava-key')
            expect(lavaKeys.length).toBeGreaterThan(0)

            // For C Major, C# (MIDI 37) should be a lava key
            const cSharpKey = container.querySelector('[data-midi="37"]')
            expect(cSharpKey.classList.contains('lava-key')).toBe(true)

            // C (MIDI 36) should NOT be a lava key (it's in C Major)
            const cKey = container.querySelector('[data-midi="36"]')
            expect(cKey.classList.contains('lava-key')).toBe(false)
            expect(cKey.classList.contains('lava-good-key')).toBe(true)
        })
    })

    it('should update lavaKeys immediately when scale root changes via Circle of Fifths', async () => {
        const { container } = render(<App />)

        // Switch to Lava Mode
        const lavaModeButton = screen.getByText('Lava Game')
        await userEvent.click(lavaModeButton)

        // Change root to G Major in Circle of Fifths
        const gMajorSegment = container.querySelector('path[data-key="major-G"]')
        await userEvent.click(gMajorSegment)

        await waitFor(() => {
            expect(screen.getByText(/Lava Game - G major/i)).toBeInTheDocument()

            // In G Major, F# (MIDI 42) is GOOD, but F (MIDI 41) is LAVA
            const fKey = container.querySelector('[data-midi="41"]')
            const fSharpKey = container.querySelector('[data-midi="42"]')

            expect(fKey.classList.contains('lava-key')).toBe(true)
            expect(fSharpKey.classList.contains('lava-good-key')).toBe(true)
        })
    })

    it('should pass mode="lava" and lavaKeys to both Piano components', async () => {
        const { container } = render(<App />)

        // Switch to Lava Mode
        const lavaModeButton = screen.getByText('Lava Game')
        await userEvent.click(lavaModeButton)

        await waitFor(() => {
            const leftPiano = container.querySelector('.left-piano .piano-container')
            const rightPiano = container.querySelector('.right-piano .piano-container')

            expect(leftPiano.classList.contains('lava-mode')).toBe(true)
            expect(rightPiano.classList.contains('lava-mode')).toBe(true)

            // Both should have red keys
            expect(leftPiano.querySelectorAll('.lava-key').length).toBeGreaterThan(0)
            expect(rightPiano.querySelectorAll('.lava-key').length).toBeGreaterThan(0)
        })
    })
})
