export type SLAStatus = 'BREACHED' | 'AT_RISK' | 'ON_TRACK';

export const getSLAStatus = (createdAt: string | Date): SLAStatus => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 21) return 'BREACHED';
  if (diffDays >= 15) return 'AT_RISK';
  return 'ON_TRACK';
};

export const getSLAColor = (status: SLAStatus): string => {
  switch (status) {
    case 'BREACHED':
      return '#ef4444'; // Red-500
    case 'AT_RISK':
      return '#f97316'; // Orange-500
    case 'ON_TRACK':
      return '#22c55e'; // Green-500
    default:
      return '#6b7280'; // Gray-500
  }
};
