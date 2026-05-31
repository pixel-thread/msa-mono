import { DSARDataCategory, DSARRequestType } from '../types/dsar.types';

export const DATA_CATEGORIES: { label: string; value: DSARDataCategory }[] = [
  { label: 'Profile Data', value: 'PROFILE_DATA' },
  { label: 'Payment History', value: 'PAYMENT_HISTORY' },
  { label: 'Communication Logs', value: 'COMMUNICATION_LOGS' },
  { label: 'Activity Data', value: 'ACTIVITY_DATA' },
];

export const REQUEST_TYPES: { label: string; value: DSARRequestType }[] = [
  { label: 'Access', value: 'ACCESS' },
  { label: 'Correction', value: 'CORRECTION' },
  { label: 'Deletion', value: 'DELETION' },
  { label: 'Portability', value: 'PORTABILITY' },
];
