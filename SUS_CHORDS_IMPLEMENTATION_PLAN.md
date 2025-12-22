# Implementation Plan: Adding sus2 and sus4 Chord Support

## Overview
This plan outlines the steps needed to add support for suspended 2nd (sus2) and suspended 4th (sus4) chords to the piano-app codebase.

## Music Theory Background

### sus2 Chord
- **Intervals**: Root, Major 2nd (2 semitones), Perfect 5th (7 semitones)
- **Example**: Csus2 = C, D, G
- **MIDI Example**: C4 (60), D4 (62), G4 (67)

### sus4 Chord
- **Intervals**: Root, Perfect 4th (5 semitones), Perfect 5th (7 semitones)
- **Example**: Csus4 = C, F, G
- **MIDI Example**: C4 (60), F4 (65), G4 (67)

## Implementation Steps

### Step 1: Add sus2 and sus4 to CHORD_TYPES
**File**: `src/core/music-theory.js`  
**Location**: Lines 15-25

**Changes**:
- Add `sus2: { name: 'Sus2', intervals: [2, 7] }`
- Add `sus4: { name: 'Sus4', intervals: [5, 7] }`

**Rationale**: These are the interval definitions needed for chord generation and detection.

---

### Step 2: Update parseChordName() Function
**File**: `src/core/music-theory.js`  
**Location**: Lines 123-181

**Changes Required**:

#### 2a. Update typeMap (Full Name Format)
**Location**: Lines 133-143

Add to the `typeMap` object:
```javascript
'sus2': 'sus2',
'sus 2': 'sus2',
'suspended 2': 'sus2',
'sus4': 'sus4',
'sus 4': 'sus4',
'suspended 4': 'sus4',
```

#### 2b. Update Suffix Parsing (Short Format)
**Location**: Lines 157-178

Add after the existing suffix checks:
```javascript
else if (suffix === 'sus2' || suffix === 'sus2nd') {
  chordType = 'sus2';
} else if (suffix === 'sus4' || suffix === 'sus4th') {
  chordType = 'sus4';
}
```

**Rationale**: Supports both full names ("C Sus2", "C Sus4") and short formats ("Csus2", "Csus4").

---

### Step 3: Update normalizeChordName() in App.jsx
**File**: `src/App.jsx`  
**Location**: Lines 610-629

**Changes Required**:

Update the condition that checks for full format chords:
```javascript
if (name.includes('Major') || name.includes('Minor') || 
    name.includes('Diminished') || name.includes('Augmented') ||
    name.includes('Sus2') || name.includes('Sus4')) {
  return name;
}
```

**Rationale**: Ensures sus chords are recognized as full format and don't get incorrectly normalized.

---

### Step 4: Update getRomanNumeral() Function (Optional)
**File**: `src/core/music-theory.js`  
**Location**: Lines 258-277

**Consideration**: Sus chords are typically notated with "sus" in Roman numeral analysis (e.g., "Vsus4"). However, the current implementation may not need changes if sus chords are primarily used in chord practice mode rather than Roman numeral progressions.

**Decision**: Review if sus chords need special Roman numeral handling. If not needed immediately, this can be deferred.

---

### Step 5: Update Inversion Detection Logic
**File**: `src/core/music-theory.js`  
**Location**: Lines 234-244

**Consideration**: The current inversion detection logic works by checking if the bass note matches one of the chord's intervals. For sus2 and sus4:
- sus2 intervals: [2, 7] - bass can be root (0), 2nd (2), or 5th (7)
- sus4 intervals: [5, 7] - bass can be root (0), 4th (5), or 5th (7)

**Status**: The existing logic should work correctly for sus chords without changes, as it already checks if the bass interval is in the chord's intervals array.

---

### Step 6: Add Unit Tests
**File**: `src/test/ChordDetection.test.js`

**New Test Cases**:

1. **sus2 Chord Detection**
   ```javascript
   it('should identify C Sus2 from MIDI notes 60, 62, 67', () => {
     // C4, D4, G4
     const activeNotes = [60, 62, 67];
     const result = identifyChord(activeNotes);
     
     expect(result).not.toBeNull();
     expect(result.root).toBe('C');
     expect(result.type).toBe('sus2');
     expect(result.name).toBe('C Sus2');
   });
   ```

2. **sus4 Chord Detection**
   ```javascript
   it('should identify C Sus4 from MIDI notes 60, 65, 67', () => {
     // C4, F4, G4
     const activeNotes = [60, 65, 67];
     const result = identifyChord(activeNotes);
     
     expect(result).not.toBeNull();
     expect(result.root).toBe('C');
     expect(result.type).toBe('sus4');
     expect(result.name).toBe('C Sus4');
   });
   ```

