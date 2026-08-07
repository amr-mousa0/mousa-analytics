import { getEnv } from '../../config/env.js';
import { Logger } from '../utils/logger.js';

export class IdempotencyStore {
  private static localMap = new Map<string, { status: string; timestamp: number }>();

  public static async isDuplicate(key: string): Promise<boolean> {
    const env = getEnv();
    if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        const res = await fetch(`${env.UPSTASH_REDIS_REST_URL}/get/idempotency:${key}`, {
          headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}` }
        });
        const data: any = await res.json();
        if (data.result) return true;
      } catch (err) {
        Logger.warn('[IdempotencyStore] Failed to query Redis, falling back to local store');
      }
    }
    return this.localMap.has(key);
  }

  public static async markProcessed(key: string, ttlSeconds = 86400): Promise<void> {
    const env = getEnv();
    if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        await fetch(`${env.UPSTASH_REDIS_REST_URL}/set/idempotency:${key}/processed?EX=${ttlSeconds}`, {
          headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}` }
        });
        return;
      } catch (err) {
        Logger.warn('[IdempotencyStore] Failed to save to Redis, falling back to local store');
      }
    }
    this.localMap.set(key, { status: 'processed', timestamp: Date.now() });
  }
}
