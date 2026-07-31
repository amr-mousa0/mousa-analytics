import { describe, it, expect } from 'vitest';
import { buildNormalizedProjectModel } from '../../src/lib/services/projectModelBuilder.js';
import { TranslationMemory, DefaultTranslationProvider } from '../../src/lib/providers/translationProvider.js';

describe('Manifest Authority & Intelligent Fallback Engine', () => {
  it('enforces Manifest Authority Rule (declared title wins)', () => {
    const model = buildNormalizedProjectModel({
      repoName: 'my-custom-repo',
      manifest: {
        schemaVersion: 1,
        project: {
          title: 'Declared Manifest Title'
        }
      }
    });

    expect(model.title).toBe('Declared Manifest Title');
    expect(model.isFallback).toBe(false);
  });

  it('activates Intelligent Fallback when manifest title is missing', () => {
    const model = buildNormalizedProjectModel({
      repoName: 'enterprise-crm-erp',
      readmeContent: 'First paragraph summary from README file.'
    });

    expect(model.title).toBe('Enterprise Crm Erp');
    expect(model.description).toBe('First paragraph summary from README file.');
    expect(model.isFallback).toBe(true);
  });

  it('generates SHA-256 Translation Memory compound cache key', () => {
    const key1 = TranslationMemory.generateCacheKey('Hello', 'en', 'ar', 'free-local-provider');
    const key2 = TranslationMemory.generateCacheKey('Hello', 'en', 'ar', 'free-local-provider');
    const key3 = TranslationMemory.generateCacheKey('Hello', 'en', 'ar', 'other-provider');

    expect(key1).toBe(key2);
    expect(key1).not.toBe(key3);
    expect(key1).toMatch(/^[a-f0-9]{64}$/);
  });

  it('translates strings dynamically using default provider with TM caching', async () => {
    const provider = new DefaultTranslationProvider();
    const result = await provider.translate('Enterprise CRM & ERP Platform', 'en', 'ar');

    expect(result).toBe('منصة إدارة علاقات العملاء وتخطيط الموارد للمؤسسات');
  });
});
