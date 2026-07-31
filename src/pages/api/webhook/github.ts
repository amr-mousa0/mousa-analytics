import type { APIRoute } from 'astro';
import crypto from 'crypto';
import { MemoryQueueProvider } from '../../../lib/providers/queueProvider.js';

export const prerender = false;

const queueProvider = new MemoryQueueProvider();

function verifyHmacSignature(payloadText: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = `sha256=${hmac.update(payloadText).digest('hex')}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch (err) {
    return false;
  }
}

export const POST: APIRoute = async ({ request }) => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  const payloadText = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  // 1. HMAC Signature Verification
  if (secret && !verifyHmacSignature(payloadText, signature, secret)) {
    return new Response(JSON.stringify({ error: 'Invalid HMAC signature' }), { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(payloadText);
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), { status: 400 });
  }

  const eventType = request.headers.get('x-github-event') || 'push';

  if (eventType === 'ping') {
    return new Response(
      JSON.stringify({ status: 'active', message: 'Mousa Analytics Content Hub Webhook Active' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const repoName = payload.repository?.name || 'unknown-repo';
  const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const traceId = `trace_${crypto.randomBytes(8).toString('hex')}`;
  const correlationId = `corr_${crypto.randomBytes(8).toString('hex')}`;

  // 2. Dispatch Pipeline Job to Queue
  await queueProvider.enqueue({
    jobId,
    traceId,
    correlationId,
    type: 'repo_sync',
    payload: {
      repoName,
      commitSha: payload.after || payload.head_commit?.id,
      githubPagesUrl: payload.repository?.homepage
    }
  });

  console.log(`[Webhook] Enqueued repo_sync job jobId=${jobId} traceId=${traceId} repo=${repoName}`);

  return new Response(
    JSON.stringify({
      status: 'queued',
      jobId,
      traceId,
      correlationId,
      repository: repoName
    }),
    { status: 202, headers: { 'Content-Type': 'application/json' } }
  );
};
