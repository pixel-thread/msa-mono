# CSV Import DataTable Pagination & Filter Design

**Date:** 2026-06-16
**Status:** Approved

## Problem

The CSV import preview view renders all parsed rows in a single table with no pagination or search, making it unusable for large files.

## Solution

Enhance the shared `DataTable` component with optional client-side pagination and global filtering, then enable both on the import preview view.

## Changes

### 1. `DataTable` — New Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pageSize` | `number` | `10` | Rows per page when > 0. Enables `getPaginationRowModel` from tanstack table. |
| `enableGlobalFilter` | `boolean` | `false` | Shows a search input that filters all visible columns. Enables `getFilteredRowModel`. |

When `pageSize` or `enableGlobalFilter` is enabled, the component internally adds:
- `getFilteredRowModel()` (for global filter)
- `getPaginationRowModel()` (for pagination)

Pipeline order: `getCoreRowModel` → `getFilteredRowModel` → `getPaginationRowModel`

### 2. `DataTable` — New UI Elements

**Global filter input:** A search input with `Search` icon rendered above the table when `enableGlobalFilter` is true. Uses tanstack's `globalFilter` state and `onGlobalFilterChange`.

**Pagination controls:** Rendered below the table when `pageSize > 0`. Uses the existing `Pagination` UI components (`Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationNext`, `PaginationPrevious`, `PaginationEllipsis`). Shows "Showing X to Y of Z rows" label.

### 3. `ImportPreviewView`

Pass `pageSize={30}` and `enableGlobalFilter={true}` to `<DataTable>`. No other changes needed.

## Non-Breaking

Existing consumers see zero change — both new props default to their current behavior (`pageSize=10` is only used when explicitly set, but actually `10` is the default even today... wait).

Actually, the current behavior shows ALL rows with no pagination. So the default needs to be `pageSize=0` which means "no pagination". Let me clarify:

- `pageSize` default should be `undefined` or `0` to mean "no pagination" (current behavior)
- When set to a number > 0, pagination is enabled

So: if `pageSize > 0`, enable pagination and use `pageSize` as the page size.

Wait, but `PAGE_SIZE` is already imported. Maybe I should default to `PAGE_SIZE`? No — the current behavior has no pagination at all, so the default must preserve that.

The default for `pageSize` will be `0` (falsy → no pagination). When explicitly passed a value > 0, pagination is enabled.

## File Changes

| File | Change |
|------|--------|
| `src/shared/components/data-table.tsx` | Add new props, models, and UI |
| `src/features/members/components/import/import-preview-view.tsx` | Pass `pageSize={30} enableGlobalFilter={true}` |

## Test Plan

1. Open CSV import with a file containing >30 rows — verify pagination shows 30 per page
2. Use global search — verify rows filter, page resets to 1
3. Navigate pages — verify correct slice of data
4. Verify existing DataTable users are unaffected
