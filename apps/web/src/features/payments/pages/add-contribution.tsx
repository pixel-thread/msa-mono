'use client';
import { DataTable } from '@src/shared/components/data-table';
import { DataTablePagination } from '@src/shared/components/data-table-pagination';
import { MemberCombobox } from '@src/shared/components/members/member-combobox';
import { SectionHeader } from '@src/shared/components/section-header';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ContributionPeriod } from '../types';
import { useUserContributionColumns } from '../hooks/useUserContributionColumns';
import { Controller, SubmitHandler } from 'react-hook-form';
import z from 'zod';
import { toast } from 'sonner';
import { Button } from '@src/shared/components/ui/button';
import { useUrlFilters } from '@hooks/use-url-filters';
import { Card, CardContent } from '@components/ui/card';
import { useUserContributions } from '../hooks';

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
  const [amountToBePaid, setAmountToBePaid] = useState<number>(0);
  const [userId, setUserId] = useState<string>('');

  const handleRowCheckChange = (data: ContributionPeriod) => {
    if (selectedPeriods.some((id) => id.id === data.id)) {
      setSelectedPeriods((prev) => prev.filter((id) => id.id !== data.id));
    } else {
      setSelectedPeriods((prev) => [...prev, data]);
    }
  };

  const { columns } = useUserContributionColumns({
    onCheck: (value) => handleRowCheckChange(value),
    checkValues: selectedPeriods,
  });

  const queryClient = useQueryClient();

  const { setPage, page } = useUrlFilters({
    basePath: '/payments/add-contribution',
  });

  const { contributions = [], meta, refetch } = useUserContributions({ page, userId: userId });

  const { mutate: addUserContribution } = useMutation({
    mutationFn: (data: AddMemberContributionInput) => http.post(`/contributions/payments`, data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Contributions added successfully');

        queryClient.invalidateQueries({ queryKey: ['all-contributions'] });
        return;
      }
      toast.error(data.message || 'Failed to add contributions');
    },
  });

  const genContribution = useMutation({
    mutationFn: () => http.post(`/payments/users/${userId}/contributions`, {}),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Contributions added successfully');
        queryClient.invalidateQueries({ queryKey: ['all-contributions'] });
        refetch();
        return;
      }
    },
  });

  const onSubmit: SubmitHandler<AddMemberContributionInput> = (data) => {
    if (selectedPeriods.length === 0) {
      toast.error('Please select at least one contribution period');
      return;
    }
    const amount = parseFloat(data.amount);

    const total = selectedPeriods.reduce((acc, period) => acc + parseInt(period.dueAmount, 10), 0);

    if (!total) toast.error('Total due amount not found');

    if (amount > total || amount < total) {
      toast.error('Amount is greater or less than total due amount');
      return;
    }
    const paylaod = {
      ...data,
      contributionPeriodIds: selectedPeriods.map((id) => id.id),
    };

    const isValidPayload = AddMemberContributionSchema.safeParse(paylaod);

    if (!isValidPayload.success) {
      toast.error(isValidPayload.error.message);
      return;
    }

    addUserContribution(
      {
        ...data,
        contributionPeriodIds: selectedPeriods.map((id) => id.id),
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success('Contributions added successfully');
            queryClient.invalidateQueries({ queryKey: ['all-contributions'] });
            genContribution.mutate();
            setSelectedPeriods([]);
            return;
          }
          toast.error(data.message || 'Failed to add contributions');
          return;
        },
      },
    );
    return;
  };

  return (
    <div className="space-y-2 flex-col flex ">
      <SectionHeader title="Add Member Contributions" />
      <Card>
        <CardContent>
          <MemberCombobox value={userId} onValueChange={(value) => setUserId(value)} />
          <div className="gap-4 my-4">
            <h1>
              <b>Contributions</b>
              <b> {selectedPeriods.length > 0 ? `(${selectedPeriods.length})` : ''}</b>
            </h1>
            <h1>
              <b>Total Due Amount:</b>{' '}
              {selectedPeriods.reduce((acc, period) => acc + parseInt(period.dueAmount, 10), 0)}
            </h1>
            <h1>
              <b>Total Amount To Pay:</b>{' '}
              {amountToBePaid ||
                selectedPeriods.reduce((acc, period) => acc + parseInt(period.dueAmount, 10), 0)}
            </h1>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end items-center">
        <Button
          disabled={genContribution.isPending || !userId}
          variant={'outline'}
          onClick={() => genContribution.mutate()}
        >
          Generate All Contributions Months
        </Button>
      </div>

      <DataTable data={contributions || []} columns={columns} />
      <DataTablePagination onPageChange={setPage} meta={meta} />
    </div>
  );
};
