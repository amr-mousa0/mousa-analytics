import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { GitHubWorker } from '../../src/lib/workers/githubWorker.js';
import { PublishWorker } from '../../src/lib/workers/publishWorker.js';
import { AssetWorker } from '../../src/lib/workers/assetWorker.js';
import { TranslationWorker } from '../../src/lib/workers/translationWorker.js';
import { TranslationFallbackChain } from '../../src/lib/providers/translationFallbackChain.js';
import { DistributedLock } from '../../src/lib/orchestrator/locks.js';
import { PermanentError, TransientError } from '../../src/lib/errors.js';
import { DiskStorageProvider } from '../../src/lib/providers/storageProvider.js';

describe('Production Security & Hardening Remediation Tests (P-01 to P-10)', () => {
  // P-01: Ghost files deletion
  it('P-01: confirms ghost project markdown files are completely deleted from disk', () => {
    const ghostAr = path.join(process.cwd(), 'src/content/projects/ar/amr-mousa0.md');
    const ghostEn = path.join(process.cwd(), 'src/content/projects/en/amr-mousa0.md');
    expect(fs.existsSync(ghostAr)).toBe(false);
    expect(fs.existsSync(ghostEn)).toBe(false);
  });

  // P-02: Fail-Closed publish gate
  it('P-02: rejects project when portfolio target is missing or disabled', async () => {
    const jobPayload = {
      jobId: 'test-job-p02-1',
      traceId: 'test-trace',
      type: 'repo_sync',
      status: 'processing' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      payload: {
        model: {
          projectId: 'internal-service',
          title: 'Internal Service',
          description: 'Test service',
          status: 'production',
          tags: ['Backend'],
          gallery: [],
          capabilities: {},
          publish: {
            cli: { enabled: true, visibility: 'public' as const } // Missing 'portfolio'
          },
          isFallback: false,
          updatedAt: new Date().toISOString()
        },
        targetDestination: 'portfolio'
      }
    };

    await expect(PublishWorker.process(jobPayload)).rejects.toThrow(PermanentError);
  });

  it('P-02: allows publication when portfolio enabled is explicitly true', async () => {
    const jobPayload = {
      jobId: 'test-job-p02-2',
      traceId: 'test-trace',
      type: 'repo_sync',
      status: 'processing' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      payload: {
        model: {
          projectId: 'authorized-public-portfolio-project',
          title: 'Authorized Project',
          description: 'Test authorized project',
          status: 'production',
          tags: ['Analytics'],
          gallery: [],
          capabilities: {},
          publish: {
            portfolio: { enabled: true, visibility: 'public' as const }
          },
          isFallback: false,
          updatedAt: new Date().toISOString()
        },
        targetDestination: 'portfolio'
      }
    };

    const result = await PublishWorker.process(jobPayload);
    expect(result.projectId).toBe('authorized-public-portfolio-project');
  });

  // P-03: PermanentError on missing or invalid manifest
  it('P-03: throws PermanentError when manifest is missing', async () => {
    const job = {
      jobId: 'test-p03-missing',
      traceId: 'trace-1',
      type: 'repo_sync',
      status: 'processing' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      payload: {
        repoName: 'no-manifest-repo'
      }
    };

    await expect(GitHubWorker.process(job)).rejects.toThrow(PermanentError);
  });

  it('P-03: throws PermanentError when manifest is invalid JSON', async () => {
    const job = {
      jobId: 'test-p03-invalid',
      traceId: 'trace-2',
      type: 'repo_sync',
      status: 'processing' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      payload: {
        repoName: 'broken-manifest-repo',
        manifestRaw: '{ broken json }'
      }
    };

    await expect(GitHubWorker.process(job)).rejects.toThrow(PermanentError);
  });

  // P-04 & P-10: DistributedLock concurrency & Stale Commit protection
  it('P-04: acquires and releases distributed locks properly', async () => {
    const resource = 'test-lock-resource';
    const acquired = await DistributedLock.acquire(resource, 5000);
    expect(acquired).toBe(true);

    // Second immediate acquire should fail
    const secondAcquire = await DistributedLock.acquire(resource, 5000);
    expect(secondAcquire).toBe(false);

    // Release and re-acquire
    await DistributedLock.release(resource);
    const thirdAcquire = await DistributedLock.acquire(resource, 5000);
    expect(thirdAcquire).toBe(true);
    await DistributedLock.release(resource);
  });

  // P-08: Fail-Closed Translation
  it('P-08: throws PermanentError when required Arabic translation is missing', async () => {
    const mockProvider = {
      id: 'mock-blank-provider',
      translate: vi.fn().mockResolvedValue('')
    };

    const job = {
      jobId: 'test-p08',
      traceId: 'trace-p08',
      type: 'repo_sync',
      status: 'processing' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      payload: {
        model: {
          projectId: 'sample-project',
          title: 'English Title',
          description: 'English Description',
          status: 'production',
          tags: ['Data'],
          gallery: [],
          capabilities: {},
          publish: {},
          isFallback: false,
          updatedAt: new Date().toISOString()
        },
        sourceLang: 'en',
        targetLang: 'ar'
      }
    };

    await expect(TranslationWorker.process(job, mockProvider)).rejects.toThrow(PermanentError);
  });

  // P-09: Required PDF Artifact Enforcement & Binary Ingestion
  it('P-09: throws PermanentError when manifest declares a PDF that fails binary resolution', async () => {
    const storageProvider = new DiskStorageProvider();

    // Mock fetch to simulate 404 on PDF asset download
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 404, statusText: 'Not Found' }));

    const job = {
      jobId: 'test-p09',
      traceId: 'trace-p09',
      type: 'repo_sync',
      status: 'processing' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      payload: {
        model: {
          projectId: 'pdf-project',
          title: 'PDF Project',
          description: 'Project with PDF',
          status: 'production',
          tags: ['Data'],
          gallery: [
            { type: 'pdf', title: 'Technical Spec', url: 'docs/architecture.pdf' }
          ],
          capabilities: {},
          publish: {},
          isFallback: false,
          updatedAt: new Date().toISOString()
        },
        repoFullName: 'amr-mousa0/pdf-project',
        branch: 'main'
      }
    };

    await expect(AssetWorker.process(job, storageProvider)).rejects.toThrow(PermanentError);

    globalThis.fetch = originalFetch;
  });

  it('P-09: successfully downloads binary PDF stream, computes hash, and registers public URL', async () => {
    const storageProvider = new DiskStorageProvider();

    const samplePdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]); // %PDF-1.4 header
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(samplePdfBytes, {
        status: 200,
        headers: { 'content-type': 'application/pdf', 'content-length': '8' }
      })
    );

    const job = {
      jobId: 'test-p09-success',
      traceId: 'trace-p09-success',
      type: 'repo_sync',
      status: 'processing' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      payload: {
        model: {
          projectId: 'pdf-success-project',
          title: 'PDF Success Project',
          description: 'Project with PDF',
          status: 'production',
          tags: ['Data'],
          gallery: [
            { type: 'pdf', title: 'Technical Spec', url: 'docs/spec.pdf' }
          ],
          capabilities: {},
          publish: {},
          isFallback: false,
          updatedAt: new Date().toISOString()
        },
        repoFullName: 'amr-mousa0/pdf-success-project',
        branch: 'main'
      }
    };

    const processedModel = await AssetWorker.process(job, storageProvider);
    expect(processedModel.pdfUrl).toBeDefined();
    expect(processedModel.pdfUrl).toContain('/assets/');

    globalThis.fetch = originalFetch;
  });
});
