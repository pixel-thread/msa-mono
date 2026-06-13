# Member CSV Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a CSV import page under `/members/import` with client-side preview and file upload to the existing backend endpoint.

**Architecture:** New TanStack Router route under the dashboard layout that delegates to a new page component. CSV is parsed client-side with papaparse for preview, then the raw file is sent as FormData to `POST /admin/users/import-csv`.

**Tech Stack:** Vite + React 19, TanStack Router, TanStack Query, papaparse, shadcn/ui components, Tailwind 4

---

### Task 1: Add import-csv endpoint constant to shared package

**Files:**

- Modify: `packages/shared/src/constants/endpoints/admin.ts`
- Modify: `packages/shared/src/constants/endpoints/index.ts` (already exports ADMIN)

- [ ] **Add `IMPORT_USERS_CSV` to the ADMIN constant**

Edit `packages/shared/src/constants/endpoints/admin.ts`:

```ts
export const ADMIN = {
  ASSOCIATIONS: '/admin/associations',
  ASSOCIATION_DETAILS: (id: string) => `/admin/associations/${id}`,
  ASSOCIATION_MEMBER: (id: string) => `/admin/associations/${id}/member`,
  MEMBERSHIP_APPLICATIONS: '/admin/membership-applications',
  MEMBERSHIP_APPLICATION_APPROVE: (id: string) => `/admin/membership-applications/${id}/approve`,
  MEMBERSHIP_APPLICATION_REJECT: (id: string) => `/admin/membership-applications/${id}/reject`,
  IMPORT_USERS_CSV: '/admin/users/import-csv',
} as const;
```

- [ ] **Verify the export chain**

Run: `ls packages/shared/src/constants/endpoints/index.ts`
Confirm ADMIN is imported from "./admin" and re-exported as `ENDPOINTS.ADMIN`.

- [ ] **Commit**

```bash
git add packages/shared/src/constants/endpoints/admin.ts
git commit -m "feat: add IMPORT_USERS_CSV endpoint constant"
```

---

### Task 2: Install papaparse

**Files:**

- Modify: `apps/web/package.json`

- [ ] **Install papaparse and its types**

```bash
pnpm add papaparse
pnpm add -D @types/papaparse
```

Run from the web app directory or monorepo root with `--filter=mfsa`.

- [ ] **Commit**

```bash
git add apps/web/package.json apps/web/pnpm-lock.yaml
git commit -m "feat: add papaparse dependency for CSV parsing"
```

---

### Task 3: Create `useCsvPreview` hook

**Files:**

- Create: `apps/web/src/features/members/hooks/useCsvPreview.ts`

This hook takes a `File`, parses it with papaparse, and returns the parsed rows as an array of record objects plus parsing metadata.

- [ ] **Write the hook**

Create `apps/web/src/features/members/hooks/useCsvPreview.ts`:

```ts
import { useState, useCallback } from 'react';
import Papa from 'papaparse';

interface CsvPreviewState {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  fileName: string;
  fileSize: number;
}

interface UseCsvPreviewReturn {
  preview: CsvPreviewState | null;
  parseFile: (file: File) => void;
  error: string | null;
  clear: () => void;
  isParsing: boolean;
}

export function useCsvPreview(): UseCsvPreviewReturn {
  const [preview, setPreview] = useState<CsvPreviewState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const parseFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv') && !file.type.includes('csv')) {
      setError('Please select a valid CSV file');
      return;
    }

    setIsParsing(true);
    setError(null);
    setPreview(null);

    Papa.parse<string[]>(file, {
      header: false,
      preview: 1,
      complete(results) {
        if (!results.data || results.data.length === 0) {
          setError('CSV file appears to be empty');
          setIsParsing(false);
          return;
        }
        const headers = results.data[0] as string[];

        Papa.parse<Record<string, string>>(file, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
          complete(parseResult) {
            const rows = parseResult.data.filter((row) =>
              Object.values(row).some((val) => val !== null && val !== ''),
            );

            setPreview({
              headers,
              rows,
              totalRows: rows.length,
              fileName: file.name,
              fileSize: file.size,
            });
            setIsParsing(false);
          },
          error(parseError) {
            setError(parseError.message || 'Failed to parse CSV file');
            setIsParsing(false);
          },
        });
      },
      error(err) {
        setError(err.message || 'Failed to read CSV file');
        setIsParsing(false);
      },
    });
  }, []);

  const clear = useCallback(() => {
    setPreview(null);
    setError(null);
    setIsParsing(false);
  }, []);

  return { preview, parseFile, error, clear, isParsing };
}
```

