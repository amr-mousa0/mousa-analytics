import { test, expect } from '@playwright/test';

test.describe('Locale Redirection & Routing', () => {
  test('redirects root / to default locale /en/', async ({ page }) => {
    await page.goto('/');
    // Check that we are redirected to /en/
    await expect(page).toHaveURL(/\/en\//);
  });

  test('redirects invalid locale to /en/', async ({ page }) => {
    await page.goto('/fr/');
    await expect(page).toHaveURL(/\/en\//);
  });

  test('supports language switching', async ({ page }) => {
    await page.goto('/en/');

    // Select Arabic language switcher (which displays "AR" in the new layout)
    const arToggle = page.locator('header a:has-text("AR")').first();
    if (await arToggle.isVisible()) {
      await arToggle.click({ force: true });
      await expect(page).toHaveURL(/\/ar\//);
      // Main heading should contain Arabic greeting or content
      await expect(page.locator('main h1')).toContainText('الرؤية');
    }
  });



  test('navigates to about page and switch languages', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Skip desktop-only navigation test');
    await page.goto('/en/');
    // Locate the About link in the header navigation
    const aboutLink = page.locator('nav.hidden.md\\:flex a:has-text("About")').first();
    await expect(aboutLink).toBeVisible();
    await aboutLink.click({ force: true });
    await expect(page).toHaveURL(/\/en\/about\//);
    await expect(page.locator('main h1')).toContainText('Mousa');

    // Switch to Arabic
    const arToggle = page.locator('header a:has-text("AR")').first();
    if (await arToggle.isVisible()) {
      await arToggle.click({ force: true });
      await expect(page).toHaveURL(/\/ar\/about\//);
      await expect(page.locator('main h1')).toContainText('موسى');
    }
  });
});

test.describe('Responsive Navigation Drawer', () => {
  test('hides drawer toggle on desktop and displays horizontal links', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Skip desktop-only test on mobile');
    await page.goto('/en/');

    // Desktop navigation links should be visible
    await expect(page.locator('nav.hidden.md\\:flex')).toBeVisible();

    // Mobile menu toggle checkbox peer label should be hidden
    await expect(page.locator('label[aria-label="Toggle Menu"]')).toBeHidden();
  });

  test('shows drawer toggle on mobile and hides horizontal links', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Skip mobile-only test on desktop');
    await page.goto('/en/');

    // Desktop nav should be hidden
    await expect(page.locator('nav.hidden.md\\:flex')).toBeHidden();

    // Hamburger menu toggle button should be visible
    const hamburger = page.locator('label[aria-label="Toggle Menu"]');
    await expect(hamburger).toBeVisible();

    // Checkbox should start unchecked (drawer closed)
    const checkbox = page.locator('#menu-toggle');
    expect(await checkbox.isChecked()).toBe(false);

    // Open drawer
    await hamburger.click();
    expect(await checkbox.isChecked()).toBe(true);

    // Click on About inside mobile drawer
    const aboutDrawerLink = page.locator('.mobile-drawer-link:has-text("Who I Am")').first();
    await expect(aboutDrawerLink).toBeVisible();
    await page.waitForTimeout(400); // Wait for transition transform (300ms) to settle
    await aboutDrawerLink.evaluate((el: HTMLElement) => el.click());

    // Page should navigate and drawer checkbox should reset to unchecked
    await expect(page).toHaveURL(/\/en\/about\//);
    expect(await checkbox.isChecked()).toBe(false);
  });
});
