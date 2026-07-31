import type { QueueProvider, PipelineJob } from '../../types/providers.js';

export class MemoryQueueProvider implements QueueProvider {
  public id = 'memory-queue';
  private queue: PipelineJob[] = [];
  private jobsMap = new Map<string, PipelineJob>();

  public async enqueue<T>(
    jobInput: Omit<PipelineJob<T>, 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<PipelineJob<T>> {
    const now = new Date().toISOString();
    const job: PipelineJob<T> = {
      ...jobInput,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    };

    this.queue.push(job);
    this.jobsMap.set(job.jobId, job);
    return job;
  }

  public async dequeue<T>(queueName?: string): Promise<PipelineJob<T> | null> {
    if (this.queue.length === 0) return null;

    const job = (queueName
      ? this.queue.find(j => j.type === queueName && j.status === 'pending')
      : this.queue.find(j => j.status === 'pending')) as PipelineJob<T> | undefined;

    if (!job) return null;

    job.status = 'processing';
    job.updatedAt = new Date().toISOString();
    return job;
  }

  public async getJob<T>(jobId: string): Promise<PipelineJob<T> | null> {
    return (this.jobsMap.get(jobId) as PipelineJob<T>) || null;
  }

  public completeJob(jobId: string): void {
    const job = this.jobsMap.get(jobId);
    if (job) {
      job.status = 'completed';
      job.updatedAt = new Date().toISOString();
      // Remove from active queue
      this.queue = this.queue.filter(j => j.jobId !== jobId);
    }
  }

  public failJob(jobId: string, error: string): void {
    const job = this.jobsMap.get(jobId);
    if (job) {
      job.status = 'failed';
      job.error = error;
      job.updatedAt = new Date().toISOString();
    }
  }
}
