export class SecurityValidator {
  private static allowedExtensions = new Set([
    'png', 'jpg', 'jpeg', 'webp', 'gif',
    'pdf', 'sql', 'pbix', 'py', 'ts'
  ]);

  private static allowedMimeTypes = new Set([
    'image/png', 'image/jpeg', 'image/webp', 'image/gif',
    'application/pdf', 'application/sql', 'application/x-sql', 'text/x-sql',
    'application/octet-stream' // pbix often defaults to this
  ]);

  /**
   * Validates if a manifest path is a safe, internal repository path.
   * Throws an error if any security rules are violated.
   */
  public static validateAssetPath(assetPath: string): void {
    if (!assetPath || assetPath.trim() === '') {
      throw new Error('Asset path cannot be empty.');
    }

    // 1. Forbid absolute paths
    if (assetPath.startsWith('/')) {
      throw new Error(`Asset path must be relative, forbidden absolute path: ${assetPath}`);
    }

    // 2. Forbid external URLs
    if (assetPath.startsWith('http://') || assetPath.startsWith('https://')) {
      throw new Error(`Asset path must not be an external URL: ${assetPath}`);
    }

    // 3. Forbid path traversal
    if (assetPath.includes('../') || assetPath.includes('..\\')) {
      throw new Error(`Path traversal detected, forbidden sequence: ${assetPath}`);
    }

    // 4. Validate Extension
    const ext = assetPath.split('.').pop()?.toLowerCase();
    if (!ext || !this.allowedExtensions.has(ext)) {
      throw new Error(`Forbidden file extension (${ext}) for asset: ${assetPath}`);
    }
  }

  /**
   * Validates if the downloaded mime type is within allowed types.
   */
  public static validateMimeType(mimeType: string, filename: string): void {
    // If it's a known non-standard type like pbix, allow it through
    if (filename.endsWith('.pbix') || filename.endsWith('.sql') || filename.endsWith('.py')) {
      return; 
    }
    
    const baseMime = mimeType.split(';')[0].trim().toLowerCase();
    if (!this.allowedMimeTypes.has(baseMime)) {
      throw new Error(`Forbidden mime type (${baseMime}) for file: ${filename}`);
    }
  }
}
