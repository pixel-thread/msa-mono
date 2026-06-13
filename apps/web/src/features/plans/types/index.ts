export interface PlanVersion {
  id: string;
  amount: number;
  currency: string;
  billingCycle: string;
  features: Record<string, unknown>;
  description?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  createdAt: string;
}

export interface Plan {
  id: string;
  associationId: string;
  name: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  memberTypeId?: string;
  memberType?: { id: string; level: number; description?: string };
  activeVersion?: PlanVersion;
  versions?: PlanVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface PlanListItem {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  memberTypeId?: string;
  activeVersion?: PlanVersion;
  createdAt: string;
}
