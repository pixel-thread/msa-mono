import { User } from '@src/features/announcements';

export type DSARStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
export type DSARRequestType = 'ACCESS' | 'CORRECTION' | 'DELETION' | 'PORTABILITY';
export type DSARDataCategory =
  | 'PROFILE_DATA'
  | 'PAYMENT_HISTORY'
  | 'COMMUNICATION_LOGS'
  | 'ACTIVITY_DATA';

export interface DSARRequest {
  id: string;
  ticketNumber: string;
  userId: string;
  requestType: DSARRequestType;
  requestedData: DSARDataCategory[];
  description?: string;
  status: DSARStatus;
  responseDeadline: string;
  createdAt: string;
  notes?: string;
  responseType?: string;
  storageKey?: string;
  rejectedReason?: string;
  assignedToId?: string;
}

export interface DSARSubmitPayload {
  requestType: DSARRequestType;
  requestedData: DSARDataCategory[];
  description?: string;
}

export interface DSARResponsePayload {
  status: Exclude<DSARStatus, 'PENDING'>;
  notes?: string;
  responseType?: string;
  storageKey?: string;
  rejectedReason?: string;
}

export interface SLAReport {
  breached: number;
  atRisk: number;
  onTrack: number;
}

export interface DSARResponse {
  id: string;
  dsarTicketId: string;
  responseType: string;
  storageKey: string | null;
  deliveryMethod: string;
  notes: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

export interface DSARRequestDetail extends DSARRequest {
  completedAt?: string;
  updatedAt: string;
  member?: User;
  assignedTo?: User | null;
  responses: DSARResponse[];
}
