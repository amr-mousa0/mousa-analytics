import fs from 'fs';
import path from 'path';
import type { PipelineJob } from '../../types/providers.js';
import type { NormalizedProjectModel, RepositoryManifest } from '../../types/manifest.js';
import { MemoryQueueProvider } from '../providers/queueProvider.js';
import { getProductionStorageProvider } from '../providers/storageProvider.js';
import { DefaultTranslationProvider } from '../providers/translationProvider.js';
import { GitHubWorker } from '../workers/githubWorker.js';
import { TranslationWorker } from '../workers/translationWorker.js';
import { AssetWorker } from '../workers/assetWorker.js';
import { PublishWorker } from '../workers/publishWorker.js';
import { fetchManifest } from '../services/manifestFetcher.js';
import { getSafeProjects } from '../../scripts/projectsHelper.js';

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
  private static storageProvider = getProductionStorageProvider();
  private static translationProvider = new DefaultTranslationProvider();

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

    console.log(`[Pipeline] [2/15] PipelineOrchestrator.enqueueRepoSync() - Job created (jobId: ${jobId}, repo: ${repoFullName})`);

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

    // Stage 3: Queue status
    console.log(`[Pipeline] [3/15] Queue status: Job ${job.jobId} enqueued in MemoryQueueProvider. Status: ${job.status}`);

    // Immediately dequeue & process the job
    const result = await this.processRepoSyncJob(job);
    return { jobId, traceId, result };
  }

  /**
   * Process all 15 stages of the repository sync pipeline with structured logging.
   */
  public static async processRepoSyncJob(enqueuedJob: PipelineJob<any>): Promise<NormalizedProjectModel> {
    // Stage 4: Dequeue job & start execution
    const job = await this.queueProvider.dequeue('repo_sync') || enqueuedJob;
    const payload = job.payload;
    const repoName = payload.repoName || 'SQL Practice Level 1';
    const repoFullName = payload.repoFullName || `amr-mousa0/${repoName.replace(/\s+/g, '-')}`;
    const installationId = payload.installationId || payload.fullPayload?.installation?.id || 58291043;
    const branch = payload.branch || 'main';

    try {
      console.log(`[Pipeline] [4/15] Job execution started - Dequeued jobId: ${job.jobId}, traceId: ${job.traceId}, status: ${job.status}`);

      // Stage 5: Repository full name
      console.log(`[Pipeline] [5/15] Repository full name: ${repoFullName} (Installation ID: ${installationId})`);

      // Stage 6: Branch
      console.log(`[Pipeline] [6/15] Branch: ${branch}`);

      // Stage 7: fetchManifest()
      console.log(`[Pipeline] [7/15] Calling fetchManifest()...`);
      const fetchResult = await fetchManifest(repoFullName, branch, payload.manifestRaw);

      let manifestRawToUse = payload.manifestRaw;
      if (fetchResult.manifestFound && fetchResult.rawResponse) {
        manifestRawToUse = fetchResult.rawResponse;
      }

      // Stage 8: Parsed manifest
      const normalizedModel = await GitHubWorker.process({
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
      console.log(`[Pipeline] [8/15] Parsed manifest - Title: "${normalizedModel.title}", Project ID: "${normalizedModel.projectId}"`);

      // Stage 9: Translation
      const translationJob: PipelineJob<any> = {
        ...job,
        payload: {
          model: normalizedModel,
          sourceLang: 'en',
          targetLang: 'ar'
        }
      };
      const translatedModel = await TranslationWorker.process(translationJob, this.translationProvider);
      console.log(`[Pipeline] [9/15] Translation - English Title: "${translatedModel.title}", Arabic Title: "${translatedModel.titleAr || translatedModel.title}"`);

      // Stage 10: Asset discovery & Selected Storage Provider
      const activeStorageProvider = this.storageProvider.id;
      console.log(`[Pipeline] [10/15] Asset discovery - Storage Provider selected: "${activeStorageProvider}". Cover: "${translatedModel.cover || 'None'}", Gallery items: ${translatedModel.gallery.length}`);

      const assetJob: PipelineJob<any> = {
        ...job,
        payload: { model: translatedModel }
      };
      const assetModel = await AssetWorker.process(assetJob, this.storageProvider);

      // Stage 11: Publish target resolution
      const publishJob: PipelineJob<any> = {
        ...job,
        payload: { model: assetModel, targetDestination: 'portfolio' }
      };
      
      const publishConfig = assetModel.publish?.portfolio;
      if (publishConfig && publishConfig.enabled === false) {
        const exitReason = `Publish target "portfolio" is explicitly disabled in manifest configuration for ${repoFullName}.`;
        console.warn(`[Pipeline] EARLY EXIT at Stage 11 (Publish target resolution): ${exitReason}`);
        this.queueProvider.failJob(job.jobId, exitReason);
        throw new Error(exitReason);
      }

      const publishedModel = await PublishWorker.process(publishJob);
      console.log(`[Pipeline] [11/15] Publish target resolution - Target portfolio enabled. Targets: ${Object.keys(publishedModel.publish || {}).join(', ')}`);

      // Stage 12: Storage write & Exact location
      const isVercel = Boolean(process.env.VERCEL);
      const targetDir = isVercel ? '/tmp/content/projects/' : 'src/content/projects/';
      await this.writeProjectToStorage(publishedModel);

      console.log(`[Pipeline] [12/15] Storage write - Provider: "${activeStorageProvider}". Location: "${targetDir}${publishedModel.projectId}.md" (Note: Serverless /tmp is ephemeral across function instances)`);

      // Stage 13: Project store refresh
      PublishWorker.updateStore(publishedModel);
      console.log(`[Pipeline] [13/15] Project store refresh - Updated in-memory PublishWorker store with "${publishedModel.projectId}"`);

      // Stage 14: /api/projects source reload
      const exposedProjectsEn = await getSafeProjects('en');
      console.log(`[Pipeline] [14/15] /api/projects source reload - Reloaded sources. Total exposed projects for 'en': ${exposedProjectsEn.length}`);

      // Stage 15: Job completed
      this.queueProvider.completeJob(job.jobId);
      console.log(`[Pipeline] [15/15] Job completed - jobId: ${job.jobId}, projectId: ${publishedModel.projectId}, status: completed`);

      return publishedModel;
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      if (!errorMsg.startsWith('Publish target')) {
        console.error(`[Pipeline] EARLY EXIT during job execution (Job ID: ${job.jobId}): ${errorMsg}`);
        if (error?.stack) {
          console.error(`[Pipeline] Stack Trace:\n${error.stack}`);
        }
        this.queueProvider.failJob(job.jobId, errorMsg);
      }
      throw error;
    }
  }

  /**
   * Helper to write project data to Markdown storage files in src/content/projects/ or /tmp in Vercel
   */
  private static async writeProjectToStorage(model: NormalizedProjectModel): Promise<void> {
    try {
      const cwd = process.cwd();
      const isVercel = Boolean(process.env.VERCEL);
      const baseDir = isVercel ? path.join('/tmp', 'content', 'projects') : path.join(cwd, 'src', 'content', 'projects');

      const enDir = path.join(baseDir, 'en');
      const arDir = path.join(baseDir, 'ar');

      if (!fs.existsSync(enDir)) fs.mkdirSync(enDir, { recursive: true });
      if (!fs.existsSync(arDir)) fs.mkdirSync(arDir, { recursive: true });

      const galleryPaths = model.gallery.map(g => `  - "${g.url}"`).join('\n');
      const tagsYaml = JSON.stringify(model.tags || ['Data Analytics']);

      // English Content File
      const enContent = `---
title: ${JSON.stringify(model.title)}
projectBadge: ${JSON.stringify(model.tags?.[0]?.toUpperCase() || 'DATA ANALYTICS')}
problemText: ${JSON.stringify(model.problem || model.description)}
solutionText: ${JSON.stringify(model.solution || model.description)}
impactText: ${JSON.stringify(model.businessValue || model.description)}
coverImage: ${JSON.stringify(model.cover || '../../../assets/images/uploads/marketing-roi.jpg')}
galleryImages:
${galleryPaths || '  - "../../../assets/images/uploads/marketing-roi.jpg"'}
githubUrl: ${JSON.stringify(`https://github.com/amr-mousa0/${model.sourceRepo || model.projectId}`)}
dashboardUrl: ${JSON.stringify(model.demo || '')}
whatsappStartProjectMsg: ${JSON.stringify(`Hi Amr, I'd like to inquire about the ${model.title} project.`)}
whatsappOpenDashboardMsg: ${JSON.stringify(`Hi Amr, I'd like to request access to the ${model.title} dashboard.`)}
priority: 1
category: "Data Analytics"
tags: ${tagsYaml}
draft: false
featured: ${model.publish?.portfolio?.featured ?? true}
publishedDate: ${JSON.stringify(model.updatedAt || new Date().toISOString())}
---
Case Study: ${model.title}
`;

      // Arabic Content File
      const arContent = `---
title: ${JSON.stringify(model.titleAr || model.title)}
projectBadge: ${JSON.stringify(model.tags?.[0]?.toUpperCase() || 'تحليل البيانات')}
problemText: ${JSON.stringify(model.problemAr || model.problem || model.description)}
solutionText: ${JSON.stringify(model.solutionAr || model.solution || model.description)}
impactText: ${JSON.stringify(model.businessValueAr || model.businessValue || model.description)}
coverImage: ${JSON.stringify(model.cover || '../../../assets/images/uploads/marketing-roi.jpg')}
galleryImages:
${galleryPaths || '  - "../../../assets/images/uploads/marketing-roi.jpg"'}
githubUrl: ${JSON.stringify(`https://github.com/amr-mousa0/${model.sourceRepo || model.projectId}`)}
dashboardUrl: ${JSON.stringify(model.demo || '')}
whatsappStartProjectMsg: ${JSON.stringify(`مرحباً عمرو، أود الاستفسار عن مشروع ${model.titleAr || model.title}`)}
whatsappOpenDashboardMsg: ${JSON.stringify(`مرحباً عمرو، أود طلب رابط التقرير التفاعلي لمشروع ${model.titleAr || model.title}`)}
priority: 1
category: "Data Analytics"
tags: ${tagsYaml}
draft: false
featured: ${model.publish?.portfolio?.featured ?? true}
publishedDate: ${JSON.stringify(model.updatedAt || new Date().toISOString())}
---
دراسة حالة: ${model.titleAr || model.title}
`;

      fs.writeFileSync(path.join(enDir, `${model.projectId}.md`), enContent, 'utf-8');
      fs.writeFileSync(path.join(arDir, `${model.projectId}.md`), arContent, 'utf-8');
    } catch (err: any) {
      console.warn(`[Pipeline] Note: Disk storage update attempted: ${err.message}`);
    }
  }
}
