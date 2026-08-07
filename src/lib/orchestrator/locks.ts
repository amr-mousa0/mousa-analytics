import { getEnv } from '../../config/env.js';
import { Logger } from '../utils/logger.js';

export class DistributedLock {
  private static activeLocks = new Set<string>();

  public static async acquire(resourceKey: string, ttlMs = 10000): Promise<boolean> {
    const env = getEnv();
    const lockKey = `lock:${resourceKey}`;

    if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        const res = await fetch(`${env.UPSTASH_REDIS_REST_URL}/set/${lockKey}/locked?NX=true&PX=${ttlMs}`, {
          headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}` }
        });
        const data: any = await res.json();
        return data.result === 'OK';
      } catch (err) {
        Logger.warn('[DistributedLock] Redis lock failed, falling back to memory lock');
      }
    }

    if (this.activeLocks.has(lockKey)) return false;
    this.activeLocks.add(lockKey);
    setTimeout(() => this.activeLocks.delete(lockKey), ttlMs);
    return true;
  }

  public static async release(resourceKey: string): Promise<void> {
    const env = getEnv();
    const lockKey = `lock:${resourceKey}`;

    if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        await fetch(`${env.UPSTASH_REDIS_REST_URL}/del/${lockKey}`, {
          headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}` }
        });
      } catch (err) {
        Logger.warn('[DistributedLock] Redis lock release failed');
      }
    }
    this.activeLocks.delete(lockKey);
  }
}
