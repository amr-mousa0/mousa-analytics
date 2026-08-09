import type { PipelineJob } from '../../types/providers.js';
import { buildNormalizedProjectModel, type FallbackInput } from '../services/projectModelBuilder.js';
import type { NormalizedProjectModel } from '../../types/manifest.js';
import { ManifestSchema } from '../schemas/manifestSchema.js';

export interface GitHubWorkerPayload {
  repoName: string;
  commitSha?: string;
  manifestRaw?: string;
  treeRaw?: Array<{ path: string; type: 'blob' | 'tree'; sha: string }>;
  readmeRaw?: string;
  githubPagesUrl?: string;
}

export class GitHubWorker {
  public static async process(job: PipelineJob<GitHubWorkerPayload>): Promise<NormalizedProjectModel> {
    console.log(`[GitHubWorker] Processing jobId=${job.jobId} traceId=${job.traceId} repo=${job.payload.repoName}`);

    let parsedManifest = undefined;
    if (job.payload.manifestRaw) {
      try {
        const rawJson = JSON.parse(job.payload.manifestRaw);
        parsedManifest = ManifestSchema.parse(rawJson);
      } catch (err: any) {
        throw new Error(`[GitHubWorker] PermanentError: Invalid manifest.json for ${job.payload.repoName}: ${err.message}`);
      }
    } else {
      throw new Error(`[GitHubWorker] PermanentError: Missing manifest.json for ${job.payload.repoName}. Repositories without manifest.json are not published.`);
    }

    const input: FallbackInput = {
      repoName: job.payload.repoName,
      manifest: parsedManifest,
      tree: job.payload.treeRaw,
      readmeContent: job.payload.readmeRaw,
      githubPagesUrl: job.payload.githubPagesUrl
    };

    // Execute projectModelBuilder.ts with Manifest Authority Rule
    const normalizedModel = buildNormalizedProjectModel(input);
    console.log(`[GitHubWorker] Completed normalization for ${normalizedModel.projectId}`);
    return normalizedModel;
  }
}
