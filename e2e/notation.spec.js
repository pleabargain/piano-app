// 2026-02-13: E2E tests for notation rendering in a real browser
// Catches font loading, layout timing, and VexFlow issues that unit tests miss
import { test, expect } from '@playwright/test';

test.describe('Sheet music notation', () => {
  test('i-vi-ii-v-lesson-g: notation should render (no "Unable to render notation")', async ({ page }) => {
    await page.goto('/exercise/i-vi-ii-v-lesson-g');
    // Wait for page and notation area to be ready
    await page.waitForSelector('[data-testid="sheet-music-display"]', { timeout: 10000 });
    // Give VexFlow time to render (fonts, layout)
    await page.waitForTimeout(1500);
    const body = await page.locator('body').textContent();
    expect(body).not.toContain('Unable to render notation');
    // Should show either staff notation or placeholder - not the error
    const errorEl = page.getByText(/unable to render notation/i);
    await expect(errorEl).not.toBeVisible();
  });

  test('i-vi-ii-v-lesson-g: sheet music container should have content', async ({ page }) => {
    await page.goto('/exercise/i-vi-ii-v-lesson-g');
    await page.waitForSelector('[data-testid="sheet-music-display"]', { timeout: 10000 });
    await page.waitForTimeout(1500);
    // VexFlow renders SVG inside .sheet-music-vexflow-output
    const container = page.locator('.sheet-music-container');
    await expect(container).toBeVisible();
    const hasSvg = await container.locator('svg').count() > 0;
    const hasPlaceholder = await container.getByText(/play a chord or select a scale/i).count() > 0;
    // Either SVG notation or the intentional placeholder - not the error
    expect(hasSvg || hasPlaceholder).toBeTruthy();
  });

  test('i-v-i exercise: chord notation should render', async ({ page }) => {
    await page.goto('/exercise/i-v-i?startKey=G&keys=1');
    await page.waitForSelector('[data-testid="sheet-music-display"]', { timeout: 10000 });
    await page.waitForTimeout(1500);
    const errorEl = page.getByText(/unable to render notation/i);
    await expect(errorEl).not.toBeVisible();
  });

  test('major-scales-circle: scale notation should render', async ({ page }) => {
    await page.goto('/exercise/major-scales-circle?keys=1');
    await page.waitForSelector('[data-testid="sheet-music-display"]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    const errorEl = page.getByText(/unable to render notation/i);
    await expect(errorEl).not.toBeVisible();
  });
});
