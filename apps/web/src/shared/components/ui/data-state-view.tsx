import * as React from 'react';
import { DatabaseIcon } from 'lucide-react';
import { Loading } from '@src/shared/components/loading/loading';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@src/shared/components/ui/empty';

export interface DataStateViewProps {
  /** If true, the loading state is shown */
  isLoading?: boolean;
  /** If true (and not loading), the empty state is shown */
  isEmpty?: boolean;
  /** Main title for the empty state */
  emptyTitle?: string;
  /** Description text for the empty state */
  emptyDescription?: string;
  /** Icon component to display in the empty state */
  emptyIcon?: React.ElementType;
  /** Optional text to display below the loading spinner */
  loadingLabel?: string;
  /** Whether the loading spinner should take up the full screen */
  fullScreenLoading?: boolean;
  /** The content to show when not loading and not empty */
  children: React.ReactNode;
}

export function DataStateView({
  isLoading,
  isEmpty,
  emptyTitle = 'No data found',
  emptyDescription = 'There is currently no data to display.',
  emptyIcon: Icon = DatabaseIcon,
  loadingLabel,
  fullScreenLoading = false,
  children,
}: DataStateViewProps) {
  if (isLoading) {
    return <Loading fullScreen={fullScreenLoading} label={loadingLabel} />;
  }

  if (isEmpty) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return <>{children}</>;
}
