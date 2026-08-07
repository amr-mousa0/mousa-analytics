import type { PipelineJob } from '../../types/providers.js';
import type { NormalizedProjectModel, RepositoryManifest } from '../../types/manifest.js';
import { MemoryQueueProvider } from '../providers/queueProvider.js';
import { getProductionStorageProvider } from '../providers/storageProvider.js';
import { TranslationProviderFactory } from '../providers/translationProviderFactory.js';
import { GitHubWorker } from '../workers/githubWorker.js';
import { TranslationWorker } from '../workers/translationWorker.js';
import { AssetWorker } from '../workers/assetWorker.js';
import { PublishWorker } from '../workers/publishWorker.js';
import { fetchManifest } from '../services/manifestFetcher.js';
import { getSafeProjects } from '../../scripts/projectsHelper.js';
import { getDbClient } from '../db.js';
import { FeatureFlagManager } from '../flags.js';
import { TransientError, PermanentError } from '../errors.js';
import { Logger } from '../utils/logger.js';

export interface WebhookPushPayload {
  ref?: string;
  after?: string;
  installation?: {
    id: number;
    node_id?: string;
  };
  head_commit?: {
    id: string;
    message?: string;
    added?: string[];
    modified?: string[];
  };
  repository?: {
    name: string;
    full_name?: string;
    homepage?: string;
    default_branch?: string;
  };
  manifestRaw?: string;
  readmeRaw?: string;
  treeRaw?: Array<{ path: string; type: 'blob' | 'tree'; sha: string }>;
}

export class PipelineOrchestrator {
  private static queueProvider = new MemoryQueueProvider();

  private static get storageProvider() {
    return getProductionStorageProvider();
  }

  private static get translationProvider() {
    return TranslationProviderFactory.getProvider();
  }

  private static async updateJobState(jobId: string, traceId: string, status: string, stage: number, payload: any, error?: string): Promise<void> {
    try {
      const db = getDbClient();
      await db.jobState.upsert({
        where: { jobId },
        create: {
          jobId,
          traceId,
          type: 'repo_sync',
          status,
          currentStage: stage,
          payload: JSON.parse(JSON.stringify(payload)), // Strip undefined
          error: error || null
        },
        update: {
          status,
          currentStage: stage,
          payload: JSON.parse(JSON.stringify(payload)),
          error: error || null
        }
      });
      Logger.debug(`[JobState] Updated jobId: ${jobId} -> Stage: ${stage} (${status})`);
    } catch (dbErr: any) {
      Logger.warn(`[JobState] Failed to persist state for ${jobId}: ${dbErr.message}`);
    }
  }

  private static checkAbort(signal?: AbortSignal) {
    if (signal?.aborted) {
      throw new TransientError('Job interrupted by graceful shutdown (AbortSignal).');
    }
  }

  /**
   * Stage 2: Enqueue repository synchronization job into pipeline queue.
   */
  public static async enqueueRepoSync(payload: WebhookPushPayload): Promise<{ jobId: string; traceId: string; result?: NormalizedProjectModel }> {
    const repoName = payload.repository?.name || 'SQL Practice Level 1';
    const repoFullName = payload.repository?.full_name || `amr-mousa0/${repoName.replace(/\s+/g, '-')}`;
    const installationId = payload.installation?.id || 58291043;
    const branch = payload.ref ? payload.ref.replace('refs/heads/', '') : (payload.repository?.default_branch || 'main');
    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const traceId = `trace_${Math.random().toString(36).slice(2, 10)}`;
    const correlationId = `corr_${Math.random().toString(36).slice(2, 10)}`;

    Logger.info(`[Pipeline] [2/15] PipelineOrchestrator.enqueueRepoSync() - Job created (jobId: ${jobId}, repo: ${repoFullName})`);

    const job = await this.queueProvider.enqueue({
      jobId,
      traceId,
      correlationId,
      type: 'repo_sync',
      payload: {
        repoName,
        repoFullName,
        installationId,
        branch,
        commitSha: payload.after || payload.head_commit?.id,
        githubPagesUrl: payload.repository?.homepage,
        manifestRaw: payload.manifestRaw,
        readmeRaw: payload.readmeRaw,
        treeRaw: payload.treeRaw,
        fullPayload: payload
      }
    });

    await this.updateJobState(jobId, traceId, 'QUEUED', 3, job.payload);
    Logger.info(`[Pipeline] [3/15] Queue status: Job ${job.jobId} enqueued in MemoryQueueProvider. Status: ${job.status}`);

    const result = await this.processRepoSyncJob(job);
    return { jobId, traceId, result };
  }

