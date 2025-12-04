<!-- https://github.com/pleabargain/piano-app -->
# Piano Trainer Application - Development Prompt

## Project Overview
Create an interactive web-based piano training application that helps users learn major and minor scales and chords using MIDI input from their computer.

## Core Requirements

### 1. Scale Display & Learning
- Display all notes in a selected major or minor scale
- Visual representation of the scale on a piano keyboard
- Highlight which keys belong to the current scale
- Show scale degrees (1st, 2nd, 3rd, etc.) and their names (tonic, supertonic, mediant, etc.)
- Support all 12 major keys (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
- Support all 12 minor keys (natural minor, harmonic minor, melodic minor variations)

### 2. Chord Display & Learning
- Display all chords in a selected major or minor scale
- Show chord types: triads (major, minor, diminished, augmented), seventh chords, extended chords
- Visual representation of chords on a piano keyboard
- Display chord names in both Roman numeral notation (I, ii, iii, IV, V, vi, vii°) and alpha/letter notation (C, Dm, Em, F, G, Am, Bdim)
- Show chord progressions common to the selected key
- **Custom Chord Progression Builder**: Allow users to create and save custom chord progressions (e.g., I IV V ii)
- **Transposable Progressions**: Practice any custom progression in any key (e.g., I IV V ii in C Major = C F G Dm, in G Major = G C D Am)

### 3. MIDI Integration
- Connect to user's MIDI-enabled keyboard/piano via Web MIDI API
- Real-time detection of MIDI input
- Visual feedback when user plays correct notes/chords
- Practice mode: guide user to play specific scales or chords
- Recognition mode: identify what scale or chord the user is playing
- Show which keys are currently being pressed on the MIDI device

### 4. Interactive Features
- **Scale Practice Mode**: 
  - Select a key (major/minor)
  - Display the scale
  - User plays the scale, app provides feedback
  - Show correct/incorrect notes in real-time

- **Lava Game Mode**:
  - Select a key (major/minor)
  - Visual key indicators on the piano keyboard:
    - **Ice Blue keys = Good keys** (notes in the selected scale - safe to play)
    - **Red keys = Bad keys** (lava keys - notes NOT in the selected scale - avoid these!)
  - **Real-time scoring**: Scores update instantly as keys are pressed - tracks good keys hit and lava keys hit
  - Continuous gameplay with no time limit
  - Perfect for practicing scale awareness and avoiding wrong notes
  
- **Chord Practice Mode**:
  - Display chords in both Roman numerals (I, ii, iii, IV, V, vi, vii°) and alpha notation (C, Dm, Em, F, G, Am, Bdim)
  - Allow user to set custom chord progressions (e.g., I IV V ii, I vi IV V, ii V I)
  - User can practice the set chord progression in any key
  - Select a chord from the progression
  - Display the chord with both notations
  - User plays the chord, app provides feedback
  - Progress through the entire progression with guidance
  - Practice mode cycles through the progression automatically
  
- **Free Play Mode**:
  - User plays freely
  - App identifies and displays the scale/chord being played
  - Educational overlay showing music theory information

### 5. User Interface
- Clean, modern, responsive design
- Virtual piano keyboard visualization
- Key selection dropdown (major/minor keys)
- Mode selector (Scale Practice, Chord Practice, Free Play)
- **Chord Progression Builder**: Text input field for custom progressions (e.g., "I IV V ii")
  - Input validation for valid Roman numeral chord symbols
  - Preview of progression in selected key showing both Roman and alpha notation
  - Save/load custom progressions
- Progress tracking and statistics
- Visual feedback with colors:
  - Green: Correct note/chord
  - Red: Incorrect note
  - Blue: Currently playing
  - Yellow: Part of current scale/chord
- Display current chord in progression with both notations side-by-side

### 6. Educational Content
- Music theory explanations for each scale/chord
- Scale formula display (e.g., Major: W-W-H-W-W-W-H)
- Chord construction explanation (e.g., Major triad: Root + Major 3rd + Perfect 5th)
- Interval relationships
- Common uses and progressions

## Technical Specifications

### Technologies
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **MIDI**: Web MIDI API (navigator.requestMIDIAccess)
- **Audio**: Web Audio API for sound generation (optional)
- **Visualization**: Canvas API or SVG for piano keyboard rendering
- **Framework**: Vanilla JavaScript or lightweight framework (React/Vue if needed)

### Browser Compatibility
- Chrome/Edge (full Web MIDI API support)
- Firefox (may need polyfill or alternative approach)
- Safari (may need polyfill or alternative approach)

### MIDI Implementation
```javascript
// Request MIDI access
navigator.requestMIDIAccess()
  .then(access => {
    // Get MIDI inputs
    const inputs = access.inputs;
    // Listen for MIDI messages
    inputs.forEach(input => {
      input.onmidimessage = handleMIDIMessage;
    });
  });
```

## Features to Implement

### Phase 1: Basic Scale Display
- [ ] Create virtual piano keyboard component
- [ ] Implement scale calculation (major/minor)
- [ ] Display scale notes visually
- [ ] Key selection interface

### Phase 2: MIDI Integration
- [ ] Web MIDI API connection
- [ ] MIDI input detection
- [ ] Visual feedback for MIDI input
- [ ] Note recognition

### Phase 3: Chord Display
- [ ] Chord calculation from scales
- [ ] Chord visualization
- [ ] Display chords in both Roman numeral (I, ii, iii, IV, V, vi, vii°) and alpha notation (C, Dm, Em, F, G, Am, Bdim)
- [ ] Chord progression display
- [ ] Custom chord progression builder (user can input progression like "I IV V ii")
- [ ] Transpose custom progressions to any key
- [ ] Roman numeral analysis

### Phase 4: Practice Modes
- [ ] Scale practice mode with feedback
- [ ] Chord practice mode with feedback
- [ ] Free play with recognition
- [ ] Progress tracking

### Phase 5: Polish & Enhancement
- [ ] Educational content and tooltips
- [ ] Statistics and progress reports
- [ ] Responsive design
- [ ] Performance optimization

## User Experience Flow

1. **Initial Setup**:
   - User opens app
   - App requests MIDI access
   - User connects MIDI device
   - App detects and confirms connection

2. **Scale Learning**:
   - User selects a key (e.g., "C Major")
   - App displays the scale with highlighted keys
   - User selects "Practice Mode"
   - App guides user to play the scale
   - Real-time feedback as user plays

3. **Chord Learning**:
   - **Option A - Single Chord**: User selects a key and chord (e.g., "C Major - I chord")
     - App displays the chord in both Roman numeral (I) and alpha notation (C)
     - User plays the chord
     - App provides feedback
   
   - **Option B - Custom Progression**:
     - User creates/sets a custom chord progression (e.g., "I IV V ii")
     - User selects a key to practice the progression in (e.g., "C Major")
     - App displays the progression with both notations:
       - Roman: I IV V ii
       - Alpha: C F G Dm
     - User practices each chord in sequence
     - App guides through the progression with real-time feedback
     - User can change key and practice the same progression in different keys

4. **Free Play**:
   - User plays freely on MIDI keyboard
   - App recognizes and displays what's being played
   - Educational overlay shows music theory information

## Design Considerations

- **Accessibility**: Keyboard navigation, screen reader support
- **Mobile Responsive**: Touch-friendly controls for mobile devices
- **Performance**: Smooth real-time MIDI processing
- **Visual Clarity**: Clear distinction between scale notes, chord notes, and other keys
- **Educational**: Progressive disclosure of music theory concepts

## Future Enhancements (Optional)

- Metronome integration
- Recording and playback
- Multiple instrument support
- Gamification (scoring, achievements)
- Custom exercises
- Export progress data
- Social features (share progress, compete)

---

## Development Prompt for AI/Developer

Create a web-based piano training application with the following specifications:

**Core Functionality:**
1. Interactive virtual piano keyboard that displays all 88 keys
2. Scale display: Show all notes in any major or minor scale (all 12 keys)
3. Chord display: Show all chords within a selected scale
4. MIDI integration: Connect to user's MIDI keyboard via Web MIDI API
5. Real-time feedback: Visual indication when user plays correct/incorrect notes

**Key Features:**
- Select any major or minor key from dropdown
- Visual highlighting of scale notes on virtual keyboard
- Display chord names in both Roman numeral notation (I, ii, iii, IV, V, vi, vii°) and alpha/letter notation (C, Dm, Em, F, G, Am, Bdim)
- Custom chord progression builder: Allow users to create and set custom progressions (e.g., "I IV V ii")
- Transposable progressions: Practice any custom progression in any key (e.g., I IV V ii in C Major = C F G Dm, in G Major = G C D Am)
- Practice modes: Scale practice, Chord practice (single chord or custom progression), Free play
- MIDI input detection and visual feedback
- Music theory explanations (scale formulas, chord construction)

**Technical Requirements:**
- Use Web MIDI API for MIDI input
- Canvas or SVG for piano keyboard visualization
- Real-time MIDI message processing
- Responsive design
- Modern, clean UI

**User Flow:**
1. User connects MIDI device
2. Selects key (e.g., "C Major")
3. Views scale/chords visually
4. Practices with real-time feedback
5. Learns music theory concepts

Build a complete, working application with all features implemented and ready to use.

---

## User Interaction Log

### 2025-12-02T19:21:11

**Question**: For the Lava Game feature, how should scoring and gameplay mechanics work?

**Options**:
A) Players gain points for hitting good (blue) keys, and lose points for hitting bad (red) keys
B) Players only lose points for hitting bad (red) keys, no points gained for good keys
C) Continuous gameplay (play as long as you want)
D) Time limit or number of mistakes before game over
E) All of the above

**Answer**: C (Continuous gameplay - play as long as you want)

**Additional Requirements**: Keep score of good and bad keys

**Implementation Completed**: 2025-12-02T19:21:57

---

Last Updated: 2025-12-02T19:21:11

