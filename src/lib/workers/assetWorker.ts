import type { PipelineJob, StorageProvider } from '../../types/providers.js';
import type { NormalizedProjectModel } from '../../types/manifest.js';

export interface AssetWorkerPayload {
  model: NormalizedProjectModel;
}

export class AssetWorker {
  public static async process(
    job: PipelineJob<AssetWorkerPayload>,
    storageProvider: StorageProvider
  ): Promise<NormalizedProjectModel> {
    console.log(`[AssetWorker] Processing jobId=${job.jobId} traceId=${job.traceId} projectId=${job.payload.model.projectId}`);

    const model = { ...job.payload.model };

    if (model.cover) {
      model.cover = storageProvider.getPublicUrl(
        model.cover.startsWith('assets/') ? `/${model.cover}` : model.cover
      );
    }

    model.gallery = model.gallery.map(item => ({
      ...item,
      url: item.url.startsWith('http://') || item.url.startsWith('https://')
        ? item.url
        : storageProvider.getPublicUrl(
            item.url.startsWith('assets/') ? `/${item.url}` : item.url
          )
    }));

    console.log(`[AssetWorker] Asset optimization completed for ${model.projectId}`);
    return model;
  }
}
