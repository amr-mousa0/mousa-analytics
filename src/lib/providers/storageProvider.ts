import type { StorageProvider } from '../../types/providers.js';

export class LocalStorageProvider implements StorageProvider {
  public id = 'local-storage';
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
