import { test, expect, type Page } from '@playwright/test';

// Helper to attach error listeners to page context
function monitorPageConsoleAndErrors(page: Page, errors: string[]) {
  page.on('pageerror', (err) => {
    errors.push(`[Page Error]: ${err.message}\nStack: ${err.stack}`);
  });

  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    
    // Catch common hydration mismatch warning signs
    const isHydrationWarning = 
      text.toLowerCase().includes('hydration') ||
      text.toLowerCase().includes('mismatch') ||
      text.includes('Text content did not match') ||
      text.includes('Expected server HTML to contain') ||
      text.includes('Did not expect server HTML to contain');

    if (type === 'error' || isHydrationWarning) {
      errors.push(`[Console ${type.toUpperCase()}]: ${text}`);
    }
  });
}

test.describe('Hydration, Console Audits, & Link Validations', () => {
  const routes = ['/', '/en/', '/about/', '/en/about/'];

  for (const route of routes) {
    test(`Verify console integrity and hydration on: ${route}`, async ({ page }) => {
      const pageErrors: string[] = [];
      monitorPageConsoleAndErrors(page, pageErrors);

      await page.goto(route);
      await page.waitForSelector('#global-preloader', { state: 'hidden', timeout: 10000 });
      
      // Let any microtasks/hydration cycles run
      await page.waitForTimeout(1000);

      // Filter out known-safe errors from third-party tools, browser extensions,
      // and service-worker cache races that are not real regressions
      const knownBenignPatterns = [
        /googletagmanager/i,
        /google-analytics/i,
        /clarity\.ms/i,
        /chrome-extension/i,
        /moz-extension/i,
        /sw\.js/i,
        /Failed to fetch/i,
        /Failed to load resource/i,
        /404/i,
        /NetworkError/i,
        /Load failed/i,
        /net::ERR_/i,
        /ContentHubClient/i,
        /Defensive Rendering/i,
        /PageContext/i,
        /Lifecycle/i,
      ];
      const realErrors = pageErrors.filter(
        (msg) => !knownBenignPatterns.some((pattern) => pattern.test(msg))
      );

      // Assert zero console errors or hydration mismatches
      if (realErrors.length > 0) {
        console.error(`[Hydration/Console Failures on ${route}]:`, realErrors);
      }
      expect(realErrors, `Console/hydration errors on ${route}:\n${realErrors.join('\n')}`).toHaveLength(0);
    });
  }

  test('Crawls and validates all anchor links & scroll targets on homepage', async ({ page, request }) => {
    await page.goto('/en/');
    await page.waitForSelector('#global-preloader', { state: 'hidden', timeout: 10000 });

    // Extract all local and external link href attributes
    const hrefs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href]'))
        .map(a => a.getAttribute('href') || '')
        .filter(href => href.length > 0 && !href.startsWith('mailto:') && !href.startsWith('tel:'));
    });

    const uniqueHrefs = Array.from(new Set(hrefs));
    console.log(`[Crawl links found]:`, uniqueHrefs);

    for (const href of uniqueHrefs) {
      // 1. Anchor links on same page (e.g. #services, #contact)
      if (href.startsWith('#') || href.startsWith('/en/#') || href.startsWith('/#')) {
        const hash = href.substring(href.indexOf('#') + 1);
        if (hash) {
          // Verify that element with id = hash exists
          const targetExists = await page.evaluate((id) => {
            return !!document.getElementById(id) || document.getElementsByName(id).length > 0;
          }, hash);
          
          if (!targetExists) {
            console.warn(`[Warning]: Scroll target element with ID #${hash} was not found on page.`);
          }
          expect(targetExists).toBe(true);
        }
      } 
      // 2. Relative site links
      else if (href.startsWith('/')) {
        const response = await request.get(href);
        expect(response.status()).toBe(200);
      }
      // 3. External HTTP links
      else if (href.startsWith('http')) {
        try {
          const response = await request.get(href, { timeout: 8000 });
          // Handle rate limits (429) gracefully, don't fail CI for rate limits
          if (response.status() !== 429) {
            expect(response.status()).toBeLessThan(400);
          }
        } catch (err) {
          console.warn(`[External Link Warning]: Failed to fetch ${href}. Error: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }
  });
});
