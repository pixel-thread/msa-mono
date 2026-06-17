'use client';

import { DataTable } from '@src/shared/components/data-table';
import { DataTableFilters } from '@src/shared/components/data-table-filters';
import { DataTablePagination } from '@src/shared/components/data-table-pagination';
import { Button } from '@src/shared/components/ui/button';
import { useUrlFilters } from '@src/shared/hooks';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Award } from 'lucide-react';

import { useTrainingCompletions } from '../hooks/completions/use-training-completions';
import { useTrainingCompletionsColumns } from '../hooks/completions/use-training-completions-columns';
import { useTrainingModule } from '../hooks/use-training-modules';

export function TrainingCompletionsPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as Record<string, string | undefined>;
  const moduleId = params.id as string;
  const { page, setPage } = useUrlFilters({
    basePath: `/training/${moduleId}/completions`,
  });

  const { module: trainingModule, isLoading: isModuleLoading } = useTrainingModule(moduleId);

  const {
    completions,
    meta,
    isLoading: isCompletionsLoading,
  } = useTrainingCompletions(moduleId, { page });

  const { columns } = useTrainingCompletionsColumns();

  if (isModuleLoading) {
    return <div className="py-24 text-center text-body">Loading completion details...</div>;
  }

  if (!trainingModule) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-xl font-bold text-ink mb-2">Module Not Found</h2>
        <p className="text-body mb-6">
          The training module you are trying to access does not exist or has been removed.
        </p>
        <Button onClick={() => navigate({ to: '/training' })} className="">
          Back to Portal
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto pb-12 w-full h-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Completions</h1>
          <p className="text-sm text-muted-foreground">
            Users who completed{' '}
            <span className="font-semibold text-ink">{trainingModule.title}</span>
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="flex gap-4">
        <div className="bg-surface-card border border-hairline p-4 flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Award className="h-4 w-4" />
            Total Completions
          </div>
          <p className="text-2xl font-bold text-ink">{meta ? meta.total : completions.length}</p>
        </div>
      </div>

      {/* Completions table */}
      <DataTableFilters
        fields={[
          {
            type: 'search',
            id: 'search',
            placeholder: 'Search completions...',
          },
        ]}
        onFilterChange={() => {}}
      />

      <DataTable loading={isCompletionsLoading} data={completions} columns={columns} />

      <DataTablePagination meta={meta} onPageChange={setPage} label="completions" />
    </div>
  );
}
