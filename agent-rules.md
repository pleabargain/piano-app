<!-- https://github.com/pleabargain/piano-app -->
# Agent Coding Rules

This document contains coding rules and guidelines for development of this project.

## General Rules

1a. functions should only one input and one output. build unit tests to make sure that is true.

1. **Bug Fixing**: When a bug is discovered, add a unit test to isolate that bug and abstract the function causing the issue.

2. **Testing**: All new features and bug fixes should include appropriate unit tests to verify desired behavior.

3. **Error Handling**: Always include proper error handling and user-friendly error messages.

4. **Code Organization**: 
   - Keep functions focused and single-purpose
   - Abstract reusable logic into separate functions
   - Use descriptive function and variable names

5. **Documentation**: 
   - Include comments for complex logic
   - Update README.md with accurate timestamps (YYYY-MM-DD format at the bottom)
   - Document any breaking changes

## Testing Rules

1. **Test-Driven Development (TDD)**: 
   - **Write tests BEFORE implementing code** whenever possible
   - TDD helps clarify requirements and design before coding
   - Tests serve as executable documentation of expected behavior
   - Red-Green-Refactor cycle: Write failing test → Implement code → Refactor
   - Benefits:
     - Ensures code meets requirements from the start
     - Prevents over-engineering by focusing on what's needed
     - Creates safety net for refactoring
     - Improves code design by forcing testable architecture
   - When to use TDD:
     - New features or functionality
     - Bug fixes (write test that reproduces bug first)
     - Complex logic that needs careful validation
     - Critical user-facing features

2. **Unit Tests**: Create unit tests for:
   - Bug fixes (to prevent regression)
   - Core functionality
   - Abstracted functions

3. **Test Structure**: 
   - Use descriptive test names
   - Isolate bugs in separate test cases
   - Abstract functions being tested into testable units

4. **Test Coverage**: Aim for meaningful test coverage, especially for:
   - Critical user-facing features
   - Complex logic
   - Bug-prone areas

5. **Test Console Messages**: All tests must include console.log messages that clearly explain:
   - **WHAT** the test is doing (test description)
   - **WHY** the test is important (purpose and context)
   - **IMPORTANCE** of the test (impact on user experience or system reliability)
   - Test data values when relevant (e.g., MIDI note numbers, chord names)
   - Success confirmation when test passes
   - Format: Use `[Test]` prefix for all console messages
   - Example:
     ```javascript
     console.log('[Test] Testing C Major chord detection');
     console.log('[Test] WHY: Major chords are fundamental - users need accurate detection');
     console.log('[Test] IMPORTANCE: Validates core interval pattern [4, 7] works correctly');
     console.log('[Test] MIDI Notes: C4=60, E4=64, G4=67');
     // ... test code ...
     console.log('[Test] ✅ C Major correctly detected');
     ```
   - These messages help developers understand test purpose and aid debugging

## File Naming

- Scripts: Use ISO DATETIME format prepended to filename: `YYYY-MM-DDTHH-MM-SS_scriptname.js`
- Test files: Place in `src/test/` directory with `.test.jsx` or `.test.js` extension

## Code Quality

1. **Linting**: All code should pass ESLint checks
2. **Type Safety**: Use TypeScript where applicable, or add JSDoc type annotations
3. **Performance**: Consider performance implications of code changes
4. **Accessibility**: Ensure UI components are accessible

## UI/UX Rules

1. **Centering**: The UI should be centered in the browser horizontally. Use flexbox or CSS Grid to achieve proper centering of the main application container.

## React-Specific Rules

1. **Component Structure**: 
   - Use functional components with hooks
   - Keep components focused and composable
   - Extract complex logic into custom hooks when appropriate

2. **State Management**: 
   - Use useState for local component state
   - Use useEffect properly with dependency arrays
   - Avoid unnecessary re-renders

3. **Error Boundaries**: Implement error boundaries for better error handling

## Git Workflow

1. **Commits**: Write clear, descriptive commit messages
2. **Branches**: Use feature branches for new features
3. **Pull Requests**: Include tests and documentation updates

## User Interaction

1. **Question Format**: When clarification is needed, ask only one multiple choice question at a time and provide a clear description of the options.
2. **Multiple Choice Options**: Include "All of the above" as an option when applicable
3. **Question Logging**: All questions and answers must be logged in `instructions.md` with ISO datestamp format (YYYY-MM-DDTHH:MM:SS)
4. **One Question at a Time**: Ask one question at a time to avoid overwhelming the user

## Documentation Updates

- Update README.md with accurate YYYY-MM-DD timestamp at the bottom of the file
- Document API changes
- Update this file when new rules are established
- Log all user interaction questions and answers in instructions.md with ISO datestamp

---

Last Updated: 2025-01-27

