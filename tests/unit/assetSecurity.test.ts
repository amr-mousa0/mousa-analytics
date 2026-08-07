import { describe, it, expect } from 'vitest';
import { SecurityValidator } from '../../src/lib/utils/securityValidator.js';

describe('SecurityValidator', () => {
  describe('validateAssetPath', () => {
    it('should pass valid relative paths', () => {
      expect(() => SecurityValidator.validateAssetPath('assets/image.png')).not.toThrow();
      expect(() => SecurityValidator.validateAssetPath('cover.webp')).not.toThrow();
    });

    it('should throw on absolute paths', () => {
      expect(() => SecurityValidator.validateAssetPath('/etc/passwd')).toThrow(/absolute path/);
      expect(() => SecurityValidator.validateAssetPath('/assets/image.png')).toThrow(/absolute path/);
    });

    it('should throw on external URLs', () => {
      expect(() => SecurityValidator.validateAssetPath('http://evil.com/malware.exe')).toThrow(/external URL/);
      expect(() => SecurityValidator.validateAssetPath('https://s3.amazonaws.com/bucket/file.png')).toThrow(/external URL/);
    });

    it('should throw on path traversal', () => {
      expect(() => SecurityValidator.validateAssetPath('../../secrets.txt')).toThrow(/Path traversal/);
      expect(() => SecurityValidator.validateAssetPath('assets/../../config.json')).toThrow(/Path traversal/);
    });

    it('should throw on invalid extensions', () => {
      expect(() => SecurityValidator.validateAssetPath('assets/script.sh')).toThrow(/Forbidden file extension/);
      expect(() => SecurityValidator.validateAssetPath('malware.exe')).toThrow(/Forbidden file extension/);
    });
  });

  describe('validateMimeType', () => {
    it('should pass allowed mime types', () => {
      expect(() => SecurityValidator.validateMimeType('image/png', 'image.png')).not.toThrow();
      expect(() => SecurityValidator.validateMimeType('application/pdf', 'doc.pdf')).not.toThrow();
    });

    it('should throw on forbidden mime types', () => {
      expect(() => SecurityValidator.validateMimeType('text/html', 'index.html')).toThrow(/Forbidden mime type/);
      expect(() => SecurityValidator.validateMimeType('application/x-msdownload', 'virus.exe')).toThrow(/Forbidden mime type/);
    });

    it('should handle custom extension exceptions (pbix, sql, py)', () => {
      expect(() => SecurityValidator.validateMimeType('application/octet-stream', 'dashboard.pbix')).not.toThrow();
      expect(() => SecurityValidator.validateMimeType('application/octet-stream', 'script.py')).not.toThrow();
    });
  });
});
