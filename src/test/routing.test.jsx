// https://github.com/pleabargain/piano-app
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import App from '../App';
import { loadExerciseFromUrl, getExerciseIdFromPath } from '../core/exercise-loader';

// Mock MIDI manager to avoid Web MIDI API issues in tests
vi.mock('../core/midi-manager', () => ({
  midiManager: {
    requestAccess: vi.fn(() => Promise.resolve(false)),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    getFirstInputName: vi.fn(() => null),
    setRecordingCallback: vi.fn(),
  }
}));

// Mock recording managers
vi.mock('../core/recording-manager', () => ({
  default: class MockRecordingManager {
    getState() { return 'idle'; }
    recordEvent() {}
  }
}));

vi.mock('../core/playback-manager', () => ({
  default: class MockPlaybackManager {
    on() {}
    off() {}
    setWaitForInput() {}
    setLoop() {}
  }
}));

vi.mock('../core/recording-storage', () => ({
  default: class MockRecordingStorage {
    async init() { return true; }
    async save() { return 'mock-id'; }
  }
}));

describe('Routing Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getExerciseIdFromPath', () => {
    it('should extract exercise ID from path', () => {
      expect(getExerciseIdFromPath('/exercise/i-v-i-circle')).toBe('i-v-i-circle');
    });

    it('should return null for non-exercise paths', () => {
      expect(getExerciseIdFromPath('/')).toBeNull();
      expect(getExerciseIdFromPath('/some/path')).toBeNull();
    });
  });

  describe('loadExerciseFromUrl', () => {
    it('should load exercise configuration', () => {
      const exercise = loadExerciseFromUrl('i-v-i-circle', '');
      expect(exercise).toBeDefined();
      expect(exercise.id).toBe('i-v-i-circle');
    });

    it('should return null for invalid exercise', () => {
      expect(loadExerciseFromUrl('invalid', '')).toBeNull();
    });

    it('should parse URL parameters', () => {
      const exercise = loadExerciseFromUrl('i-v-i-circle', '?startKey=G&keys=6');
      expect(exercise.params.startKey).toBe('G');
      expect(exercise.params.keys).toBe(6);
    });
  });

  describe('App Routing', () => {
    it('should render app at root path', async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      await waitFor(() => {
        // App should render - check for header
        const header = screen.queryByText(/Piano Trainer/i);
        expect(header).toBeTruthy();
      });
    });

    it('should render app at exercise path', async () => {
      render(
        <MemoryRouter initialEntries={['/exercise/i-v-i-circle']}>
          <App />
        </MemoryRouter>
      );

      await waitFor(() => {
        // App should render
        const header = screen.queryByText(/Piano Trainer/i);
        expect(header).toBeTruthy();
      });
    });

    it('should handle exercise route with parameters', async () => {
      render(
        <MemoryRouter initialEntries={['/exercise/i-v-i-circle?startKey=G&keys=6']}>
          <App />
        </MemoryRouter>
      );

      await waitFor(() => {
        // App should render
        const header = screen.queryByText(/Piano Trainer/i);
        expect(header).toBeTruthy();
      });
    });

    it('should handle invalid exercise route gracefully', async () => {
      render(
        <MemoryRouter initialEntries={['/exercise/invalid-exercise']}>
          <App />
        </MemoryRouter>
      );

      await waitFor(() => {
        // App should still render, just without exercise
        const header = screen.queryByText(/Piano Trainer/i);
        expect(header).toBeTruthy();
      });
    });
  });

  describe('URL Parameter Handling', () => {
    it('should handle startKey parameter', () => {
      const exercise = loadExerciseFromUrl('i-v-i-circle', '?startKey=C');
      expect(exercise.params.startKey).toBe('C');
    });

    it('should handle keys parameter', () => {
      const exercise = loadExerciseFromUrl('i-v-i-circle', '?keys=12');
      expect(exercise.params.keys).toBe(12);
    });

    it('should handle both parameters together', () => {
      const exercise = loadExerciseFromUrl('i-v-i-circle', '?startKey=G&keys=6');
      expect(exercise.params.startKey).toBe('G');
      expect(exercise.params.keys).toBe(6);
    });

    it('should set startKeyIndex for valid startKey', () => {
      const exercise = loadExerciseFromUrl('i-v-i-circle', '?startKey=G');
      expect(exercise.startKeyIndex).toBe(1); // G is index 1
    });

    it('should set maxKeys for valid keys parameter', () => {
      const exercise = loadExerciseFromUrl('i-v-i-circle', '?keys=6');
      expect(exercise.maxKeys).toBe(6);
    });
  });

  describe('Route Navigation', () => {
    it('should maintain app state when navigating between routes', async () => {
      const { rerender } = render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      await waitFor(() => {
        const header = screen.queryByText(/Piano Trainer/i);
        expect(header).toBeTruthy();
      });

      // Navigate to exercise route
      rerender(
        <MemoryRouter initialEntries={['/exercise/i-v-i-circle']}>
          <App />
        </MemoryRouter>
      );

      await waitFor(() => {
        const header = screen.queryByText(/Piano Trainer/i);
        expect(header).toBeTruthy();
      });
    });
  });
});
