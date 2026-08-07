import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import type { StorageProvider, AssetUpload } from '../../types/providers.js';

export class S3StorageProvider implements StorageProvider {
  public id = 's3-storage';
  private s3: S3Client;
  private bucket: string;
  private publicUrlBase: string;

  constructor() {
    if (!process.env.AWS_REGION || !process.env.AWS_S3_BUCKET) {
      throw new Error('[S3StorageProvider] Missing AWS_REGION or AWS_S3_BUCKET');
    }
    
    this.bucket = process.env.AWS_S3_BUCKET;
    this.publicUrlBase = process.env.AWS_S3_PUBLIC_URL || `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com`;
    
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    });
  }

  public async upload(asset: AssetUpload): Promise<string> {
    const key = `assets/${asset.hash}-${asset.filename}`;
    
    // Convert ReadableStream to async iterable or buffer for S3 if needed,
    // Note: S3 client v3 allows sending native Node streams or blobs/buffers.
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: asset.stream as any,
      ContentType: asset.mimeType,
      ContentLength: asset.size
    });

    await this.s3.send(command);

    return this.getPublicUrl(key);
  }

  public async download(key: string): Promise<ReadableStream> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key
    });

    const response = await this.s3.send(command);
    if (!response.Body) {
      throw new Error(`[S3] Empty body for key: ${key}`);
    }

    // response.Body is an SDK stream, often convertible to Web ReadableStream
    return response.Body.transformToWebStream();
  }

  public async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key
    });
    await this.s3.send(command);
  }

  public getPublicUrl(key: string): string {
    if (key.startsWith('http://') || key.startsWith('https://')) {
      return key;
    }
    return `${this.publicUrlBase}/${key}`;
  }
}
