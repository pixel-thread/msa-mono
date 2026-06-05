'use client';
import { DataTable } from '@src/shared/components/data-table';
import { DataTablePagination } from '@src/shared/components/data-table-pagination';
import { MemberCombobox } from '@src/shared/components/members/member-combobox';
import { SectionHeader } from '@src/shared/components/section-header';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ContributionPeriod } from '../types';
import { useUserContributionColumns } from '../hooks/useUserContributionColumns';
import z from 'zod';
import { toast } from 'sonner';
import { Button } from '@src/shared/components/ui/button';
import { useUrlFilters } from '@hooks/use-url-filters';
import { Card } from '@components/ui/card';
import { useUserContributions } from '../hooks';
import { Loader2 } from 'lucide-react';
import { ENDPOINTS } from '@repo/shared';
import { MemberProfileCard } from '../components/member-profile-card';
import { ContributionStatsPanel } from '../components/contribution-stats-panel';
import { PaymentSummaryBar } from '../components/payment-summary-bar';

const RecordContributionSchema = z.object({
  userId: z.uuid(),
  contributionPeriodIds: z.array(z.uuid()),
  amount: z
    .string()
    .refine((value) => {
      const amount = parseFloat(value);
      return !isNaN(amount);
    })
    .regex(/^\d+(\.\d{1,2})?$/)
    .min(1),
});

type RecordContributionInput = z.infer<typeof RecordContributionSchema>;

export const AddContributionPage = () => {
  const [selectedPeriods, setSelectedPeriods] = useState<ContributionPeriod[]>([]);
  const [userId, setUserId] = useState<string>('');

  const selectedTotal = useMemo(
    () => selectedPeriods.reduce((acc, period) => acc + parseInt(period.dueAmount, 10), 0),
    [selectedPeriods],
  );

  const handleRowCheckChange = (data: ContributionPeriod[]) => {
    setSelectedPeriods(data);
  };

  const { columns } = useUserContributionColumns({
    onCheck: (value) => handleRowCheckChange(value),
    checkValues: selectedPeriods,
  });

  const queryClient = useQueryClient();

  const { setPage, page } = useUrlFilters({
    basePath: '/contributions/add-contribution',
  });

  const {
    contributions = [],
    meta,
    summary,
    refetch,
    user,
  } = useUserContributions({ page, userId });

  const { mutate: recordContribution, isPending: isRecordingContribution } = useMutation({
    mutationFn: (data: RecordContributionInput) =>
      http.post(ENDPOINTS.CONTRIBUTION.CREATE_PAYMENT, data),
  });

  const genContribution = useMutation({
    mutationFn: (id: string) => http.post(ENDPOINTS.CONTRIBUTION.USER(id), {}),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['all-contributions'] });
        refetch();
        return;
      }
      toast.error(res.message || 'Failed to generate contributions');
      return;
    },
  });

  const onSubmit = () => {
    if (selectedPeriods.length === 0) {
      toast.error('Please select at least one contribution period');
      return;
    }

    recordContribution(
      {
        userId,
        contributionPeriodIds: selectedPeriods.map((p) => p.id),
        amount: selectedTotal.toString(),
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success('Contributions added successfully');
            queryClient.invalidateQueries({ queryKey: ['all-contributions'] });
            genContribution.mutate(userId);
            setSelectedPeriods([]);
            return;
          }
          toast.error(data.message || 'Failed to add contributions');
        },
      },
    );
  };

  function onMemberChange(value: string) {
    setSelectedPeriods([]);
    setUserId(value);
  }

  return (
    <div className="space-y-6 flex-col flex">
      <SectionHeader title="Record Contributions" description="Record contributions for a member" />
      <Card className="p-4">
        <MemberCombobox value={userId} onValueChange={onMemberChange} />
      </Card>

      {userId && user && (
        <MemberProfileCard
          name={user.name}
          email={user.email}
          membershipNumber={user.membershipNumber}
          userId={userId}
          summary={summary}
          totalPeriods={contributions.length}
        />
      )}

      {summary && <ContributionStatsPanel summary={summary} contributions={contributions} />}

      <PaymentSummaryBar
        selectedPeriods={selectedPeriods}
        selectedTotal={selectedTotal}
        summary={summary}
        isAdding={isRecordingContribution}
        onSubmit={onSubmit}
      />

      <div className="flex justify-end items-center">
        <Button
          disabled={genContribution.isPending || !userId}
          variant="outline"
          onClick={() => genContribution.mutate(userId)}
        >
          {genContribution.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate All Contributions Months
        </Button>
      </div>

      <DataTable data={contributions || []} columns={columns} />
      <DataTablePagination onPageChange={setPage} meta={meta} />
    </div>
  );
};
