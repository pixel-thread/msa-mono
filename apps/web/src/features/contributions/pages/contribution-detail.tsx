'use client';

import { useParams, useNavigate } from '@tanstack/react-router';
import { useContributionDetail } from '@src/features/contributions/hooks/useContributionDetail';
import { Button } from '@src/shared/components/ui/button';
import { SectionHeader } from '@src/shared/components/section-header';
import { ContributionDetail } from '@src/features/contributions/components/contribution-detail';
import { ArrowLeft } from 'lucide-react';

export function ContributionDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const contributionId = params.contributionId as string;

  const { contribution, isLoading } = useContributionDetail(contributionId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-body">Loading contribution details...</p>
      </div>
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
        description={`${contribution.user?.name || 'Member'} \u2014 ${new Date(contribution.year, contribution.month - 1).toLocaleDateString('en-IN', {
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
