import { defineCollection, z } from 'astro:content';

const seoCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(60, "Title should be under 60 characters for optimal search display"),
    description: z.string().max(160, "Description should be under 160 characters for search snippets"),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().optional(),
  }),
});

const servicesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string().describe("Lucide icon identifier name"),
    features: z.array(z.string()).describe("Bullet list of service details"),
    priority: z.number().int().default(0).describe("Order weight of service display"),
  }),
});

const socialsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    url: z.string().url(),
    icon: z.string().describe("FontAwesome or custom icon class"),
    priority: z.number().int().default(0),
  }),
});

const heroCollection = defineCollection({
  type: 'content',
  schema: z.object({
    eyebrow: z.string(),
    bio: z.string(),
    primaryBtn: z.string(),
    secondaryBtn: z.string(),
    floatingBadge: z.string(),
    statLeftTitle: z.string(),
    statLeftVal: z.string(),
    statRightTitle: z.string(),
    statRightVal: z.string(),
  }),
});

export const collections = {
  seo: seoCollection,
  services: servicesCollection,
  socials: socialsCollection,
  hero: heroCollection,
};
