'use client';

import { useMemo, useRef } from 'react';
import { useCsvPreview } from '@src/features/members/hooks/useCsvPreview';
import { useImportMembers } from '@src/features/members/hooks/useImportMembers';
import { DataTable } from '@src/shared/components/data-table';
import { SectionHeader } from '@src/shared/components/section-header';
import { Button } from '@src/shared/components/ui/button';
import { Card } from '@src/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@src/shared/components/ui/table';
import { useNavigate } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { AlertCircle, CheckCircle2, Download, Upload, X } from 'lucide-react';

function generateTemplateCsv(): string {
  const headers = [
    'email',
    'name',
    'mobile',
    'designation',
    'dateOfJoiningGovt',
    'dateOfJoiningAssociation',
    'dateOfRetirement',
  ];
  const sampleRow = [
    'john@example.com',
    'John Doe',
    '9876543210',
    'Secretary',
    '2020-06-01',
    '2021-06-01',
    '2022-06-01',
  ];
  return [headers.join(','), sampleRow.join(',')].join('\n');
}

export default function MemberImportPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);
  const { preview, parseFile, error: parseError, clear, isParsing } = useCsvPreview();
  const importMutation = useImportMembers();

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;
    fileRef.current = file;
    parseFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleImport = () => {
    if (!fileRef.current) return;
    importMutation.mutate(fileRef.current);
  };

  const handleDownloadTemplate = () => {
    const csv = generateTemplateCsv();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'member-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = useMemo<ColumnDef<Record<string, string>>[]>(() => {
    if (!preview) return [];
    return [
      {
        id: 'rowNumber',
        header: '#',
        cell: ({ row }) => <span className="text-muted-foreground">{row.index + 1}</span>,
        size: 60,
      },
      ...preview.headers.map((header) => ({
        id: header,
        header,
        accessorKey: header,
        cell: ({ getValue }: { getValue: () => unknown }) => (getValue() as string) ?? '',
      })),
    ];
  }, [preview]);

  const importResult = importMutation.data?.data;

  if (importResult) {
    return (
      <>
        <SectionHeader title="Import Members" description="CSV import results" />

        <Card className="p-8 max-w-2xl mx-auto mt-8 text-center">
          <div className="flex justify-center mb-4">
            {importResult.created > 0 ? (
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            ) : (
              <AlertCircle className="h-12 w-12 text-amber-500" />
            )}
          </div>

          <h2 className="text-xl font-semibold mb-2">Import Complete</h2>
          <p className="text-body mb-6">{importMutation.data?.message}</p>

          <div className="flex justify-center gap-8 mb-6">
            <div>
              <p className="text-2xl font-bold text-green-600">{importResult.created}</p>
              <p className="text-sm text-body">Imported</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{importResult.skipped}</p>
              <p className="text-sm text-body">Skipped</p>
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div className="text-left mb-6">
              <h3 className="font-medium mb-2">Errors</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importResult.errors.map((err, i) => (
                    <TableRow key={i}>
                      <TableCell>{err.row}</TableCell>
                      <TableCell>{err.email}</TableCell>
                      <TableCell className="text-destructive">{err.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Button onClick={() => navigate({ to: '/members' })}>Done</Button>
        </Card>
      </>
    );
  }

  return (
    <>
      <SectionHeader
        title="Import Members"
        description="Upload a CSV file to bulk import members"
      />

      {!preview ? (
        <Card className="p-8 max-w-2xl mx-auto mt-8">
          <div
            className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />
            {isParsing ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-sm text-body">Parsing CSV file...</p>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-1">Drop your CSV file here</p>
                <p className="text-sm text-body mb-4">or click to browse</p>
                <Button variant="outline" type="button">
                  Select CSV File
                </Button>
              </>
            )}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Download className="h-4 w-4" />
              Download CSV template
            </button>
          </div>
        </Card>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{preview.fileName}</p>
              <p className="text-xs text-body">
                {preview.totalRows} row{preview.totalRows !== 1 ? 's' : ''} found
                {' · '}
                {(preview.fileSize / 1024).toFixed(1)} KB
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                disabled={importMutation.isPending}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button
                size="sm"
                onClick={handleImport}
                disabled={importMutation.isPending || preview.totalRows === 0}
              >
                {importMutation.isPending ? 'Importing...' : 'Import Members'}
              </Button>
            </div>
          </div>

          <DataTable data={preview.rows} columns={columns} />
        </div>
      )}

      {parseError && (
        <Card className="p-4 mt-4 border-destructive/50 bg-destructive/5">
          <p className="text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {parseError}
          </p>
        </Card>
      )}

      {importMutation.isError && (
        <Card className="p-4 mt-4 border-destructive/50 bg-destructive/5">
          <p className="text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {importMutation.error?.message || 'Import failed. Please try again.'}
          </p>
        </Card>
      )}
    </>
  );
}
