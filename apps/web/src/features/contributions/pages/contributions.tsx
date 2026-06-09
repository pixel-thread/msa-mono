'use client';

import { useMemo, useState } from 'react';
import { useContributionPeriodColumns } from '@src/features/contributions/hooks/useContributionPeriodColumns';
import { useContributions } from '@src/features/contributions/hooks/useContributions';
import { DataTable } from '@src/shared/components/data-table';
import { DataTableFilters, type FilterField } from '@src/shared/components/data-table-filters';
import { DataTablePagination } from '@src/shared/components/data-table-pagination';
import { SectionHeader } from '@src/shared/components/section-header';
import { Button } from '@src/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/shared/components/ui/select';
import { useUrlFilters } from '@src/shared/hooks';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useGeneratePeriodicContribution } from '../hooks/useGeneratePeriodicContribution';

const filterFields: FilterField[] = [
  {
    type: 'select',
    id: 'status',
    label: 'Status',
    options: [
      { value: 'DUE', label: 'Due' },
      { value: 'PARTIAL', label: 'Partial' },
      { value: 'PAID', label: 'Paid' },
      { value: 'WAIVED', label: 'Waived' },
      { value: 'OVERDUE', label: 'Overdue' },
    ],
  },
  {
    type: 'select',
    id: 'year',
    label: 'Year',
    options: Array.from({ length: 6 }, (_, i) => {
      const y = 2026 - 5 + i;
      return { value: String(y), label: String(y) };
    }),
  },
];

export default function ContributionsPage() {
  const { filters, page, setPage, setFilters } = useUrlFilters({
    basePath: '/contributions',
  });

  const currentYear = new Date().getFullYear();

  const years = Array.from({ length: 6 }, (_, i) => currentYear - 5 + i);

  const [year, setYear] = useState(String(new Date().getFullYear()));

  const apiFilters = useMemo(() => {
    const result: Record<string, string | number | undefined> = { ...filters };
    if (filters.year) result.year = parseInt(filters.year, 10);
    if (filters.month) result.month = parseInt(filters.month, 10);
    return result;
  }, [filters]);

  const { contributions, meta, isLoading } = useContributions({
    page,
    ...apiFilters,
  });

  const { columns } = useContributionPeriodColumns();

  const { mutate: generateContributions, isPending: isGenerating } =
    useGeneratePeriodicContribution();

  const onGenerateContributions = () => {
    generateContributions(
      { year: parseInt(year, 10) },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success(data.message);
            return;
          }
          toast.error(data.message);
          return;
        },
      },
    );
  };

  return (
    <>
      <SectionHeader
        title="Contributions"
        description="Manage monthly contribution periods for all members"
      >
        <div className="flex flex-row gap-4">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button disabled={isGenerating} onClick={onGenerateContributions} className="h-10">
            <Plus className="mr-2 h-4 w-4" />
            Generate Contributions
          </Button>
        </div>
      </SectionHeader>

      <DataTableFilters fields={filterFields} onFilterChange={setFilters} />

      <DataTable columns={columns} data={contributions} loading={isLoading} />

      <DataTablePagination meta={meta} onPageChange={setPage} label="contributions" />
    </>
  );
}
