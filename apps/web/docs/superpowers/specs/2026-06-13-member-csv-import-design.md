# Member CSV Import Design

**Status:** DRAFT
**Created:** 2026-06-13
**Last Updated:** 2026-06-13

## Purpose

Provide a frontend page under `/members/import` where admin users can upload a CSV of members, preview the parsed data with validation, and confirm the import to the existing backend endpoint `POST /admin/users/import-csv`.

## Scope

- Frontend only. The backend endpoint `POST /admin/users/import-csv` already exists.
- Client-side CSV parsing for instant preview (no round-trip for preview data).
- The actual import sends the original CSV file as `FormData` to the backend.

## Expected CSV Columns

The frontend parses and previews these columns (case-insensitive matching):

| Column (CSV header → mapped)                             | Type   | Required |
| -------------------------------------------------------- | ------ | -------- |
| `email` (Email)                                          | string | Yes      |
| `name` (Name)                                            | string | Yes      |
| `mobile` (Phone)                                         | string | No       |
| `designation` (Designation)                              | string | No       |
| `dateOfJoiningGovt` (Date of Joining Govt)               | date   | No       |
| `dateOfJoiningAssociation` (Date of Joining Association) | date   | No       |
| `dateOfRetirement` (Date of Retirement)                  | date   | No       |
| `dob` (Date of Birth)                                    | date   | No       |

The download template uses exact backend header names (`email`, `name`, `mobile`, etc.). The preview table displays friendly labels for better readability. The raw file is sent to the backend as-is — validation is server-side.

## Route

- **Path:** `/_dashboard/members/import/`
- **Route file:** `apps/web/src/routes/_dashboard/members/import/index.tsx`
- **Page component:** `apps/web/src/features/members/pages/member-import.tsx`
- **Navigation:** Accessed via "Import CSV" button in the header of the members list page

## UI Layout

Three-step flow on one page:

### Step 1: File Selection

- Drag-and-drop zone or file picker
- Accepts `.csv` files only
- "Download CSV template" link — generates a template with headers and one sample row
- Shows file name and size after selection

### Step 2: Preview Table

- Full data grid rendered with TanStack Table
- Columns match the parsed CSV headers
- Rows show all parsed data as strings
- Summary bar: "N rows found"
- Validation highlights: rows with missing required fields shown with a warning icon
- "Clear" button to reset and pick a different file

### Step 3: Import Action

- "Import Members" button (disabled if no rows parsed)
- Loading state during upload
- Success state: shows "X imported, Y skipped" with error detail list
- Error state: shows backend error message
- "Done" button navigates back to `/members`

## Data Flow

```
User selects CSV
      ↓
papaparse parses client-side (header: true, dynamicTyping: false)
      ↓
Parsed rows stored in component state
      ↓
Preview table renders all rows
      ↓
User clicks "Import Members"
      ↓
File sent as FormData to POST /admin/users/import-csv
      ↓
Backend returns { data: { created, skipped, errors } }
      ↓
Result summary displayed
```

## Files to Create

| File                                                      | Purpose                       |
| --------------------------------------------------------- | ----------------------------- |
| `apps/web/src/routes/_dashboard/members/import/index.tsx` | TanStack Router route file    |
| `apps/web/src/features/members/pages/member-import.tsx`   | Main page component           |
| `apps/web/src/features/members/hooks/useImportMembers.ts` | React Query mutation hook     |
| `apps/web/src/features/members/hooks/useCsvPreview.ts`    | CSV parsing + validation hook |

## Files to Modify

| File                                               | Change                                           |
| -------------------------------------------------- | ------------------------------------------------ |
| `apps/web/src/features/members/pages/index.ts`     | Add `member-import` export                       |
| `apps/web/src/features/members/pages/members.tsx`  | Add "Import CSV" button in SectionHeader chilren |
| `packages/shared/src/constants/endpoints/admin.ts` | Add `IMPORT_USERS_CSV` constant                  |

## Dependencies to Add

- `papaparse` — client-side CSV parsing (~10KB gzipped)

## Non-Goals

- No backend changes.
- No database schema changes.
- No editing of member data before import — validation is server-side.
