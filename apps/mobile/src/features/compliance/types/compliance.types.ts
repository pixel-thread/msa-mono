export type ComplianceStatus = 'PENDING' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export type ComplianceCategory =
  | 'MEETING_CONDUCT'
  | 'PAYMENT_DISPUTE'
  | 'DATA_PRIVACY'
  | 'MEMBER_CONDUCT'
  | 'ADMINISTRATIVE'
  | 'OTHER';

export type CompliancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Compliance {
  id: string;
  ticketNumber: string;
  userId: string;
  category: ComplianceCategory;
  subject: string;
  description: string;
  priority: CompliancePriority;
  status: ComplianceStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface ComplianceResponse {
  id: string;
  complianceId: string;
  message: string;
  responseType: 'INTERNAL_NOTE' | 'MEMBER_REPLY' | 'RESOLUTION';
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface ComplianceDetail extends Compliance {
  responses: ComplianceResponse[];
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface SubmitCompliancePayload {
  category: ComplianceCategory;
  subject: string;
  description: string;
  priority?: CompliancePriority;
}
