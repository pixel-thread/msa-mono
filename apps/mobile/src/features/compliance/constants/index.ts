import { ComplianceCategory, CompliancePriority } from '../types/compliance.types';

export const COMPLIANCE_CATEGORIES: { label: string; value: ComplianceCategory }[] = [
  { label: 'Meeting Conduct', value: 'MEETING_CONDUCT' },
  { label: 'Payment Dispute', value: 'PAYMENT_DISPUTE' },
  { label: 'Data Privacy', value: 'DATA_PRIVACY' },
  { label: 'Member Conduct', value: 'MEMBER_CONDUCT' },
  { label: 'Administrative', value: 'ADMINISTRATIVE' },
  { label: 'Other', value: 'OTHER' },
];

export const COMPLIANCE_PRIORITIES: { label: string; value: CompliancePriority }[] = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
];
