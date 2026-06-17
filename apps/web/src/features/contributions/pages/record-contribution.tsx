'use client';
import { useMemo, useState } from 'react';
import { Card } from '@components/ui/card';
import { useUrlFilters } from '@hooks/use-url-filters';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import { DataTable } from '@src/shared/components/data-table';
import { DataTablePagination } from '@src/shared/components/data-table-pagination';
import { MemberCombobox } from '@src/shared/components/members/member-combobox';
import { SectionHeader } from '@src/shared/components/section-header';
import { Button } from '@src/shared/components/ui/button';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { ContributionStatsPanel } from '../components/contribution-stats-panel';
import { PaymentSummaryBar } from '../components/payment-summary-bar';
import { useUserContributions } from '../hooks';
import { useUserContributionColumns } from '../hooks/use-user-contribution-columns';
import { ContributionPeriod } from '../types';

export const RecordContributionPage = () => {
  const routeApi = getRouteApi('/_dashboard/contributions/record/');
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const memberId = search.member || '';
  const [selectedPeriods, setSelectedPeriods] = useState<ContributionPeriod[]>([]);
  const [userId, setUserId] = useState<string>(memberId);
  const [paidAt, setPaidAt] = useState<Date>(new Date());

  const selectedTotal = useMemo(
    () => selectedPeriods.reduce((acc, period) => acc + parseInt(period.dueAmount, 10), 0),
    [selectedPeriods],
  );

  const handleRowCheckChange = (data: ContributionPeriod[]) => {
    if (data.length > selectedPeriods.length) {
      const furthestAdded = data
        .filter((d) => !selectedPeriods.some((s) => s.id === d.id))
        .sort((a, b) => b.year - a.year || b.month - a.month)[0];

      const newSelection = sortedUnpaidContributions.filter(
        (pm) =>
          pm.year < furthestAdded.year ||
          (pm.year === furthestAdded.year && pm.month <= furthestAdded.month),
      );
      setSelectedPeriods(newSelection);
    } else if (data.length < selectedPeriods.length) {
      const removedIds = selectedPeriods
        .filter((s) => !data.some((d) => d.id === s.id))
        .map((s) => s.id);

      const earliestRemoved = selectedPeriods
        .filter((s) => removedIds.includes(s.id))
        .sort((a, b) => a.year - b.year || a.month - b.month)[0];

      const newSelection = selectedPeriods.filter(
        (sp) =>
          sp.year < earliestRemoved.year ||
          (sp.year === earliestRemoved.year && sp.month < earliestRemoved.month),
      );
      setSelectedPeriods(newSelection);
    }
  };

  const { columns } = useUserContributionColumns({
    onCheck: (value) => handleRowCheckChange(value),
    checkValues: selectedPeriods,
  });

  const queryClient = useQueryClient();

  const { setPage, page } = useUrlFilters({
    basePath: '/contributions/record',
  });

  const { contributions = [], meta, summary, refetch } = useUserContributions({ page, userId });

  const sortedUnpaidContributions = contributions
    .filter((c) => c.status !== 'PAID' && c.status !== 'WAIVED')
    .sort((a, b) => a.year - b.year || a.month - b.month);

  const genContribution = useMutation({
    mutationFn: (id: string) => http.post(ENDPOINTS.CONTRIBUTION.USER(id), {}),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.ALL() });
        refetch();
        return;
      }
      toast.error(res.message || 'Failed to generate contributions');
      return;
    },
  });

  const handleRecordingSuccess = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.ALL() });
    genContribution.mutate(userId);
    setSelectedPeriods([]);
  };

  function onMemberChange(value: string) {
    navigate({
      to: '.',
      search: {
        member: value,
        page: page,
      },
    });
    setSelectedPeriods([]);
    setUserId(value);
  }

  return (
    <div className="space-y-6 flex-col flex">
      <SectionHeader title="Record Contributions" description="Record contributions for a member" />
      <Card className="p-4">
        <MemberCombobox value={userId} onValueChange={onMemberChange} />
      </Card>

      {summary && <ContributionStatsPanel summary={summary} contributions={contributions} />}

      <PaymentSummaryBar
        selectedPeriods={selectedPeriods}
        selectedTotal={selectedTotal}
        summary={summary}
        paidAt={paidAt}
        onPaidAtChange={(date) => date && setPaidAt(date)}
        userId={userId}
        onRecordingSuccess={handleRecordingSuccess}
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
