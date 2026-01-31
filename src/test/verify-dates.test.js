import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Date Consistency Verification', () => {
    const today = '2026-01-31';
    const rootDir = 'c:/Users/denni/OneDrive/Documents/piano-app';

    it('should have correct "Last updated" date in README.md', () => {
        const readmePath = path.join(rootDir, 'README.md');
        const content = fs.readFileSync(readmePath, 'utf8');

        // Lines 4 and 1128 (approx)
        expect(content).toContain(`Last updated: ${today}`);
        expect(content).toContain(`Last Updated: ${today}`);

        // Changelog entry
        expect(content).toContain(`### ${today}: Interval Sprints and Multi-Key Support`);

        // Development notes
        expect(content).toContain(`**${today}**: Added Interval Sprints exercises`);
    });

    it('should have correct date comment in exercise-config.js', () => {
        const filePath = path.join(rootDir, 'src/core/exercise-config.js');
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain(`// ${today}: Added Interval Sprints and 12-Key Interval Sprints`);
    });

    it('should have correct date comment in interval-sprints.test.js', () => {
        const filePath = path.join(rootDir, 'src/test/interval-sprints.test.js');
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain(`// ${today}: Internal Sprints unit tests`);
    });
});
