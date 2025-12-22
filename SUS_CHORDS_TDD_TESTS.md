# TDD Test Plan: sus2 and sus4 Chord Support

## Test-Driven Development Approach

These tests should be written **before** implementing the code. They will guide the implementation and ensure we build the right functionality.

---

## Test File: `src/test/SusChords.test.js`

### Test Group 1: Chord Note Generation (getChordNotes)

**Purpose**: Verify that sus2 and sus4 chords generate the correct notes.

```javascript
describe('getChordNotes - Sus Chords', () => {
  it('should generate correct notes for C Sus2', () => {
    const notes = getChordNotes('C', 'sus2');
    expect(notes).toEqual(['C', 'D', 'G']);
  });

  it('should generate correct notes for C Sus4', () => {
    const notes = getChordNotes('C', 'sus4');
    expect(notes).toEqual(['C', 'F', 'G']);
  });

  it('should generate correct notes for F# Sus2', () => {
    const notes = getChordNotes('F#', 'sus2');
    expect(notes).toEqual(['F#', 'G#', 'C#']);
  });

  it('should generate correct notes for Bb Sus4', () => {
    const notes = getChordNotes('Bb', 'sus4');
    expect(notes).toEqual(['Bb', 'Eb', 'F']);
  });

  it('should handle all 12 roots for sus2', () => {
    const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    roots.forEach(root => {
      const notes = getChordNotes(root, 'sus2');
      expect(notes).toHaveLength(3);
      expect(notes[0]).toBe(root); // First note should be root
    });
  });

  it('should handle all 12 roots for sus4', () => {
    const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    roots.forEach(root => {
      const notes = getChordNotes(root, 'sus4');
      expect(notes).toHaveLength(3);
      expect(notes[0]).toBe(root); // First note should be root
    });
  });
});
```

**Why First**: This tests the core data structure. If `getChordNotes` works, we know the interval definitions are correct.

---

### Test Group 2: Chord Detection (identifyChord) - Basic Detection

**Purpose**: Verify that sus2 and sus4 chords are detected from MIDI notes.

```javascript
describe('identifyChord - Sus Chords Detection', () => {
  describe('sus2 Chord Detection', () => {
    it('should identify C Sus2 from MIDI notes 60, 62, 67', () => {
      // C4, D4, G4
      const activeNotes = [60, 62, 67];
      const result = identifyChord(activeNotes);

      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.type).toBe('sus2');
      expect(result.name).toBe('C Sus2');
    });

    it('should identify G Sus2 from MIDI notes 67, 69, 74', () => {
      // G4, A4, D5
      const activeNotes = [67, 69, 74];
      const result = identifyChord(activeNotes);

      expect(result).not.toBeNull();
      expect(result.root).toBe('G');
      expect(result.type).toBe('sus2');
      expect(result.name).toBe('G Sus2');
    });

    it('should identify F# Sus2 from MIDI notes 66, 68, 73', () => {
      // F#4, G#4, C#5
      const activeNotes = [66, 68, 73];
      const result = identifyChord(activeNotes);

      expect(result).not.toBeNull();
      expect(result.root).toBe('F#');
      expect(result.type).toBe('sus2');
      expect(result.name).toBe('F# Sus2');
    });
  });

  describe('sus4 Chord Detection', () => {
    it('should identify C Sus4 from MIDI notes 60, 65, 67', () => {
      // C4, F4, G4
      const activeNotes = [60, 65, 67];
      const result = identifyChord(activeNotes);

      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.type).toBe('sus4');
      expect(result.name).toBe('C Sus4');
    });

    it('should identify D Sus4 from MIDI notes 62, 67, 69', () => {
      // D4, G4, A4
      const activeNotes = [62, 67, 69];
      const result = identifyChord(activeNotes);

      expect(result).not.toBeNull();
      expect(result.root).toBe('D');
      expect(result.type).toBe('sus4');
      expect(result.name).toBe('D Sus4');
    });

    it('should identify A Sus4 from MIDI notes 69, 74, 76', () => {
      // A4, D5, E5
      const activeNotes = [69, 74, 76];
      const result = identifyChord(activeNotes);

      expect(result).not.toBeNull();
      expect(result.root).toBe('A');
      expect(result.type).toBe('sus4');
      expect(result.name).toBe('A Sus4');
    });
  });

  describe('Different Octaves', () => {
    it('should identify sus2 across different octaves', () => {
      // C3, D4, G5 - different octaves
      const activeNotes = [48, 62, 79];
      const result = identifyChord(activeNotes);

      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.type).toBe('sus2');
    });

    it('should identify sus4 across different octaves', () => {
      // C2, F3, G4 - different octaves
      const activeNotes = [36, 53, 67];
      const result = identifyChord(activeNotes);

      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.type).toBe('sus4');
    });
  });
});
```

