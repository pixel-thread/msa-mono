import { WebhookSignatureError } from '@errors';
import { getDefaultEasWebhookService } from '@feature/eas/services/webhook.service';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import type { RequestHandler } from 'express';
import type { Request, Response } from 'express';

export const webhook: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response) => {
    logger.info('POST /api/v1/eas/webhook - Request started');

    let rawBody: string;
    try {
      rawBody = req.body
        ? typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body)
        : '';
    } catch {
      return res.status(400).json({ error: 'Failed to read request body' });
    }

    const signature = req.headers['expo-signature'] as string;
    if (!signature) {
      return res.status(400).json({ error: 'Missing expo-signature header' });
    }

    try {
      const service = getDefaultEasWebhookService();
      const result = await service.processEvent(rawBody, signature);

      logger.info({ event: result.status }, 'POST /api/v1/eas/webhook - Success');

      return res.status(200).json({ status: result.status });
    } catch (error) {
      if (error instanceof WebhookSignatureError) {
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }

      logger.error({ error }, 'EAS webhook processing error');
      return res.status(200).json({ status: 'error', message: 'Webhook processing failed' });
    }
  }),
];
