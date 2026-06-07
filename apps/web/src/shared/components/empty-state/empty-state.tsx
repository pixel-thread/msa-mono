import * as React from 'react';
import { Button } from '@src/shared/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@src/shared/components/ui/empty';
import { RefreshCwIcon } from 'lucide-react';

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
