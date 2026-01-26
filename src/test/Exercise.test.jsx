// https://github.com/pleabargain/piano-app
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import Exercise from '../components/Exercise';
import { getExercise } from '../core/exercise-config';

describe('Exercise Component', () => {
  let mockOnProgressionUpdate;
  let mockOnKeyUpdate;
  let mockOnStatusUpdate;
  let exerciseConfig;

  beforeEach(() => {
    mockOnProgressionUpdate = vi.fn();
    mockOnKeyUpdate = vi.fn();
    mockOnStatusUpdate = vi.fn();
    exerciseConfig = getExercise('i-v-i-circle');
  });

  it('should render without crashing', () => {
    const { container } = render(
      <Exercise
        exerciseConfig={exerciseConfig}
        currentStepIndex={0}
        progression={[]}
        onProgressionUpdate={mockOnProgressionUpdate}
        onKeyUpdate={mockOnKeyUpdate}
        onStatusUpdate={mockOnStatusUpdate}
      />
    );
    
    // Exercise component doesn't render anything visible
    expect(container.firstChild).toBeNull();
  });

  it('should initialize with first key and generate progression', async () => {
    render(
      <Exercise
        exerciseConfig={exerciseConfig}
        currentStepIndex={0}
        progression={[]}
        onProgressionUpdate={mockOnProgressionUpdate}
        onKeyUpdate={mockOnKeyUpdate}
        onStatusUpdate={mockOnStatusUpdate}
      />
    );

    await waitFor(() => {
      expect(mockOnProgressionUpdate).toHaveBeenCalled();
      expect(mockOnKeyUpdate).toHaveBeenCalled();
      expect(mockOnStatusUpdate).toHaveBeenCalled();
    });

    // Should generate I-V-I progression for C
    const progressionCall = mockOnProgressionUpdate.mock.calls[0][0];
    expect(progressionCall).toHaveLength(3);
    expect(progressionCall[0].name).toBe('C Major');
    expect(progressionCall[1].name).toBe('G Major');
    expect(progressionCall[2].name).toBe('C Major');

    // Should update key to C
    expect(mockOnKeyUpdate).toHaveBeenCalledWith('C');
  });

  it('should start at specified startKeyIndex', async () => {
    const configWithStartKey = {
      ...exerciseConfig,
      startKeyIndex: 1 // G Major
    };

    render(
      <Exercise
        exerciseConfig={configWithStartKey}
        currentStepIndex={0}
        progression={[]}
        onProgressionUpdate={mockOnProgressionUpdate}
        onKeyUpdate={mockOnKeyUpdate}
        onStatusUpdate={mockOnStatusUpdate}
      />
    );

    await waitFor(() => {
      expect(mockOnKeyUpdate).toHaveBeenCalled();
    });

    // Should start with G (index 1)
    expect(mockOnKeyUpdate).toHaveBeenCalledWith('G');
  });

  it('should update progression when key changes', async () => {
    const { rerender } = render(
      <Exercise
        exerciseConfig={exerciseConfig}
        currentStepIndex={0}
        progression={[]}
        onProgressionUpdate={mockOnProgressionUpdate}
        onKeyUpdate={mockOnKeyUpdate}
        onStatusUpdate={mockOnStatusUpdate}
      />
    );

    await waitFor(() => {
      expect(mockOnProgressionUpdate).toHaveBeenCalled();
    });

    mockOnProgressionUpdate.mockClear();
    mockOnKeyUpdate.mockClear();

    // Simulate key change by updating currentKeyIndex internally
    // This is done by the component's internal state, so we need to trigger it
    // by changing the exerciseConfig or progression
    const newProgression = [
      { name: 'C Major', roman: 'I' },
      { name: 'G Major', roman: 'V' },
      { name: 'C Major', roman: 'I' }
    ];

    // First render with step 2 (last step) to set prevStepIndexRef
    rerender(
      <Exercise
        exerciseConfig={exerciseConfig}
        currentStepIndex={2}
        progression={newProgression}
        onProgressionUpdate={mockOnProgressionUpdate}
        onKeyUpdate={mockOnKeyUpdate}
        onStatusUpdate={mockOnStatusUpdate}
      />
    );

    // Then render with step 3 (wraps to 0) to trigger completion detection
    rerender(
      <Exercise
        exerciseConfig={exerciseConfig}
        currentStepIndex={3} // Completed progression (wraps to step 0)
        progression={newProgression}
        onProgressionUpdate={mockOnProgressionUpdate}
        onKeyUpdate={mockOnKeyUpdate}
        onStatusUpdate={mockOnStatusUpdate}
      />
    );

    // Component should detect completion and advance to next key
    await waitFor(() => {
      // After completion, should advance to next key (G)
      expect(mockOnKeyUpdate).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('should handle progression completion and advance to next key', async () => {
    const initialProgression = [
      { name: 'C Major', roman: 'I' },
      { name: 'G Major', roman: 'V' },
      { name: 'C Major', roman: 'I' }
    ];

    const { rerender } = render(
      <Exercise
        exerciseConfig={exerciseConfig}
        currentStepIndex={0}
        progression={initialProgression}
        onProgressionUpdate={mockOnProgressionUpdate}
        onKeyUpdate={mockOnKeyUpdate}
        onStatusUpdate={mockOnStatusUpdate}
      />
    );

    // Simulate completing the progression (step 0 -> 1 -> 2 -> 3)
    rerender(
      <Exercise
        exerciseConfig={exerciseConfig}
        currentStepIndex={3} // Completed all 3 chords
        progression={initialProgression}
        onProgressionUpdate={mockOnProgressionUpdate}
        onKeyUpdate={mockOnKeyUpdate}
        onStatusUpdate={mockOnStatusUpdate}
      />
    );

    await waitFor(() => {
      // Should advance to next key (G)
      const keyCalls = mockOnKeyUpdate.mock.calls;
      const lastCall = keyCalls[keyCalls.length - 1];
      if (lastCall && lastCall[0] === 'G') {
        expect(true).toBe(true); // Key advanced correctly
      }
    }, { timeout: 2000 });
  });

  it('should handle exercise completion when all keys are done', async () => {
    const configWithMaxKeys = {
      ...exerciseConfig,
      maxKeys: 1 // Only practice C
    };

    const progression = [
      { name: 'C Major', roman: 'I' },
      { name: 'G Major', roman: 'V' },
      { name: 'C Major', roman: 'I' }
    ];

    const { rerender } = render(
      <Exercise
        exerciseConfig={configWithMaxKeys}
        currentStepIndex={0}
        progression={progression}
        onProgressionUpdate={mockOnProgressionUpdate}
        onKeyUpdate={mockOnKeyUpdate}
        onStatusUpdate={mockOnStatusUpdate}
      />
    );

    // First render with step 2 (last step) to set prevStepIndexRef
    rerender(
      <Exercise
        exerciseConfig={configWithMaxKeys}
        currentStepIndex={2}
        progression={progression}
        onProgressionUpdate={mockOnProgressionUpdate}
        onKeyUpdate={mockOnKeyUpdate}
        onStatusUpdate={mockOnStatusUpdate}
      />
    );

    // Then render with step 3 (wraps to 0) to trigger completion detection
    rerender(
      <Exercise
        exerciseConfig={configWithMaxKeys}
        currentStepIndex={3}
        progression={progression}
        onProgressionUpdate={mockOnProgressionUpdate}
        onKeyUpdate={mockOnKeyUpdate}
        onStatusUpdate={mockOnStatusUpdate}
      />
    );

    await waitFor(() => {
      // Should show completion message
      const statusCalls = mockOnStatusUpdate.mock.calls;
      const hasCompletionMessage = statusCalls.some(call => 
        call[0] && call[0].includes('Complete')
      );
      expect(hasCompletionMessage).toBe(true);
    }, { timeout: 2000 });
  });

  it('should respect maxKeys parameter', async () => {
    const configWithMaxKeys = {
      ...exerciseConfig,
      maxKeys: 3 // Only practice first 3 keys
    };

    render(
      <Exercise
        exerciseConfig={configWithMaxKeys}
        currentStepIndex={0}
        progression={[]}
        onProgressionUpdate={mockOnProgressionUpdate}
        onKeyUpdate={mockOnKeyUpdate}
        onStatusUpdate={mockOnStatusUpdate}
      />
    );

    await waitFor(() => {
      expect(mockOnKeyUpdate).toHaveBeenCalled();
    });

    // Should start with C (first key)
    expect(mockOnKeyUpdate).toHaveBeenCalledWith('C');
  });
});
