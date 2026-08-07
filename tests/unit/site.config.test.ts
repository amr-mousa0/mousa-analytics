import { describe, it, expect } from 'vitest';
import { siteConfig, siteConfigSchema } from '../../src/lib/config/site.config.js';

describe('TASK-FND-001: Centralized Site Runtime Configuration Provider', () => {
  it('exports canonical brand siteName matching Mousa Analytics', () => {
    expect(siteConfig.public.siteName).toBe('Mousa Analytics');
  });

  it('exports canonical contact phone and whatsapp links matching AD-03', () => {
    expect(siteConfig.public.contactPhone).toBe('201017749925');
    expect(siteConfig.public.whatsappBaseUrl).toBe('https://wa.me/201017749925');
  });

  it('validates siteConfig against siteConfigSchema without error', () => {
    const result = siteConfigSchema.safeParse(siteConfig);
    expect(result.success).toBe(true);
  });

  it('throws validation error when invalid email or phone configuration is supplied', () => {
    const invalidConfig = {
      ...siteConfig,
      public: {
        ...siteConfig.public,
        contactEmail: 'not-an-email',
      },
    };
    const result = siteConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('ensures siteConfig instance is frozen and immutable', () => {
    expect(Object.isFrozen(siteConfig)).toBe(true);
  });
});
