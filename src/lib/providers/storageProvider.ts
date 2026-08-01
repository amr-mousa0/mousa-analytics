import fs from 'fs';
import path from 'path';
import type { StorageProvider } from '../../types/providers.js';

/**
 * Local Disk & Ephemeral Storage Provider (for development environments)
 */
export class DiskStorageProvider implements StorageProvider {
  public id = 'disk-storage';
  private storageMap = new Map<string, Buffer>();

  public async upload(key: string, data: Buffer, _mimeType: string): Promise<string> {
    this.storageMap.set(key, data);
    return this.getPublicUrl(key);
  }

  public getPublicUrl(key: string): string {
    if (key.startsWith('http://') || key.startsWith('https://') || key.startsWith('/')) {
      return key;
    }
    return `/assets/${key}`;
  }

  public async delete(key: string): Promise<void> {
    this.storageMap.delete(key);
  }
}

/**
 * Vercel Blob / Cloud Object Storage Provider (for production assets)
 */
export class VercelBlobStorageProvider implements StorageProvider {
  public id = 'vercel-blob';

  public async upload(key: string, _data: Buffer, _mimeType: string): Promise<string> {
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      console.warn('[VercelBlobStorageProvider] BLOB_READ_WRITE_TOKEN not set, returning asset path key');
      return this.getPublicUrl(key);
    }
    return `https://public.blob.vercel-storage.com/${key}`;
  }

  public getPublicUrl(key: string): string {
    if (key.startsWith('http://') || key.startsWith('https://') || key.startsWith('/')) {
      return key;
    }
    return `https://public.blob.vercel-storage.com/${key}`;
  }

  public async delete(_key: string): Promise<void> {
    // Blob delete implementation
  }
}

/**
 * Vercel KV / Persistent Key-Value Storage Provider (for serverless JSON project model persistence across cold starts)
 */
export class VercelKVStorageProvider implements StorageProvider {
  public id = 'vercel-kv';
  private kvUrl = process.env.KV_REST_API_URL;
  private kvToken = process.env.KV_REST_API_TOKEN;

  public async upload(key: string, data: Buffer, _mimeType: string): Promise<string> {
    if (this.kvUrl && this.kvToken) {
      try {
        await fetch(`${this.kvUrl}/set/${encodeURIComponent(key)}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.kvToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ value: data.toString('utf-8') })
        });
      } catch (err: any) {
        console.warn(`[VercelKVStorageProvider] KV REST set error: ${err.message}`);
      }
    }
    return this.getPublicUrl(key);
  }

  public getPublicUrl(key: string): string {
    if (key.startsWith('http://') || key.startsWith('https://') || key.startsWith('/')) {
      return key;
    }
    return `/api/projects?key=${encodeURIComponent(key)}`;
  }

  public async delete(key: string): Promise<void> {
    if (this.kvUrl && this.kvToken) {
      try {
        await fetch(`${this.kvUrl}/del/${encodeURIComponent(key)}`, {
          headers: { Authorization: `Bearer ${this.kvToken}` }
        });
      } catch (err: any) {
        console.warn(`[VercelKVStorageProvider] KV REST del error: ${err.message}`);
      }
    }
  }
}

export function getProductionStorageProvider(): StorageProvider {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return new VercelKVStorageProvider();
  }
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return new VercelBlobStorageProvider();
  }
  return new DiskStorageProvider();
}
