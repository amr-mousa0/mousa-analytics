import { describe, it, expect, vi, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';

vi.mock('astro:content', () => ({
  getEntry: vi.fn(),
  getCollection: vi.fn().mockResolvedValue([])
}));

import { PipelineOrchestrator } from '../../src/lib/orchestrator/pipelineOrchestrator.js';
import { PublishWorker } from '../../src/lib/workers/publishWorker.js';

describe('PipelineOrchestrator Full Pipeline Execution Trace', () => {
  it('traces complete 15-stage execution path for a successful GitHub push event', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log');

    const samplePushPayload = {
      ref: 'refs/heads/main',
      after: 'a1b2c3d4e5f67890',
      head_commit: {
        id: 'a1b2c3d4e5f67890',
        message: 'feat: add sales analytics dashboard manifest',
        added: ['manifest.json', 'README.md'],
        modified: []
      },
      repository: {
        name: 'sales-performance-analytics',
        full_name: 'amr-mousa0/sales-performance-analytics',
        homepage: 'https://app.powerbi.com/view?r=sample-sales-demo',
        default_branch: 'main'
      },
      manifestRaw: JSON.stringify({
        schemaVersion: 1,
        project: {
          title: 'Sales Performance & Territory Analytics',
          description: 'Comprehensive Power BI executive dashboard analyzing multi-region sales pipeline and commission structures.',
          problem: 'Regional managers lacked real-time visiblity into monthly revenue quotas and dynamic target achievements.',
          solution: 'Built an enterprise Star Schema model with DAX measures for YTD growth and variance analysis.',
          businessValue: 'Increased regional sales forecast accuracy by 35% and saved 12 hours of manual reporting per week.',
          tags: ['Power BI', 'SQL Server', 'DAX'],
          cover: 'https://raw.githubusercontent.com/amr-mousa0/sales-performance-analytics/main/assets/images/uploads/coffee-shop.jpg',
          gallery: [
            { type: 'powerbi', title: 'Interactive Sales Dashboard', url: 'https://app.powerbi.com/view?r=sample-sales-demo' },
            { type: 'pdf', title: 'Sales Performance Spec Sheet', url: 'https://raw.githubusercontent.com/amr-mousa0/sales-performance-analytics/main/docs/sales-spec.pdf' }
          ]
        },
        publish: {
          portfolio: {
            enabled: true,
            featured: true,
            priority: 1
          }
        }
      }),
      readmeRaw: '# Sales Performance Analytics\nComprehensive data dashboard for sales tracking.'
    };

    // Mock fetch for GitHub API asset downloads
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const urlStr = typeof input === 'string' ? input : input.toString();
      if (urlStr.includes('api.github.com/repos/')) {
        return new Response(new Uint8Array([0x89, 0x50, 0x4e, 0x47]), {
          status: 200,
          headers: {
            'content-type': urlStr.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
            'content-length': '4'
          }
        });
      }
      return originalFetch(input, init);
    });

    // Stage 1 Log
    console.log('[Pipeline] [1/15] Webhook received - Event: "push", Signature Header: Present');

    // Stage 2 to 15 via PipelineOrchestrator
    const { jobId, result } = await PipelineOrchestrator.enqueueRepoSync(samplePushPayload);

    globalThis.fetch = originalFetch;

    expect(jobId).toBeDefined();
    expect(result).toBeDefined();
    expect(result?.projectId).toBe('sales-performance-analytics');
    expect(result?.title).toBe('Sales Performance & Territory Analytics');
    expect(result?.titleAr).toBeDefined();

    // Verify PublishWorker store updated
    const publishedProjects = PublishWorker.getPublishedProjects();
    const publishedProject = publishedProjects.find(p => p.projectId === 'sales-performance-analytics');
    expect(publishedProject).toBeDefined();
    expect(publishedProject?.title).toBe('Sales Performance & Territory Analytics');

    consoleLogSpy.mockRestore();
  });

  it('logs early exit when publish target is disabled', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn');

    const disabledPayload = {
      ref: 'refs/heads/main',
      after: '1122334455',
      repository: { name: 'private-internal-tool' },
      manifestRaw: JSON.stringify({
        schemaVersion: 1,
        project: { title: 'Internal Tool' },
        publish: {
          portfolio: { enabled: false }
        }
      })
    };

    await expect(PipelineOrchestrator.enqueueRepoSync(disabledPayload)).rejects.toThrow();

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('EARLY EXIT at Stage 11')
    );

    consoleWarnSpy.mockRestore();
  });

  afterAll(() => {
    // Cleanup any temporary mock state
  });
});
