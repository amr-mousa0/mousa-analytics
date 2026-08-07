// Database connection abstraction / Prisma Client singleton helper
import { getEnv } from '../config/env.js';

let dbClient: any = null;

export function getDbClient() {
  if (!dbClient) {
    const env = getEnv();
    if (!env.DATABASE_URL) {
      console.warn('[DB] DATABASE_URL is not defined. Database operations will be mocked in-memory.');
      dbClient = createInMemoryDbMock();
    } else {
      // Lazy load Prisma if environment has DATABASE_URL configured
      try {
        const { PrismaClient } = require('@prisma/client');
        dbClient = new PrismaClient();
      } catch (e) {
        console.warn('[DB] @prisma/client failed to initialize, falling back to mock DB.');
        dbClient = createInMemoryDbMock();
      }
    }
  }
  return dbClient;
}

function createInMemoryDbMock() {
  const store = new Map<string, Map<string, any>>();
  store.set('projects', new Map());
  store.set('job_states', new Map());
  store.set('idempotency_store', new Map());
  store.set('asset_registry', new Map());

  return {
    project: {
      findUnique: async ({ where }: any) => store.get('projects')?.get(where.slug || where.id) || null,
      upsert: async ({ where, create, update }: any) => {
        const key = where.slug || where.id || create.slug;
        const existing = store.get('projects')?.get(key);
        const data = existing ? { ...existing, ...update } : { ...create };
        store.get('projects')?.set(key, data);
        return data;
      }
    },
    jobState: {
      findUnique: async ({ where }: any) => store.get('job_states')?.get(where.jobId) || null,
      upsert: async ({ where, create, update }: any) => {
        const existing = store.get('job_states')?.get(where.jobId);
        const data = existing ? { ...existing, ...update } : { ...create };
        store.get('job_states')?.set(where.jobId, data);
        return data;
      }
    },
    idempotencyStore: {
      findUnique: async ({ where }: any) => store.get('idempotency_store')?.get(where.key) || null,
      create: async ({ data }: any) => {
        store.get('idempotency_store')?.set(data.key, data);
        return data;
      }
    },
    assetRegistry: {
      findUnique: async ({ where }: any) => store.get('asset_registry')?.get(where.hash) || null,
      create: async ({ data }: any) => {
        store.get('asset_registry')?.set(data.hash, data);
        return data;
      }
    }
  };
}
