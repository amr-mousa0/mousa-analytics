import type { APIRoute } from 'astro';
import crypto from 'crypto';
import { PipelineOrchestrator } from '../../../lib/orchestrator/pipelineOrchestrator.js';

export const prerender = false;

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
  const eventType = request.headers.get('x-github-event') || 'push';
  const payloadText = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  // Stage 1: Webhook received
  console.log(`[Pipeline] [1/14] Webhook received - Event: "${eventType}", Signature Header: ${signature ? 'Present' : 'None'}`);

  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  // 1. HMAC Signature Verification
  if (secret && !verifyHmacSignature(payloadText, signature, secret)) {
    const exitReason = 'Invalid HMAC signature check failed';
    console.error(`[Pipeline] EARLY EXIT at Stage 1 (Webhook received): ${exitReason}`);
    return new Response(JSON.stringify({ error: exitReason }), { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(payloadText);
  } catch (err) {
    const exitReason = 'Invalid JSON payload format';
    console.error(`[Pipeline] EARLY EXIT at Stage 1 (Webhook received): ${exitReason}`);
    return new Response(JSON.stringify({ error: exitReason }), { status: 400 });
  }

  if (eventType === 'ping') {
    console.log('[Pipeline] Ping event processed successfully.');
    return new Response(
      JSON.stringify({ status: 'active', message: 'Mousa Analytics Content Hub Webhook Active' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Stage 2 & pipeline execution: PipelineOrchestrator.enqueueRepoSync()
    const { jobId, traceId, result } = await PipelineOrchestrator.enqueueRepoSync(payload);

    return new Response(
      JSON.stringify({
        status: 'processed',
        jobId,
        traceId,
        repository: payload.repository?.name || 'unknown-repo',
        project: result?.projectId
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        status: 'failed',
        error: err.message || 'Pipeline execution failed'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
