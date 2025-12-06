<!-- https://github.com/pleabargain/piano-app -->
# Piano App

A React-based piano training application built with Vite. Practice scales, chords, and free play with MIDI keyboard support.

## Screenshots

### Main Application View
![Main Application View](screenshots/main-view.png)
*Main interface showing piano keyboard and controls*

### Full Application Interface
![Full Application Interface](screenshots/full-app-view.png)
*Complete view with Circle of Fifths and all controls*

### Free Play Mode with Circle of Fifths
![Free Play Mode](screenshots/free-play-mode.png)
*Free Play mode with real-time chord detection and Circle of Fifths*

### Chord Practice Mode
![Chord Practice Mode](screenshots/chord-practice-mode.png)
*Chord Practice mode with progression builder*

### Chord Practice with Detection
![Chord Practice with Detection](screenshots/chord-practice-with-detection.png)
*Chord Practice mode showing target chord and detected chord side-by-side*

### Circle of Fifths and Chord Display
![Circle of Fifths and Chord Display](screenshots/chord-practice-complete-view.png)
*Interactive Circle of Fifths with detected chord display frame positioned to the right*

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
  - Visual feedback shows which chord and inversion is currently displayed on the piano
  - Transposable progressions - practice the same progression in any key

- **Free Play Mode**:
  - Play freely and see chord detection in real-time
  - Automatic chord identification with inversion detection
  - **Chord display frame**: Always-visible frame positioned next to Circle of Fifths
  - Shows detected chord name and inversion when playing, or "No chord detected" when idle
  - Educational feedback showing what you're playing

- **Lava Game Mode**:
  - Fun, interactive game mode to practice staying in key
  - **Visual Key Indicators**: 
    - **Blue keys = Good keys** (notes in the selected scale - safe to play)
    - **Red keys = Lava keys** (notes NOT in the scale - avoid these!)
  - **Real-time Scoring System**: 
    - Scores update instantly as keys are pressed
    - Tracks good keys hit (notes in scale)
    - Tracks lava keys hit (notes out of scale)
    - Score display positioned next to Circle of Fifths showing both counts in real-time
  - **Continuous Gameplay**: No time limit - play as long as you want
  - Perfect for practicing scale awareness and avoiding wrong notes
  - Animated lava keys with glowing red effect for visual feedback

### Pyramid Layout (split-keyboard branch)

The application features an innovative pyramid layout for integrated chord and scale practice:

#### Layout Structure

```
         ┌─────────────────┐
         │ Circle of Fifths│  (Top - Centered, Scaled)
         └─────────────────┘
    
┌──────────┐  ┌──────────┐  ┌──────────┐
│Extensions│  │  Chord   │  │  Scale   │  (Middle Row)
│          │  │ Practice │  │ Selector │
└──────────┘  └──────────┘  └──────────┘

┌──────────────┐            ┌──────────────┐
│ Chord Piano  │            │ Scale Piano  │  (Bottom Row)
│  (C2-C4)     │            │  (C4-C6)     │
└──────────────┘            └──────────────┘
```

#### Three-Row Design

1. **Top Row**: Interactive Circle of Fifths (centered, 70% scale)
   - No title for clean appearance
   - Click any chord segment to highlight it
   - Automatically reflects locked chord root

2. **Middle Row**: Three Information Panels
   - **Extensions Panel (Left)**: Shows chord extensions and variations
   - **Chord Practice (Center)**: Main chord detection and locking
   - **Scale Selector (Right)**: Choose scales for practice

3. **Bottom Row**: Two Interactive Piano Keyboards
   - **Left Piano (C2-C4)**: Chord practice with chord highlighting
   - **Right Piano (C4-C6)**: Scale practice with scale note highlighting

#### Extensions Panel Features

- **Auto-Detection**: Shows available chord extensions when a chord is detected
- **Smart Suggestions**: Displays up to 4 extensions/variations
- **Note Display**: Shows which notes to add (e.g., "+B" for Major 7th)
- **Purple Theme**: Distinct visual styling for quick identification
- **Examples**: 
  - Playing C-E-G shows: C Major 7 (+B), C Major 9 (+B, D), etc.
  - Playing D-F#-A shows: D Major 7 (+C#), D Dominant 7 (+C), etc.

#### Chord Locking Feature

