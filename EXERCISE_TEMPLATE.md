# Exercise Addition Template

This template provides a step-by-step checklist for adding new exercises to the Piano Trainer app. Follow this guide to ensure consistency and completeness.

## Overview

Exercises in the Piano Trainer app are URL-based and automatically integrate with the existing routing, component, and testing infrastructure. This template covers all steps needed to add a new exercise.

## Exercise URL Pattern

All exercises follow this URL pattern:
```
http://localhost:5173/exercise/{exercise-id}
```

**Optional URL Parameters:**
- `?startKey={key}` - Start at a specific key (e.g., `?startKey=G`)
- `?keys={number}` - Limit to N keys (e.g., `?keys=6`)
- Combined: `?startKey=G&keys=6`

**Example:**
```
http://localhost:5173/exercise/i-v-i-circle
http://localhost:5173/exercise/i-v-i-circle?startKey=G&keys=6
```

## Step-by-Step Checklist

### 1. Exercise ID Naming Convention

Choose a descriptive, URL-friendly exercise ID:
- Use lowercase letters
- Separate words with hyphens (`-`)
- Be descriptive but concise
- Examples: `i-v-i-circle`, `i-iv-v-i-circle`, `circle-of-fifths-tour`

**Checklist:**
- [ ] Exercise ID follows naming convention
- [ ] ID is unique (not already in use)
- [ ] ID is descriptive and clear

### 2. Exercise Configuration

**File:** `src/core/exercise-config.js`

Add your exercise to the `EXERCISES` object. Each exercise requires:

```javascript
'exercise-id': {
  id: 'exercise-id',                    // Must match the key
  name: 'Display Name',                 // Human-readable name
  description: 'Exercise description',   // Brief description
  mode: 'chord',                        // 'chord' or 'scale'
  config: {
    keyProgression: CIRCLE_OF_FIFTHS_KEYS,  // Array of keys to cycle through
    generateProgression: (root) => {          // Function that generates progression for a key
      // Return array of chord objects: [{name: 'C Major', roman: 'I'}, ...]
    },
    scaleType: 'major'                    // 'major' or 'natural_minor'
  }
}
```

**Required Fields:**
- `id`: Unique identifier (must match the object key)
- `name`: Display name for the exercise
- `description`: Brief description of what the exercise does
- `mode`: Either `'chord'` or `'scale'`
- `config.keyProgression`: Array of keys (usually `CIRCLE_OF_FIFTHS_KEYS`)
- `config.generateProgression`: Function that takes a root note and returns an array of chord objects
- `config.scaleType`: Scale type (`'major'` or `'natural_minor'`)

**Progression Generator Function:**

The `generateProgression` function must:
- Accept a `root` parameter (string, e.g., `'C'`, `'G#'`)
- Return an array of chord objects with format: `[{name: 'C Major', roman: 'I'}, ...]`
- Handle invalid inputs gracefully (return empty array)

**Common Patterns:**

1. **Using existing helper functions:**
```javascript
generateProgression: generateIVIProgression  // Uses predefined function
```

2. **Using Roman numeral pattern parser:**
```javascript
generateProgression: (root) => generateProgressionFromRomanPattern('I IV V I', root, 'major')
```

3. **Custom function:**
```javascript
generateProgression: (root) => {
  // Custom logic here
  return [
    { name: `${root} Major`, roman: 'I' },
    { name: `${getVChordRoot(root)} Major`, roman: 'V' },
    { name: `${root} Major`, roman: 'I' }
  ];
}
```

**Checklist:**
- [ ] Exercise added to `EXERCISES` object in `exercise-config.js`
- [ ] All required fields present
- [ ] `generateProgression` function returns correct format
- [ ] Function handles edge cases (invalid root, etc.)

### 3. URL Routing (Automatic)

**Files:** `src/core/exercise-loader.js`, `src/App.jsx`

No changes needed! The routing system automatically handles:
- Extracting exercise ID from URL path (`/exercise/{exercise-id}`)
- Loading exercise configuration
- Parsing URL parameters (`startKey`, `keys`)
- Validating parameters

The routing works automatically once the exercise is added to `EXERCISES`.

**Checklist:**
- [ ] Verify routing works (no code changes needed)

### 4. Component Integration (Automatic)

**File:** `src/components/Exercise.jsx`

No changes needed! The `Exercise` component automatically:
- Loads exercise configuration
- Manages key progression
- Updates progression when keys change
- Handles continuous looping
- Provides status updates

