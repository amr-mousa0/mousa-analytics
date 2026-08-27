import crypto from 'crypto';
import pLimit from 'p-limit';
import { getDbClient } from '../db.js';
import { SecurityValidator } from '../utils/securityValidator.js';
import type { PipelineJob, StorageProvider, AssetUpload } from '../../types/providers.js';
import type { NormalizedProjectModel } from '../../types/manifest.js';
import { TransientError, PermanentError } from '../errors.js';
import { Logger } from '../utils/logger.js';

export interface AssetWorkerPayload {
  model: NormalizedProjectModel;
  repoFullName: string;
  branch: string;
  githubToken?: string;
}

export class AssetWorker {
  public static async process(
    job: PipelineJob<AssetWorkerPayload>,
    storageProvider: StorageProvider
  ): Promise<NormalizedProjectModel> {
    const { model, repoFullName, branch, githubToken } = job.payload;
    Logger.info(`[AssetWorker] Processing jobId=${job.jobId} traceId=${job.traceId} projectId=${model.projectId}`);

    const newModel = { ...model };
    const limit = pLimit(5); // Concurrency pool limit 5

    // Process cover
    if (newModel.cover) {
      newModel.cover = await this.processSingleAsset(
        newModel.cover, repoFullName, branch, storageProvider, githubToken
      );
    }

    // Process gallery concurrently
    if (newModel.gallery && newModel.gallery.length > 0) {
      const galleryPromises = newModel.gallery.map((item) =>
        limit(async () => {
          if (!item.url) return item;
          const newUrl = await this.processSingleAsset(
            item.url, repoFullName, branch, storageProvider, githubToken
          );
          return { ...item, url: newUrl };
        })
      );
      newModel.gallery = await Promise.all(galleryPromises);
      
      const pdfItem = newModel.gallery.find(g => g.type === 'pdf');
      if (pdfItem && pdfItem.url) {
        newModel.pdfUrl = pdfItem.url;
      }
    }

    // Fail-Closed Validation: If manifest declared a PDF gallery item, pdfUrl MUST be resolved
    const declaredPdf = (model.gallery || []).find(g => g.type === 'pdf');
    if (declaredPdf && (!newModel.pdfUrl || newModel.pdfUrl.trim() === '')) {
      throw new PermanentError(
        `Fail-Closed: Required PDF artifact "${declaredPdf.title || declaredPdf.url}" declared in manifest could not be resolved for project ${newModel.projectId}. Publication blocked.`
      );
    }

    Logger.info(`[AssetWorker] Asset optimization completed for ${newModel.projectId}`);
    return newModel;
  }

  private static async processSingleAsset(
    assetPath: string,
    repoFullName: string,
    branch: string,
    storageProvider: StorageProvider,
    githubToken?: string
  ): Promise<string> {
    // 1. Normalize GitHub raw URL back to relative repo path if needed
    let cleanPath = assetPath;
    const rawGhPrefix = `https://raw.githubusercontent.com/${repoFullName}/${branch}/`;
    if (cleanPath.startsWith(rawGhPrefix)) {
      cleanPath = cleanPath.slice(rawGhPrefix.length);
    } else if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
      // Third-party external URL (e.g. PowerBI or external CDN)
      return cleanPath;
    }

    // Strip leading slash if any
    const relativePath = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;

    // 2. Security Validation
    SecurityValidator.validateAssetPath(relativePath);