- **Lock Button** (🔓): Click to lock the currently detected chord
- **Locked Display**: Shows with green gradient background and lock icon (🔒)
- **Persistent Display**: Chord remains visible even when keys are released
- **Root Filtering**: Locked chord root automatically filters scale selection
- **Unlock Button**: Release the locked chord at any time
- **Practice Workflow**:
  1. Play a chord (e.g., D Major)
  2. Click "Lock Chord" button
  3. Circle of Fifths updates to show D as root
  4. Scale Selector filters to show only D-based scales
  5. Practice D Major, D Minor, D Blues, etc.
  6. Unlock to switch to a different chord

#### Chord Detection Features

- **Real-Time Detection**: Instantly identifies played chords
- **Inversion Display**: Shows chord inversions (Root, 1st, 2nd, 3rd)
- **Extension Suggestions**: Recommends 7th, 9th, and other extended chords
- **Visual Feedback**: Highlights chord notes on left piano

#### Scale Selector Features

- **Root Note Filtering**: When chord is locked, only shows scales for that root
- **Locked Root Indicator**: Displays lock icon and root note (🔒 Root: D)
- **Scale Types Available**:
  - Major
  - Natural Minor
  - Harmonic Minor
  - Melodic Minor
  - Blues
- **Auto-Highlighting**: Selected scale notes highlighted on right piano
- **Info Messages**: Clear explanations of filtering behavior

#### Stable UI Design

- **Fixed Dimensions**: All panels have consistent min/max widths and heights
- **No Jumping**: UI remains stable when detecting chords or changing selections
- **Panel Sizes**:
  - Extensions: 240px width, 280px min-height
  - Chord Practice: 280px width, 280px min-height
  - Scale Selector: 280px width, 280px min-height

#### Integrated Practice Workflow Example

**Scenario: Learning D Major and its scales**

