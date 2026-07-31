export interface ContentSourceTreeItem {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
}

export interface ContentSourceAdapter {
  id: string;
  fetchTree(repoId: string, commitSha?: string): Promise<ContentSourceTreeItem[]>;
  fetchFileContent(repoId: string, filePath: string): Promise<string | Buffer>;
}

export interface TranslationProvider {
  id: string;
  translate(text: string, sourceLang: string, targetLang: string): Promise<string>;
}

export interface AssetProcessorOptions {
  width?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export interface AssetProcessor {
  id: string;
  optimizeImage(buffer: Buffer, options?: AssetProcessorOptions): Promise<Buffer>;
  generateBlurHash(buffer: Buffer): Promise<string>;
}

export interface StorageProvider {
  id: string;
  upload(key: string, data: Buffer, mimeType: string): Promise<string>;
  getPublicUrl(key: string): string;
  delete(key: string): Promise<void>;
}

export interface PipelineJob<T = any> {
  jobId: string;
  traceId: string;
  correlationId: string;
  type: 'repo_sync' | 'translate' | 'process_assets' | 'publish' | 'cleanup';
  payload: T;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QueueProvider {
  id: string;
  enqueue<T>(job: Omit<PipelineJob<T>, 'status' | 'createdAt' | 'updatedAt'>): Promise<PipelineJob<T>>;
  dequeue<T>(queueName?: string): Promise<PipelineJob<T> | null>;
  getJob<T>(jobId: string): Promise<PipelineJob<T> | null>;
}
