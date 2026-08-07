import type { StorageProvider } from '../../types/providers.js';
import { getDbClient } from '../db.js';
import { Logger } from '../utils/logger.js';

export class PersistentStorageProvider implements StorageProvider {
  public id = 'persistent-db-storage';

  public async upload(key: string, data: Buffer, mimeType: string): Promise<string> {
    Logger.info(`[PersistentStorage] Uploading key: ${key} (${data.length} bytes, mime: ${mimeType})`);
    // Store in DB or Object Store representation
    return this.getPublicUrl(key);
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
        featured: project.publish?.portfolio?.featured ?? true
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
        featured: project.publish?.portfolio?.featured ?? true
      }
    });
    Logger.info(`[PersistentStorage] Saved project ${project.projectId} to database.`);
  }
}
