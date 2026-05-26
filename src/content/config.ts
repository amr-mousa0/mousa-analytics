import { defineCollection, z, type SchemaContext } from 'astro:content';

const seoCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(60, "Title should be under 60 characters for optimal search display"),
    description: z.string().max(160, "Description should be under 160 characters for search snippets"),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().optional(),
  }),
});

const seoFieldsSchema = z.object({
  metaTitle: z.string(),
  metaDescription: z.string(),
  ogImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
  noindex: z.boolean().default(false),
});

const servicesCollection = defineCollection({
  type: 'content',
  schema: ({ image }: SchemaContext) => z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string(),
    features: z.array(z.string()).default([]),
    priority: z.number().int().default(0),
    category: z.enum(["Data Analytics", "Digital Marketing", "Systems Automation", "Web Development"]),
    tags: z.array(z.string()).default([]),
    translationKey: z.string(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    publishedDate: z.coerce.date(),
    coverImage: image().optional(),
    
    // Detailed Proposal Fields
    execSummaryText: z.string(),
    scopeTitle: z.string().optional(),
    scopeItems: z.array(z.object({
      title: z.string(),
      desc: z.string(),
    })).default([]),
    deliverablesTitle: z.string().optional(),
    deliverablesItems: z.array(z.string()).default([]),
    ctaTitle: z.string().optional(),
    ctaDesc: z.string().optional(),
    ctaBtn: z.string().optional(),
    whatsappMessage: z.string().optional(),
    faqTitle: z.string().optional(),
    faqItems: z.array(z.object({
      q: z.string(),
      a: z.string(),
    })).default([]),
    
    seo: seoFieldsSchema,
  }),
});

const projectsCollection = defineCollection({
  type: 'content',
  schema: ({ image }: SchemaContext) => z.object({
    title: z.string(),
    projectBadge: z.string(),
    problemTitle: z.string(),
    problemText: z.string(),
    solutionTitle: z.string(),
    solutionText: z.string(),
    impactTitle: z.string(),
    impactText: z.string(),
    galleryTab: z.string(),
    dashboardTab: z.string(),
    dashboardPrompt: z.string(),
    dashboardBtn: z.string(),
    inquireTitle: z.string(),
    inquireDesc: z.string(),
    inquireBtn: z.string(),
    galleryImages: z.array(image()),
    coverImage: image(),
    githubUrl: z.string().url().optional(),
    dashboardUrl: z.string().url().optional(),
    whatsappStartProjectMsg: z.string(),
    whatsappOpenDashboardMsg: z.string(),
    priority: z.number().int().default(0),
    category: z.enum(["Data Analytics", "Digital Marketing", "Systems Automation", "Web Development"]),
    tags: z.array(z.string()).default([]),
    translationKey: z.string(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    publishedDate: z.coerce.date(),
    seo: seoFieldsSchema,
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
    title: z.string(),
    eyebrow: z.string(),
    bio: z.string(),
    primaryBtn: z.string(),
    secondaryBtn: z.string(),
    floatingBadge: z.string(),
    statLeftTitle: z.string(),
    statLeftVal: z.string(),
    statRightTitle: z.string(),
    statRightVal: z.string(),
    trendingLabel: z.string(),
    trendingItems: z.string(),
  }),
});

const blogCollection = defineCollection({
  type: 'content',
  schema: ({ image }: SchemaContext) => z.object({
    title: z.string().max(60, "Meta title should be under 60 characters for optimal display"),
    description: z.string().max(160, "Meta description should be under 160 characters for search snippets"),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    coverImage: image().optional(),
    author: z.string().default("Amr Mousa"),
    category: z.enum(["Data Analytics", "Digital Marketing", "Systems Automation", "Web Development"]),
    tags: z.array(z.string()).default([]),
    translationKey: z.string(),
    draft: z.boolean().default(true),
    seo: seoFieldsSchema,
  }),
});

const testimonialsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    clientName: z.string(),
    company: z.string().optional(),
    role: z.string().optional(),
    feedback: z.string(),
    rating: z.number().min(1).max(5).default(5),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  seo: seoCollection,
  services: servicesCollection,
  socials: socialsCollection,
  hero: heroCollection,
  projects: projectsCollection,
  blog: blogCollection,
  testimonials: testimonialsCollection,
};

