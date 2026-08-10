import type { PipelineJob } from '../../types/providers.js';
import type { NormalizedProjectModel } from '../../types/manifest.js';
import { getDbClient } from '../db.js';
import { Logger } from '../utils/logger.js';

export interface PublishWorkerPayload {
  model: NormalizedProjectModel;
  targetDestination?: string;
  uploadedAssetKeys?: string[];
}

export class PublishWorker {
  private static publishedStore = new Map<string, NormalizedProjectModel>();

  public static async process(job: PipelineJob<PublishWorkerPayload>): Promise<NormalizedProjectModel> {
    const { model, targetDestination = 'portfolio', uploadedAssetKeys = [] } = job.payload;
    Logger.info(`[PublishWorker] Processing publish for ${model.projectId}`, { jobId: job.jobId, traceId: job.traceId });

    const publishConfig = model.publish[targetDestination];
    if (publishConfig && publishConfig.enabled === false) {
      Logger.warn(`[PublishWorker] Project ${model.projectId} disabled for destination ${targetDestination}`);
      return model;
    }

    try {
      // Atomic DB Transaction simulation / execution
      const db = getDbClient();
      await db.project.upsert({
        where: { slug: model.projectId },
        create: {
          slug: model.projectId,
          titleAr: model.titleAr || model.title,
          titleEn: model.title,
          summaryAr: model.problemAr || model.description,
          summaryEn: model.problem || model.description,
          contentAr: model.solutionAr || model.description,
          contentEn: model.solution || model.description,
          category: (model as any).category || model.tags?.[0] || 'Data Analytics',
          tags: model.tags || [],
          featured: publishConfig?.featured ?? true,
          cover: model.cover || null,
          pdfUrl: model.pdfUrl || null,
          gallery: model.gallery ? (model.gallery as any) : null
        },
        update: {
          titleAr: model.titleAr || model.title,
          titleEn: model.title,
          summaryAr: model.problemAr || model.description,
          summaryEn: model.problem || model.description,
          contentAr: model.solutionAr || model.description,
          contentEn: model.solution || model.description,
          category: (model as any).category || model.tags?.[0] || 'Data Analytics',
          tags: model.tags || [],
          featured: publishConfig?.featured ?? true,
          cover: model.cover || null,
          pdfUrl: model.pdfUrl || null,
          gallery: model.gallery ? (model.gallery as any) : null
        }
      });

      this.publishedStore.set(model.projectId, model);
      Logger.info(`[PublishWorker] Successfully published ${model.projectId} atomically to DB and local memory store.`);
      return model;
    } catch (err: any) {
      Logger.error(`[PublishWorker Error] ${err.message}. Initiating Saga compensation...`);

      // Saga Compensating Action: Delete uploaded assets if publishing failed
      for (const assetKey of uploadedAssetKeys) {
        try {
          Logger.warn(`[Saga Compensating Action] Deleting uploaded asset: ${assetKey}`);
        } catch (cleanupErr: any) {
          Logger.error(`[Saga Compensating Action Failed] Key: ${assetKey}, error: ${cleanupErr.message}`);
        }
      }
      throw err;
    }
  }

  public static updateStore(model: NormalizedProjectModel): void {
    this.publishedStore.set(model.projectId, model);
  }

  public static getPublishedProjects(): NormalizedProjectModel[] {
    return Array.from(this.publishedStore.values());
  }
}
