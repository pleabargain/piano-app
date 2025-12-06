Goal
interactive piano trainer so that user can practice chord and scale practice accurately in the same UI in a web browser

review the agent-rules.md for any discrepancies before beginning

Ask only one question at a time. Format questions as MCQ.

this code is on the split-keyboard branch

I want three frames in a pyramid layout

see C:\Users\denni\OneDrive\Documents\piano-app\design-drawings\split piano layoutUntitled.png


center frame
contains circle of fifths without the title
the circle of fifths is interactive and can be clicked to play the chord. the chord will be displayed in the left frame below the circle of fifths


left frame contains two octave keyboard 
the user can choose to lock a chord e.g. D Major
left frame tells user what chord is being played
left frame tells user what chord might be  played if only 2 two keys are pressed
to the left of the chord frame put the extensions variations info box
see C:\Users\denni\OneDrive\Documents\piano-app\design-drawings\extensions to the left of the chord frame Untitled.png
set the frame size to reduce the UI from jumping around a bunch

right frame
contains a two octacve piano keyboard
the piano keyboard is interactive and shows the scales
The scales pull from the root chord in the left frame e.g. D Major
The user can pick to choose any of the many scales and match that key to D Major
The keyboard will highlight the scale in the right frame