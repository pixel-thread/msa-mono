'use client';

import { Badge } from '@components/ui/badge';
import { cn } from '@src/shared/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  PAID: { label: 'Paid', className: 'text-green-600 bg-green-50 border-green-200' },
  PARTIAL: { label: 'Partial', className: 'text-blue-600 bg-blue-50 border-blue-200' },
  DUE: { label: 'Due', className: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  OVERDUE: { label: 'Overdue', className: 'text-red-600 bg-red-50 border-red-200' },
  WAIVED: { label: 'Waived', className: 'text-gray-500 bg-gray-50 border-gray-200' },
  PENDING: { label: 'Pending', className: 'text-gray-500 bg-gray-50 border-gray-200' },
};

interface ContributionStatusBadgeProps {
  status: string;
}

export function ContributionStatusBadge({ status }: ContributionStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'text-muted-foreground' };

  return (
    <Badge
      variant="outline"
      className={cn('rounded px-1.5 py-0.5 border text-[10px]', config.className)}
    >
      {config.label}
    </Badge>
  );
}
