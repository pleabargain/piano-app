// https://github.com/pleabargain/piano-app
/**
 * Unit test to catch syntax errors in chord practice validation logic
 * Specifically tests the if-else structure to prevent duplicate else blocks
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

describe('Chord Practice Syntax Validation', () => {
  it('should have proper if-else structure (no duplicate else blocks)', () => {
    // Read the source file to check for duplicate else blocks
    const appPath = join(__dirname, '../App.jsx');
    const sourceCode = readFileSync(appPath, 'utf-8');
    
    // Check for the problematic pattern: } else { ... } else {
    // This regex looks for closing brace followed by else, then another closing brace and else
    const duplicateElsePattern = /\}\s*else\s*\{[^}]*\}\s*else\s*\{/s;
    
    if (duplicateElsePattern.test(sourceCode)) {
      // Find the line numbers for better error reporting
      const lines = sourceCode.split('\n');
      let foundDuplicate = false;
      let lastElseLine = -1;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '} else {' || line.startsWith('} else {')) {
          if (lastElseLine !== -1 && i - lastElseLine < 10) {
            // Found two else blocks close together
            foundDuplicate = true;
            throw new Error(
              `Duplicate else block found:\n` +
              `Line ${lastElseLine + 1}: ${lines[lastElseLine]}\n` +
              `Line ${i + 1}: ${lines[i]}\n` +
              `This indicates a syntax error in the if-else structure.`
            );
          }
          lastElseLine = i;
        }
      }
    }
    
    // Also check for the specific pattern that caused the error
    const lines = sourceCode.split('\n');
    for (let i = 0; i < lines.length - 1; i++) {
      const currentLine = lines[i].trim();
      const nextLine = lines[i + 1]?.trim();
      
      // Check for pattern: } else { ... } else {
      if (currentLine === '}' && nextLine === '} else {') {
        // Look back to see if there was an else before
        for (let j = i - 1; j >= Math.max(0, i - 10); j--) {
          if (lines[j].trim() === '} else {' || lines[j].trim().endsWith('} else {')) {
            throw new Error(
              `Duplicate else block detected:\n` +
              `Line ${j + 1}: ${lines[j]}\n` +
              `Line ${i + 2}: ${nextLine}\n` +
              `This is a syntax error - cannot have two else blocks for the same if statement.`
            );
          }
        }
      }
    }
    
    // If we get here, no duplicate else blocks were found
    expect(true).toBe(true);
  });

  it('should have balanced braces in chord validation useEffect', () => {
    const appPath = join(__dirname, '../App.jsx');
    const sourceCode = readFileSync(appPath, 'utf-8');
    
    // Extract the chord validation useEffect block (around line 612-696)
    const lines = sourceCode.split('\n');
    const startLine = lines.findIndex(line => 
      line.includes('Chord validation: MATCH!') || 
      line.includes('if (detected && match)')
    );
    
    if (startLine === -1) {
      // If we can't find it, that's okay - the test just verifies structure
      return;
    }
    
    // Check brace balance in the if-else block
    let braceCount = 0;
    let inIfBlock = false;
    let elseCount = 0;
    
    for (let i = startLine; i < Math.min(startLine + 100, lines.length); i++) {
      const line = lines[i];
      
      // Count braces
      for (const char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
      
      // Count else statements
      if (line.trim().includes('} else {')) {
        elseCount++;
      }
      
      // We should only have one else per if
      if (elseCount > 1 && braceCount > 0) {
        throw new Error(
          `Multiple else blocks found in chord validation logic around line ${i + 1}`
        );
      }
    }
    
    expect(elseCount).toBeLessThanOrEqual(1);
  });
});