**Checklist:**
- [ ] Verify component integration (no code changes needed)

### 5. Testing

**File:** `src/test/exercise-config.test.js`

Add test cases for your exercise:

```javascript
describe('exercise-id', () => {
  it('should be defined in EXERCISES', () => {
    expect(EXERCISES['exercise-id']).toBeDefined();
  });

  it('should have correct structure', () => {
    const exercise = EXERCISES['exercise-id'];
    expect(exercise.id).toBe('exercise-id');
    expect(exercise.name).toBeDefined();
    expect(exercise.description).toBeDefined();
    expect(exercise.mode).toBe('chord'); // or 'scale'
    expect(exercise.config).toBeDefined();
    expect(exercise.config.keyProgression).toBeDefined();
    expect(exercise.config.generateProgression).toBeDefined();
    expect(typeof exercise.config.generateProgression).toBe('function');
  });

  it('should generate progression correctly', () => {
    const exercise = EXERCISES['exercise-id'];
    const progression = exercise.config.generateProgression('C');
    expect(progression).toBeDefined();
    expect(Array.isArray(progression)).toBe(true);
    expect(progression.length).toBeGreaterThan(0);
    // Add specific assertions for your progression
  });
});
```

**File:** `src/test/routing.test.jsx`

Add routing tests:

```javascript
describe('Exercise-ID Routing', () => {
  it('should extract exercise ID from path', () => {
    expect(getExerciseIdFromPath('/exercise/exercise-id')).toBe('exercise-id');
  });

  it('should load exercise-id exercise', () => {
    const exercise = loadExerciseFromUrl('exercise-id', '');
    expect(exercise).toBeDefined();
    expect(exercise.id).toBe('exercise-id');
  });

  it('should handle URL parameters for exercise-id', () => {
    const exercise = loadExerciseFromUrl('exercise-id', '?startKey=G&keys=6');
    expect(exercise.params.startKey).toBe('G');
    expect(exercise.params.keys).toBe(6);
  });

  it('should render app at exercise-id exercise path', async () => {
    render(
      <MemoryRouter initialEntries={['/exercise/exercise-id']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      const header = screen.queryByText(/Piano Trainer/i);
      expect(header).toBeTruthy();
    });
  });
});
```

**File:** `src/test/exercise-loader.test.js` (if needed)

Add loader-specific tests if your exercise has special parameter handling.

**Checklist:**
- [ ] Tests added to `exercise-config.test.js`
- [ ] Tests added to `routing.test.jsx`
- [ ] All tests pass
- [ ] Edge cases covered (invalid keys, etc.)

### 6. Documentation

**File:** `usage-ideas.md`

Add documentation in two places:

#### A. Quick Links Section (around line 81-86)

Add to the "Quick Links to Exercises" section:

```markdown
- **Exercise Name**: [http://localhost:5173/exercise/exercise-id](http://localhost:5173/exercise/exercise-id)
  - Brief description of what it does
  - With parameters: [http://localhost:5173/exercise/exercise-id?startKey=C&keys=12](http://localhost:5173/exercise/exercise-id?startKey=C&keys=12)
```

#### B. Exercise Description Section

If there's an existing manual exercise description, add a link:

```markdown
**Want automated practice through all keys?** Try the [Exercise Name Exercise](#the-exercise-id-exercise-continuous-practice) at `http://localhost:5173/exercise/exercise-id` - it automatically guides you through all 12 keys with continuous looping!
```

#### C. Detailed Exercise Section (if needed)

Add a detailed section similar to the I-V-I Circle Exercise documentation:

```markdown
### The "Exercise Name" (Continuous Practice)

**What it is**: Detailed description of the automated exercise.

**How to access it**:
1. Navigate to: `http://localhost:5173/exercise/exercise-id`
2. Description of how it starts
3. Description of progression
4. Description of looping behavior

**How to use it**:
1. Connect your MIDI keyboard
2. Description of what user sees
3. Description of interaction
4. Description of progression
5. Description of looping

**URL Parameters** (optional customization):
- `?startKey=C` - Start at a specific key
- `?keys=12` - Practice only the first N keys
- Combine both: `?startKey=G&keys=6`

**Examples**:
- Full circle: `http://localhost:5173/exercise/exercise-id`
- With startKey: `http://localhost:5173/exercise/exercise-id?startKey=G`
- With keys limit: `http://localhost:5173/exercise/exercise-id?keys=6`
- Combined: `http://localhost:5173/exercise/exercise-id?startKey=D&keys=3`

**Why it's effective**:
- List of benefits

