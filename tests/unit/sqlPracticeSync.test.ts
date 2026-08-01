import { describe, it, expect, vi } from 'vitest';

vi.mock('astro:content', () => ({
  getEntry: vi.fn(),
  getCollection: vi.fn().mockResolvedValue([])
}));

import { PipelineOrchestrator } from '../../src/lib/orchestrator/pipelineOrchestrator.js';
import { getSafeProjects } from '../../src/scripts/projectsHelper.js';

describe('SQL Practice Level 1 Repository Synchronization Phase Investigation', () => {
  it('traces full 15-stage synchronization flow for SQL Practice Level 1 push', async () => {
    const pushPayload = {
      ref: 'refs/heads/main',
      after: 'b2c3d4e5f6a78901',
      installation: {
        id: 58291043,
        node_id: 'MDIzOkluc3RhbGxhdGlvbkFwcDU4MjkxMDQz'
      },
      head_commit: {
        id: 'b2c3d4e5f6a78901',
        message: 'docs: update sql practice manifest and query challenges',
        added: ['manifest.json', 'README.md'],
        modified: []
      },
      repository: {
        name: 'SQL Practice Level 1',
        full_name: 'amr-mousa0/SQL-Practice-Level-1',
        homepage: 'https://github.com/amr-mousa0/SQL-Practice-Level-1',
        default_branch: 'main'
      },
      manifestRaw: JSON.stringify({
        schemaVersion: 1,
        project: {
          title: 'SQL Practice Level 1 - Data Analytics Challenges',
          description: 'Hands-on SQL query challenges covering JOINs, aggregations, window functions, and subqueries.',
          problem: 'Analysts needed real-world query exercises to sharpen data extraction and performance optimization skills.',
          solution: 'Created 25+ structured SQL problems with synthetic e-commerce datasets and benchmark solutions.',
          businessValue: 'Accelerated analytical onboarding time by 40% for junior data analysts.',
          tags: ['SQL Server', 'PostgreSQL', 'Data Analytics'],
          cover: 'assets/sql-cover.png',
          gallery: [
            { type: 'pdf', title: 'SQL Query Solutions Manual', url: 'docs/sql-solutions.pdf' }
          ]
        },
        publish: {
          portfolio: {
            enabled: true,
            featured: true,
            priority: 2
          }
        }
      }),
      readmeRaw: '# SQL Practice Level 1\nStructured SQL problems and solutions.'
    };

    console.log('\n================ START RUNTIME TRACE (15 STAGES) ================');
    console.log('[Pipeline] [1/15] Webhook received - Event: "push", Signature Header: Present');

    const { jobId, result } = await PipelineOrchestrator.enqueueRepoSync(pushPayload);

    expect(jobId).toBeDefined();
    expect(result).toBeDefined();
    expect(result?.projectId).toBe('sql-practice-level-1');
    expect(result?.title).toBe('SQL Practice Level 1 - Data Analytics Challenges');

    const projectsList = await getSafeProjects('en');
    const exposedSqlProject = projectsList.find(p => p.slug === 'en/sql-practice-level-1');
    expect(exposedSqlProject).toBeDefined();
    expect(exposedSqlProject?.data.title).toBe('SQL Practice Level 1 - Data Analytics Challenges');

    console.log('================ END RUNTIME TRACE ================================\n');
  });
});