**Why Second**: This tests the core detection logic. Once this works, we know chords can be identified from MIDI input.

---

### Test Group 3: Inversion Detection

**Purpose**: Verify that inversions of sus chords are detected correctly.

```javascript
describe('identifyChord - Sus Chords Inversions', () => {
  describe('sus2 Inversions', () => {
    it('should identify C Sus2 in root position', () => {
      // C4, D4, G4 (root in bass)
      const activeNotes = [60, 62, 67];
      const result = identifyChord(activeNotes);

      expect(result).not.toBeNull();
      expect(result.type).toBe('sus2');
      expect(result.inversion).toBe('Root Position');
    });

    it('should identify C Sus2 in 1st inversion (2nd in bass)', () => {
      // D4, G4, C5 (2nd in bass)
      const activeNotes = [62, 67, 72];
      const result = identifyChord(activeNotes);

      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.type).toBe('sus2');
      expect(result.inversion).toBe('1st Inversion');
    });

    it('should identify C Sus2 in 2nd inversion (5th in bass)', () => {
      // G4, C5, D5 (5th in bass)
      const activeNotes = [67, 72, 74];
      const result = identifyChord(activeNotes);

      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.type).toBe('sus2');
      expect(result.inversion).toBe('2nd Inversion');
    });
  });

  describe('sus4 Inversions', () => {
    it('should identify C Sus4 in root position', () => {
      // C4, F4, G4 (root in bass)
      const activeNotes = [60, 65, 67];
      const result = identifyChord(activeNotes);

      expect(result).not.toBeNull();
      expect(result.type).toBe('sus4');
      expect(result.inversion).toBe('Root Position');
    });

    it('should identify C Sus4 in 1st inversion (4th in bass)', () => {
      // F4, G4, C5 (4th in bass)
      const activeNotes = [65, 67, 72];
      const result = identifyChord(activeNotes);

      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.type).toBe('sus4');
      expect(result.inversion).toBe('1st Inversion');
    });

    it('should identify C Sus4 in 2nd inversion (5th in bass)', () => {
      // G4, C5, F5 (5th in bass)
      const activeNotes = [67, 72, 77];
      const result = identifyChord(activeNotes);

      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.type).toBe('sus4');
      expect(result.inversion).toBe('2nd Inversion');
    });
  });
});
```

**Why Third**: Inversions are important for real-world usage. This ensures the inversion detection logic works with sus chords.

---

### Test Group 4: Chord Name Parsing (parseChordName)

**Purpose**: Verify that sus chord names can be parsed from various formats.