**Practice tips**:
- List of tips

**Variation**: Suggestions for variations
```

**Checklist:**
- [ ] URL added to Quick Links section
- [ ] Link added to exercise description (if applicable)
- [ ] Detailed section added (if needed)
- [ ] All URLs are correct and working
- [ ] Examples include parameter variations

### 7. Verification

**Manual Testing Checklist:**
- [ ] Navigate to exercise URL - exercise loads correctly
- [ ] Exercise starts with correct key (default: C)
- [ ] Progression displays correctly
- [ ] Can complete progression and advance to next key
- [ ] Exercise loops back to first key after completing all keys
- [ ] URL parameter `?startKey=G` works correctly
- [ ] URL parameter `?keys=6` limits to 6 keys correctly
- [ ] Combined parameters work correctly
- [ ] Invalid parameters are handled gracefully

**Automated Testing:**
- [ ] Run all tests: `npm test`
- [ ] All new tests pass
- [ ] No existing tests broken

## Common Patterns and Examples

### Pattern 1: Simple Roman Numeral Progression

For exercises that use standard Roman numeral progressions:

```javascript
'i-vi-iv-v-circle': {
  id: 'i-vi-iv-v-circle',
  name: 'I-vi-IV-V Circle of Fifths',
  description: 'Practice I-vi-IV-V chord progressions through all 12 keys',
  mode: 'chord',
  config: {
    keyProgression: CIRCLE_OF_FIFTHS_KEYS,
    generateProgression: (root) => generateProgressionFromRomanPattern('I vi IV V', root, 'major'),
    scaleType: 'major'
  }
}
```

### Pattern 2: Custom Progression Function

For exercises with custom logic:

```javascript
'custom-exercise': {
  id: 'custom-exercise',
  name: 'Custom Exercise',
  description: 'Custom exercise description',
  mode: 'chord',
  config: {
    keyProgression: CIRCLE_OF_FIFTHS_KEYS,
    generateProgression: (root) => {
      const vRoot = getVChordRoot(root);
      const ivRoot = getIVChordRoot(root); // If you create this helper
      return [
        { name: `${root} Major`, roman: 'I' },
        { name: `${ivRoot} Major`, roman: 'IV' },
        { name: `${vRoot} Major`, roman: 'V' },
        { name: `${root} Major`, roman: 'I' }
      ];
    },
    scaleType: 'major'
  }
}
```

### Pattern 3: Minor Key Exercise

For exercises in minor keys:

```javascript
'minor-i-iv-v-i-circle': {
  id: 'minor-i-iv-v-i-circle',
  name: 'Minor I-iv-V-i Circle of Fifths',
  description: 'Practice minor key I-iv-V-i progressions',
  mode: 'chord',
  config: {
    keyProgression: CIRCLE_OF_FIFTHS_KEYS,
    generateProgression: (root) => generateProgressionFromRomanPattern('i iv V i', root, 'natural_minor'),
    scaleType: 'natural_minor'
  }
}
```

## Troubleshooting

### Exercise doesn't load from URL
- Check that exercise ID matches the key in `EXERCISES` object
- Verify `getExercise()` function can find your exercise
- Check browser console for errors

### Progression doesn't generate correctly
- Verify `generateProgression` function returns correct format
- Check that function handles all 12 keys correctly
- Test function directly: `EXERCISES['exercise-id'].config.generateProgression('C')`

### URL parameters don't work
- Verify parameter names are `startKey` and `keys` (case-sensitive)
- Check that `startKey` value is in `CIRCLE_OF_FIFTHS_KEYS`
- Verify `keys` is a number between 1 and 12

### Exercise doesn't advance to next key
- Check that progression completion detection works
- Verify `Exercise` component receives correct progression length
- Check browser console for errors

## Summary Checklist

Before considering an exercise complete:

- [ ] Exercise configuration added to `exercise-config.js`
- [ ] Tests added and passing
- [ ] Documentation updated in `usage-ideas.md`
- [ ] Manual testing completed
- [ ] URL works correctly
- [ ] URL parameters work correctly
- [ ] Exercise loops correctly
- [ ] All existing tests still pass

## Notes

- The routing and component integration are automatic - you only need to add the exercise configuration
- All exercises automatically support URL parameters (`startKey`, `keys`)
- All exercises automatically loop continuously through keys
- The `Exercise` component handles all state management and progression logic
- Focus on creating a good `generateProgression` function - that's the core of each exercise

---

**Last Updated:** 2026-01-27
