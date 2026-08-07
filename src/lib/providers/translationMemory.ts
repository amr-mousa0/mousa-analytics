import crypto from 'crypto';
import { Logger } from '../utils/logger.js';

/**
 * Translation Memory Store (Redis / Vercel KV interface)
 */
export class TranslationMemory {
  private static kvUrl = process.env.KV_REST_API_URL;
  private static kvToken = process.env.KV_REST_API_TOKEN;

  /**
   * Generates deterministic CacheKey:
   * SHA256(ModelVersion + PromptVersion + SourceLang + TargetLang + Text)
   */
  public static generateCacheKey(
    text: string,
    sourceLang: string,
    targetLang: string,
    modelVersion: string,
    promptVersion: string
  ): string {
    const raw = `${modelVersion}:${promptVersion}:${sourceLang}:${targetLang}:${text}`;
    return `translation:${crypto.createHash('sha256').update(raw).digest('hex')}`;
  }

  public static async get(key: string): Promise<string | undefined> {
    if (!this.kvUrl || !this.kvToken) return undefined;

    try {
      const res = await fetch(`${this.kvUrl}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${this.kvToken}` }
      });
      const data = await res.json();
      return data.result || undefined;
    } catch (err: any) {
      Logger.warn(`[TranslationMemory] Cache get failed: ${err.message}`);
      return undefined;
    }
  }

  public static async set(key: string, value: string): Promise<void> {
    if (!this.kvUrl || !this.kvToken) return;

    try {
      await fetch(`${this.kvUrl}/set/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.kvToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(value)
      });
    } catch (err: any) {
      Logger.warn(`[TranslationMemory] Cache set failed: ${err.message}`);
    }
  }
}
