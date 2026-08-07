import { defineCollection, z, type SchemaContext } from 'astro:content';

const seoCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(60, "Title should be under 60 characters for optimal search display"),
    description: z.string().max(160, "Description should be under 160 characters for search snippets"),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().optional(),
    canonicalUrl: z.string().url().optional(),
    noindex: z.boolean().default(false),
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
    title: z.string().describe("The professional title of the service"),
    description: z.string().describe("A brief summary of the service's value proposition"),
    icon: z.string().describe("FontAwesome icon name (e.g. 'table', 'chart-simple')"),
    features: z.array(z.string()).default([]).describe("Quick bullet features of this service"),
    priority: z.number().int().default(0).describe("Sorting priority on the services listing (lower is first)"),
    category: z.enum(["Data Analytics", "Digital Marketing", "Systems Automation", "Web Development"]).describe("The business vertical category"),
    tags: z.array(z.string()).default([]).describe("Technology tags associated with the service"),
    translationKey: z.string().optional().describe("Legacy translation mapping key, replaced by filename slug"),
    draft: z.boolean().default(false).describe("If true, this page won't be built in production"),
    featured: z.boolean().default(false).describe("If true, this service will be featured first on the homepage"),
    publishedDate: z.coerce.date().describe("Date when the service was first published"),
    coverImage: z.any().optional().describe("The main cover image for the service proposal card"),
    
    // Detailed Proposal Fields
    execSummaryText: z.string().describe("Main executive summary text explaining the value proposition"),
    scopeTitle: z.string().optional().describe("Custom heading for the Scope of Work section"),
    scopeItems: z.array(z.object({
      title: z.string(),
      desc: z.string(),
    })).default([]).describe("Detailed items included in the scope of work"),
    deliverablesTitle: z.string().optional().describe("Custom heading for the Business ROI & Deliverables section"),
    deliverablesItems: z.array(z.string()).default([]).describe("Tangible deliverables the client will receive"),
    ctaTitle: z.string().optional().describe("Custom heading for the call-to-action block"),
    ctaDesc: z.string().optional().describe("Custom description text for the call-to-action block"),
    ctaBtn: z.string().optional().describe("Custom button text for the WhatsApp CTA"),
    whatsappMessage: z.string().optional().describe("Pre-filled message text when redirecting the user to WhatsApp"),
    faqTitle: z.string().optional().describe("Custom heading for the FAQ section"),
    faqItems: z.array(z.object({
      q: z.string(),
      a: z.string(),
    })).default([]).describe("List of frequently asked questions and answers"),
  }),
});

const projectsCollection = defineCollection({
  type: 'content',
  schema: ({ image }: SchemaContext) => z.object({
    title: z.string().describe("The case study project title"),
    projectBadge: z.string().describe("Uppercase mono badge overlay (e.g. 'DATA ANALYTICS & BI')"),
    problemTitle: z.string().optional().describe("Custom heading for the Problem section"),
    problemText: z.string().describe("Contextual description of the client's business problems"),
    solutionTitle: z.string().optional().describe("Custom heading for the Solution section"),
    solutionText: z.string().describe("Detailed description of our analytical or systems solution"),
    impactTitle: z.string().optional().describe("Custom heading for the Impact section"),
    impactText: z.string().describe("Data-driven business impact and ROI metrics achieved"),
    galleryTab: z.string().optional().describe("Custom label for the project gallery tab"),
    dashboardTab: z.string().optional().describe("Custom label for the interactive dashboard tab"),
    dashboardPrompt: z.string().optional().describe("Interactive dashboard call-to-action helper prompt"),
    dashboardBtn: z.string().optional().describe("Interactive dashboard activation button label"),
    inquireTitle: z.string().optional().describe("Custom heading for the bottom inquiry section"),
    inquireDesc: z.string().optional().describe("Custom description for the bottom inquiry section"),
    inquireBtn: z.string().optional().describe("Custom inquiry button text"),
    galleryImages: z.array(z.any()).default([]).describe("Snapshots of the project/dashboard for the visual gallery"),
    coverImage: z.any().optional().describe("The main cover image showing in lists and header"),
    githubUrl: z.string().url().optional().describe("Optional link to the public GitHub code repository"),
    dashboardUrl: z.string().url().optional().describe("Optional link to embed the live Power BI / looker dashboard"),
    whatsappStartProjectMsg: z.string().describe("Pre-filled WhatsApp message for initiating a similar project"),
    whatsappOpenDashboardMsg: z.string().describe("Pre-filled WhatsApp message for requesting access to dashboard"),
    priority: z.number().int().default(0).describe("Sorting order on the home page grid"),
    category: z.enum(["Data Analytics", "Digital Marketing", "Systems Automation", "Web Development"]).describe("Service vertical category of the project"),
    tags: z.array(z.string()).default([]).describe("Specific tools or technologies used (e.g. 'Power BI', 'SQL')"),
    translationKey: z.string().optional().describe("Legacy translation mapping key, replaced by filename slug"),
    draft: z.boolean().default(false).describe("If draft is true, page will not build in production"),
    featured: z.boolean().default(false).describe("Featured flag to pin this project on the homepage slider"),
    publishedDate: z.coerce.date().describe("Date when case study was written"),
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
    title: z.string().describe("Main large headline on the homepage"),
    bio: z.string().describe("Paragraph text beneath the headline"),
    primaryBtn: z.string().describe("Label of the primary action button"),
    secondaryBtn: z.string().describe("Label of the secondary action button"),
    trendingLabel: z.string().describe("Label of the guarantees/trust section"),
    trendingItems: z.string().describe("Separated by bullets (•), trust badges underneath the buttons"),
  }),
});

const blogCollection = defineCollection({
  type: 'content',
  schema: ({ image }: SchemaContext) => z.object({
    title: z.string().max(60, "Meta title should be under 60 characters for optimal display"),
    description: z.string().max(160, "Meta description should be under 160 characters for search snippets"),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    coverImage: z.any().optional(),
    author: z.string().default("Amr Mousa"),
    category: z.enum(["Data Analytics", "Digital Marketing", "Systems Automation", "Web Development"]),
    tags: z.array(z.string()).default([]),
    translationKey: z.string().optional().describe("Legacy translation mapping key, replaced by filename slug"),
    draft: z.boolean().default(true),
    seo: seoFieldsSchema,
  }),
});

const capabilitiesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().describe("Capability title"),
    description: z.string().describe("Brief capability description"),
    tag: z.string().optional().describe("Category tag badge"),
    icon: z.string().optional().describe("Optional icon identifier"),
    priority: z.number().int().default(0).describe("Sort order priority"),
    draft: z.boolean().default(false).describe("Draft status flag"),
  }),
});

export const collections = {
  seo: seoCollection,
  services: servicesCollection,
  socials: socialsCollection,
  hero: heroCollection,
  projects: projectsCollection,
  blog: blogCollection,
  capabilities: capabilitiesCollection,
};

