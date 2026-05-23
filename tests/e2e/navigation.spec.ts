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
      await expect(page.locator('main h1')).toContainText('عمرو موسى');
    }
  });

  test('navigates to methodology page and switch languages', async ({ page }) => {
    await page.goto('/en/');
    // In the new layout, we navigate to the methodology page via "Explore Services" in the Hero
    const methodLink = page.locator('a:has-text("Explore Services")');
    if (await methodLink.isVisible()) {
      await methodLink.click({ force: true });
      await expect(page).toHaveURL(/\/en\/methodology\//);
      await expect(page.locator('main h1')).toContainText('Work Methodology');
    }
  });

  test('navigates to about page and switch languages', async ({ page }) => {
    await page.goto('/en/');
    // Secondary CTA in the hero
    const aboutLink = page.locator('a:has-text("Get to Know Me")');
    if (await aboutLink.isVisible()) {
      await aboutLink.click({ force: true });
      await expect(page).toHaveURL(/\/en\/about\//);
      await expect(page.locator('main h1')).toContainText('The Professional Interview');

      // Switch to Arabic
      const arToggle = page.locator('header a:has-text("AR")').first();
      if (await arToggle.isVisible()) {
        await arToggle.click({ force: true });
        await expect(page).toHaveURL(/\/ar\/about\//);
        await expect(page.locator('main h1')).toContainText('التعريف بالخبرة المهنية');
      }
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

    // Click on Methodology inside mobile drawer
    const methodologyDrawerLink = page.locator('.mobile-drawer-link:has-text("Methodology")');
    await expect(methodologyDrawerLink).toBeVisible();
    await page.waitForTimeout(400); // Wait for transition transform (300ms) to settle
    await methodologyDrawerLink.click();

    // Page should navigate and drawer checkbox should reset to unchecked
    await expect(page).toHaveURL(/\/en\/methodology\//);
    expect(await checkbox.isChecked()).toBe(false);
  });
});