- [ ] **Commit**

```bash
git add apps/web/src/features/members/hooks/useCsvPreview.ts
git commit -m "feat: add useCsvPreview hook for client-side CSV parsing"
```

---

### Task 4: Create `useImportMembers` mutation hook

**Files:**

- Create: `apps/web/src/features/members/hooks/useImportMembers.ts`

This hook sends the CSV file to the backend as FormData and handles the response.

- [ ] **Write the mutation hook**

Create `apps/web/src/features/members/hooks/useImportMembers.ts`:

```ts
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface ImportResult {
  created: number;
  skipped: number;
  errors: Array<{ row: number; email: string; reason: string }>;
}

export function useImportMembers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return http.post<ImportResult>(ENDPOINTS.ADMIN.IMPORT_USERS_CSV, formData);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBERS_KEYS.ALL() });
        return;
      }
      toast.error(data.message);
    },
  });
}
```

- [ ] **Commit**

```bash
git add apps/web/src/features/members/hooks/useImportMembers.ts
git commit -m "feat: add useImportMembers mutation hook"
```

---

### Task 5: Create the member import page component

**Files:**

- Create: `apps/web/src/features/members/pages/member-import.tsx`

This is the main page with three steps: file selection, preview, and import confirmation.

- [ ] **Write the page component**

Create `apps/web/src/features/members/pages/member-import.tsx`:

```tsx
'use client';

import { useImportMembers } from '@src/features/members/hooks/useImportMembers';
import { useCsvPreview } from '@src/features/members/hooks/useCsvPreview';
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
import { SectionHeader } from '@src/shared/components/section-header';
import { useNavigate } from '@tanstack/react-router';
import { DownloadIcon, UploadIcon, AlertCircleIcon, CheckCircleIcon, XIcon } from 'lucide-react';
import { useRef } from 'react';

function generateTemplateCsv(): string {
  const headers = [
    'email',
    'name',
    'mobile',
    'designation',
    'dateOfJoiningGovt',
    'dateOfJoiningAssociation',
    'membershipNumber',
  ];
  const sampleRow = [
    'john@example.com',
    'John Doe',
    '9876543210',
    'Secretary',
    '2020-01-15',
    '2021-06-01',
    'MEM-001',
  ];
  return [headers.join(','), sampleRow.join(',')].join('\n');
}

export default function MemberImportPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { preview, parseFile, error: parseError, clear, isParsing } = useCsvPreview();
  const importMutation = useImportMembers();

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;
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
    if (!fileInputRef.current?.files?.[0]) return;
    importMutation.mutate(fileInputRef.current.files[0]);
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

  const importResult = importMutation.data?.data;

  if (importResult) {
    return (
      <>
        <SectionHeader title="Import Members" description="CSV import results" />

        <Card className="p-8 max-w-2xl mx-auto mt-8 text-center">
          <div className="flex justify-center mb-4">
            {importResult.created > 0 ? (
              <CheckCircleIcon className="h-12 w-12 text-green-500" />
            ) : (
              <AlertCircleIcon className="h-12 w-12 text-amber-500" />
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
            <UploadIcon className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-1">Drop your CSV file here</p>
            <p className="text-sm text-body mb-4">or click to browse</p>
            <Button variant="outline" type="button">
              Select CSV File
            </Button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <DownloadIcon className="h-4 w-4" />
              Download CSV template
            </button>
          </div>
        </Card>
      ) : (
        <div className="mt-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
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
                  <XIcon className="h-4 w-4 mr-1" />
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

            <div className="max-h-96 overflow-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    {preview.headers.map((header) => (
                      <TableHead key={header}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell className="text-muted-foreground">{rowIndex + 1}</TableCell>
                      {preview.headers.map((header) => (
                        <TableCell key={header}>{row[header] ?? ''}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {parseError && (
        <Card className="p-4 mt-4 border-destructive/50 bg-destructive/5">
          <p className="text-sm text-destructive flex items-center gap-2">
            <AlertCircleIcon className="h-4 w-4" />
            {parseError}
          </p>
        </Card>
      )}

      {importMutation.isError && (
        <Card className="p-4 mt-4 border-destructive/50 bg-destructive/5">
          <p className="text-sm text-destructive flex items-center gap-2">
            <AlertCircleIcon className="h-4 w-4" />
            {importMutation.error?.message || 'Import failed. Please try again.'}
          </p>
        </Card>
      )}
    </>
  );
}
```