3. **sus2 with Inversions**
   ```javascript
   it('should identify D Sus2 in 1st inversion from MIDI notes 62, 67, 74', () => {
     // D4, G4, D5 (2nd in bass)
     const activeNotes = [62, 67, 74];
     const result = identifyChord(activeNotes);
     
     expect(result).not.toBeNull();
     expect(result.root).toBe('D');
     expect(result.type).toBe('sus2');
     expect(result.inversion).toBe('1st Inversion');
   });
   ```

4. **sus4 with Inversions**
   ```javascript
   it('should identify G Sus4 in 2nd inversion from MIDI notes 72, 77, 79', () => {
     // G5, C6, D6 (4th in bass)
     const activeNotes = [72, 77, 79];
     const result = identifyChord(activeNotes);
     
     expect(result).not.toBeNull();
     expect(result.root).toBe('G');
     expect(result.type).toBe('sus4');
     expect(result.inversion).toBe('2nd Inversion');
   });
   ```

5. **parseChordName Tests**
   ```javascript
   it('should parse "Csus2" correctly', () => {
     const result = parseChordName('Csus2');
     expect(result.root).toBe('C');
     expect(result.chordType).toBe('sus2');
   });
   
   it('should parse "C Sus4" correctly', () => {
     const result = parseChordName('C Sus4');
     expect(result.root).toBe('C');
     expect(result.chordType).toBe('sus4');
   });
   ```

---

### Step 7: Update findPotentialChords() (No Changes Needed)
**File**: `src/core/music-theory.js`  
**Location**: Lines 279-325

**Status**: No changes required. The function already iterates through all `CHORD_TYPES`, so it will automatically include sus2 and sus4 once they're added to the `CHORD_TYPES` object.

---

### Step 8: Integration Testing

**Test Scenarios**:

1. **Chord Practice Mode**
   - Create a progression with sus2/sus4 chords
   - Verify they are detected correctly when played
   - Verify progression advances when correct sus chord is played

2. **Free Play Mode**
   - Play sus2 and sus4 chords on MIDI keyboard
   - Verify they are displayed correctly in the "Detected Chord" area
   - Verify chord suggestions include sus chords when appropriate

3. **Chord Suggestions**
   - Play partial notes that could form sus chords
   - Verify sus2/sus4 appear in suggestions when relevant

---

### Step 9: Edge Cases to Consider

1. **Ambiguity with Other Chords**
   - sus2 (C-D-G) shares notes with some other chords
   - sus4 (C-F-G) shares notes with some other chords
   - The brute-force matching in `identifyChord()` will return the first match
   - **Consideration**: May need to prioritize certain chord types or check for ambiguity

2. **Chord Name Format Consistency**
   - Ensure "C Sus2" vs "Csus2" both work
   - Ensure display format is consistent ("C Sus2" vs "C sus2")

3. **Roman Numeral Notation**
   - Sus chords in progressions may need special notation
   - Current implementation may handle this automatically

---

### Step 10: Documentation Updates

**Files to Update**:

1. **README.md**
   - Add sus2 and sus4 to the list of supported chord types
   - Update any chord examples if needed

2. **Code Comments**
   - Add comments explaining sus2/sus4 intervals
   - Document any special handling

---

## Implementation Order

1. ✅ Step 1: Add to CHORD_TYPES (Core definition)
2. ✅ Step 2: Update parseChordName() (Parsing support)
3. ✅ Step 3: Update normalizeChordName() (App.jsx compatibility)
4. ✅ Step 4: Review getRomanNumeral() (Optional, can defer)
5. ✅ Step 5: Verify inversion logic (Should work as-is)
6. ✅ Step 6: Add unit tests (Validation)
7. ✅ Step 7: Verify findPotentialChords() (Should work automatically)
8. ✅ Step 8: Integration testing (End-to-end validation)
9. ✅ Step 9: Handle edge cases (Polish)
10. ✅ Step 10: Update documentation (Completeness)

---

## Testing Checklist

- [ ] sus2 chord detection works for all 12 roots
- [ ] sus4 chord detection works for all 12 roots
- [ ] sus2 inversions are detected correctly
- [ ] sus4 inversions are detected correctly
- [ ] parseChordName handles "Csus2" format
- [ ] parseChordName handles "C Sus2" format
- [ ] parseChordName handles "C Sus4" format
- [ ] normalizeChordName recognizes sus chords
- [ ] Chord practice mode works with sus chords
- [ ] Free play mode displays sus chords correctly
- [ ] Chord suggestions include sus chords
- [ ] All existing tests still pass

---

## Notes

- Sus chords are triads (3 notes), so they fit the existing pattern
- The interval-based system should handle them seamlessly
- Main work is adding definitions and parsing support
- Inversion detection should work automatically with existing logic

---

**Created**: 2025-01-27  
**Branch**: sus-me  
**Status**: Planning Phase

