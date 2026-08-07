/**
 * Typed Site & Runtime Configuration Source of Truth
 * Governed by AD-03, 002-configuration-and-identity.md, and TASK-FND-001
 */
import { z } from 'zod';

export const publicSiteConfigSchema = z.object({
  siteName: z.string().min(1),
  domain: z.string().min(1),
  contactPhone: z.string().min(1),
  whatsappNumber: z.string().min(1),
  contactEmail: z.string().email(),
  whatsappBaseUrl: z.string().min(1),
  socials: z.object({
    github: z.string().url(),
    linkedin: z.string().url(),
    whatsapp: z.string().url(),
  }),
});

export const serverSiteConfigSchema = z.object({
  allowedOrigins: z.array(z.string()),
  timeouts: z.object({
    defaultApiMs: z.number().positive(),
  }),
  rateLimits: z.object({
    windowMs: z.number().positive(),
    maxRequests: z.number().positive(),
  }),
});

export const siteConfigSchema = z.object({
  public: publicSiteConfigSchema,
  server: serverSiteConfigSchema,
});

export type PublicSiteConfig = z.infer<typeof publicSiteConfigSchema>;
export type ServerSiteConfig = z.infer<typeof serverSiteConfigSchema>;
export type SiteConfig = z.infer<typeof siteConfigSchema>;

const defaultDomain = process.env.PUBLIC_SITE_URL || 'mousa-analytics.vercel.app';
const contactPhone = '201017749925';
const contactEmail = 'Amrmousa240@gmail.com';

const rawSiteConfig: SiteConfig = {
  public: {
    siteName: 'Mousa Analytics',
    domain: defaultDomain,
    contactPhone,
    whatsappNumber: contactPhone,
    contactEmail,
    whatsappBaseUrl: `https://wa.me/${contactPhone}`,
    socials: {
      github: 'https://github.com/amr-mousa0',
      linkedin: 'https://www.linkedin.com/in/amr-mousa0/',
      whatsapp: `https://wa.me/${contactPhone}`,
    },
  },
  server: {
    allowedOrigins: [
      'http://localhost:4321',
      'http://localhost:3000',
      'http://127.0.0.1:4321',
      'https://mousa-analytics.vercel.app',
      `https://${defaultDomain}`,
    ],
    timeouts: {
      defaultApiMs: 5000,
    },
    rateLimits: {
      windowMs: 60000,
      maxRequests: 100,
    },
  },
};

// Validate and freeze configuration instance
export const siteConfig: Readonly<SiteConfig> = Object.freeze(siteConfigSchema.parse(rawSiteConfig));
