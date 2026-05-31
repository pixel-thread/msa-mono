type BillingCycle = 'MONTHLY' | 'YEARLY';

export type SubscriptionPlanVersion = {
  id: string;
  planId: string;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  features: Record<string, unknown>;
  description: string | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string;
};

export interface SubscriptionPlan {
  id: string;

  associationId: string;

  name: string;

  description: string | null;

  isActive: boolean;

  memberTypeId?: string | null;

  isDefault: true;
  createdAt: string;
  updatedAt: string;
  activeVersion: SubscriptionPlanVersion;
}

export interface SubscriptionFeatures {
  events: boolean;

  voting: boolean;

  [key: string]: boolean;
}
