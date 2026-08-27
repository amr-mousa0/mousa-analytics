import type { APIRoute } from 'astro';
import crypto from 'crypto';
import { UpstashQueueProvider } from '../../../lib/providers/upstashQueueProvider.js';
import { Logger } from '../../../lib/utils/logger.js';
import { getEnv } from '../../../config/env.js';
import { IdempotencyStore } from '../../../lib/orchestrator/idempotency.js';
import { FeatureFlagManager } from '../../../lib/flags.js';

export const prerender = false;

// In-memory rate limiting counter (e.g. max 30 requests per minute per IP)
// NOTE (P-07 / F-07): This in-memory map is scoped to a single serverless instance.
// In high-traffic production, edge rate limiting (Vercel WAF or Upstash @upstash/ratelimit) should be used.
const rateLimitMap = new Map<string, { count: number; expires: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.expires) {
    rateLimitMap.set(ip, { count: 1, expires: now + 60000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 30;
}

function verifyHmacSignature(payloadText: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = `sha256=${hmac.update(payloadText).digest('hex')}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch (err) {
    return false;
  }
}

const queueProvider = new UpstashQueueProvider();

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const requestId = crypto.randomUUID();
  const eventType = request.headers.get('x-github-event') || 'push';
  const deliveryId = request.headers.get('x-github-delivery');
  const payloadText = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  // Rate limiting check
  if (isRateLimited(clientAddress || 'global')) {
    Logger.warn('Rate limit exceeded on webhook endpoint', { requestId, ip: clientAddress });
    return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429 });
  }

  Logger.info(`Webhook received - Event: "${eventType}"`, { requestId, signaturePresent: !!signature });

  const env = getEnv();
  const secret = env.GITHUB_WEBHOOK_SECRET || process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret) {
    Logger.error('GITHUB_WEBHOOK_SECRET missing on server', { requestId });
    return new Response(JSON.stringify({ error: 'Webhook secret unconfigured' }), { status: 401 });
  }

  if (!verifyHmacSignature(payloadText, signature, secret)) {
    Logger.error('Invalid HMAC signature check failed', { requestId });
    return new Response(JSON.stringify({ error: 'Invalid HMAC signature' }), { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(payloadText);
  } catch (err) {
    Logger.error('Invalid JSON payload format', { requestId });
    return new Response(JSON.stringify({ error: 'Invalid JSON payload format' }), { status: 400 });
  }

  if (eventType === 'ping') {
    return new Response(
      JSON.stringify({ status: 'active', message: 'Mousa Analytics Webhook Active' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Idempotency check if enabled via feature flag
  const commitSha = payload.after || payload.head_commit?.id || deliveryId;
  if (commitSha && FeatureFlagManager.isEnabled('ENABLE_IDEMPOTENCY')) {
    const isDuplicate = await IdempotencyStore.isDuplicate(commitSha);
    if (isDuplicate) {
      Logger.info(`Duplicate webhook delivery detected (SHA: ${commitSha}). Skipping payload.`, { requestId });
      return new Response(JSON.stringify({ status: 'skipped', reason: 'Duplicate commit SHA' }), { status: 200 });
    }
    // NOTE (P-05): Do NOT mark as processed here.
    // The worker endpoint marks it AFTER successful pipeline execution to avoid dropped retries.
  }

  const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const traceId = `trace_${Math.random().toString(36).slice(2, 10)}`;

  // Enqueue payload into durable background queue
  await queueProvider.enqueue({
    jobId,
    traceId,
    correlationId: requestId,
    type: 'repo_sync',
    payload
  });

  return new Response(
    JSON.stringify({
      status: 'queued',
      jobId,
      traceId,
      requestId,
      message: 'Job successfully enqueued for asynchronous execution.'
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
