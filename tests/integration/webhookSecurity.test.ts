import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

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

describe('Webhook Security Verification', () => {
  const secret = 'my-super-secret-key';
  const payload = JSON.stringify({ ref: 'refs/heads/main' });

  it('rejects missing signature', () => {
    expect(verifyHmacSignature(payload, null, secret)).toBe(false);
  });

  it('rejects invalid signature', () => {
    expect(verifyHmacSignature(payload, 'sha256=invalid', secret)).toBe(false);
  });

  it('accepts valid HMAC signature', () => {
    const hmac = crypto.createHmac('sha256', secret);
    const validSignature = `sha256=${hmac.update(payload).digest('hex')}`;
    expect(verifyHmacSignature(payload, validSignature, secret)).toBe(true);
  });
});
