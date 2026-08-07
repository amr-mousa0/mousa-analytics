import type { APIRoute } from 'astro';
import crypto from 'crypto';
import { Logger } from '../../../lib/utils/logger.js';
import { PipelineOrchestrator } from '../../../lib/orchestrator/pipelineOrchestrator.js';
import { getEnv } from '../../../config/env.js';

export const prerender = false;

function validateUpstashSignature(request: Request, bodyText: string): boolean {
  const env = getEnv();
  const signature = request.headers.get('upstash-signature');
  const signingKey = env.UPSTASH_QSTASH_CURRENT_SIGNING_KEY;

  if (!signingKey) {
    Logger.warn('[Worker Auth] UPSTASH_QSTASH_CURRENT_SIGNING_KEY not set. Rejecting request to prevent fail-open.');
    return false;
  }

  if (!signature) {
    Logger.error('[Worker Auth] Missing upstash-signature header.');
    return false;
  }

  // Cryptographic Signature Validation
  try {
    const hmac = crypto.createHmac('sha256', signingKey);
    const expectedSignature = hmac.update(bodyText).digest('base64url');
    
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      Logger.error('[Worker Auth] Cryptographic signature mismatch.');
      return false;
    }
  } catch (err: any) {
    Logger.error(`[Worker Auth] Error validating signature: ${err.message}`);
    return false;
  }

  // Replay Protection & Timestamp check
  const timestampHeader = request.headers.get('upstash-timestamp');
  if (timestampHeader) {
    const timestamp = parseInt(timestampHeader, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) { // 5 minutes max tolerance
      Logger.error('[Worker Auth] Request timestamp expired (replay attack protection).');
      return false;
    }
  }

  return true;
}

export const POST: APIRoute = async ({ request }) => {
  const bodyText = await request.text();

  if (!validateUpstashSignature(request, bodyText)) {
    return new Response(JSON.stringify({ error: 'Unauthorized queue consumer request' }), { status: 401 });
  }

  try {
    const job = JSON.parse(bodyText);
    Logger.info(`[Worker Endpoint] Consuming job ${job.jobId}`, { jobId: job.jobId, traceId: job.traceId });

    // Pass the abort signal for graceful termination support
    const result = await PipelineOrchestrator.processRepoSyncJob(job, request.signal);

    return new Response(JSON.stringify({ status: 'completed', result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    Logger.error(`[Worker Endpoint Error] ${err.message}`, { name: err.name, stack: err.stack });
    
    if (err.name === 'PermanentError') {
      Logger.warn('[Worker Endpoint] Permanent error encountered. Returning 200 to prevent retries (route to DLQ).');
      return new Response(JSON.stringify({ status: 'failed_permanent', error: err.message }), {
        status: 200, // 200 OK so QStash doesn't retry, moves to DLQ
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // By default or for TransientError, return 500 so QStash retries
    return new Response(JSON.stringify({ status: 'failed_transient', error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
