import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  GITHUB_WEBHOOK_SECRET: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_PAT: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  DEEPL_API_KEY: z.string().optional(),
  GOOGLE_TRANSLATE_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  UPSTASH_QSTASH_TOKEN: z.string().optional(),
  QSTASH_TOKEN: z.string().optional(),
  UPSTASH_QSTASH_CURRENT_SIGNING_KEY: z.string().optional(),
  QSTASH_CURRENT_SIGNING_KEY: z.string().optional(),
  UPSTASH_QSTASH_NEXT_SIGNING_KEY: z.string().optional(),
  QSTASH_NEXT_SIGNING_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  KV_REST_API_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  KV_REST_API_TOKEN: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  POSTGRES_PRISMA_URL: z.string().optional(),
  POSTGRES_URL: z.string().optional(),
  USE_PERSISTENT_STORAGE: z.string().transform((v) => v === 'true').default(false),
  ENABLE_IDEMPOTENCY: z.string().transform((v) => v === 'true').default(true),
  ENABLE_TRANSLATION_FALLBACK: z.string().transform((v) => v === 'true').default(true),
});

export interface EnvConfig {
  NODE_ENV: 'development' | 'test' | 'production';
  GITHUB_WEBHOOK_SECRET?: string;
  GITHUB_TOKEN?: string;
  OPENAI_API_KEY?: string;
  DEEPL_API_KEY?: string;
  GOOGLE_TRANSLATE_API_KEY?: string;
  GEMINI_API_KEY?: string;
  UPSTASH_QSTASH_TOKEN?: string;
  UPSTASH_QSTASH_CURRENT_SIGNING_KEY?: string;
  UPSTASH_QSTASH_NEXT_SIGNING_KEY?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  DATABASE_URL?: string;
  USE_PERSISTENT_STORAGE: boolean;
  ENABLE_IDEMPOTENCY: boolean;
  ENABLE_TRANSLATION_FALLBACK: boolean;
}

let parsedEnv: EnvConfig;

export function getEnv(): EnvConfig {
  if (!parsedEnv) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.error('❌ Environment validation error:', JSON.stringify(result.error.format(), null, 2));
      throw new Error('Invalid environment variables configuration');
    }
    const raw = result.data;
    
    // Automatically map Vercel / Upstash integration naming conventions
    parsedEnv = {
      NODE_ENV: raw.NODE_ENV,
      GITHUB_WEBHOOK_SECRET: raw.GITHUB_WEBHOOK_SECRET,
      GITHUB_TOKEN: raw.GITHUB_TOKEN || raw.GITHUB_PAT,
      OPENAI_API_KEY: raw.OPENAI_API_KEY,
      DEEPL_API_KEY: raw.DEEPL_API_KEY,
      GOOGLE_TRANSLATE_API_KEY: raw.GOOGLE_TRANSLATE_API_KEY,
      GEMINI_API_KEY: raw.GEMINI_API_KEY,
      UPSTASH_QSTASH_TOKEN: raw.UPSTASH_QSTASH_TOKEN || raw.QSTASH_TOKEN,
      UPSTASH_QSTASH_CURRENT_SIGNING_KEY: raw.UPSTASH_QSTASH_CURRENT_SIGNING_KEY || raw.QSTASH_CURRENT_SIGNING_KEY,
      UPSTASH_QSTASH_NEXT_SIGNING_KEY: raw.UPSTASH_QSTASH_NEXT_SIGNING_KEY || raw.QSTASH_NEXT_SIGNING_KEY,
      UPSTASH_REDIS_REST_URL: raw.UPSTASH_REDIS_REST_URL || raw.KV_REST_API_URL,
      UPSTASH_REDIS_REST_TOKEN: raw.UPSTASH_REDIS_REST_TOKEN || raw.KV_REST_API_TOKEN,
      DATABASE_URL: raw.DATABASE_URL || raw.POSTGRES_PRISMA_URL || raw.POSTGRES_URL,
      USE_PERSISTENT_STORAGE: raw.USE_PERSISTENT_STORAGE,
      ENABLE_IDEMPOTENCY: raw.ENABLE_IDEMPOTENCY,
      ENABLE_TRANSLATION_FALLBACK: raw.ENABLE_TRANSLATION_FALLBACK,
    };
  }
  return parsedEnv;
}
