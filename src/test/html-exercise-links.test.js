// https://github.com/pleabargain/piano-app
// Test to verify that exercise links appear correctly in the generated HTML
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getAllExercises } from '../core/exercise-config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..', '..');

/**
 * TEST SUITE: HTML Exercise Links Verification
 * 
 * PURPOSE: This test suite validates that exercises referenced in usage-ideas.md
 * appear as clickable links in the generated usage-ideas.html file.
 * 
 * WHY THESE TESTS ARE IMPORTANT:
 * - Users need working links to access exercises from the documentation
 * - Broken links create poor user experience and reduce discoverability
 * - Ensures build process correctly converts markdown links to HTML
 * - Validates that exercise URLs are properly formatted and accessible
 */
describe('HTML Exercise Links Verification', () => {
  // Read the generated HTML file
  const htmlPath = join(projectRoot, 'public', 'usage-ideas.html');
  const htmlContent = readFileSync(htmlPath, 'utf-8');
  
  // Get all registered exercises
  const exercises = getAllExercises();

  // Exercises that should be linked in the HTML (based on usage-ideas.md)
  // Note: interval-sprints appears with query parameters, so we check for the base URL
  const expectedLinkedExercises = [
    'triad-shape-shifting',
    'vi-iv-i-v-circle',
    'i-v-i-circle',
    'i-iv-v-i-circle',
    'major-scales-circle',
    'major-pentatonic-circle',
    'interval-sprints-circle'
  ];
  
  // Exercises that appear with query parameters (check for base URL pattern)
  const exercisesWithParams = [
    'interval-sprints' // appears as interval-sprints?startKey=...
  ];

  describe('Exercise Links in HTML', () => {
    it('should contain HTML file content', () => {
      expect(htmlContent).toBeTruthy();
      expect(htmlContent.length).toBeGreaterThan(0);
    });

    it('should contain exercise links for exercises referenced in markdown', () => {
      expectedLinkedExercises.forEach(exerciseId => {
        const exerciseUrl = `http://localhost:5173/exercise/${exerciseId}`;
        // Escape special regex characters in URL
        const escapedUrl = exerciseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const linkPattern = new RegExp(`<a[^>]*href=["']${escapedUrl}(?:[?&][^"']*)?["'][^>]*>`, 'i');
        
        expect(htmlContent).toMatch(linkPattern);
      });
      
      // Check exercises that appear with query parameters
      exercisesWithParams.forEach(exerciseId => {
        const exerciseUrl = `http://localhost:5173/exercise/${exerciseId}`;
        // Check for URL with optional query parameters
        const escapedUrl = exerciseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const linkPattern = new RegExp(`<a[^>]*href=["']${escapedUrl}(?:[?&][^"']*)?["'][^>]*>`, 'i');
        
        expect(htmlContent).toMatch(linkPattern);
      });
    });

    it('should have clickable links (not just plain text) for exercises', () => {
      [...expectedLinkedExercises, ...exercisesWithParams].forEach(exerciseId => {
        const exerciseUrl = `http://localhost:5173/exercise/${exerciseId}`;
        // Escape special regex characters in URL
        const escapedUrl = exerciseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Check for anchor tag with href containing the exercise URL (with optional query params)
        const anchorPattern = new RegExp(`<a[^>]*href=["']${escapedUrl}(?:[?&][^"']*)?["'][^>]*>.*?</a>`, 'is');
        
        expect(htmlContent).toMatch(anchorPattern);
      });
    });

    it('should have triad-shape-shifting exercise link in HTML', () => {
      const triadUrl = 'http://localhost:5173/exercise/triad-shape-shifting';
      const linkPattern = new RegExp(`<a[^>]*href=["']${triadUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i');
      
      expect(htmlContent).toMatch(linkPattern);
    });

    it('should have vi-iv-i-v-circle exercise link in HTML', () => {
      const viIvIVUrl = 'http://localhost:5173/exercise/vi-iv-i-v-circle';
      const linkPattern = new RegExp(`<a[^>]*href=["']${viIvIVUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i');
      
      expect(htmlContent).toMatch(linkPattern);
    });

    it('should have i-v-i-circle exercise link in HTML', () => {
      const iViUrl = 'http://localhost:5173/exercise/i-v-i-circle';
      const linkPattern = new RegExp(`<a[^>]*href=["']${iViUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i');
      
      expect(htmlContent).toMatch(linkPattern);
    });

    it('should have i-iv-v-i-circle exercise link in HTML', () => {
      const iIvViUrl = 'http://localhost:5173/exercise/i-iv-v-i-circle';
      const linkPattern = new RegExp(`<a[^>]*href=["']${iIvViUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i');
      
      expect(htmlContent).toMatch(linkPattern);
    });

    it('should have major-scales-circle exercise link in HTML', () => {
      const scalesUrl = 'http://localhost:5173/exercise/major-scales-circle';
      const linkPattern = new RegExp(`<a[^>]*href=["']${scalesUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i');
      
      expect(htmlContent).toMatch(linkPattern);
    });

    it('should have major-pentatonic-circle exercise link in HTML', () => {
      const pentatonicUrl = 'http://localhost:5173/exercise/major-pentatonic-circle';
      const linkPattern = new RegExp(`<a[^>]*href=["']${pentatonicUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i');
      
      expect(htmlContent).toMatch(linkPattern);
    });

    it('should have interval-sprints-circle exercise link in HTML', () => {
      const intervalUrl = 'http://localhost:5173/exercise/interval-sprints-circle';
      const linkPattern = new RegExp(`<a[^>]*href=["']${intervalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i');
      
      expect(htmlContent).toMatch(linkPattern);
    });
  });

  describe('Link Format Validation', () => {
    it('should have properly formatted anchor tags', () => {
      // Check that links use proper HTML anchor tag format
      const anchorTagPattern = /<a[^>]*href=["']http:\/\/localhost:5173\/exercise\/[^"']+["'][^>]*>/gi;
      const matches = htmlContent.match(anchorTagPattern);
      
      expect(matches).toBeTruthy();
      expect(matches.length).toBeGreaterThan(0);
    });

    it('should have exercise links with proper URL structure', () => {
      [...expectedLinkedExercises, ...exercisesWithParams].forEach(exerciseId => {
        const exerciseUrl = `http://localhost:5173/exercise/${exerciseId}`;
        // Verify URL structure: http://localhost:5173/exercise/{exercise-id}
        const urlPattern = /http:\/\/localhost:5173\/exercise\/[a-z0-9-]+/i;
        
        expect(exerciseUrl).toMatch(urlPattern);
        
        // Verify it appears in HTML (may have query parameters)
        const urlInHtml = htmlContent.includes(exerciseUrl) || 
          htmlContent.includes(`${exerciseUrl}?`) ||
          htmlContent.includes(`${exerciseUrl}&`);
        expect(urlInHtml).toBe(true);
      });
    });
  });

  describe('Specific Exercise Link Verification', () => {
    it('should have Triad Shape-Shifting as a clickable link, not plain text', () => {
      const triadUrl = 'http://localhost:5173/exercise/triad-shape-shifting';
      // Check that it's an anchor tag, not just plain text
      const anchorPattern = new RegExp(`<a[^>]*href=["']${triadUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>.*?Triad.*?Shape.*?Shifting.*?</a>`, 'is');
      
      expect(htmlContent).toMatch(anchorPattern);
    });

    it('should have exercise URLs as clickable links in Quick Links section', () => {
      // Check that main exercise links in Quick Links section are clickable
      const quickLinksSection = htmlContent.match(/<h2>Quick Links to Exercises<\/h2>.*?<h2>/s);
      
      if (quickLinksSection) {
        expectedLinkedExercises.forEach(exerciseId => {
          const exerciseUrl = `http://localhost:5173/exercise/${exerciseId}`;
          // Check that URL appears as a link (in href attribute) in Quick Links section
          const escapedUrl = exerciseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const linkPattern = new RegExp(`<a[^>]*href=["']${escapedUrl}(?:[?&][^"']*)?["'][^>]*>`, 'i');
          
          expect(quickLinksSection[0]).toMatch(linkPattern);
        });
      } else {
        // If Quick Links section not found, at least verify links exist somewhere
        expectedLinkedExercises.forEach(exerciseId => {
          const exerciseUrl = `http://localhost:5173/exercise/${exerciseId}`;
          const escapedUrl = exerciseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const linkPattern = new RegExp(`<a[^>]*href=["']${escapedUrl}(?:[?&][^"']*)?["'][^>]*>`, 'i');
          expect(htmlContent).toMatch(linkPattern);
        });
      }
    });
  });
});