- [ ] **Update barrel export**

Edit `apps/web/src/features/members/pages/index.ts`:

```ts
export { default as MembersPage } from './members';
export * from './member-detail';
export { default as MemberImportPage } from './member-import';
```

- [ ] **Commit**

```bash
git add apps/web/src/features/members/pages/member-import.tsx apps/web/src/features/members/pages/index.ts
git commit -m "feat: add member import page with CSV preview"
```

---

### Task 6: Create the import route file

**Files:**

- Create: `apps/web/src/routes/_dashboard/members/import/index.tsx`

- [ ] **Write the route file**

Create `apps/web/src/routes/_dashboard/members/import/index.tsx`:

```tsx
import { MemberImportPage } from '@src/features/members/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/members/import/')({
  component: MemberImportPage,
});
```

- [ ] **Verify route registration**

Run: `ls apps/web/src/routes/_dashboard/members/`
Confirm `import/` directory exists alongside `index.tsx`, `$memberId/`, and `applications/`.

- [ ] **Commit**

```bash
git add apps/web/src/routes/_dashboard/members/import/index.tsx
git commit -m "feat: add /members/import route"
```

---

### Task 7: Add "Import CSV" button to members list page

**Files:**

- Modify: `apps/web/src/features/members/pages/members.tsx`
- Modify: `apps/web/src/features/members/pages/index.ts`

- [ ] **Add import button to the SectionHeader children**

Edit `apps/web/src/features/members/pages/members.tsx` — add a button in the SectionHeader `children` prop:

```tsx
'use client';

import { useMembers } from '@src/features/members/hooks/useMembers';
import { useMemberTableActions } from '@src/features/members/hooks/useMemberTableActions';
import { useMemberTableColumns } from '@src/features/members/hooks/useMemberTableColumns';
import { Button } from '@src/shared/components/ui/button';
import { DataTable } from '@src/shared/components/data-table';
import { DataTableFilters } from '@src/shared/components/data-table-filters';
import { DataTablePagination } from '@src/shared/components/data-table-pagination';
import { SectionHeader } from '@src/shared/components/section-header';
import { useUrlFilters } from '@src/shared/hooks';
import { useNavigate } from '@tanstack/react-router';
import { UploadIcon } from 'lucide-react';

export default function MembersPage() {
  const navigate = useNavigate();
  const { page, setPage } = useUrlFilters({ basePath: '/members' });

  const { members, meta, isLoading } = useMembers({ page });
  const { onRoleChange, onStatusChange, onAssociationChange } = useMemberTableActions();
  const { columns } = useMemberTableColumns({
    onRoleChange,
    onStatusChange,
    onAssociationChange,
  });

  return (
    <>
      <SectionHeader title="Members" description="Manage and view all association members">
        <Button onClick={() => navigate({ to: '/members/import' })}>
          <UploadIcon className="h-4 w-4" />
          Import CSV
        </Button>
      </SectionHeader>

      <DataTableFilters
        fields={[
          {
            type: 'search',
            id: 'search',
            placeholder: 'Search members...',
          },
        ]}
        onFilterChange={() => {}}
      />

      <DataTable loading={isLoading} data={members} columns={columns} />

      <DataTablePagination meta={meta} onPageChange={setPage} label="members" />
    </>
  );
}
```

If `index.ts` already exports `MemberImportPage`, skip that edit.

- [ ] **Commit**

```bash
git add apps/web/src/features/members/pages/members.tsx
git commit -m "feat: add Import CSV button to members list page"
```

---

### Task 8: Verify the app builds

- [ ] **Run build to check for errors**

```bash
pnpm --filter mfsa run build
```

Expected: Build succeeds with no errors.

```bash
pnpm --filter mfsa run lint
```

Expected: Lint passes with no errors.

- [ ] **Commit if fixes needed**

```bash
git add -A
git commit -m "chore: fix build/lint issues"
```