```javascript
describe('parseChordName - Sus Chords', () => {
  describe('Short Format (e.g., "Csus2")', () => {
    it('should parse "Csus2" correctly', () => {
      const result = parseChordName('Csus2');
      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.chordType).toBe('sus2');
    });

    it('should parse "Csus4" correctly', () => {
      const result = parseChordName('Csus4');
      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.chordType).toBe('sus4');
    });

    it('should parse "F#sus2" correctly', () => {
      const result = parseChordName('F#sus2');
      expect(result).not.toBeNull();
      expect(result.root).toBe('F#');
      expect(result.chordType).toBe('sus2');
    });

    it('should parse "Bbsus4" correctly', () => {
      const result = parseChordName('Bbsus4');
      expect(result).not.toBeNull();
      expect(result.root).toBe('Bb');
      expect(result.chordType).toBe('sus4');
    });
  });

  describe('Full Format (e.g., "C Sus2")', () => {
    it('should parse "C Sus2" correctly', () => {
      const result = parseChordName('C Sus2');
      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.chordType).toBe('sus2');
    });

    it('should parse "C Sus4" correctly', () => {
      const result = parseChordName('C Sus4');
      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.chordType).toBe('sus4');
    });

    it('should parse "D# Sus2" correctly', () => {
      const result = parseChordName('D# Sus2');
      expect(result).not.toBeNull();
      expect(result.root).toBe('D#');
      expect(result.chordType).toBe('sus2');
    });

    it('should parse "G Sus4" correctly', () => {
      const result = parseChordName('G Sus4');
      expect(result).not.toBeNull();
      expect(result.root).toBe('G');
      expect(result.chordType).toBe('sus4');
    });
  });

  describe('Alternative Formats', () => {
    it('should parse "C Sus 2" (with space) correctly', () => {
      const result = parseChordName('C Sus 2');
      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.chordType).toBe('sus2');
    });

    it('should parse "C Sus 4" (with space) correctly', () => {
      const result = parseChordName('C Sus 4');
      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.chordType).toBe('sus4');
    });

    it('should parse "C Suspended 2" correctly', () => {
      const result = parseChordName('C Suspended 2');
      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.chordType).toBe('sus2');
    });

    it('should parse "C Suspended 4" correctly', () => {
      const result = parseChordName('C Suspended 4');
      expect(result).not.toBeNull();
      expect(result.root).toBe('C');
      expect(result.chordType).toBe('sus4');
    });
  });

  describe('Edge Cases', () => {
    it('should return null for invalid sus chord format', () => {
      const result = parseChordName('Csus');
      // Should return null or default to major
      expect(result).toBeDefined();
    });

    it('should handle case insensitivity', () => {
      const result1 = parseChordName('csus2');
      const result2 = parseChordName('CSUS2');
      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
      expect(result1.chordType).toBe('sus2');
      expect(result2.chordType).toBe('sus2');
    });
  });
});
```

**Why Fourth**: Parsing is needed for user input and progression building. This ensures sus chords can be entered in various formats.

---

### Test Group 5: Chord Suggestions (findPotentialChords)

**Purpose**: Verify that sus chords appear in suggestions when appropriate.

```javascript
describe('findPotentialChords - Sus Chords Suggestions', () => {
  it('should suggest C Sus2 when C and D are played', () => {
    // C4, D4 - missing the 5th
    const activeNotes = [60, 62];
    const suggestions = findPotentialChords(activeNotes);

    const sus2Suggestion = suggestions.find(s => s.type === 'sus2' && s.root === 'C');
    expect(sus2Suggestion).toBeDefined();
    expect(sus2Suggestion.missingNotes).toContain('G');
  });

  it('should suggest C Sus4 when C and F are played', () => {
    // C4, F4 - missing the 5th
    const activeNotes = [60, 65];
    const suggestions = findPotentialChords(activeNotes);

    const sus4Suggestion = suggestions.find(s => s.type === 'sus4' && s.root === 'C');
    expect(sus4Suggestion).toBeDefined();
    expect(sus4Suggestion.missingNotes).toContain('G');
  });

  it('should suggest C Sus2 when C and G are played', () => {
    // C4, G4 - missing the 2nd
    const activeNotes = [60, 67];
    const suggestions = findPotentialChords(activeNotes);

    const sus2Suggestion = suggestions.find(s => s.type === 'sus2' && s.root === 'C');
    expect(sus2Suggestion).toBeDefined();
    expect(sus2Suggestion.missingNotes).toContain('D');
  });

  it('should suggest C Sus4 when C and G are played', () => {
    // C4, G4 - missing the 4th
    const activeNotes = [60, 67];
    const suggestions = findPotentialChords(activeNotes);

    const sus4Suggestion = suggestions.find(s => s.type === 'sus4' && s.root === 'C');
    expect(sus4Suggestion).toBeDefined();
    expect(sus4Suggestion.missingNotes).toContain('F');
  });
});
```

