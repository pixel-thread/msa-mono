# CSV Import DataTable Pagination & Filter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add client-side pagination (30/page) and global search filter to the CSV import preview data table.

**Architecture:** Enhance the shared `DataTable` component with optional `pageSize` and `enableGlobalFilter` props. Internally use tanstack table's `getFilteredRowModel` and `getPaginationRowModel`. Enable both on the import preview view.

**Tech Stack:** Next.js, TypeScript, @tanstack/react-table v8, Tailwind CSS

---

### Task 1: Enhance DataTable with pagination + global filter

**Files:**

- Modify: `src/shared/components/data-table.tsx`

- [ ] **Step 1: Update imports**

Add `useState` from React, `Input` from shadcn, `Search` from lucide-react, `Pagination` UI components, and tanstack models:

```tsx
import { useState } from 'react';
import { Card } from '@components/ui/card';
import { Input } from '@src/shared/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@src/shared/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@src/shared/components/ui/table';
import { TableSkeleton } from '@src/shared/components/ui/table-skeleton';
import { Search } from 'lucide-react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
```

- [ ] **Step 2: Update DataTableProps type**

```tsx
type DataTableProps<TData> = {
  loading?: boolean;
  data: TData[];
  columns: ColumnDef<TData>[];
  meta?: Record<string, unknown>;
  pageSize?: number;
  enableGlobalFilter?: boolean;
};
```

- [ ] **Step 3: Update component signature and add internal state**

```tsx
export function DataTable<TData>({
  loading = false,
  data,
  columns,
  meta,
  pageSize = 0,
  enableGlobalFilter = false,
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState('');

  const paginationEnabled = pageSize > 0;
  const filterEnabled = enableGlobalFilter;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(paginationEnabled || filterEnabled ? { getFilteredRowModel: getFilteredRowModel() } : {}),
    ...(paginationEnabled ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    state: filterEnabled ? { globalFilter } : undefined,
    onGlobalFilterChange: filterEnabled ? setGlobalFilter : undefined,
    initialState: paginationEnabled ? { pagination: { pageSize } } : undefined,
    meta,
  });
```

- [ ] **Step 4: Add search input after Card opening, before table wrapper**

```tsx
{
  filterEnabled && (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search all columns..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="pl-9 h-10"
      />
    </div>
  );
}
```

- [ ] **Step 5: Add pagination controls after table wrapper, before Card closing**

```tsx
{
  paginationEnabled && (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-body">
        Showing{' '}
        <span className="font-medium text-body-strong">
          {table.getState().pagination.pageIndex * pageSize + 1}
        </span>{' '}
        to{' '}
        <span className="font-medium text-body-strong">
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * pageSize,
            table.getFilteredRowModel().rows.length,
          )}
        </span>{' '}
        of{' '}
        <span className="font-medium text-body-strong">
          {table.getFilteredRowModel().rows.length.toLocaleString()}
        </span>{' '}
        rows
      </p>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => table.previousPage()}
              className={
                !table.getCanPreviousPage() ? 'pointer-events-none opacity-50' : 'cursor-pointer'
              }
            />
          </PaginationItem>
          {Array.from({ length: table.getPageCount() }, (_, i) => i + 1)
            .filter((page) => {
              const current = table.getState().pagination.pageIndex + 1;
              const total = table.getPageCount();
              if (total <= 7) return true;
              if (page === 1 || page === total) return true;
              if (Math.abs(page - current) <= 1) return true;
              return false;
            })
            .map((page, idx, arr) => (
              <span key={page}>
                {idx > 0 && arr[idx - 1] !== page - 1 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink
                    onClick={() => table.setPageIndex(page - 1)}
                    isActive={table.getState().pagination.pageIndex + 1 === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              </span>
            ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => table.nextPage()}
              className={
                !table.getCanNextPage() ? 'pointer-events-none opacity-50' : 'cursor-pointer'
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
```

- [ ] **Step 6: Verify the build**

Run: `npx tsc --noEmit` (or `npm run typecheck`)
Expected: No type errors

---

### Task 2: Enable pagination + filter on ImportPreviewView

**Files:**

- Modify: `src/features/members/components/import/import-preview-view.tsx`

- [ ] **Step 1: Pass new props to DataTable**

Change line 62:

```tsx
<DataTable data={rows} columns={columns} pageSize={30} enableGlobalFilter />
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors
