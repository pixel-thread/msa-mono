import { z } from 'zod';
import { ProviderType } from '../types';

export const providerTypes: ProviderType[] = ['RAZORPAY', 'STRIPE', 'PAYU', 'CASHFREE'];

export const addProviderSchema = z.object({
  provider: z.enum(['RAZORPAY', 'STRIPE', 'PAYU', 'CASHFREE']),
  keyId: z.string().min(1, 'Key ID is required'),
  keySecret: z.string().min(1, 'Key Secret is required'),
  webhookSecret: z.string().optional(),
});

export type AddProviderFormValues = z.infer<typeof addProviderSchema>;
