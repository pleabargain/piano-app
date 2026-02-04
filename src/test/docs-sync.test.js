import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Documentation Sync', () => {
    it('should have identical content in root usage-ideas.md and public/usage-ideas.md', () => {
        const rootPath = path.resolve(__dirname, '../../usage-ideas.md');
        const publicPath = path.resolve(__dirname, '../../public/usage-ideas.md');

        // Check if files exist
        expect(fs.existsSync(rootPath)).toBe(true);

        // Only check public file if it exists (it might be generated or copied)
        // But for this test, we want to ensure they ARE sync if public exists
        if (fs.existsSync(publicPath)) {
            const rootContent = fs.readFileSync(rootPath, 'utf-8');
            const publicContent = fs.readFileSync(publicPath, 'utf-8');

            expect(publicContent).toBe(rootContent);
        }
    });
});
