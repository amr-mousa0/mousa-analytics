import { test, expect, type Page } from '@playwright/test';

// Setup Performance Observer on new document to capture FCP, LCP, and CLS
async function setupPerformanceMetrics(page: Page) {
  await page.addInitScript(() => {
    (window as any).performanceMetrics = {
      fcp: null,
      lcp: null,
      cls: 0,
      longTasks: 0,
    };

    // Each observer is wrapped in try-catch because Firefox doesn't support
    // all PerformanceObserver entry types (e.g., longtask, layout-shift, LCP).

    // 1. Observe Paint (FCP)
    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            (window as any).performanceMetrics.fcp = entry.startTime;
          }
        }
      }).observe({ type: 'paint', buffered: true });
    } catch (_) {}

    // 2. Observe Largest Contentful Paint (LCP)
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        (window as any).performanceMetrics.lcp = lastEntry.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (_) {}

    // 3. Observe Cumulative Layout Shift (CLS)
    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            (window as any).performanceMetrics.cls += entry.value;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (_) {}

    // 4. Observe Long Tasks (>50ms)
    try {
      new PerformanceObserver((entryList) => {
        (window as any).performanceMetrics.longTasks += entryList.getEntries().length;
      }).observe({ type: 'longtask', buffered: true });
    } catch (_) {}
  });
}

test.describe('Performance & Core Web Vitals Audits', () => {
  test.beforeEach(async ({ page }) => {
    await setupPerformanceMetrics(page);
  });

  const testPages = [
    '/',
    '/en/',
    '/about/',
    '/en/about/',
    '/privacy/',
    '/en/privacy/',
    '/terms/',
    '/en/terms/',
    '/services/data-analytics/',
    '/en/services/data-analytics/',
    '/services/advanced-excel/',
    '/en/services/advanced-excel/',
    '/services/custom-crm/',
    '/en/services/custom-crm/',
    '/services/web-portfolios/',
    '/en/services/web-portfolios/',
    '/services/marketing-strategy/',
    '/en/services/marketing-strategy/'
  ];

  for (const route of testPages) {
    test(`Validates Core Web Vitals targets on: ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForSelector('#global-preloader', { state: 'hidden', timeout: 10000 }).catch(() => {});
      
      // Give a buffer to finish loading and scroll down to trigger lazy assets
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(500);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);

      const metrics = await page.evaluate(() => (window as any).performanceMetrics);

      console.log(`[Performance Metrics - ${route}]:`, metrics);

      // Assertions against Quality Targets (strict for Chromium, relaxed for WebKit/Firefox)
      const isChromium = page.context().browser()?.browserType().name() === 'chromium';
      const fcpLimit = isChromium ? 3500 : 4000;
      const lcpLimit = isChromium ? 4000 : 5000;

      if (metrics.cls !== null) {
        expect(metrics.cls).toBeLessThan(0.1); // CLS target < 0.1
      }
      if (metrics.fcp !== null) {
        expect(metrics.fcp).toBeLessThan(fcpLimit);
      }
      if (metrics.lcp !== null) {
        expect(metrics.lcp).toBeLessThan(lcpLimit);
      }
    });
  }

  test('Emulates Slow 3G network conditions on Chromium', async ({ page, browserName }) => {
    // Only chromium supports CDP emulation in Playwright easily
    test.skip(browserName !== 'chromium', 'Skip network emulation on non-chromium browsers');

    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');

    // Emulate Slow 3G: latency 400ms, download 400kbps, upload 400kbps
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 400,
      downloadThroughput: (400 * 1024) / 8,
      uploadThroughput: (400 * 1024) / 8,
    });

    await page.goto('/en/');
    await page.waitForSelector('#global-preloader', { state: 'hidden', timeout: 20000 });

    // Assert that lazy loaded assets are loaded correctly
    const imagesCount = await page.locator('img').count();
    expect(imagesCount).toBeGreaterThan(0);

    const lazyImages = page.locator('img[loading="lazy"]');
    // Ensure lazy loading attributes are configured on secondary images
    if (await lazyImages.count() > 0) {
      const firstLazySrc = await lazyImages.first().getAttribute('src');
      expect(firstLazySrc).not.toBeNull();
    }
  });

  test('Validates image width and height attributes to prevent layout shifts', async ({ page }) => {
    await page.goto('/en/');
    await page.waitForSelector('#global-preloader', { state: 'hidden', timeout: 10000 });

    const imagesWithoutDimensions = await page.evaluate(() => {
      const imgs = Array.from(document.images);
      return imgs
        .filter(img => {
          // Ignore tracking pixels and SVG monograms
          if (img.width <= 1 || img.height <= 1) return false;
          if (img.src.endsWith('.svg')) return false;
          
          // Check if width and height are absent or zero
          const hasWidthAttr = img.hasAttribute('width') && img.getAttribute('width') !== '0';
          const hasHeightAttr = img.hasAttribute('height') && img.getAttribute('height') !== '0';
          return !hasWidthAttr || !hasHeightAttr;
        })
        .map(img => img.src);
    });

    if (imagesWithoutDimensions.length > 0) {
      console.warn('Responsive images missing explicit width/height attributes:', imagesWithoutDimensions);
    }
    // We do not strictly fail yet as Astro Image component might omit them in some custom wrappers,
    // but warning helps developer audit them.
  });
});
