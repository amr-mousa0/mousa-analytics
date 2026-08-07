import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import type { StorageProvider, AssetUpload } from '../../types/providers.js';

export class LocalDiskStorageProvider implements StorageProvider {
  public id = 'local-disk';
  private basePath: string;

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('LocalDiskStorageProvider MUST NOT be initialized in production.');
    }
    
    // Write to public/generated-assets for development
    this.basePath = path.join(process.cwd(), 'public', 'generated-assets');
    
    // Ensure directory exists
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }

  public async upload(asset: AssetUpload): Promise<string> {
    const filePath = path.join(this.basePath, asset.filename);
    
    // Assuming asset.stream is a Web ReadableStream, we can convert it or pipe it if it's node stream.
    // In node, fetch returns web ReadableStream.
    let nodeStream;
    if ('getReader' in asset.stream) {
      nodeStream = Readable.fromWeb(asset.stream as any);
    } else {
      nodeStream = asset.stream as unknown as Readable;
    }

    const writeStream = fs.createWriteStream(filePath);
    await pipeline(nodeStream, writeStream);
    
    return this.getPublicUrl(asset.filename);
  }

  public async download(key: string): Promise<ReadableStream> {
    const filePath = path.join(this.basePath, key);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${key}`);
    }
    const nodeStream = fs.createReadStream(filePath);
    return Readable.toWeb(nodeStream) as unknown as ReadableStream;
  }

  public async delete(key: string): Promise<void> {
    const filePath = path.join(this.basePath, key);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  public getPublicUrl(key: string): string {
    if (key.startsWith('http://') || key.startsWith('https://') || key.startsWith('/')) {
      return key;
    }
    return `/generated-assets/${key}`;
  }
}
