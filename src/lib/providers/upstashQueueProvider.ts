import type { QueueProvider, PipelineJob } from '../../types/providers.js';
import { getEnv } from '../../config/env.js';
import { Logger } from '../utils/logger.js';

export class UpstashQueueProvider implements QueueProvider {
  public id = 'upstash-qstash';

  private jobs = new Map<string, PipelineJob<any>>();

  public async enqueue<T>(jobData: Omit<PipelineJob<T>, 'status' | 'createdAt' | 'updatedAt'>): Promise<PipelineJob<T>> {
    const env = getEnv();
    const now = new Date().toISOString();
    const job: PipelineJob<T> = {
      ...jobData,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    };

    this.jobs.set(job.jobId, job);

    if (env.UPSTASH_QSTASH_TOKEN) {
      try {
        Logger.info(`[Upstash QStash] Enqueueing job ${job.jobId} to QStash endpoint`);
        const workerUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}/api/internal/worker`
          : 'http://localhost:3000/api/internal/worker';

        await fetch(`https://qstash.upstash.io/v2/publish/${encodeURIComponent(workerUrl)}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.UPSTASH_QSTASH_TOKEN}`,
            'Content-Type': 'application/json',
            'Upstash-Retries': '3',
            'Upstash-Callback': `${workerUrl}?action=dlq`
          },
          body: JSON.stringify(job)
        });
      } catch (err: any) {
        Logger.error(`[Upstash QStash Error] Failed to publish job: ${err.message}`);
      }
    } else {
      Logger.warn(`[Upstash QStash] UPSTASH_QSTASH_TOKEN missing, job stored in local queue memory.`);
    }

    return job;
  }

  public async dequeue<T>(queueName?: string): Promise<PipelineJob<T> | null> {
    for (const [id, job] of this.jobs.entries()) {
      if (job.status === 'pending') {
        job.status = 'processing';
        job.updatedAt = new Date().toISOString();
        return job as PipelineJob<T>;
      }
    }
    return null;
  }

  public async getJob<T>(jobId: string): Promise<PipelineJob<T> | null> {
    return (this.jobs.get(jobId) as PipelineJob<T>) || null;
  }
}
