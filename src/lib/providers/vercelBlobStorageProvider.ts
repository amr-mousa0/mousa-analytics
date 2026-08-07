import { put, del } from '@vercel/blob';
import type { StorageProvider, AssetUpload } from '../../types/providers.js';

export class VercelBlobStorageProvider implements StorageProvider {
  public id = 'vercel-blob';

  public async upload(asset: AssetUpload): Promise<string> {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('[VercelBlob] BLOB_READ_WRITE_TOKEN is missing in environment.');
    }

    const { url } = await put(asset.filename, asset.stream as any, {
      access: 'public',
      contentType: asset.mimeType,
      addRandomSuffix: true
    });

    return url;
  }

  public async download(key: string): Promise<ReadableStream> {
    // For Vercel Blob, typically files are accessed directly via URL.
    // To download the actual stream server-side:
    const res = await fetch(this.getPublicUrl(key));
    if (!res.ok || !res.body) {
      throw new Error(`Failed to download blob: ${key}`);
    }
    return res.body;
  }

  public async delete(key: string): Promise<void> {
    if (!process.env.BLOB_READ_WRITE_TOKEN) return;
    
    // key might just be the filename or URL. `@vercel/blob` del accepts the full URL.
    const url = this.getPublicUrl(key);
    await del(url);
  }

  public getPublicUrl(key: string): string {
    if (key.startsWith('http://') || key.startsWith('https://')) {
      return key;
    }
    return `https://public.blob.vercel-storage.com/${key}`;
  }
}
