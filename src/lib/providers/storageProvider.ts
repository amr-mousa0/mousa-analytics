import type { StorageProvider, AssetUpload } from '../../types/providers.js';
import { FeatureFlagManager } from '../flags.js';
import { PersistentStorageProvider } from './persistentStorageProvider.js';

/**
 * Local Disk & Ephemeral Storage Provider (for development environments)
 */
export class DiskStorageProvider implements StorageProvider {
  public id = 'disk-storage';
  private storageMap = new Map<string, Buffer>();

  public async upload(asset: AssetUpload | string, data?: Buffer, _mimeType?: string): Promise<string> {
    const key = typeof asset === 'string' ? asset : asset.filename;
    const buf = typeof asset === 'string' ? (data || Buffer.from('')) : Buffer.from('');
    this.storageMap.set(key, buf);
    return this.getPublicUrl(key);
  }

  public async download(key: string): Promise<ReadableStream> {
    const data = this.storageMap.get(key) || Buffer.from('');
    return new ReadableStream({
      start(controller) {
        controller.enqueue(data);
        controller.close();
      }
    });
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

  public async upload(asset: AssetUpload | string, _data?: Buffer, _mimeType?: string): Promise<string> {
    const key = typeof asset === 'string' ? asset : asset.filename;
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      console.warn('[VercelBlobStorageProvider] BLOB_READ_WRITE_TOKEN not set, returning asset path key');
      return this.getPublicUrl(key);
    }
    return `https://public.blob.vercel-storage.com/${key}`;
  }

  public async download(key: string): Promise<ReadableStream> {
    const res = await fetch(this.getPublicUrl(key));
    if (!res.body) throw new Error(`Blob download failed for key: ${key}`);
    return res.body;
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
 * Vercel KV / Persistent Key-Value Storage Provider
 */
export class VercelKVStorageProvider implements StorageProvider {
  public id = 'vercel-kv';
  private kvUrl = process.env.KV_REST_API_URL;
  private kvToken = process.env.KV_REST_API_TOKEN;

  public async upload(asset: AssetUpload | string, data?: Buffer, _mimeType?: string): Promise<string> {
    const key = typeof asset === 'string' ? asset : asset.filename;
    const payload = typeof asset === 'string' ? data?.toString('utf-8') : '';
    if (this.kvUrl && this.kvToken) {
      try {
        await fetch(`${this.kvUrl}/set/${encodeURIComponent(key)}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.kvToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ value: payload })
        });
      } catch (err: any) {
        console.warn(`[VercelKVStorageProvider] KV REST set error: ${err.message}`);
      }
    }
    return this.getPublicUrl(key);
  }

  public async download(key: string): Promise<ReadableStream> {
    let content = '';
    if (this.kvUrl && this.kvToken) {
      const res = await fetch(`${this.kvUrl}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${this.kvToken}` }
      });
      const data = await res.json();
      content = data.result || '';
    }
    return new ReadableStream({
      start(controller) {
        controller.enqueue(Buffer.from(content));
        controller.close();
      }
    });
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
  if (FeatureFlagManager.isEnabled('USE_PERSISTENT_STORAGE')) {
    return new PersistentStorageProvider();
  }

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return new VercelKVStorageProvider();
  }
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return new VercelBlobStorageProvider();
  }
  return new DiskStorageProvider();
}
