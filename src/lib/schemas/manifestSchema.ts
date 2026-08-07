import { z } from 'zod';

export const ManifestGalleryItemSchema = z.object({
  type: z.enum(['image', 'video', 'pdf', 'powerbi']),
  title: z.string(),
  url: z.string()
});

export const PublishConfigSchema = z.object({
  enabled: z.boolean().default(true),
  visibility: z.enum(['public', 'private', 'internal']).default('public'),
  featured: z.boolean().default(false),
  priority: z.number().default(99),
  customTitle: z.string().optional()
});

export const ProjectSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  problem: z.string().optional(),
  solution: z.string().optional(),
  businessValue: z.string().optional(),
  status: z.enum(['draft', 'production', 'archived']).optional(),
  tags: z.array(z.string()).optional(),
  cover: z.string().optional(),
  gallery: z.array(ManifestGalleryItemSchema).optional(),
  demo: z.string().url().optional(),
  caseStudy: z.string().optional(),
  capabilities: z.record(z.string(), z.boolean()).optional()
});

export const ManifestSchema = z.object({
  version: z.string().optional(),
  project: ProjectSchema.optional(),
  publish: z.record(z.string(), PublishConfigSchema).optional()
});

export type ParsedManifest = z.infer<typeof ManifestSchema>;
