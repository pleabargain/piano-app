
const CIRCLE_OF_FIFTHS = [
    { major: 'C', minor: 'Am', enharmonicMajor: null, enharmonicMinor: null },
    { major: 'G', minor: 'Em', enharmonicMajor: null, enharmonicMinor: null },
    { major: 'D', minor: 'Bm', enharmonicMajor: null, enharmonicMinor: null },
    { major: 'A', minor: 'F#m', enharmonicMajor: null, enharmonicMinor: null },
    { major: 'E', minor: 'C#m', enharmonicMajor: null, enharmonicMinor: null },
    { major: 'B', minor: 'G#m', enharmonicMajor: null, enharmonicMinor: 'Abm' },
    { major: 'F#', minor: 'D#m', enharmonicMajor: 'Gb', enharmonicMinor: 'Ebm' },
    { major: 'Db', minor: 'A#m', enharmonicMajor: 'C#', enharmonicMinor: 'Bbm' },
    { major: 'Ab', minor: 'Fm', enharmonicMajor: null, enharmonicMinor: null },
    { major: 'Eb', minor: 'Cm', enharmonicMajor: null, enharmonicMinor: null },
    { major: 'Bb', minor: 'Gm', enharmonicMajor: null, enharmonicMinor: null },
    { major: 'F', minor: 'Dm', enharmonicMajor: null, enharmonicMinor: null },
];

const NOTE_MAP = {
    'C': 'C',
    'G': 'G',
    'D': 'D',
    'A': 'A',
    'E': 'E',
    'B': 'B',
    'F#': 'F#',
    'Gb': 'F#',
    'C#': 'C#',
    'Db': 'C#',
    'Ab': 'G#',
    'Eb': 'D#',
    'Bb': 'A#',
    'F': 'F',
};

const getActiveKeys = (detectedChord) => {
    if (!detectedChord || typeof detectedChord !== 'object') return { major: [], minor: [] };

    const { name } = detectedChord;
    if (typeof name !== 'string') return { major: [], minor: [] };

    const parts = name.split(' ');
    const root = parts[0];
    const quality = parts.slice(1).join(' ').toLowerCase();
    const isMinor = quality.includes('minor');

    console.log(`Analyzing: ${name}`);
    console.log(`Root: ${root}, Quality: ${quality}, isMinor: ${isMinor}`);

    // Helper to map circle notes to app notes (sharps)
    const getAppNote = (circleNote) => NOTE_MAP[circleNote] || circleNote;

    // Find the center index
    let centerIndex = -1;

    if (isMinor) {
        centerIndex = CIRCLE_OF_FIFTHS.findIndex(k => {
            // Check primary minor key
            const minorRoot = k.minor.slice(0, -1); // Remove 'm'
            const appNote = getAppNote(minorRoot);
            console.log(`Checking ${k.minor} -> Root: ${minorRoot} -> AppNote: ${appNote} vs ${root}`);

            if (appNote === root) return true;

            // Check enharmonic minor key
            if (k.enharmonicMinor) {
                const enhMinorRoot = k.enharmonicMinor.slice(0, -1);
                const enhAppNote = getAppNote(enhMinorRoot);
                console.log(`Checking Enharmonic ${k.enharmonicMinor} -> Root: ${enhMinorRoot} -> AppNote: ${enhAppNote} vs ${root}`);
                if (enhAppNote === root) return true;
            }
            return false;
        });
    } else {
        centerIndex = CIRCLE_OF_FIFTHS.findIndex(k => {
            // Check primary major key
            if (getAppNote(k.major) === root) return true;

            // Check enharmonic major key
            if (k.enharmonicMajor) {
                if (getAppNote(k.enharmonicMajor) === root) return true;
            }
            return false;
        });
    }

    console.log(`Found Index: ${centerIndex}`);
    return centerIndex;
};

// Test Case 1: C Minor
getActiveKeys({ name: 'C Minor' });

// Test Case 2: Eb Minor (should match D#m or Ebm)
// Note: App uses sharps, so root might be D#
getActiveKeys({ name: 'D# Minor' });