  /**
   * Process all 15 stages of the repository sync pipeline.
   */
  public static async processRepoSyncJob(enqueuedJob: PipelineJob<any>, signal?: AbortSignal): Promise<NormalizedProjectModel> {
    const job = await this.queueProvider.dequeue('repo_sync') || enqueuedJob;
    
    // Recovery Phase: Fetch previous state if this is a retry
    let previousState: any = null;
    try {
      const db = getDbClient();
      previousState = await db.jobState.findUnique({ where: { jobId: job.jobId } });
      if (previousState && previousState.status === 'COMPLETED') {
        Logger.info(`[Pipeline] Job ${job.jobId} already completed. Skipping execution.`);
        return previousState.payload as NormalizedProjectModel;
      }
    } catch (e) {
      Logger.warn(`[Pipeline] Could not fetch previous state for ${job.jobId}, starting from beginning.`);
    }

    const startStage = previousState?.currentStage || 0;
    const payload = (startStage > 3 && previousState?.payload) ? previousState.payload : job.payload;
    
    const repoName = payload.repoName || 'SQL Practice Level 1';
    const repoFullName = payload.repoFullName || `amr-mousa0/${repoName.replace(/\s+/g, '-')}`;
    const installationId = payload.installationId || payload.fullPayload?.installation?.id || 58291043;
    const branch = payload.branch || 'main';

    let currentModel: NormalizedProjectModel | any = payload.model || null;

    try {
      this.checkAbort(signal);
      
      if (startStage < 8) {
        await this.updateJobState(job.jobId, job.traceId, 'FETCHING', 4, payload);
        Logger.info(`[Pipeline] [4/15] Job execution started - Dequeued jobId: ${job.jobId}`);
        Logger.info(`[Pipeline] [5/15] Repository full name: ${repoFullName} (Installation ID: ${installationId})`);
        Logger.info(`[Pipeline] [6/15] Branch: ${branch}`);
        Logger.info(`[Pipeline] [7/15] Calling fetchManifest()...`);
        
        const fetchResult = await fetchManifest(repoFullName, branch, payload.manifestRaw);
        let manifestRawToUse = payload.manifestRaw;
        if (fetchResult.manifestFound && fetchResult.rawResponse) {
          manifestRawToUse = fetchResult.rawResponse;
        }

        this.checkAbort(signal);
        await this.updateJobState(job.jobId, job.traceId, 'PARSING', 8, payload);
        currentModel = await GitHubWorker.process({
          ...job,
          payload: {
            repoName,
            commitSha: payload.commitSha,
            manifestRaw: manifestRawToUse,
            treeRaw: payload.treeRaw,
            readmeRaw: payload.readmeRaw,
            githubPagesUrl: payload.githubPagesUrl
          }
        });
        Logger.info(`[Pipeline] [8/15] Parsed manifest - Title: "${currentModel.title}"`);
      } else {
         Logger.info(`[Pipeline] Resuming from stage ${startStage}, skipping fetch/parse.`);
      }

      if (startStage < 9) {
        this.checkAbort(signal);
        await this.updateJobState(job.jobId, job.traceId, 'TRANSLATING', 9, { model: currentModel });
        
        const translationJob: PipelineJob<any> = {
          ...job,
          payload: { model: currentModel, sourceLang: 'en', targetLang: 'ar' }
        };
        currentModel = await TranslationWorker.process(translationJob, this.translationProvider);
        Logger.info(`[Pipeline] [9/15] Translation - Arabic Title: "${currentModel.titleAr || currentModel.title}"`);
      }

      if (startStage < 10) {
        this.checkAbort(signal);
        await this.updateJobState(job.jobId, job.traceId, 'ASSET_PROCESSING', 10, { model: currentModel });
        
        const activeStorageProvider = this.storageProvider.id;
        Logger.info(`[Pipeline] [10/15] Asset discovery - Storage Provider: "${activeStorageProvider}"`);
        
        const assetJob: PipelineJob<any> = { 
          ...job, 
          payload: { 
            model: currentModel,
            repoFullName,
            branch
          } 
        };
        currentModel = await AssetWorker.process(assetJob, this.storageProvider);
      }

      if (startStage < 11) {
        this.checkAbort(signal);
        await this.updateJobState(job.jobId, job.traceId, 'PUBLISHING', 11, { model: currentModel });
        
        const publishJob: PipelineJob<any> = { ...job, payload: { model: currentModel, targetDestination: 'portfolio' } };
        const publishConfig = currentModel.publish?.portfolio;
        
        if (publishConfig && publishConfig.enabled === false) {
          const exitReason = `Publish target "portfolio" is explicitly disabled.`;
          Logger.warn(`[Pipeline] EARLY EXIT at Stage 11: ${exitReason}`);
          await this.updateJobState(job.jobId, job.traceId, 'COMPLETED_DISABLED', 15, { model: currentModel });
          this.queueProvider.failJob(job.jobId, exitReason);
          throw new PermanentError(exitReason);
        }

        currentModel = await PublishWorker.process(publishJob);
        Logger.info(`[Pipeline] [11/15] Publish target resolution - Target portfolio enabled.`);
      }

      if (startStage < 12) {
        this.checkAbort(signal);
        await this.updateJobState(job.jobId, job.traceId, 'STORAGE_WRITE', 12, { model: currentModel });
        
        await this.writeProjectToStorage(currentModel);
        Logger.info(`[Pipeline] [12/15] Storage write via ${this.storageProvider.id}`);
      }

      if (startStage < 13) {
        this.checkAbort(signal);
        await this.updateJobState(job.jobId, job.traceId, 'REFRESHING_STORE', 13, { model: currentModel });
        
        PublishWorker.updateStore(currentModel);
        Logger.info(`[Pipeline] [13/15] Project store refresh - Updated in-memory PublishWorker store.`);
      }

      if (startStage < 14) {
        const exposedProjectsEn = await getSafeProjects('en');
        Logger.info(`[Pipeline] [14/15] /api/projects source reload - Total exposed projects for 'en': ${exposedProjectsEn.length}`);
      }

      await this.updateJobState(job.jobId, job.traceId, 'COMPLETED', 15, { model: currentModel });
      this.queueProvider.completeJob(job.jobId);
      Logger.info(`[Pipeline] [15/15] Job completed - jobId: ${job.jobId}, projectId: ${currentModel.projectId}`);

      return currentModel;
    } catch (error: any) {
      const isTransient = error instanceof TransientError;
      const finalState = isTransient ? 'FAILED_TRANSIENT' : 'FAILED_PERMANENT';
      
      Logger.error(`[Pipeline] EXIT during execution (Job ID: ${job.jobId}): ${error.message}`, { stack: error.stack });
      await this.updateJobState(job.jobId, job.traceId, finalState, startStage, { model: currentModel }, error.message);
      this.queueProvider.failJob(job.jobId, error.message);
      
      throw error;
    }
  }

  /**
   * Delegates entirely to the injected StorageProvider.
   * No direct filesystem writes are allowed here anymore.
   */
  private static async writeProjectToStorage(model: NormalizedProjectModel): Promise<void> {
    if (this.storageProvider.saveProject) {
      await this.storageProvider.saveProject(model);
    } else {
      Logger.warn(`[Pipeline] Active Storage Provider (${this.storageProvider.id}) does not implement saveProject. Skipping write.`);
    }
  }
}
