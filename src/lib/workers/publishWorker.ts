import type { PipelineJob } from '../../types/providers.js';
import type { NormalizedProjectModel } from '../../types/manifest.js';

export interface PublishWorkerPayload {
  model: NormalizedProjectModel;
  targetDestination?: string;
}

export class PublishWorker {
  private static publishedStore = new Map<string, NormalizedProjectModel>();

  public static async process(job: PipelineJob<PublishWorkerPayload>): Promise<NormalizedProjectModel> {
    console.log(`[PublishWorker] Publishing jobId=${job.jobId} traceId=${job.traceId} projectId=${job.payload.model.projectId}`);

    const model = job.payload.model;
    const dest = job.payload.targetDestination || 'portfolio';

    const publishConfig = model.publish[dest];
    if (publishConfig && publishConfig.enabled === false) {
      console.log(`[PublishWorker] Project ${model.projectId} disabled for destination ${dest}`);
      return model;
    }

    this.publishedStore.set(model.projectId, model);
    console.log(`[PublishWorker] Successfully published ${model.projectId} to ${dest}`);
    return model;
  }

  public static getPublishedProjects(): NormalizedProjectModel[] {
    return Array.from(this.publishedStore.values());
  }
}
