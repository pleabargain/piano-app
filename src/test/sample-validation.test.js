import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Sample Key Progression Validation', () => {
    it('should be a valid JSON file and match the required schema', () => {
        const filePath = path.join(process.cwd(), 'public', 'sample-progressions', 'sample-key-progression.json');

        // Check if file exists
        expect(fs.existsSync(filePath), 'Sample file should exist at /public/sample-key-progression.json').toBe(true);

        const fileContent = fs.readFileSync(filePath, 'utf8');
        let parsed;

        // Check if it's valid JSON
        expect(() => {
            parsed = JSON.parse(fileContent);
        }, 'Sample file should be valid JSON').not.toThrow();

        // Check required fields (based on KeyProgressionStorage.validateProgression)
        expect(parsed.name, 'Sample should have a name').toBeDefined();
        expect(typeof parsed.name, 'Name should be a string').toBe('string');

        expect(parsed.progression, 'Sample should have a progression').toBeDefined();
        expect(typeof parsed.progression, 'Progression should be a string').toBe('string');

        // Notes validation (simple check)
        const tokens = parsed.progression.trim().split(/\s+/);
        expect(tokens.length).toBeGreaterThan(0);

        // Check optional but recommended fields
        expect(parsed.version, 'Sample should have a version').toBeDefined();
        expect(parsed.id, 'Sample should have an id').toBeDefined();
    });
});
