import * as React from 'react';
import { RefreshCwIcon } from 'lucide-react';

import { Button } from '@src/shared/components/ui/button';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@src/shared/components/ui/empty';

interface EmptyStateProps {
  label: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

function EmptyState({ label, description, onRetry, retryLabel = 'Try again' }: EmptyStateProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{label}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {onRetry && (
        <EmptyContent>
          <Button variant="outline" onClick={onRetry}>
            <RefreshCwIcon className="size-3.5" />
            {retryLabel}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}

export { EmptyState };
