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