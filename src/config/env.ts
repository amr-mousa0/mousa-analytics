import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  GITHUB_WEBHOOK_SECRET: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  DEEPL_API_KEY: z.string().optional(),
  GOOGLE_TRANSLATE_API_KEY: z.string().optional(),
  UPSTASH_QSTASH_TOKEN: z.string().optional(),
  UPSTASH_QSTASH_CURRENT_SIGNING_KEY: z.string().optional(),
  UPSTASH_QSTASH_NEXT_SIGNING_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  USE_PERSISTENT_STORAGE: z.string().transform((v) => v === 'true').default(false),
  ENABLE_IDEMPOTENCY: z.string().transform((v) => v === 'true').default(false),
  ENABLE_TRANSLATION_FALLBACK: z.string().transform((v) => v === 'true').default(false),
});

export type EnvConfig = z.infer<typeof envSchema>;

let parsedEnv: EnvConfig;

export function getEnv(): EnvConfig {
  if (!parsedEnv) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.error('❌ Environment validation error:', JSON.stringify(result.error.format(), null, 2));
      throw new Error('Invalid environment variables configuration');
    }
    parsedEnv = result.data;
  }
  return parsedEnv;
}
