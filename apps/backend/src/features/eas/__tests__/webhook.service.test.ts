import { describe, it, expect } from '@jest/globals';
import { createEasWebhookService } from '../services/webhook.service';

describe('EAS webhook service', () => {
  const secret = 'test-secret-at-least-16-chars';

  it('should verify valid expo-signature', async () => {
    const service = createEasWebhookService(secret);
    const body = JSON.stringify({ event: 'test' });
    const crypto = await import('crypto');
    const hmac = crypto.createHmac('sha1', secret).update(body).digest('hex');
    const signature = `sha1=${hmac}`;
    expect(service.verifySignature(body, signature)).toBe(true);
  });

  it('should reject invalid signature', async () => {
    const service = createEasWebhookService(secret);
    const body = JSON.stringify({ event: 'test' });
    expect(service.verifySignature(body, 'sha1=invalid')).toBe(false);
  });

  it('should reject tampered body', async () => {
    const service = createEasWebhookService(secret);
    const body = JSON.stringify({ event: 'test' });
    const crypto = await import('crypto');
    const hmac = crypto.createHmac('sha1', secret).update(body).digest('hex');
    const signature = `sha1=${hmac}`;
    expect(service.verifySignature(body + 'tampered', signature)).toBe(false);
  });

  it('should reject missing sha1= prefix', async () => {
    const service = createEasWebhookService(secret);
    const body = JSON.stringify({ event: 'test' });
    expect(service.verifySignature(body, 'invalidsignature')).toBe(false);
  });

  it('should reject missing signature header', async () => {
    const service = createEasWebhookService(secret);
    const body = JSON.stringify({ event: 'test' });
    expect(service.verifySignature(body, '')).toBe(false);
  });
});
