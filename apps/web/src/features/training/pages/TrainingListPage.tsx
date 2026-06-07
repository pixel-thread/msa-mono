'use client';

import { useState } from 'react';
import { DataTable } from '@src/shared/components/data-table';
import { DataTableFilters } from '@src/shared/components/data-table-filters';
import { DataTablePagination } from '@src/shared/components/data-table-pagination';
import { SectionHeader } from '@src/shared/components/section-header';
import { Button } from '@src/shared/components/ui/button';
import { useUrlFilters } from '@src/shared/hooks';
import { useNavigate } from '@tanstack/react-router';
import { Award,Plus } from 'lucide-react';

import { CreateModuleDialog } from '../components';
import { useModuleTableColumns,useTrainingModules, useUpdateTrainingModule } from '../hooks';

export function TrainingListPage() {
  const navigate = useNavigate();

  const { page, setPage, setFilters } = useUrlFilters({
    basePath: '/training',
  });

  const [createOpen, setCreateOpen] = useState(false);

  const { modules: allModules, isLoading: isModulesLoading, meta } = useTrainingModules({ page });

  const { updateModule } = useUpdateTrainingModule();

  const { columns: moduleColumns } = useModuleTableColumns({
    onManage: (mod) => {
      navigate({ to: `/training/${mod.id}` });
    },
    onToggleActive: (mod) => {
      updateModule({
        moduleId: mod.id,
        data: { isActive: !mod.isActive },
      });
    },
  });

  return (
    <>
      <SectionHeader
        title="Training Modules"
        description="Manage training modules, assign them to members, and record scores."
      />

      <div className="flex items-center justify-between gap-4 mb-6">
        <DataTableFilters
          fields={[
            {
              type: 'search',
              id: 'search',
              placeholder: 'Search training modules...',
            },
          ]}
          onFilterChange={(f) => setFilters(f)}
        />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/training/completions' })}
            className="h-11 border-hairline px-4 text-sm font-semibold"
          >
            <Award className="mr-2 h-4 w-4" />
            Completions
          </Button>
          <Button
            onClick={() => setCreateOpen(true)}
            className="h-11 bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-active"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Module
          </Button>
        </div>
      </div>

      <DataTable loading={isModulesLoading} data={allModules} columns={moduleColumns} />

      <DataTablePagination meta={meta} onPageChange={setPage} />

      <CreateModuleDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
