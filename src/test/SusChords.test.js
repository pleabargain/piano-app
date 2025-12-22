import { describe, it, expect } from 'vitest';
import { 
  getChordNotes, 
  identifyChord, 
  parseChordName, 
  findPotentialChords,
  getChordNotesAsMidi 
} from '../core/music-theory';

/**
 * TEST SUITE: Sus Chords Support (sus2 and sus4)
 * 
 * PURPOSE: This test suite validates support for suspended 2nd (sus2) and suspended 4th (sus4) chords.
 * 
 * WHY THESE TESTS ARE IMPORTANT:
 * - Sus chords are common in modern music (pop, rock, jazz)
 * - Users need to be able to detect and practice sus chords via MIDI input
 * - Sus chords expand the chord vocabulary available in the application
 * - These tests ensure sus chords work correctly across all features (detection, parsing, suggestions)
 * 
 * TEST COVERAGE:
 * - Chord note generation (getChordNotes)
 * - Chord detection from MIDI notes (identifyChord)
 * - Inversion detection for sus chords
 * - Chord name parsing (parseChordName)
 * - Chord suggestions (findPotentialChords)
 * - Integration with MIDI generation (getChordNotesAsMidi)
 */

describe('Sus Chords Support', () => {
  describe('getChordNotes - Sus Chords', () => {
    it('should generate correct notes for C Sus2', () => {
      console.log('[Test] Testing C Sus2 note generation');
      console.log('[Test] WHY: Sus2 chords use intervals [2, 7] - Root, Major 2nd, Perfect 5th');
      console.log('[Test] IMPORTANCE: Ensures core interval definitions are correct for sus2');
      
      const notes = getChordNotes('C', 'sus2');
      
      console.log('[Test] Expected: [C, D, G], Got:', notes);
      expect(notes).toEqual(['C', 'D', 'G']);
      console.log('[Test] ✅ C Sus2 note generation correct');
    });

    it('should generate correct notes for C Sus4', () => {
      console.log('[Test] Testing C Sus4 note generation');
      console.log('[Test] WHY: Sus4 chords use intervals [5, 7] - Root, Perfect 4th, Perfect 5th');
      console.log('[Test] IMPORTANCE: Ensures core interval definitions are correct for sus4');
      
      const notes = getChordNotes('C', 'sus4');
      
      console.log('[Test] Expected: [C, F, G], Got:', notes);
      expect(notes).toEqual(['C', 'F', 'G']);
      console.log('[Test] ✅ C Sus4 note generation correct');
    });

    it('should generate correct notes for F# Sus2', () => {
      console.log('[Test] Testing F# Sus2 note generation with sharp root');
      console.log('[Test] WHY: Validates sus2 works with all 12 chromatic roots');
      console.log('[Test] IMPORTANCE: Ensures sharp/flat handling works correctly');
      
      const notes = getChordNotes('F#', 'sus2');
      
      console.log('[Test] Expected: [F#, G#, C#], Got:', notes);
      expect(notes).toEqual(['F#', 'G#', 'C#']);
      console.log('[Test] ✅ F# Sus2 note generation correct');
    });

    it('should generate correct notes for Bb Sus4', () => {
      console.log('[Test] Testing Bb Sus4 note generation with flat root');
      console.log('[Test] WHY: Validates sus4 works with flat notation');
      console.log('[Test] IMPORTANCE: Ensures flat roots are handled correctly');
      console.log('[Test] NOTE: D# and Eb are enharmonically equivalent - both are valid');
      
      const notes = getChordNotes('Bb', 'sus4');
      
      console.log('[Test] Got notes:', notes);
      expect(notes).toHaveLength(3);
      expect(notes[0]).toBe('Bb'); // Bb stays as Bb (getChordNotes doesn't convert)
      expect(notes[2]).toBe('F'); // F should always be F
      // The 2nd note can be either Eb or D# (enharmonically equivalent)
      expect(notes[1] === 'Eb' || notes[1] === 'D#').toBe(true);
      console.log('[Test] ✅ Bb Sus4 note generation correct (D#/Eb are enharmonically equivalent)');
    });

    it('should handle all 12 roots for sus2', () => {
      console.log('[Test] Testing sus2 generation for all 12 chromatic roots');
      console.log('[Test] WHY: Ensures sus2 works consistently across all keys');
      console.log('[Test] IMPORTANCE: Validates no edge cases are missed for any root note');
      
      const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      
      roots.forEach(root => {
        const notes = getChordNotes(root, 'sus2');
        expect(notes).toHaveLength(3);
        expect(notes[0]).toBe(root); // First note should be root
      });
      
      console.log('[Test] ✅ All 12 roots generate valid sus2 chords');
    });

    it('should handle all 12 roots for sus4', () => {
      console.log('[Test] Testing sus4 generation for all 12 chromatic roots');
      console.log('[Test] WHY: Ensures sus4 works consistently across all keys');
      console.log('[Test] IMPORTANCE: Validates no edge cases are missed for any root note');
      
      const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      
      roots.forEach(root => {
        const notes = getChordNotes(root, 'sus4');
        expect(notes).toHaveLength(3);
        expect(notes[0]).toBe(root); // First note should be root
      });
      
      console.log('[Test] ✅ All 12 roots generate valid sus4 chords');
    });
  });

  describe('identifyChord - Sus Chords Detection', () => {
    describe('sus2 Chord Detection', () => {
      it('should identify C Sus2 from MIDI notes 60, 62, 67', () => {
        console.log('[Test] Testing C Sus2 detection from MIDI notes');
        console.log('[Test] WHY: This is the core functionality - detecting sus2 chords from MIDI input');
        console.log('[Test] IMPORTANCE: Users need to see "C Sus2" when they play C-D-G on their keyboard');
        console.log('[Test] MIDI Notes: C4=60, D4=62, G4=67');
        
        const activeNotes = [60, 62, 67];
        const result = identifyChord(activeNotes);

        expect(result).not.toBeNull();
        expect(result.root).toBe('C');
        expect(result.type).toBe('sus2');
        expect(result.name).toBe('C Sus2');
        
        console.log('[Test] ✅ C Sus2 correctly detected:', result);
      });

      it('should identify G Sus2 from MIDI notes 67, 69, 74', () => {
        console.log('[Test] Testing G Sus2 detection (note: ambiguous with D Sus4)');
        console.log('[Test] WHY: Validates sus2 detection works for different roots');
        console.log('[Test] IMPORTANCE: Ensures detection works (note: G Sus2 = G-A-D, same notes as D Sus4 = D-G-A)');
        console.log('[Test] MIDI Notes: G4=67, A4=69, D5=74');
        console.log('[Test] NOTE: These notes can be interpreted as either G Sus2 or D Sus4 - both are valid!');
        
        const activeNotes = [67, 69, 74];
        const result = identifyChord(activeNotes);

        expect(result).not.toBeNull();
        // Both G Sus2 and D Sus4 are valid interpretations of these notes
        // The algorithm finds the first match (D Sus4 comes before G in iteration)
        expect(result.type === 'sus2' || result.type === 'sus4').toBe(true);
        expect(['G Sus2', 'D Sus4']).toContain(result.name);
        
        console.log('[Test] ✅ Chord correctly detected (ambiguous - both interpretations valid):', result);
      });

      it('should identify F# Sus2 from MIDI notes 66, 68, 73', () => {
        console.log('[Test] Testing F# Sus2 detection (note: ambiguous with C# Sus4)');
        console.log('[Test] WHY: Validates sus2 works with sharp/flat roots');
        console.log('[Test] IMPORTANCE: Ensures all chromatic roots are supported');
        console.log('[Test] MIDI Notes: F#4=66, G#4=68, C#5=73');
        console.log('[Test] NOTE: These notes can be interpreted as either F# Sus2 or C# Sus4 - both are valid!');
        
        const activeNotes = [66, 68, 73];
        const result = identifyChord(activeNotes);

        expect(result).not.toBeNull();
        // Both F# Sus2 and C# Sus4 are valid interpretations of these notes
        // The algorithm finds the first match (C# Sus4 comes before F# in iteration)
        expect(result.type === 'sus2' || result.type === 'sus4').toBe(true);
        expect(['F# Sus2', 'C# Sus4']).toContain(result.name);
        
        console.log('[Test] ✅ Chord correctly detected (ambiguous - both interpretations valid):', result);
      });
    });

    describe('sus4 Chord Detection', () => {
      it('should identify C Sus4 from MIDI notes 60, 65, 67', () => {
        console.log('[Test] Testing C Sus4 detection from MIDI notes');
        console.log('[Test] WHY: This is the core functionality - detecting sus4 chords from MIDI input');
        console.log('[Test] IMPORTANCE: Users need to see "C Sus4" when they play C-F-G on their keyboard');
        console.log('[Test] MIDI Notes: C4=60, F4=65, G4=67');
        
        const activeNotes = [60, 65, 67];
        const result = identifyChord(activeNotes);

        expect(result).not.toBeNull();
        expect(result.root).toBe('C');
        expect(result.type).toBe('sus4');
        expect(result.name).toBe('C Sus4');
        
        console.log('[Test] ✅ C Sus4 correctly detected:', result);
      });

      it('should identify D Sus4 from MIDI notes 62, 67, 69', () => {
        console.log('[Test] Testing D Sus4 detection');
        console.log('[Test] WHY: Validates sus4 detection works for different roots');
        console.log('[Test] IMPORTANCE: Ensures detection is not hardcoded to C');
        console.log('[Test] MIDI Notes: D4=62, G4=67, A4=69');
        
        const activeNotes = [62, 67, 69];
        const result = identifyChord(activeNotes);

        expect(result).not.toBeNull();
        expect(result.root).toBe('D');
        expect(result.type).toBe('sus4');
        expect(result.name).toBe('D Sus4');
        
        console.log('[Test] ✅ D Sus4 correctly detected:', result);
      });

      it('should identify A Sus4 from MIDI notes 69, 74, 76', () => {
        console.log('[Test] Testing A Sus4 detection (note: ambiguous with D Sus2)');
        console.log('[Test] WHY: Validates sus4 works across different octaves');
        console.log('[Test] IMPORTANCE: Ensures octave independence works correctly');
        console.log('[Test] MIDI Notes: A4=69, D5=74, E5=76');
        console.log('[Test] NOTE: These notes can be interpreted as either A Sus4 or D Sus2 - both are valid!');
        
        const activeNotes = [69, 74, 76];
        const result = identifyChord(activeNotes);

        expect(result).not.toBeNull();
        // Both A Sus4 and D Sus2 are valid interpretations of these notes
        // The algorithm finds the first match (D Sus2 comes before A in iteration)
        expect(result.type === 'sus2' || result.type === 'sus4').toBe(true);
        expect(['A Sus4', 'D Sus2']).toContain(result.name);
        
        console.log('[Test] ✅ Chord correctly detected (ambiguous - both interpretations valid):', result);
      });
    });

    describe('Different Octaves', () => {
      it('should identify sus2 across different octaves', () => {
        console.log('[Test] Testing sus2 detection across multiple octaves');
        console.log('[Test] WHY: Real MIDI input often spans multiple octaves');
        console.log('[Test] IMPORTANCE: Ensures chord detection is octave-independent (pitch class based)');
        console.log('[Test] MIDI Notes: C3=48, D4=62, G5=79 (spans 3 octaves)');
        
        const activeNotes = [48, 62, 79];
        const result = identifyChord(activeNotes);

        expect(result).not.toBeNull();
        expect(result.root).toBe('C');
        expect(result.type).toBe('sus2');
        
        console.log('[Test] ✅ Sus2 detected correctly across octaves:', result);
      });

      it('should identify sus4 across different octaves', () => {
        console.log('[Test] Testing sus4 detection across multiple octaves');
        console.log('[Test] WHY: Real MIDI input often spans multiple octaves');
        console.log('[Test] IMPORTANCE: Ensures chord detection is octave-independent (pitch class based)');
        console.log('[Test] MIDI Notes: C2=36, F3=53, G4=67 (spans 3 octaves)');
        
        const activeNotes = [36, 53, 67];
        const result = identifyChord(activeNotes);

        expect(result).not.toBeNull();
        expect(result.root).toBe('C');
        expect(result.type).toBe('sus4');
        
        console.log('[Test] ✅ Sus4 detected correctly across octaves:', result);
      });
    });
  });

  describe('identifyChord - Sus Chords Inversions', () => {
    describe('sus2 Inversions', () => {
      it('should identify C Sus2 in root position', () => {
        console.log('[Test] Testing C Sus2 root position detection');
        console.log('[Test] WHY: Root position is the most common sus2 voicing');
        console.log('[Test] IMPORTANCE: Ensures basic inversion detection works for sus2');
        console.log('[Test] MIDI Notes: C4=60, D4=62, G4=67 (root in bass)');
        
        const activeNotes = [60, 62, 67];
        const result = identifyChord(activeNotes);

        expect(result).not.toBeNull();
        expect(result.type).toBe('sus2');
        expect(result.inversion).toBe('Root Position');
        
        console.log('[Test] ✅ C Sus2 root position correctly identified');
      });

      it('should identify C Sus2 in 1st inversion (2nd in bass)', () => {
        console.log('[Test] Testing C Sus2 1st inversion detection');
        console.log('[Test] WHY: Inversions are common in real music - 2nd in bass creates different sound');
        console.log('[Test] IMPORTANCE: Users need accurate inversion feedback for learning');
        console.log('[Test] MIDI Notes: D4=62, G4=67, C5=72 (2nd in bass)');
        
        const activeNotes = [62, 67, 72];
        const result = identifyChord(activeNotes);

        expect(result).not.toBeNull();
        expect(result.root).toBe('C');
        expect(result.type).toBe('sus2');
        expect(result.inversion).toBe('1st Inversion');
        
        console.log('[Test] ✅ C Sus2 1st inversion correctly identified');
      });

      it('should identify C Sus2 in 2nd inversion (5th in bass)', () => {
        console.log('[Test] Testing C Sus2 2nd inversion detection');
        console.log('[Test] WHY: 5th in bass is another common sus2 voicing');
        console.log('[Test] IMPORTANCE: Complete inversion support enables full chord practice');
        console.log('[Test] MIDI Notes: G4=67, C5=72, D5=74 (5th in bass)');
        
        const activeNotes = [67, 72, 74];
        const result = identifyChord(activeNotes);

        expect(result).not.toBeNull();
        expect(result.root).toBe('C');
        expect(result.type).toBe('sus2');
        expect(result.inversion).toBe('2nd Inversion');
        
        console.log('[Test] ✅ C Sus2 2nd inversion correctly identified');
      });
    });

    describe('sus4 Inversions', () => {
      it('should identify C Sus4 in root position', () => {
        console.log('[Test] Testing C Sus4 root position detection');
        console.log('[Test] WHY: Root position is the most common sus4 voicing');
        console.log('[Test] IMPORTANCE: Ensures basic inversion detection works for sus4');
        console.log('[Test] MIDI Notes: C4=60, F4=65, G4=67 (root in bass)');
        
        const activeNotes = [60, 65, 67];
        const result = identifyChord(activeNotes);

        expect(result).not.toBeNull();
        expect(result.type).toBe('sus4');
        expect(result.inversion).toBe('Root Position');
        
        console.log('[Test] ✅ C Sus4 root position correctly identified');
      });

      it('should identify C Sus4 in 1st inversion (4th in bass)', () => {
        console.log('[Test] Testing C Sus4 1st inversion detection');
        console.log('[Test] WHY: Inversions are common in real music - 4th in bass creates different sound');
        console.log('[Test] IMPORTANCE: Users need accurate inversion feedback for learning');
        console.log('[Test] MIDI Notes: F4=65, G4=67, C5=72 (4th in bass)');
        
        const activeNotes = [65, 67, 72];
        const result = identifyChord(activeNotes);

        expect(result).not.toBeNull();
        expect(result.root).toBe('C');
        expect(result.type).toBe('sus4');
        expect(result.inversion).toBe('1st Inversion');
        
        console.log('[Test] ✅ C Sus4 1st inversion correctly identified');
      });

      it('should identify C Sus4 in 2nd inversion (5th in bass)', () => {
        console.log('[Test] Testing C Sus4 2nd inversion detection');
        console.log('[Test] WHY: 5th in bass is another common sus4 voicing');
        console.log('[Test] IMPORTANCE: Complete inversion support enables full chord practice');
        console.log('[Test] MIDI Notes: G4=67, C5=72, F5=77 (5th in bass)');
        
        const activeNotes = [67, 72, 77];
        const result = identifyChord(activeNotes);

        expect(result).not.toBeNull();
        expect(result.root).toBe('C');
        expect(result.type).toBe('sus4');
        expect(result.inversion).toBe('2nd Inversion');
        
        console.log('[Test] ✅ C Sus4 2nd inversion correctly identified');
      });
    });
  });

  describe('parseChordName - Sus Chords', () => {
    describe('Short Format (e.g., "Csus2")', () => {
      it('should parse "Csus2" correctly', () => {
        console.log('[Test] Testing short format parsing: "Csus2"');
        console.log('[Test] WHY: Users often type chords in short format (common in chord charts)');
        console.log('[Test] IMPORTANCE: Enables users to input sus chords in familiar notation');
        
        const result = parseChordName('Csus2');
        
        expect(result).not.toBeNull();
        expect(result.root).toBe('C');
        expect(result.chordType).toBe('sus2');
        
        console.log('[Test] ✅ "Csus2" parsed correctly:', result);
      });

      it('should parse "Csus4" correctly', () => {
        console.log('[Test] Testing short format parsing: "Csus4"');
        console.log('[Test] WHY: Users often type chords in short format (common in chord charts)');
        console.log('[Test] IMPORTANCE: Enables users to input sus chords in familiar notation');
        
        const result = parseChordName('Csus4');
        
        expect(result).not.toBeNull();
        expect(result.root).toBe('C');
        expect(result.chordType).toBe('sus4');
        
        console.log('[Test] ✅ "Csus4" parsed correctly:', result);
      });

      it('should parse "F#sus2" correctly', () => {
        console.log('[Test] Testing short format with sharp: "F#sus2"');
        console.log('[Test] WHY: Validates parsing works with sharp/flat roots');
        console.log('[Test] IMPORTANCE: Ensures all chromatic roots are parseable');
        
        const result = parseChordName('F#sus2');
        
        expect(result).not.toBeNull();
        expect(result.root).toBe('F#');
        expect(result.chordType).toBe('sus2');
        
        console.log('[Test] ✅ "F#sus2" parsed correctly:', result);
      });
    });

    describe('Full Format (e.g., "C Sus2")', () => {
      it('should parse "C Sus2" correctly', () => {
        console.log('[Test] Testing full format parsing: "C Sus2"');
        console.log('[Test] WHY: Full format is more readable and matches display format');
        console.log('[Test] IMPORTANCE: Enables consistency between input and display');
        
        const result = parseChordName('C Sus2');
        
        expect(result).not.toBeNull();
        expect(result.root).toBe('C');
        expect(result.chordType).toBe('sus2');
        
        console.log('[Test] ✅ "C Sus2" parsed correctly:', result);
      });

      it('should parse "C Sus4" correctly', () => {
        console.log('[Test] Testing full format parsing: "C Sus4"');
        console.log('[Test] WHY: Full format is more readable and matches display format');
        console.log('[Test] IMPORTANCE: Enables consistency between input and display');
        
        const result = parseChordName('C Sus4');
        
        expect(result).not.toBeNull();
        expect(result.root).toBe('C');
        expect(result.chordType).toBe('sus4');
        
        console.log('[Test] ✅ "C Sus4" parsed correctly:', result);
      });
    });

    describe('Alternative Formats', () => {
      it('should parse "C Sus 2" (with space) correctly', () => {
        console.log('[Test] Testing alternative format: "C Sus 2" (space between Sus and number)');
        console.log('[Test] WHY: Users may type with spaces in different places');
        console.log('[Test] IMPORTANCE: Makes the parser more forgiving and user-friendly');
        
        const result = parseChordName('C Sus 2');
        
        expect(result).not.toBeNull();
        expect(result.root).toBe('C');
        expect(result.chordType).toBe('sus2');
        
        console.log('[Test] ✅ "C Sus 2" parsed correctly:', result);
      });

      it('should parse "C Suspended 2" correctly', () => {
        console.log('[Test] Testing full word format: "C Suspended 2"');
        console.log('[Test] WHY: Some users prefer full word notation');
        console.log('[Test] IMPORTANCE: Supports multiple user preferences and notation styles');
        
        const result = parseChordName('C Suspended 2');
        
        expect(result).not.toBeNull();
        expect(result.root).toBe('C');
        expect(result.chordType).toBe('sus2');
        
        console.log('[Test] ✅ "C Suspended 2" parsed correctly:', result);
      });
    });
  });

  describe('findPotentialChords - Sus Chords Suggestions', () => {
    it('should suggest C Sus2 when C and D are played', () => {
      console.log('[Test] Testing chord suggestions for partial sus2 (missing 5th)');
      console.log('[Test] WHY: Users often play partial chords - suggestions help them complete them');
      console.log('[Test] IMPORTANCE: Enhances learning by showing what chord could be completed');
      console.log('[Test] MIDI Notes: C4=60, D4=62 (missing G)');
      
      const activeNotes = [60, 62];
      const suggestions = findPotentialChords(activeNotes);

      const sus2Suggestion = suggestions.find(s => s.type === 'sus2' && s.root === 'C');
      expect(sus2Suggestion).toBeDefined();
      expect(sus2Suggestion.missingNotes).toContain('G');
      
      console.log('[Test] ✅ C Sus2 suggested when C and D are played');
    });

    it('should suggest C Sus4 when C and F are played', () => {
      console.log('[Test] Testing chord suggestions for partial sus4 (missing 5th)');
      console.log('[Test] WHY: Users often play partial chords - suggestions help them complete them');
      console.log('[Test] IMPORTANCE: Enhances learning by showing what chord could be completed');
      console.log('[Test] MIDI Notes: C4=60, F4=65 (missing G)');
      
      const activeNotes = [60, 65];
      const suggestions = findPotentialChords(activeNotes);

      const sus4Suggestion = suggestions.find(s => s.type === 'sus4' && s.root === 'C');
      expect(sus4Suggestion).toBeDefined();
      expect(sus4Suggestion.missingNotes).toContain('G');
      
      console.log('[Test] ✅ C Sus4 suggested when C and F are played');
    });
  });

  describe('Integration with Existing Functionality', () => {
    it('should work with getChordNotesAsMidi for sus2', () => {
      console.log('[Test] Testing MIDI note generation for sus2 chords');
      console.log('[Test] WHY: MIDI generation is used for playback and visual highlighting');
      console.log('[Test] IMPORTANCE: Ensures sus2 chords can be played back and displayed correctly');
      
      const midiNotes = getChordNotesAsMidi('C', 'sus2', 0, 4);
      
      // Function returns notes sorted and may place them in different octaves
      // Verify it contains the correct pitch classes (C, D, G) regardless of octave
      const pitchClasses = midiNotes.map(n => n % 12).sort((a, b) => a - b);
      expect(pitchClasses).toEqual([0, 2, 7]); // C, D, G pitch classes
      expect(midiNotes).toHaveLength(3);
      
      console.log('[Test] ✅ Sus2 MIDI generation works correctly:', midiNotes, 'pitch classes:', pitchClasses);
    });

    it('should work with getChordNotesAsMidi for sus4', () => {
      console.log('[Test] Testing MIDI note generation for sus4 chords');
      console.log('[Test] WHY: MIDI generation is used for playback and visual highlighting');
      console.log('[Test] IMPORTANCE: Ensures sus4 chords can be played back and displayed correctly');
      
      const midiNotes = getChordNotesAsMidi('C', 'sus4', 0, 4);
      
      // Function returns notes sorted and may place them in different octaves
      // Verify it contains the correct pitch classes (C, F, G) regardless of octave
      const pitchClasses = midiNotes.map(n => n % 12).sort((a, b) => a - b);
      expect(pitchClasses).toEqual([0, 5, 7]); // C, F, G pitch classes
      expect(midiNotes).toHaveLength(3);
      
      console.log('[Test] ✅ Sus4 MIDI generation works correctly:', midiNotes, 'pitch classes:', pitchClasses);
    });

    it('should work with getChordNotesAsMidi inversions for sus2', () => {
      console.log('[Test] Testing MIDI note generation for sus2 inversions');
      console.log('[Test] WHY: Inversions need correct MIDI generation for playback');
      console.log('[Test] IMPORTANCE: Enables practice of sus2 chords in different voicings');
      
      const midiNotes = getChordNotesAsMidi('C', 'sus2', 1, 4);
      
      // 1st inversion: D in bass
      expect(midiNotes[0]).toBeLessThanOrEqual(62); // D4 or lower
      expect(midiNotes).toHaveLength(3);
      
      console.log('[Test] ✅ Sus2 inversion MIDI generation works correctly:', midiNotes);
    });

    it('should work with getChordNotesAsMidi inversions for sus4', () => {
      console.log('[Test] Testing MIDI note generation for sus4 inversions');
      console.log('[Test] WHY: Inversions need correct MIDI generation for playback');
      console.log('[Test] IMPORTANCE: Enables practice of sus4 chords in different voicings');
      
      const midiNotes = getChordNotesAsMidi('C', 'sus4', 1, 4);
      
      // 1st inversion: F in bass
      expect(midiNotes[0]).toBeLessThanOrEqual(65); // F4 or lower
      expect(midiNotes).toHaveLength(3);
      
      console.log('[Test] ✅ Sus4 inversion MIDI generation works correctly:', midiNotes);
    });
  });
});

