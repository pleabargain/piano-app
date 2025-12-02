<!-- https://github.com/pleabargain/piano-app -->
# Agent Coding Rules

This document contains coding rules and guidelines for development of this project.

## General Rules

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

1. **Unit Tests**: Create unit tests for:
   - Bug fixes (to prevent regression)
   - Core functionality
   - Abstracted functions

2. **Test Structure**: 
   - Use descriptive test names
   - Isolate bugs in separate test cases
   - Abstract functions being tested into testable units

3. **Test Coverage**: Aim for meaningful test coverage, especially for:
   - Critical user-facing features
   - Complex logic
   - Bug-prone areas

## File Naming

- Scripts: Use ISO DATETIME format prepended to filename: `YYYY-MM-DDTHH-MM-SS_scriptname.js`
- Test files: Place in `src/test/` directory with `.test.jsx` or `.test.js` extension

## Code Quality

1. **Linting**: All code should pass ESLint checks
2. **Type Safety**: Use TypeScript where applicable, or add JSDoc type annotations
3. **Performance**: Consider performance implications of code changes
4. **Accessibility**: Ensure UI components are accessible

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

## Documentation Updates

- Update README.md with accurate YYYY-MM-DD timestamp at the bottom of the file
- Document API changes
- Update this file when new rules are established

---

Last Updated: 2025-01-27

