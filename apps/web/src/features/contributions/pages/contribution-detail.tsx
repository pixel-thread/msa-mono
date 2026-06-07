'use client';

import { useParams } from '@tanstack/react-router';
import { useContributionDetail } from '@feature/contributions/hooks/useContributionDetail';
import { Button } from '@components/ui/button';
import { SectionHeader } from '@components/section-header';
import { ContributionDetail } from '@feature/contributions/components/contribution-detail';
import { ArrowLeft } from 'lucide-react';
import { Loading } from '@components/loading';

export function ContributionDetailPage() {
  const { contributionId } = useParams({
    strict: true,
    from: '/_dashboard/contributions/$contributionId/',
  });

  const { contribution, isLoading } = useContributionDetail(contributionId);

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
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-lg text-body">Contribution not found</p>
        <Button
          variant="outline"
          className="mt-4 h-11 border-hairline bg-canvas px-5 text-sm font-medium text-ink hover:bg-surface-strong"
          onClick={() => window.history.back()}
        >
          Go back
        </Button>
      </div>
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
