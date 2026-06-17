'use client';

import { Loading } from '@components/loading';
import { SectionHeader } from '@components/section-header';
import { Button } from '@components/ui/button';
import { ContributionDetail } from '@feature/contributions/components/contribution-detail';
import { useContributionDetail } from '@feature/contributions/hooks/use-contribution-detail';
import { EmptyState } from '@src/shared/components/empty-state';
import { useParams } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

export function ContributionDetailPage() {
  const { contributionId } = useParams({
    strict: true,
    from: '/_dashboard/contributions/$contributionId/',
  });

  const { contribution, isLoading, refetch } = useContributionDetail(contributionId);

  if (isLoading) {
    return (
      <Loading
        label="Loading contribution details..."
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    );
  }

  if (!contribution) {
    return (
      <EmptyState
        description="No contribution found."
        label="No contribution found."
        retryLabel="Retry"
        onRetry={refetch}
      />
    );
  }

  return (
    <>
      <SectionHeader
        title="Contribution Details"
        description={`${contribution.user?.name || 'Member'} \u2014 ${new Date(
          contribution.year,
          contribution.month - 1,
        ).toLocaleDateString('en-IN', {
          month: 'long',
          year: 'numeric',
        })}`}
      />

      <ContributionDetail contribution={contribution} />

      <div className="mt-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    </>
  );
}
