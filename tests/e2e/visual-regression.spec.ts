import { test, expect, type Page } from '@playwright/test';

// Shared utility to stabilize rendering before taking snapshots
async function stabilizePage(page: Page) {
  // 1. Wait for page preloader to be hidden
  const preloader = page.locator('#global-preloader');
  if (await preloader.count() > 0) {
    await page.waitForSelector('#global-preloader', { state: 'hidden', timeout: 10000 });
  }

  // 2. Wait for web fonts to load
  await page.evaluate(() => document.fonts.ready);

  // 3. Inject CSS overrides to disable transitions, animations, blinking cursors and dynamic elements
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-delay: -1ms !important;
        animation-duration: 1ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        scroll-behavior: auto !important;
        caret-color: transparent !important;
      }
      /* Hide dynamic elements or indicators that might cause flakiness */
      .grecaptcha-badge { display: none !important; }
    `
  });

  // 4. Trigger lazy-loaded images by scrolling down and then back to top
  await page.evaluate(async () => {
    const scrollStep = 300;
    const delay = 50;
    const totalHeight = document.body.scrollHeight;
    
    // Scroll down
    for (let offset = 0; offset < totalHeight; offset += scrollStep) {
      window.scrollTo(0, offset);
      await new Promise(r => setTimeout(r, delay));
    }
    
    // Scroll back up
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 100));
  });

  // 5. Ensure all images finish decoding to prevent partial image rendering in screenshots
  await page.evaluate(async () => {
    const images = Array.from(document.images);
    await Promise.all(images.map(img => {
      return new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, 2000); // 2-second safety timeout
        
        const finish = () => {
          clearTimeout(timer);
          resolve();
        };

        if (img.complete) {
          img.decode().then(finish).catch(finish);
        } else {
          img.onload = () => {
            img.decode().then(finish).catch(finish);
          };
          img.onerror = finish;
        }
      });
    }));
  });

  // 6. Give a small buffer for layout settling
  await page.waitForTimeout(500);
}

test.describe('Visual Regression Tests - Desktop & Mobile', () => {
  test.skip(!!process.env.CI, 'Skip visual regression in CI due to font rendering engine differences across OS platforms');

  const locales = ['ar', 'en'];

  for (const lang of locales) {
    test(`Visual parity of Home Page [${lang}]`, async ({ page }) => {
      const targetPath = lang === 'ar' ? '/' : '/en/';
      await page.goto(targetPath);
      await stabilizePage(page);

      // Full Page Screenshot
      await expect(page).toHaveScreenshot(`home-${lang}-fullpage.png`, {
        fullPage: true,
        threshold: 0.1,
      });

      // Component Specific Snapshots
      const hero = page.locator('#hero'); // Hero section has id="hero"
      await expect(hero).toHaveScreenshot(`home-${lang}-hero.png`, { threshold: 0.1 });

      const navbar = page.locator('header').first();
      await expect(navbar).toHaveScreenshot(`home-${lang}-navbar.png`, { threshold: 0.1 });

      const footer = page.locator('footer').first();
      await expect(footer).toHaveScreenshot(`home-${lang}-footer.png`, { threshold: 0.1 });
    });

    test(`Visual parity of About Page [${lang}]`, async ({ page }) => {
      const targetPath = lang === 'ar' ? '/about/' : '/en/about/';
      await page.goto(targetPath);
      await stabilizePage(page);

      // Full Page Screenshot
      await expect(page).toHaveScreenshot(`about-${lang}-fullpage.png`, {
        fullPage: true,
        threshold: 0.1,
      });
    });
  }
});
