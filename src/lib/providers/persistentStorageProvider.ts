import type { StorageProvider, AssetUpload } from '../../types/providers.js';
import { getDbClient } from '../db.js';
import { Logger } from '../utils/logger.js';

export class PersistentStorageProvider implements StorageProvider {
  public id = 'persistent-db-storage';

  public async upload(asset: AssetUpload | string, data?: Buffer, mimeType?: string): Promise<string> {
    const key = typeof asset === 'string' ? asset : asset.filename;
    const size = typeof asset === 'string' ? (data?.length || 0) : asset.size;
    const mime = typeof asset === 'string' ? (mimeType || 'application/octet-stream') : asset.mimeType;
    Logger.info(`[PersistentStorage] Uploading key: ${key} (${size} bytes, mime: ${mime})`);
    return this.getPublicUrl(key);
  }

  public async download(key: string): Promise<ReadableStream> {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(Buffer.from(''));
        controller.close();
      }
    });
  }

  public getPublicUrl(key: string): string {
    return `/api/assets/${key}`;
  }

  public async delete(key: string): Promise<void> {
    Logger.info(`[PersistentStorage] Deleting key: ${key}`);
  }

  public async saveProject(project: any): Promise<void> {
    const db = getDbClient();
    await db.project.upsert({
      where: { slug: project.projectId },
      create: {
        slug: project.projectId,
        titleAr: project.titleAr || project.title,
        titleEn: project.title,
        summaryAr: project.problemAr || project.description,
        summaryEn: project.problem || project.description,
        contentAr: project.solutionAr || project.description,
        contentEn: project.solution || project.description,
        category: project.category || 'Data Analytics',
        tags: project.tags || [],
        featured: project.publish?.portfolio?.featured ?? true,
        cover: project.cover || null,
        pdfUrl: project.pdfUrl || null,
        gallery: project.gallery ? (project.gallery as any) : null
      },
      update: {
        titleAr: project.titleAr || project.title,
        titleEn: project.title,
        summaryAr: project.problemAr || project.description,
        summaryEn: project.problem || project.description,
        contentAr: project.solutionAr || project.description,
        contentEn: project.solution || project.description,
        category: project.category || 'Data Analytics',
        tags: project.tags || [],
        featured: project.publish?.portfolio?.featured ?? true,
        cover: project.cover || null,
        pdfUrl: project.pdfUrl || null,
        gallery: project.gallery ? (project.gallery as any) : null
      }
    });
    Logger.info(`[PersistentStorage] Saved project ${project.projectId} to database.`);
  }
}
