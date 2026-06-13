'use client';

import { Button } from '@src/shared/components/ui/button';
import { Card } from '@src/shared/components/ui/card';
import { DataTable } from '@src/shared/components/data-table';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

export type ResultViewProps = {
  created: number;
  skipped: number;
  errors: { row: number; email: string; reason: string }[];
  message?: string;
  errorColumns: ColumnDef<{ row: number; email: string; reason: string }>[];
  onDone: () => void;
};

export function ImportResultView({
  created,
  skipped,
  errors,
  message,
  errorColumns,
  onDone,
}: ResultViewProps) {
  const ResultIcon = created > 0 ? CheckCircle2 : AlertCircle;
  const resultIconColor = created > 0 ? 'text-green-500' : 'text-amber-500';

  return (
    <Card className="p-8 max-w-2xl mx-auto mt-8 text-center">
      <div className="flex justify-center mb-4">
        <ResultIcon className={`h-12 w-12 ${resultIconColor}`} />
      </div>

      <h2 className="text-xl font-semibold mb-2">Import Complete</h2>
      {message && <p className="text-body mb-6">{message}</p>}

      <div className="flex justify-center gap-8 mb-6">
        <div>
          <p className="text-2xl font-bold text-green-600">{created}</p>
          <p className="text-sm text-body">Imported</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-amber-600">{skipped}</p>
          <p className="text-sm text-body">Skipped</p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium mb-2 text-left">Errors</h3>
          <DataTable data={errors} columns={errorColumns} />
        </div>
      )}

      <Button onClick={onDone}>Done</Button>
    </Card>
  );
}