**Why Fifth**: This tests integration with the suggestion system, which helps users discover chords.

---

### Test Group 6: Integration with Existing Functionality

**Purpose**: Ensure sus chords work with existing features.

```javascript
describe('Sus Chords Integration', () => {
  it('should work with getChordNotesAsMidi for sus2', () => {
    const midiNotes = getChordNotesAsMidi('C', 'sus2', 0, 4);
    // Should return [60, 62, 67] for C4, D4, G4
    expect(midiNotes).toContain(60); // C4
    expect(midiNotes).toContain(62); // D4
    expect(midiNotes).toContain(67); // G4
    expect(midiNotes).toHaveLength(3);
  });

  it('should work with getChordNotesAsMidi for sus4', () => {
    const midiNotes = getChordNotesAsMidi('C', 'sus4', 0, 4);
    // Should return [60, 65, 67] for C4, F4, G4
    expect(midiNotes).toContain(60); // C4
    expect(midiNotes).toContain(65); // F4
    expect(midiNotes).toContain(67); // G4
    expect(midiNotes).toHaveLength(3);
  });

  it('should work with getChordNotesAsMidi inversions for sus2', () => {
    const midiNotes = getChordNotesAsMidi('C', 'sus2', 1, 4);
    // 1st inversion: D in bass
    expect(midiNotes[0]).toBeLessThanOrEqual(62); // D4 or lower
  });

  it('should work with getChordNotesAsMidi inversions for sus4', () => {
    const midiNotes = getChordNotesAsMidi('C', 'sus4', 1, 4);
    // 1st inversion: F in bass
    expect(midiNotes[0]).toBeLessThanOrEqual(65); // F4 or lower
  });
});
```

**Why Sixth**: Ensures sus chords integrate with existing MIDI generation functions.

---

## Test Execution Order (TDD Workflow)

1. **Write Test Group 1** → Run (should fail) → Implement `CHORD_TYPES` → Run (should pass)
2. **Write Test Group 2** → Run (should fail) → Verify `identifyChord` works → Run (should pass)
3. **Write Test Group 3** → Run (should fail) → Verify inversion logic → Run (should pass)
4. **Write Test Group 4** → Run (should fail) → Implement `parseChordName` updates → Run (should pass)
5. **Write Test Group 5** → Run (should fail) → Verify `findPotentialChords` → Run (should pass)
6. **Write Test Group 6** → Run (should fail) → Verify integration → Run (should pass)

---

## Additional Tests to Consider

### Edge Cases
- What happens when sus2 and sus4 share notes with other chords? (Ambiguity resolution)
- What if notes are played in non-standard order?
- What if duplicate notes are played?

### Regression Tests
- Ensure existing chord types still work (major, minor, etc.)
- Ensure existing tests still pass

### Performance Tests (Optional)
- Does adding sus2/sus4 slow down chord detection?
- Are there any performance regressions?

---

## Test File Structure

```javascript
import { describe, it, expect } from 'vitest';
import { 
  getChordNotes, 
  identifyChord, 
  parseChordName, 
  findPotentialChords,
  getChordNotesAsMidi 
} from '../core/music-theory';

describe('Sus Chords Support', () => {
  // Test Group 1: getChordNotes
  // Test Group 2: identifyChord - Basic Detection
  // Test Group 3: identifyChord - Inversions
  // Test Group 4: parseChordName
  // Test Group 5: findPotentialChords
  // Test Group 6: Integration
});
```

---

## Success Criteria

All tests should:
- ✅ Pass after implementation
- ✅ Follow existing test patterns
- ✅ Use clear, descriptive names
- ✅ Include comments explaining MIDI note values
- ✅ Test both happy paths and edge cases
- ✅ Not break existing functionality

---

**Created**: 2025-01-27  
**Branch**: sus-me  
**Approach**: Test-Driven Development (TDD)

