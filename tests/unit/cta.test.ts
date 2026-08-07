import { describe, it, expect } from 'vitest';
import { getWhatsAppUrl, getContactHref } from '../../src/lib/contact/cta.js';
import { siteConfig } from '../../src/lib/config/site.config.js';

describe('APP-001 Contact CTA & WhatsApp Contract', () => {
  it('generates WhatsApp URL using canonical phone number from site.config.ts', () => {
    const defaultUrl = getWhatsAppUrl({ lang: 'ar' });
    expect(defaultUrl).toContain(`https://wa.me/${siteConfig.public.whatsappNumber}`);
    expect(defaultUrl).toContain('text=');

    const customMsgUrl = getWhatsAppUrl({ message: 'Hello Amr', lang: 'en' });
    expect(customMsgUrl).toContain('text=Hello%20Amr');
  });

  it('generates typed contact hrefs for email, phone, and whatsapp', () => {
    const emailHref = getContactHref('email');
    expect(emailHref).toBe(`mailto:${siteConfig.public.contactEmail}`);

    const phoneHref = getContactHref('phone');
    expect(phoneHref).toBe(`tel:+${siteConfig.public.whatsappNumber}`);

    const waHref = getContactHref('whatsapp', 'en');
    expect(waHref).toContain(`https://wa.me/${siteConfig.public.whatsappNumber}`);
  });
});
