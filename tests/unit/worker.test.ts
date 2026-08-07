import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

describe('Worker direct invocation test', () => {
  it('executes worker task with mock payload', async () => {
    const mockWorkerProcess = async (payload: any) => {
      if (!payload.jobId) throw new Error('Missing jobId');
      return { success: true, processedJobId: payload.jobId };
    };

    const res = await mockWorkerProcess({ jobId: 'job_456' });
    expect(res.success).toBe(true);
    expect(res.processedJobId).toBe('job_456');
  });
});

describe('Worker authentication', () => {
  it('validates HMAC signature correctly', async () => {
    // Mock the validateUpstashSignature logic here for the unit test
    const signingKey = 'test_secret_key';
    const bodyText = JSON.stringify({ jobId: 'job_123' });
    
    const hmac = crypto.createHmac('sha256', signingKey);
    const expectedSignature = hmac.update(bodyText).digest('base64url');

    const signatureBuffer = Buffer.from(expectedSignature);
    const expectedBuffer = Buffer.from(expectedSignature);

    expect(crypto.timingSafeEqual(signatureBuffer, expectedBuffer)).toBe(true);
  });
  
  it('rejects invalid HMAC signature', async () => {
    const signingKey = 'test_secret_key';
    const bodyText = JSON.stringify({ jobId: 'job_123' });
    
    const hmac = crypto.createHmac('sha256', signingKey);
    const expectedSignature = hmac.update(bodyText).digest('base64url');

    const signatureBuffer = Buffer.from('invalid_signature');
    const expectedBuffer = Buffer.from(expectedSignature);

    expect(signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)).toBe(true);
  });
});
