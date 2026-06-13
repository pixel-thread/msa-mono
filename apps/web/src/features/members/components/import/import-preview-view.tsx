'use client';

import { DataTable } from '@src/shared/components/data-table';
import { Button } from '@src/shared/components/ui/button';
import { Card } from '@src/shared/components/ui/card';
import type { ColumnDef } from '@tanstack/react-table';
import { AlertCircle, X } from 'lucide-react';

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
  const importButtonText = isPending ? 'Importing...' : 'Import Members';
  const rowLabel = totalRows === 1 ? 'row' : 'rows';

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

        <DataTable data={rows} columns={columns} />
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
