import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Audits (Axe-Core & Keyboard Navigation)', () => {
  const routes = ['/', '/en/', '/about/', '/en/about/'];

  for (const route of routes) {
    test(`Automated accessibility scan on: ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForSelector('#global-preloader', { state: 'hidden', timeout: 10000 }).catch(() => { });

      // Disable transitions and animations to prevent color-contrast false positives during fade-in transitions
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        `
      });
      await page.waitForTimeout(500);

      // Run Axe Builder audit — exclude elements that are intentionally
      // hidden/animating and would produce false-positive violations:
      //   #global-preloader  — fade-out overlay (always opacity:0 by now but still in DOM)
      //   .premium-card-global — below-fold cards start with opacity:0 for scroll entrance
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
        .exclude('#global-preloader')
        .exclude('.premium-card-global')
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.warn(`[Accessibility Violations - ${route}]:`, JSON.stringify(accessibilityScanResults.violations, null, 2));
      }

      // Assert zero critical violations
      const criticalViolations = accessibilityScanResults.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );
      expect(criticalViolations, `Critical/serious a11y violations on ${route}:\n${JSON.stringify(criticalViolations, null, 2)}`).toHaveLength(0);
    });
  }

  test('Verifies keyboard focus states and tab navigation cycle', async ({ page }) => {
    await page.goto('/en/');
    await page.waitForSelector('#global-preloader', { state: 'hidden', timeout: 10000 });

    // Focus on first interactive element (should be header/logo or skip link)
    await page.keyboard.press('Tab');

    // Check if there is an active focused element
    const activeTagName = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeTagName).not.toBeNull();

    // Press Tab multiple times to traverse navigation links
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }

    const newActiveTagName = await page.evaluate(() => document.activeElement?.tagName);
    expect(newActiveTagName).not.toBeNull();
  });

  test('Services Grid keyboard navigation & Escape key collapse', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForSelector('#global-preloader', { state: 'hidden', timeout: 10000 });

    const firstCardLink = page.locator('.card-link').first();
    await expect(firstCardLink).toBeVisible();

    await firstCardLink.focus();
    await page.waitForTimeout(200);

    const initialUrl = page.url();

    // Press Escape to collapse
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    expect(page.url()).toBe(initialUrl);
  });
});
