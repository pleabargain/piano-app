# User Defined Agent Rules

1. **Check for Latest Library Versions**: At the beginning of a project or when starting work, always check if the project is using the latest versions of its dependencies. Use `npm outdated` or `npm view <package> version` to check for updates. Update dependencies to their latest stable versions unless there are specific compatibility reasons not to. This helps ensure the project benefits from the latest features, bug fixes, and security patches.
2. **Create Limit and Regression Tests**: Always create unit and regression tests to make sure that no functionality is lost when refactoring or adding features.
3. **Granular Testing**: If a test fails, stop running it repeatedly. Instead, create new, more granular tests for each specific function or component connected to the failing test to isolate the issue.
4. **File Save UI**: When a user wants to save a file, the application must show a UI dialog that allows the user to navigate the current root directory (or file system) to choose where to save the file. The default filename must use ISO timestamp format: YYYY-MM-DD-HH-MM-SS (e.g., 2026-01-09-14-30-45).
5. **Best Practices for Debugging User Interfaces**:
   - **Isolate the Problem**: When debugging UI issues, create specific unit tests that test individual functions/components in isolation rather than end-to-end tests that may mask the root cause.
   - **Mock Browser APIs Thoroughly**: When testing features that use browser APIs (File System Access API, URL.createObjectURL, IndexedDB, etc.), mock these APIs comprehensively:
     - Test both success and failure paths
     - Mock edge cases (API not available, permission denied, user cancellation, etc.)
     - Verify error handling and fallback mechanisms
   - **Test Error Paths Explicitly**: Don't just test happy paths. Write tests for:
     - Invalid input data
     - API failures
     - Network errors
     - Permission denials
     - User cancellations
   - **Verify User Feedback**: When errors occur, ensure users receive clear, actionable error messages. Test that error messages are displayed correctly in the UI.
   - **Check API Availability**: Before using browser APIs, verify they exist and are callable (e.g., `typeof window !== 'undefined' && 'showSaveFilePicker' in window && typeof window.showSaveFilePicker === 'function'`).
   - **Test Fallback Mechanisms**: If a primary method fails, ensure fallback mechanisms work correctly and are tested.
   - **Component State Management**: When debugging React components, verify that state updates correctly and that errors don't leave components in inconsistent states.
   - **Async Error Handling**: Ensure async operations (promises, async/await) have proper error handling and that errors are caught and displayed to users.
6. **Error Logging to Browser Console**: All validation errors, parsing errors, and runtime errors must be logged to the browser console using `console.error()` for bug tracking and debugging. Error messages displayed in the UI should also be logged to the console with appropriate context (component name, function name, input values, etc.).
7. **Chrome DevTools MCP Server for Testing**: Use the Chrome DevTools MCP server to help in planning unit tests and debugging. Leverage browser automation tools to:
   - Test user interactions and verify UI behavior
   - Inspect DOM elements and component state
   - Capture console logs and network requests
   - Take snapshots of page state for debugging
   - Verify error messages are displayed correctly
8. **High Contrast UI Text**: Do NOT use low-contrast / "low definition" font colors. All UI text must be high contrast and readable against its background (including disabled states, placeholders, helper text, and secondary labels).
9. **Binary Question Format**: When presenting binary choices or options to the user, always format them using A/B labels:
   - Format: "A) Option 1, B) Option 2"
   - Use clear labels (A, B, C, etc.) for each option
   - Make options mutually exclusive and clearly distinct
   - Example: "Should I: A) Add tests to existing file, B) Create new test file?"
10. **Code Change Documentation**: All code changes must be dated with ISO timestamp format (YYYY-MM-DD) and tracked in README.md:
   - Add ISO timestamp comments in code files when making significant changes (e.g., `// 2026-01-11: Enhanced scale progression UI`)
   - Update README.md with a "Recent Updates" or "Changelog" section documenting changes
   - Include date, feature/change description, and any relevant details
   - Format: `### YYYY-MM-DD: Feature Name` followed by bullet points describing changes
11. **Multiple Choice Question Format**: When presenting multiple choice options to the user, always format them using lowercase letter labels:
   - Format: "a) Option 1, b) Option 2, c) Option 3"
   - Use lowercase letters (a, b, c, d, etc.) for each option
   - Make options mutually exclusive and clearly distinct
   - Each option should be on its own line or clearly separated
   - Example: "Which approach should I use? a) Add tests to existing file, b) Create new test file, c) Refactor first then add tests"
12. **Exercise URL Documentation**: If an exercise has a URL (accessible at `http://localhost:5173/exercise/{exercise-id}`), that exercise MUST be documented and visible in `http://localhost:5173/usage-ideas.html`:
   - The exercise must appear in the "Quick Links to Exercises" section with its URL
   - The exercise must have a detailed section explaining how to use it, URL parameters, examples, and practice tips
   - When updating `usage-ideas.md`, also update `public/usage-ideas.md` to keep them in sync
   - After updating markdown files, run `npm run convert-md` to regenerate `public/usage-ideas.html`
   - Verify the exercise appears correctly in the HTML version by checking the generated file
13. **URL Lesson Visibility**: If you create a new URL-based lesson or exercise, the link to this lesson MUST be added to `http://localhost:5173/usage-ideas.html` (via `usage-ideas.md`) so users can discover and access it easily.
