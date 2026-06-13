'use client';

import { useMemo, useRef } from 'react';
import {
  ImportPreviewView,
  ImportResultView,
  ImportUploadView,
} from '@src/features/members/components/import';
import { useCsvPreview } from '@src/features/members/hooks/useCsvPreview';
import { useImportMembers } from '@src/features/members/hooks/useImportMembers';
import { SectionHeader } from '@src/shared/components/section-header';
import { useNavigate } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';

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

  const errorColumns = useMemo<ColumnDef<{ row: number; email: string; reason: string }>[]>(
    () => [
      { accessorKey: 'row', header: 'Row' },
      { accessorKey: 'email', header: 'Email' },
      {
        id: 'reason',
        header: 'Reason',
        accessorKey: 'reason',
        cell: ({ getValue }) => <span className="text-destructive">{getValue() as string}</span>,
      },
    ],
    [],
  );

  const importResult = importMutation.data?.data;

  if (importResult) {
    return (
      <>
        <SectionHeader title="Import Members" description="CSV import results" />
        <ImportResultView
          created={importResult.created}
          skipped={importResult.skipped}
          errors={importResult.errors}
          message={importMutation.data?.message}
          errorColumns={errorColumns}
          onDone={() => {
            if (importResult.errors.length > 0) {
              importMutation.reset();
            } else {
              navigate({ to: '/members' });
            }
          }}
        />
      </>
    );
  }

  if (!preview) {
    return (
      <>
        <SectionHeader
          title="Import Members"
          description="Upload a CSV file to bulk import members"
        />
        <ImportUploadView
          isParsing={isParsing}
          parseError={parseError}
          fileInputRef={fileInputRef}
          onFileSelect={handleFileSelect}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        />
      </>
    );
  }

  return (
    <>
      <SectionHeader
        title="Import Members"
        description="Upload a CSV file to bulk import members"
      />
      <ImportPreviewView
        fileName={preview.fileName}
        totalRows={preview.totalRows}
        fileSize={preview.fileSize}
        rows={preview.rows}
        columns={columns}
        isPending={importMutation.isPending}
        importError={importMutation.error?.message || null}
        onClear={clear}
        onImport={handleImport}
      />
    </>
  );
}
