import fs from 'fs';
import path from 'path';

// Parse .env and .env.local manually if present
function loadEnvFiles() {
  const files = ['.env', '.env.local', '.env.production'];
  for (const file of files) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const firstEqual = trimmed.indexOf('=');
          const key = trimmed.slice(0, firstEqual).trim();
          let val = trimmed.slice(firstEqual + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnvFiles();

interface EnvCheck {
  key: string;
  category: string;
  required: boolean;
  purpose: string;
}

const CHECKS: EnvCheck[] = [
  // Webhook & Security
  { key: 'GITHUB_WEBHOOK_SECRET', category: 'Webhook Security', required: true, purpose: 'HMAC signature verification' },
  { key: 'GITHUB_TOKEN', category: 'GitHub API', required: false, purpose: 'GitHub API Rate Limit' },
  
  // Database
  { key: 'DATABASE_URL', category: 'Database (Prisma)', required: true, purpose: 'PostgreSQL connection' },

  // AI & Translation
  { key: 'GEMINI_API_KEY', category: 'AI Translation', required: true, purpose: 'Gemini translation engine' },
  { key: 'DEEPL_API_KEY', category: 'AI Translation', required: false, purpose: 'DeepL fallback' },

  // Queues & Distributed Lock (Upstash)
  { key: 'UPSTASH_QSTASH_TOKEN', category: 'Queue (QStash)', required: true, purpose: 'QStash job dispatch' },
  { key: 'UPSTASH_QSTASH_CURRENT_SIGNING_KEY', category: 'Queue (QStash)', required: true, purpose: 'QStash signature validation' },
  { key: 'UPSTASH_REDIS_REST_URL', category: 'Locking & Idempotency', required: true, purpose: 'Distributed lock and idempotency' },
  { key: 'UPSTASH_REDIS_REST_TOKEN', category: 'Locking & Idempotency', required: true, purpose: 'Redis connection token' },

  // Storage
  { key: 'AWS_S3_BUCKET', category: 'Storage Provider', required: false, purpose: 'AWS S3 Bucket' },
  { key: 'AWS_REGION', category: 'Storage Provider', required: false, purpose: 'AWS S3 Region' },
  { key: 'AWS_ACCESS_KEY_ID', category: 'Storage Provider', required: false, purpose: 'AWS S3 Access Key' },
  { key: 'AWS_SECRET_ACCESS_KEY', category: 'Storage Provider', required: false, purpose: 'AWS S3 Secret Key' },
  { key: 'BLOB_READ_WRITE_TOKEN', category: 'Storage Provider', required: false, purpose: 'Vercel Blob Storage' },
];

function main() {
  console.log('\n======================================================');
  console.log('[CHECK] Environment Configuration Status');
  console.log('======================================================\n');

  let missingRequired = 0;
  let missingOptional = 0;
  let configuredCount = 0;

  const categories = Array.from(new Set(CHECKS.map(c => c.category)));

  for (const cat of categories) {
    console.log(`[${cat}]`);
    const items = CHECKS.filter(c => c.category === cat);
    for (const item of items) {
      const val = process.env[item.key] || process.env[item.key.replace('UPSTASH_', '')] || process.env[item.key.replace('UPSTASH_REDIS_', 'KV_')];
      const isSet = Boolean(val && val.trim().length > 0);
      
      if (isSet) {
        configuredCount++;
        const masked = val!.length > 8 ? `${val!.slice(0, 4)}...${val!.slice(-4)}` : '********';
        console.log(`  [OK] ${item.key.padEnd(35)} : SET (${masked})`);
      } else {
        if (item.required) {
          missingRequired++;
          console.log(`  [MISSING] ${item.key.padEnd(30)} : REQUIRED (${item.purpose})`);
        } else {
          missingOptional++;
          console.log(`  [OPTIONAL] ${item.key.padEnd(29)} : NOT SET (${item.purpose})`);
        }
      }
    }
    console.log('');
  }

  console.log('------------------------------------------------------');
  console.log(`Summary: ${configuredCount} configured | ${missingRequired} required missing | ${missingOptional} optional`);
  console.log('------------------------------------------------------\n');
}

main();
