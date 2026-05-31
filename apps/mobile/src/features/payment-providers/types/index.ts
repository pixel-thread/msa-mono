export type ProviderType = 'RAZORPAY' | 'STRIPE' | 'PAYU' | 'CASHFREE';

export interface PaymentProvider {
  id: string;
  associationId: string;
  provider: ProviderType;
  keyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentProviderPayload {
  provider: ProviderType;
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
  isActive?: boolean;
}
