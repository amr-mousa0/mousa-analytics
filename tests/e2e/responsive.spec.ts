import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'Galaxy Fold (Ultra-small)', width: 320, height: 568 },
  { name: 'iPhone SE (Small)', width: 375, height: 667 },
  { name: 'iPad Mini (Tablet)', width: 768, height: 1024 },
  { name: 'Desktop (Standard)', width: 1280, height: 800 },
  { name: 'Ultra-wide Desktop', width: 2560, height: 1440 },
];

test.describe('Responsive Layout & Overflow Validations', () => {
  for (const viewport of viewports) {
    test(`Auditing layout boundaries and tap targets at: ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      // Set the viewport size dynamically for this test
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      await page.goto('/ar/');
      await page.waitForSelector('#global-preloader', { state: 'hidden', timeout: 10000 });

      // 1. Detect Horizontal Scroll Overflow
      const overflowInfo = await page.evaluate(() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const clientWidth = document.documentElement.clientWidth;
        const hasOverflow = scrollWidth > clientWidth;

        // Find elements causing the overflow
        let offendingElements: string[] = [];
        if (hasOverflow) {
          const allElements = Array.from(document.querySelectorAll('*'));
          offendingElements = allElements
            .filter((el) => el.getBoundingClientRect().right > window.innerWidth)
            .map((el) => `${el.tagName}.${Array.from(el.classList).join('.')}`)
            .slice(0, 5); // Limit to top 5
        }

        return { hasOverflow, scrollWidth, clientWidth, offendingElements };
      });

      if (overflowInfo.hasOverflow) {
        console.warn(`[Layout Overflow Detected at ${viewport.width}px]:`, overflowInfo);
      }
      expect(overflowInfo.hasOverflow).toBe(false);

      // 2. Validate viewport-height sections scale properly
      const heroHeight = await page.locator('#hero').boundingBox();
      expect(heroHeight).not.toBeNull();
      if (heroHeight) {
        expect(heroHeight.height).toBeGreaterThan(200); // Should never collapse
      }

      // 3. Verify main CTA buttons have accessible tap target sizing (especially on mobile)
      if (viewport.width <= 480) {
        const ctaButtons = page.locator('section a[href*="#"]');
        const ctaCount = await ctaButtons.count();
        for (let i = 0; i < ctaCount; i++) {
          const box = await ctaButtons.nth(i).boundingBox();
          if (box) {
            // Target size should ideally be at least 44x44px for accessibility
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(40); // 40-44px threshold
          }
        }
      }
    });
  }
});
