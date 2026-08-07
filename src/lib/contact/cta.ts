import { siteConfig } from '../config/site.config.js';

export interface WhatsAppOptions {
  message?: string;
  lang?: 'en' | 'ar';
}

/**
 * Single Typed Contact CTA Helper (Task APP-001 / ADR 004)
 * Enforces single source of truth for WhatsApp URLs and contact links.
 */
export function getWhatsAppUrl(options: WhatsAppOptions = {}): string {
  const { message, lang = 'ar' } = options;
  const phone = siteConfig.public.whatsappNumber;

  const defaultMessage = lang === 'ar'
    ? 'مرحباً عمرو، أود الاستفسار عن خدمات تحليل البيانات والحلول المتاحة.'
    : "Hi Amr, I'd like to inquire about data analytics and systems services.";

  const textParam = encodeURIComponent(message || defaultMessage);
  return `https://wa.me/${phone}?text=${textParam}`;
}

export function getContactHref(type: 'whatsapp' | 'email' | 'phone', lang: 'en' | 'ar' = 'ar'): string {
  if (type === 'whatsapp') {
    return getWhatsAppUrl({ lang });
  }
  if (type === 'email') {
    return `mailto:${siteConfig.public.contactEmail}`;
  }
  if (type === 'phone') {
    return `tel:+${siteConfig.public.whatsappNumber}`;
  }
  return '#contact';
}
