import type { PipelineJob, TranslationProvider } from '../../types/providers.js';
import type { NormalizedProjectModel } from '../../types/manifest.js';
import { formatCardDescription } from '../utils/descriptionFormatter.js';
import { TransientError, PermanentError } from '../errors.js';

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

    if (model.problem) {
      translatedModel.problem = formatCardDescription(model.problem);
    }

    try {
      if (targetLang === 'ar' && sourceLang === 'en') {
        if (model.title && !model.titleAr) {
          translatedModel.titleAr = await provider.translate(model.title, sourceLang, targetLang);
        }
        if (model.description && !model.descriptionAr) {
          translatedModel.descriptionAr = await provider.translate(model.description, sourceLang, targetLang);
        }
        if (model.problem && !model.problemAr) {
          const translatedProblem = await provider.translate(model.problem, sourceLang, targetLang);
          translatedModel.problemAr = formatCardDescription(translatedProblem);
        }
        if (model.solution && !model.solutionAr) {
          translatedModel.solutionAr = await provider.translate(model.solution, sourceLang, targetLang);
        }
        if (model.businessValue && !model.businessValueAr) {
          translatedModel.businessValueAr = await provider.translate(model.businessValue, sourceLang, targetLang);
        }

        // Fail-Closed Validation: Ensure critical Arabic fields are present
        if (model.title && (!translatedModel.titleAr || translatedModel.titleAr.trim() === '')) {
          throw new PermanentError(
            `Fail-Closed: Required Arabic title translation is missing for project ${model.projectId}.`
          );
        }
        if (model.description && (!translatedModel.descriptionAr || translatedModel.descriptionAr.trim() === '')) {
          throw new PermanentError(
            `Fail-Closed: Required Arabic description translation is missing for project ${model.projectId}.`
          );
        }
      }
    } catch (error: any) {
      if (error instanceof PermanentError || error instanceof TransientError) {
        throw error;
      }
      if (error.message && error.message.includes('400')) {
        throw new PermanentError(`Translation failed with 400 Bad Request: ${error.message}`);
      }
      throw new TransientError(`Translation failed: ${error.message}`);
    }

    console.log(`[TranslationWorker] Translation completed for ${translatedModel.projectId}`);
    return translatedModel;
  }
}
