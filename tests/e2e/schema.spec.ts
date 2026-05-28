import { test, expect, type Page } from '@playwright/test';

// Utility to parse JSON-LD schemas from a page
async function getJsonLdSchemas(page: Page) {
  const scripts = page.locator('script[type="application/ld+json"]');
  const count = await scripts.count();
  const schemas: any[] = [];
  
  for (let i = 0; i < count; i++) {
    const content = await scripts.nth(i).textContent();
    if (content) {
      try {
        const parsed = JSON.parse(content.trim());
        if (parsed && parsed['@graph'] && Array.isArray(parsed['@graph'])) {
          schemas.push(...parsed['@graph']);
        } else if (Array.isArray(parsed)) {
          schemas.push(...parsed);
        } else {
          schemas.push(parsed);
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        throw new Error(`Invalid JSON-LD format: ${errMsg}`);
      }
    }
  }
  return schemas;
}

test.describe('Structured Data & Schema.org Validations', () => {
  const paths = ['/', '/en/', '/about/', '/en/about/'];

  for (const path of paths) {
    test(`Verify JSON-LD existence and schema types on: ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForSelector('#global-preloader', { state: 'hidden', timeout: 10000 });

      const schemas = await getJsonLdSchemas(page);
      expect(schemas.length).toBeGreaterThan(0);

      // Verify canonical link matching schema id or url
      const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonicalHref).not.toBeNull();

      // Check for specific core schema types
      let hasWebSite = false;
      let hasPersonOrOrg = false;
      let hasWebPage = false;

      for (const schema of schemas) {
        if (schema.hasOwnProperty('@context')) {
          expect(schema).toHaveProperty('@context', 'https://schema.org');
        }
        expect(schema).toHaveProperty('@type');

        if (schema['@type'] === 'WebSite') {
          hasWebSite = true;
          expect(schema).toHaveProperty('name');
          expect(schema).toHaveProperty('url');
        }

        if (schema['@type'] === 'Person' || schema['@type'] === 'Organization') {
          hasPersonOrOrg = true;
          expect(schema).toHaveProperty('name');
        }

        if (schema['@type'] === 'WebPage' || schema['@type'] === 'ProfilePage') {
          hasWebPage = true;
          expect(schema).toHaveProperty('url');
          expect(schema.url).toBe(canonicalHref);
        }

        if (schema['@type'] === 'BreadcrumbList') {
          expect(schema).toHaveProperty('itemListElement');
          expect(Array.isArray(schema.itemListElement)).toBe(true);
          expect(schema.itemListElement.length).toBeGreaterThan(0);
        }
      }

      // Assert that core pages contain valid schema blocks
      if (path.includes('/about/')) {
        expect(hasWebPage).toBe(true);
      } else {
        expect(hasWebSite || hasWebPage).toBe(true);
      }
    });
  }
});
