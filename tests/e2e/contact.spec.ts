import { test, expect } from '@playwright/test';

test.describe('Contact Form Interaction & Spam Protection', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept form submission requests to prevent real submissions to getform.io
    await page.route('https://getform.io/f/allqdeya', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });
  });

  test('submits form successfully and blocks duplicate submission', async ({ page }) => {
    await page.goto('/en/');

    // Scroll to contact section
    await page.locator('#contact').scrollIntoViewIfNeeded();

    // Fill out fields
    await page.fill('#form-name', 'Jane Doe');
    await page.fill('#form-email', 'jane@example.com');
    await page.fill('#form-message', 'I would like to hire you for a GA4 audit.');

    // Honeypot should start empty
    const gotchaValue = await page.locator('#form-gotcha').inputValue();
    expect(gotchaValue).toBe('');

    // Locate submit button
    const submitBtn = page.locator('#submit-button');
    await expect(submitBtn).toBeEnabled();

    // Register the submit listener synchronously
    await page.evaluate(() => {
      const form = document.getElementById('contact-form') as HTMLFormElement | null;
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault(); // Stop navigation so page doesn't unload
          const data = new FormData(form);
          const obj: Record<string, string> = {};
          data.forEach((val, key) => {
            obj[key] = val.toString();
          });
          (window as any).submittedPayload = obj;
        });
      }
    });

    // Dispatch submit event on the form programmatically to run listeners synchronously
    await page.locator('#contact-form').evaluate((form: HTMLFormElement) => {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    // Retrieve the captured payload
    const submittedPayload = await page.evaluate(() => (window as any).submittedPayload);

    // Verify fields in the payload
    expect(submittedPayload.name).toBe('Jane Doe');
    expect(submittedPayload.email).toBe('jane@example.com');
    expect(submittedPayload.message).toBe('I would like to hire you for a GA4 audit.');
    expect(submittedPayload._gotcha).toBe('');

    // Button should change state to prevent duplicate submission
    await expect(submitBtn).toBeDisabled();
    await expect(submitBtn.locator('span')).toContainText('Sending...');
  });

  test('silently rejects submission and resets form if honeypot is filled', async ({ page }) => {
    await page.goto('/en/');

    // Scroll to contact section
    await page.locator('#contact').scrollIntoViewIfNeeded();

    // Fill standard fields
    await page.fill('#form-name', 'Spam Bot');
    await page.fill('#form-email', 'spambot@spam.com');
    await page.fill('#form-message', 'Buy cheap things here!');

    // Populate hidden honeypot field directly in the DOM
    const gotcha = page.locator('#form-gotcha');
    await gotcha.evaluate((el: HTMLInputElement) => {
      el.value = 'bot-value';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Submit button should be enabled
    const submitBtn = page.locator('#submit-button');

    // Set up request intercept listener to fail if a request actually gets sent
    let requestSent = false;
    page.on('request', (req) => {
      if (req.url() === 'https://getform.io/f/allqdeya') {
        requestSent = true;
      }
    });

    // Submit form using dispatchEvent to trigger client-side submit handler robustly
    await page.locator('#contact-form').evaluate((form: HTMLFormElement) => {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    // Assert request was never sent
    await page.waitForTimeout(1000); // Wait briefly to verify no requests triggered
    expect(requestSent).toBe(false);

    // Form inputs should be cleared out after reset
    const nameVal = await page.locator('#form-name').inputValue();
    const emailVal = await page.locator('#form-email').inputValue();
    const gotchaVal = await page.locator('#form-gotcha').inputValue();
    expect(nameVal).toBe('');
    expect(emailVal).toBe('');
    expect(gotchaVal).toBe('');

    // Submit button should remain enabled and not disabled/sending
    await expect(submitBtn).toBeEnabled();
    await expect(submitBtn.locator('span')).toContainText('Send Inquiry');
  });
});
