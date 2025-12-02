<!-- https://github.com/pleabargain/piano-app -->
# Piano App

A React-based piano training application built with Vite. Practice scales, chords, and free play with MIDI keyboard support.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Application

**Important**: This is a Vite project and must be run through Vite's development server. Do not open `index.html` directly in a browser.

To start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in the terminal).

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Testing

Run unit tests:
```bash
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

## Features

### Practice Modes

- **Scale Practice Mode**: 
  - Practice scales note-by-note with guided feedback
  - Visual highlighting of scale notes on the piano keyboard
  - Real-time feedback as you play each note in sequence
  - Supports all 12 keys (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
  - Scale types: Major, Natural Minor, Harmonic Minor, Melodic Minor

- **Chord Practice Mode**:
  - Practice custom chord progressions (e.g., "I IV V I")
  - Create and set your own progressions using Roman numeral notation
  - Automatic progression through chords with real-time feedback
  - Displays current target chord in both Roman numeral and letter notation
  - Transposable progressions - practice the same progression in any key

- **Free Play Mode**:
  - Play freely and see chord detection in real-time
  - Automatic chord identification with inversion detection
  - Displays detected chord name and inversion
  - Educational feedback showing what you're playing

### Music Theory Features

- **Scale Support**: 
  - Major scales (all 12 keys)
  - Natural Minor scales
  - Harmonic Minor scales
  - Melodic Minor scales

- **Chord Detection**:
  - Major, Minor, Diminished, Augmented triads
  - Major 7, Minor 7, Dominant 7 chords
  - Diminished 7, Half Diminished 7 chords
  - Automatic inversion detection (Root Position, 1st, 2nd, 3rd Inversion)

- **Custom Chord Progressions**:
  - Input progressions using Roman numeral notation (e.g., "I IV V ii")
  - Input validation for valid chord symbols
  - Preview progression in selected key
  - Automatic transposition to any key

### MIDI Integration

- **Web MIDI API Support**: Connect your MIDI keyboard or piano
- **Real-time Input Detection**: See which keys are being pressed
- **Visual Feedback**: Active notes highlighted on the virtual keyboard
- **Automatic Device Detection**: Connects to available MIDI devices

### Keyboard Visualization

- **Configurable Keyboard Sizes**:
  - 88 Keys (A0-C8) - Full piano range
  - 76 Keys (E1-G7)
  - 61 Keys (C2-C7) - Default
  - 49 Keys (C2-C6)
  - 25 Keys (C3-C5)

- **Visual Features**:
  - Highlighted scale notes
  - Active MIDI notes display
  - Note labels on keys
  - Color-coded feedback (correct/incorrect notes)

## Project Structure

```
piano-app/
├── src/
│   ├── components/           # React components
│   │   ├── Piano.jsx         # Virtual piano keyboard component
│   │   ├── Controls.jsx      # Settings and mode controls
│   │   └── ProgressionBuilder.jsx  # Chord progression input
│   ├── core/                 # Core music theory and MIDI logic
│   │   ├── music-theory.js   # Scale/chord calculations, chord detection
│   │   └── midi-manager.js   # Web MIDI API wrapper
│   ├── test/                 # Unit tests
│   │   ├── App.test.jsx      # App component tests
│   │   └── main.test.jsx     # Entry point tests
│   ├── App.jsx               # Main app component with state management
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styles
├── index.html                # HTML entry point
├── vite.config.js            # Vite configuration
├── vitest.config.js          # Vitest test configuration
└── agent-rules.md            # Coding rules and guidelines
```

## Usage Guide

### Getting Started

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Connect MIDI Keyboard** (optional):
   - When prompted, allow browser access to MIDI devices
   - Your MIDI keyboard will be automatically detected
   - If no MIDI device is available, you can still use the app visually

3. **Select Your Settings**:
   - **Key Center**: Choose the root note (C, C#, D, etc.)
   - **Scale Type**: Select Major, Natural Minor, Harmonic Minor, or Melodic Minor
   - **Mode**: Choose Scale Practice, Chord Practice, or Free Play
   - **Keyboard Size**: Adjust the virtual keyboard range

### Scale Practice

1. Select your desired key and scale type
2. Choose "Scale Practice" mode
3. The app will guide you to play each note of the scale in sequence
4. Play the highlighted target note to advance to the next note
5. Visual feedback shows correct/incorrect notes

### Chord Practice

1. Select "Chord Practice" mode
2. **Create a Progression**:
   - Enter a chord progression using Roman numerals (e.g., "I IV V I")
   - Click "Set Progression" to activate it
   - The progression will be displayed with both Roman and letter notation
3. **Practice**:
   - The app shows the current target chord
   - Play the target chord to advance through the progression
   - Change the key to practice the same progression in different keys

### Free Play

1. Select "Free Play" mode
2. Play any combination of notes on your MIDI keyboard
3. The app automatically detects and displays:
   - Chord name (e.g., "C Major", "D Minor 7")
   - Chord inversion (e.g., "Root Position", "1st Inversion")
4. Scale notes are highlighted for reference

## Browser Compatibility

- **Chrome/Edge**: Full Web MIDI API support ✅
- **Firefox**: Limited MIDI support (may require polyfill)
- **Safari**: Limited MIDI support (may require polyfill)

**Note**: For best experience, use Chrome or Edge browser.

## Development

See `agent-rules.md` for coding rules and guidelines.

---

## Technical Details

### Music Theory Implementation

- **Scale Calculation**: Uses interval patterns to generate scales
- **Chord Detection**: Analyzes pitch classes to identify chord types and inversions
- **Roman Numeral Analysis**: Converts chord progressions to Roman numeral notation
- **Note Normalization**: Handles enharmonic equivalents (C# = Db)

### MIDI Implementation

- Uses Web MIDI API (`navigator.requestMIDIAccess`)
- Tracks active notes in real-time
- Supports multiple MIDI input devices
- Handles MIDI device connection/disconnection events

### Testing

The project includes unit tests for:
- App component rendering
- Root element mounting
- Music theory functions (scales, chords)
- MIDI manager functionality

Run tests with `npm test` or `npm run test:ui` for interactive test interface.

---

Last Updated: 2025-01-27
