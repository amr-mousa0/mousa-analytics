import type { PipelineJob, TranslationProvider } from '../../types/providers.js';
import type { NormalizedProjectModel } from '../../types/manifest.js';

export interface TranslationWorkerPayload {
  model: NormalizedProjectModel;
  sourceLang: string;
  targetLang: string;
}

export class TranslationWorker {
  public static async process(
    job: PipelineJob<TranslationWorkerPayload>,
    provider: TranslationProvider
  ): Promise<NormalizedProjectModel> {
    console.log(`[TranslationWorker] Processing jobId=${job.jobId} traceId=${job.traceId} projectId=${job.payload.model.projectId}`);

    const { model, sourceLang, targetLang } = job.payload;
    const translatedModel = { ...model };

    if (targetLang === 'ar' && sourceLang === 'en') {
      if (model.title && !model.titleAr) {
        translatedModel.titleAr = await provider.translate(model.title, sourceLang, targetLang);
      }
      if (model.description && !model.descriptionAr) {
        translatedModel.descriptionAr = await provider.translate(model.description, sourceLang, targetLang);
      }
      if (model.problem && !model.problemAr) {
        translatedModel.problemAr = await provider.translate(model.problem, sourceLang, targetLang);
      }
      if (model.solution && !model.solutionAr) {
        translatedModel.solutionAr = await provider.translate(model.solution, sourceLang, targetLang);
      }
      if (model.businessValue && !model.businessValueAr) {
        translatedModel.businessValueAr = await provider.translate(model.businessValue, sourceLang, targetLang);
      }
    }

    console.log(`[TranslationWorker] Translation completed for ${translatedModel.projectId}`);
    return translatedModel;
  }
}
