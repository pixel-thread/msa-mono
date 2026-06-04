'use client';
import { DataTable } from '@src/shared/components/data-table';
import { DataTablePagination } from '@src/shared/components/data-table-pagination';
import { MemberCombobox } from '@src/shared/components/members/member-combobox';
import { SectionHeader } from '@src/shared/components/section-header';
import http from '@src/shared/utils/http';
import { formattedAmount } from '@src/shared/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ContributionPeriod } from '../types';
import { useUserContributionColumns } from '../hooks/useUserContributionColumns';
import z from 'zod';
import { toast } from 'sonner';
import { Button } from '@src/shared/components/ui/button';
import { useUrlFilters } from '@hooks/use-url-filters';
import { Card, CardContent } from '@components/ui/card';
import { useUserContributions } from '../hooks';
import { Loader2 } from 'lucide-react';
import { ENDPOINTS } from '@repo/shared';

const AddMemberContributionSchema = z.object({
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

type AddMemberContributionInput = z.infer<typeof AddMemberContributionSchema>;

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

  const { contributions = [], meta, summary, refetch } = useUserContributions({ page, userId });

  const { mutate: addUserContribution, isPending: isAdding } = useMutation({
    mutationFn: (data: AddMemberContributionInput) =>
      http.post(ENDPOINTS.CONTRIBUTION.CREATE_PAYMENT, data),
  });

  const genContribution = useMutation({
    mutationFn: (id: string) => http.post(ENDPOINTS.CONTRIBUTION.USER(id), {}),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Contributions generated successfully');
        queryClient.invalidateQueries({ queryKey: ['all-contributions'] });
        refetch();
      }
    },
  });

  const onSubmit = () => {
    if (selectedPeriods.length === 0) {
      toast.error('Please select at least one contribution period');
      return;
    }

    addUserContribution(
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
      <SectionHeader title="Add Member Contributions" />
      <Card className="p-4">
        <MemberCombobox value={userId} onValueChange={onMemberChange} />
      </Card>

      {selectedPeriods.length > 0 && (
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Selected Periods</p>
                <p className="text-3xl font-bold tracking-tight">{selectedPeriods.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Due (All)</p>
                <p className="text-3xl font-bold tracking-tight text-destructive">
                  {formattedAmount(summary?.totalDue ?? 0)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Paying Today</p>
                <p className="text-3xl font-bold tracking-tight text-green-600">
                  {formattedAmount(selectedTotal)}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button size="lg" onClick={() => onSubmit()} disabled={isAdding}>
                {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Pay {formattedAmount(selectedTotal)}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