    // 3. Retry loop for Download & Upload
    return this.withRetry(async () => {
      // 4. Download Stream from GitHub
      const url = `https://api.github.com/repos/${repoFullName}/contents/${encodeURIComponent(relativePath)}?ref=${branch}`;
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3.raw',
        'User-Agent': 'Antigravity-IDE-Client'
      };
      const token = githubToken || process.env.GITHUB_TOKEN;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      Logger.info(`[AssetWorker] Downloading asset from ${url}`);
      let response = await fetch(url, { headers });
      
      // Smart Fallback for PDFs: If 404, look up actual PDF in repo
      if (response.status === 404 && relativePath.toLowerCase().endsWith('.pdf')) {
        Logger.warn(`[AssetWorker] Exact PDF path not found (${relativePath}), searching repo contents for PDF match...`);
        try {
          const contentsUrl = `https://api.github.com/repos/${repoFullName}/contents/?ref=${branch}`;
          const contentsRes = await fetch(contentsUrl, {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Antigravity-IDE-Client',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          if (contentsRes.ok) {
            const items: any = await contentsRes.json();
            if (Array.isArray(items)) {
              const pdfFile = items.find(
                (item: any) => item.type === 'file' && item.name.toLowerCase().endsWith('.pdf')
              );
              if (pdfFile) {
                Logger.info(`[AssetWorker] Found matching PDF in repository: "${pdfFile.name}" (downloading from ${pdfFile.download_url || pdfFile.url})`);
                const altUrl = `https://api.github.com/repos/${repoFullName}/contents/${encodeURIComponent(pdfFile.name)}?ref=${branch}`;
                response = await fetch(altUrl, { headers });
              }
            }
          }
        } catch (findErr: any) {
          Logger.warn(`[AssetWorker] Failed to search repo for PDF: ${findErr.message}`);
        }
      }

      if (response.status === 404) {
        throw new PermanentError(`Asset not found in repository: ${relativePath}`);
      }
      if (!response.ok || !response.body) {
        throw new TransientError(`GitHub download failed: ${response.statusText}`);
      }

      const mimeType = response.headers.get('content-type') || 'application/octet-stream';
      const sizeStr = response.headers.get('content-length');
      const size = sizeStr ? parseInt(sizeStr, 10) : 0;

      SecurityValidator.validateMimeType(mimeType, relativePath);

      // 5. Calculate Checksum dynamically from stream
      const { hash, stream: bufferedStream } = await this.hashStream(response.body);

      // 6. DB Cache Check (AssetRegistry)
      const db = getDbClient();
      const existingRecord = await db.assetRegistry.findUnique({ where: { hash } });
      if (existingRecord) {
        Logger.info(`[AssetWorker] Cache hit for ${relativePath} (hash: ${hash}). Reusing url.`);
        return existingRecord.url;
      }

      // 7. Upload to StorageProvider
      const filename = `${hash}-${relativePath.split('/').pop()}`;
      
      const assetUpload: AssetUpload = {
        stream: bufferedStream,
        mimeType,
        size,
        hash,
        filename
      };

      const publicUrl = await storageProvider.upload(assetUpload);

      // 8. Register in DB
      await db.assetRegistry.create({
        data: {
          hash,
          provider: storageProvider.id,
          url: publicUrl,
          mime: mimeType,
          size
        }
      });

      return publicUrl;
    });
  }

  /**
   * Hashes a Web ReadableStream and returns a new stream containing the same data.
   */
  private static async hashStream(stream: ReadableStream): Promise<{ hash: string; stream: ReadableStream }> {
    const reader = stream.getReader();
    const hashSum = crypto.createHash('sha256');
    const chunks: Uint8Array[] = [];
    
    let totalSize = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        hashSum.update(value);
        chunks.push(value);
        totalSize += value.length;
      }
    }
    
    // In a truly massive 100MB PDF scenario, holding 100MB in memory chunks array is passable, 
    // but ideally we'd use a TransformStream to upload simultaneously. 
    // Since AWS/Blob SDKs often need to read multiple times or we need the hash *before* DB check,
    // we buffer it. If we wanted pure streaming, we'd upload first, then verify hash, then register.
    
    const hex = hashSum.digest('hex');
    
    // Reconstruct stream
    const reconstructedStream = new ReadableStream({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(chunk);
        }
        controller.close();
      }
    });

    return { hash: hex, stream: reconstructedStream };
  }

  private static async withRetry<T>(fn: () => Promise<T>, retries = 3, backoff = 1000): Promise<T> {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await fn();
      } catch (err: any) {
        if (err instanceof PermanentError) {
          throw err; // Do not retry permanent errors (like 404s or Validation failures)
        }
        attempt++;
        if (attempt >= retries) {
          throw err;
        }
        Logger.warn(`[AssetWorker] Retry ${attempt}/${retries} failed, backing off ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff * attempt));
      }
    }
    throw new Error('Unreachable code in withRetry');
  }
}
