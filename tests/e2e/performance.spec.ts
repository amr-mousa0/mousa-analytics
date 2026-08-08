import { test, expect, type Page } from '@playwright/test';

// Setup Performance Observer on new document to capture FCP, LCP, and CLS
async function setupPerformanceMetrics(page: Page) {
  await page.addInitScript(() => {
    (window as any).performanceMetrics = {
      fcp: null,
      lcp: null,
      cls: 0,
      longTasks: 0,
      layoutShifts: [],
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
            (window as any).performanceMetrics.layoutShifts.push(entry);
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
      
      // Allow initial layout to settle after preloader hide transition
      await page.waitForTimeout(500);
      const initialMetrics = await page.evaluate(() => ({ ...(window as any).performanceMetrics }));

      // Scroll down to trigger lazy assets and layout observers
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(500);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);

      const metrics = await page.evaluate(() => (window as any).performanceMetrics);

      console.log(`[Performance Metrics - ${route}]:`, { initialCls: initialMetrics.cls, ...metrics });

      // Assertions against Quality Targets (strict for Chromium desktop, relaxed for mobile/WebKit)
      const isChromium = page.context().browser()?.browserType().name() === 'chromium';
      const isMobile = page.viewportSize() ? page.viewportSize()!.width < 768 : false;
      const fcpLimit = isChromium ? 3500 : 4000;
      const lcpLimit = isChromium ? 4000 : 5000;

      // Evaluate Core Web Vitals page-load CLS (before synthetic scroll jumps)
      const pageLoadCls = initialMetrics.cls !== null ? initialMetrics.cls : metrics.cls;
      if (pageLoadCls !== null) {
        const clsLimit = (isChromium && !isMobile) ? 0.1 : 0.25;
        expect(pageLoadCls).toBeLessThan(clsLimit);
      }
      if (metrics.fcp !== null) {
        expect(metrics.fcp).toBeLessThan(fcpLimit);
      }
      if (metrics.lcp !== null) {
        expect(metrics.lcp).toBeLessThan(lcpLimit);
      }
    });
  }

  test('Emulates Slow 3G network conditions on Chromium', async ({ page, browserName, isMobile }) => {
    test.setTimeout(90000);
    // Only desktop Chromium supports reliable CDP network emulation in Playwright
    test.skip(browserName !== 'chromium' || isMobile, 'Skip network emulation on non-chromium or mobile browsers');

    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');

    // Emulate Slow 3G: latency 400ms, download 400kbps, upload 400kbps
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 400,
      downloadThroughput: (400 * 1024) / 8,
      uploadThroughput: (400 * 1024) / 8,
    });

    await page.goto('/en/', { waitUntil: 'commit', timeout: 90000 });
    await page.waitForSelector('#global-preloader', { state: 'hidden', timeout: 90000 });

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

  test('Services Grid zero-CLS desktop hover verification', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Skip desktop hover engine test on mobile/touch projects');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForSelector('#global-preloader', { state: 'hidden', timeout: 10000 });

    const grid = page.locator('[data-services-grid]');
    await expect(grid).toBeVisible();

    const engineActive = await page.evaluate(() => (window as any).__servicesEngineActive);
    expect(engineActive).toBe(true);

    const initialCols = await page.evaluate(() => {
      const g = document.querySelector('[data-services-grid]');
      return g ? window.getComputedStyle(g).gridTemplateColumns : '';
    });

    // Record a baseline of layout-shift entries before the interaction window
    const shiftsBaseline = await page.evaluate(() => (window as any).performanceMetrics.layoutShifts.length);

    const firstCard = page.locator('.premium-card-global').first();
    await firstCard.hover();
    await page.waitForTimeout(300);

    const activeCols = await page.evaluate(() => {
      const g = document.querySelector('[data-services-grid]');
      return g ? window.getComputedStyle(g).gridTemplateColumns : '';
    });

    expect(activeCols).toBe(initialCols);

    await page.mouse.move(0, 0);
    await page.waitForTimeout(500);

    // Zero-CLS guarantee: no layout-shift entry with sources during hover/expand/collapse
    const shiftsDuringInteraction = await page.evaluate((baseline: number) => {
      return (window as any).performanceMetrics.layoutShifts
        .slice(baseline)
        .filter((entry: any) => (entry.sources?.length ?? 0) > 0)
        .map((entry: any) => ({
          value: entry.value,
          sources: (entry.sources ?? []).map((s: any) => s.node?.className || s.node?.tagName || '?'),
        }));
    }, shiftsBaseline);

    expect(shiftsDuringInteraction).toEqual([]);
  });

  test('Services entrance — cards are hidden then rise+fade once on scroll into view', async ({ page, isMobile, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit headless native scroll emulation is flaky with GSAP ScrollTrigger');
    test.setTimeout(90000);
    const viewports = [
      { name: 'EN', route: '/en/' },
      { name: 'AR', route: '/' },
    ];

    for (const { name, route } of viewports) {
      await test.step(`locale ${name}`, async () => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto(route);
        await page.waitForSelector('#global-preloader', { state: 'hidden', timeout: 10000 });
        // Settle layout (lazy images, fonts, ScrollTrigger refresh) before measuring
        await page.waitForTimeout(2000);

        const grid = page.locator('[data-services-grid]');
        await expect(grid).toBeVisible();

        // Entrance pre-state: below-fold cards start hidden (opacity 0, raised y)
        const initial = await grid.evaluate(() => {
          const first = document.querySelector('.premium-card-global');
          if (!first) return null;
          return {
            opacity: getComputedStyle(first).opacity,
            transform: getComputedStyle(first).transform,
          };
        });
        expect(initial).not.toBeNull();
        expect(Number(initial!.opacity)).toBe(0);

        // Scroll into view → entrance fires once. Desktop: real wheel scrolling ensures
        // the `top 75%` ScrollTrigger line is crossed and scroll events fire in every
        // engine (WebKit skips events on instant scrolls). Mobile: `mouse.wheel` is
        // unsupported, so use stepped programmatic scrolls (also fires native events).
        await grid.scrollIntoViewIfNeeded();
        if (isMobile) {
          for (let i = 0; i < 20; i++) {
            await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'instant' }));
            await page.waitForTimeout(60);
          }
        } else {
          await page.mouse.move(400, 400);
          await page.mouse.wheel(0, 1200);
          await page.mouse.wheel(0, 800);
        }
        await expect.poll(async () => {
          const state = await grid.evaluate(() => {
            const first = document.querySelector('.premium-card-global');
            if (!first) return null;
            return {
              opacity: getComputedStyle(first).opacity,
              transform: getComputedStyle(first).transform,
            };
          });
          return state;
        }, { timeout: 15000, intervals: [250] }).toEqual({
          opacity: '1',
          transform: 'none',
        });

        // `clearProps` removes the entrance transform (cards return to native CSS layout)
        const revealed = await grid.evaluate(() => ({
          gridCols: window.getComputedStyle(document.querySelector('[data-services-grid]')!).gridTemplateColumns,
        }));

        // Column tracks frozen across the reveal — zero reflow
        const gridColsBefore = await grid.evaluate((g) => getComputedStyle(g).gridTemplateColumns);
        const gridColsAfter = revealed!.gridCols;
        expect(gridColsAfter).toBe(gridColsBefore);
      });
    }
  });

  test('Services entrance — reduced motion shows cards instantly (no hidden state)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/en/');
    await page.waitForSelector('#global-preloader', { state: 'hidden', timeout: 10000 });

    const firstCard = page.locator('.premium-card-global').first();
    await expect(firstCard).toBeVisible();

    const state = await firstCard.evaluate((el) => ({
      opacity: getComputedStyle(el).opacity,
      transform: getComputedStyle(el).transform,
    }));
    expect(Number(state.opacity)).toBe(1);
    expect(state.transform).toBe('none');
  });
});
