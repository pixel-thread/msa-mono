'use client';

import { useMemo, useState } from 'react';
import { DataTable } from '@src/shared/components/data-table';
import type { FilterField } from '@src/shared/components/data-table-filters';
import { DataTableFilters } from '@src/shared/components/data-table-filters';
import { DataTablePagination } from '@src/shared/components/data-table-pagination';
import { Button } from '@src/shared/components/ui/button';
import { Card } from '@src/shared/components/ui/card';
import type { PaginationMeta } from '@src/shared/types';
import type { ColumnDef } from '@tanstack/react-table';
import { AlertCircle, X } from 'lucide-react';

const PAGE_SIZE = 30;

const filterFields: FilterField[] = [
  { type: 'search', id: 'globalSearch', placeholder: 'Search all columns...' },
];

export type PreviewViewProps = {
  fileName: string;
  totalRows: number;
  fileSize: number;
  rows: Record<string, string>[];
  columns: ColumnDef<Record<string, string>>[];
  isPending: boolean;
  importError: string | null;
  onClear: () => void;
  onImport: () => void;
};

export function ImportPreviewView({
  fileName,
  totalRows,
  fileSize,
  rows,
  columns,
  isPending,
  importError,
  onClear,
  onImport,
}: PreviewViewProps) {
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);

  const importButtonText = isPending ? 'Importing...' : 'Import Members';
  const rowLabel = totalRows === 1 ? 'row' : 'rows';

  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    const query = searchText.toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some((value) => value.toLowerCase().includes(query)),
    );
  }, [rows, searchText]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  const paginationMeta: PaginationMeta = {
    page,
    pageSize: PAGE_SIZE,
    total: filteredRows.length,
    totalPages: Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE)),
    hasMore: page * PAGE_SIZE < filteredRows.length,
  };

  const handleFilterChange = (filters: Record<string, string | undefined>) => {
    setSearchText(filters.globalSearch ?? '');
    setPage(1);
  };

  return (
    <>
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{fileName}</p>
            <p className="text-xs text-body">
              {totalRows} {rowLabel} found
              {' · '}
              {(fileSize / 1024).toFixed(1)} KB
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClear} disabled={isPending}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
            <Button
              size="sm"
              onClick={onImport}
              disabled={isPending || totalRows === 0}
            >
              {importButtonText}
            </Button>
          </div>
        </div>

        <DataTableFilters fields={filterFields} onFilterChange={handleFilterChange} />
        <DataTable data={paginatedRows} columns={columns} />
        <DataTablePagination meta={paginationMeta} onPageChange={setPage} label="rows" />
      </div>

      {importError && (
        <Card className="p-4 mt-4 border-destructive/50 bg-destructive/5">
          <p className="text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {importError}
          </p>
        </Card>
      )}
    </>
  );
}