1. **Play D Major chord** (D-F#-A) on left piano
2. **View extensions** in left panel: D Major 7, D Dominant 7, etc.
3. **Lock the chord** using the lock button
4. **Circle of Fifths** highlights D as the root
5. **Scale Selector** filters to show: D Major, D Minor, D Harmonic Minor, D Blues
6. **Select D Major scale** from dropdown
7. **Right piano highlights** D Major scale notes (D-E-F#-G-A-B-C#-D)
8. **Practice the scale** on the right piano using the highlighted notes
9. **Switch to D Blues** for variety
10. **Unlock** when ready to practice a different chord/key


### Music Theory Features

- **Interactive Circle of Fifths**:
  - Traditional two-ring design matching standard music theory diagrams
  - **Outer ring**: Major keys with enharmonic equivalents (e.g., F#/Gb, Db/C#)
  - **Inner ring**: Relative minor keys with enharmonic equivalents
  - **Centered text labels**: All key names properly centered within their segments
  - Visual representation of the circle of fifths
  - Click any segment on the circle to instantly change the selected key
  - Highlights the currently selected key with blue color
  - Alternating light/dark segments for better visual distinction
  - Positioned alongside detected chord display for easy reference
  - **Dynamic Chord Animation**:
    - Real-time highlighting of the detected chord on the circle
    - **Active Major**: Dark blue highlighting for major chords
    - **Active Minor**: Light blue highlighting for minor chords
    - **Neighbor Highlighting**: Automatically highlights related keys (relative major/minor and adjacent fifths) to visualize harmonic relationships
  - Helps understand key relationships and music theory

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
- **Device Name Display**: Connected MIDI device name shown in the header for easy identification

### Keyboard Visualization

- **Configurable Keyboard Sizes**:
  - 88 Keys (A0-C8) - Full piano range
  - 76 Keys (E1-G7)
  - 61 Keys (C2-C7) - Default
  - 49 Keys (C2-C6)
  - 25 Keys (C3-C5)

- **Visual Features**:
  - Highlighted scale notes (yellow highlighting)
  - Active MIDI notes display (blue when pressed)
  - **Interactive chord highlighting**: Click chord buttons to highlight specific chord keys in blue
  - **Lava Game visuals**: 
    - Red keys for out-of-scale notes (lava keys) with animated glowing effect
    - Blue keys for in-scale notes (good keys)
    - All keys in lava mode are either red or blue - no default colors
  - Note labels on keys
  - Color-coded feedback (correct/incorrect notes)
  - Centered layout for optimal viewing experience
  - **Chord Display**: Detected chords shown prominently in controls and status areas
  - **Real-time Score Display**: Lava game score updates instantly as keys are pressed

## Project Structure

```
piano-app/
├── src/
│   ├── components/           # React components
│   │   ├── Piano.jsx         # Virtual piano keyboard component
│   │   ├── Controls.jsx      # Settings and mode controls
│   │   ├── ProgressionBuilder.jsx  # Chord progression input
│   │   ├── CircleOfFifths.jsx  # Interactive circle of fifths component
│   │   ├── ChordInfo.jsx     # Chord information and locking panel
│   │   └── ScaleSelector.jsx # Scale selection dropdown
│   ├── core/                 # Core music theory and MIDI logic
│   │   ├── music-theory.js   # Scale/chord calculations, chord detection
│   │   └── midi-manager.js   # Web MIDI API wrapper
│   ├── hooks/                # Custom React hooks
│   │   └── useChordDetection.js  # Chord detection hook
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
3. **Explore Chord Inversions**:
   - **Click any chord button** in the progression preview to see its keys highlighted on the piano
   - The piano keys will light up in blue showing exactly which keys to play for that chord
   - **Cycle through inversions**: Click the same chord button again to see the next inversion
   - Each click cycles through: Root Position → 1st Inversion → 2nd Inversion → 3rd Inversion → (back to Root)
   - A display below the progression shows which chord and inversion is currently highlighted
   - This helps you learn different voicings and fingerings for the same chord
4. **Practice**:
   - The app shows the current target chord (what you should play) in a card below the controls
   - **Real-time feedback**: As you play, the app detects and displays:
     - The chord name you're playing (e.g., "C Major", "D Minor 7")
     - The inversion (e.g., "Root Position", "1st Inversion")
   - Detected chord shown in the frame next to Circle of Fifths and in the target card
   - The chord display frame is always visible, showing "No chord detected" when idle
   - Play the target chord correctly to advance through the progression
   - Change the key to practice the same progression in different keys

### Free Play

1. Select "Free Play" mode
2. The chord display frame appears next to the Circle of Fifths (always visible)
3. Play any combination of notes on your MIDI keyboard
4. The app automatically detects and displays:
   - Chord name (e.g., "C Major", "D Minor 7")
   - Chord inversion (e.g., "Root Position", "1st Inversion")
5. When no chord is detected, the frame shows "No chord detected"
6. Scale notes are highlighted for reference on the keyboard
7. Use the Circle of Fifths to quickly change keys while playing

### Lava Game

1. Select your desired key and scale type (e.g., "C Major")
2. Choose "Lava Game" mode
3. **Visual Guide**:
   - **Blue keys = Good keys** (safe to play - these are in your selected scale)
   - **Red keys = Lava keys** (avoid these - they're NOT in your scale!)
4. **Gameplay**:
   - Play continuously on your MIDI keyboard
   - Try to hit only the blue (good) keys
   - Avoid the red (lava) keys
   - No time limit - play as long as you want
5. **Real-time Scoring**:
   - Score display positioned next to Circle of Fifths shows two counters:
     - **Good Keys**: Number of correct scale notes hit (displayed in blue)
     - **Lava Keys Hit**: Number of wrong notes (out of scale) hit (displayed in red)
   - **Scores update instantly** as you press keys - no delay
   - Watch your score change in real-time as you play
6. **Practice Tips**:
   - Start with a simple scale (like C Major) to get familiar
   - Focus on staying in key and avoiding the lava keys
   - Challenge yourself by trying different keys and scale types
   - Great for developing muscle memory and scale awareness

## Browser Compatibility

- **Chrome/Edge**: Full Web MIDI API support ✅
- **Firefox**: Limited MIDI support (may require polyfill)
- **Safari**: Limited MIDI support (may require polyfill)

**Note**: For best experience, use Chrome or Edge browser.

## Development

See `agent-rules.md` for coding rules and guidelines.

---

## UI/Design

- **Centered Layout**: The application interface is centered both horizontally and vertically in the browser for optimal viewing experience
- **Responsive Design**: Adapts to different screen sizes while maintaining centered layout
- **Dark Theme**: Modern dark theme optimized for extended practice sessions
- **Max Width**: Content is constrained to a maximum width of 1400px for better readability on large screens
- **Real-time Feedback**: Chord detection displayed in dedicated frame:
  - **Chord Display Frame**: Always-visible frame positioned to the right of Circle of Fifths
  - Shows detected chord name and inversion when playing
  - Displays "No chord detected" placeholder when idle
  - Target card (below controls in practice modes) shows both target and detected chords
- **Circle of Fifths**: White background with traditional two-ring design for clear visibility
- **Layout**: Circle of Fifths and chord display arranged side-by-side for optimal workflow

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

Last Updated: 2025-12-06
