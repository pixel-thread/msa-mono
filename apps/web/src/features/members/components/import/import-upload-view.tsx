'use client';

import { Button } from '@src/shared/components/ui/button';
import { Card } from '@src/shared/components/ui/card';
import { AlertCircle, Download, Upload } from 'lucide-react';
import type { RefObject } from 'react';

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

export type UploadViewProps = {
  isParsing: boolean;
  parseError: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileSelect: (file: File | undefined) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
};

export function ImportUploadView({
  isParsing,
  parseError,
  fileInputRef,
  onFileSelect,
  onDrop,
  onDragOver,
}: UploadViewProps) {
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

  let dropZoneContent;
  if (isParsing) {
    dropZoneContent = (
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-body">Parsing CSV file...</p>
      </div>
    );
  } else {
    dropZoneContent = (
      <>
        <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-1">Drop your CSV file here</p>
        <p className="text-sm text-body mb-4">or click to browse</p>
        <Button variant="outline" type="button">
          Select CSV File
        </Button>
      </>
    );
  }

  return (
    <>
      <Card className="p-8 max-w-2xl mx-auto mt-8">
        <div
          className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => onFileSelect(e.target.files?.[0])}
          />
          {dropZoneContent}
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

      {parseError && (
        <Card className="p-4 mt-4 border-destructive/50 bg-destructive/5">
          <p className="text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {parseError}
          </p>
        </Card>
      )}
    </>
  );
}
