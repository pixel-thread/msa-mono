# CSV User Import Design

**Status:** APPROVED
**Date:** 2026-06-13

## Overview

Admin endpoint to bulk-import users via CSV upload. Parses a CSV file, validates each row with Zod, skips duplicates, and bulk-creates users with `password: null` (forcing first-login password reset).

## Route

`POST /api/v1/admin/users/import-csv`

**Auth:** `auth` middleware (router-level) + `withRole(req, UserRole.SECRETARY)`

## Request

- **Content-Type:** `multipart/form-data`
- **Field name:** `file`
- **Format:** CSV with header row
- **Max size:** 10 MB

### CSV Columns

| Column                     | Required | Validation                         |
| -------------------------- | -------- | ---------------------------------- |
| `email`                    | ✅       | Valid email                        |
| `name`                     | ✅       | Min 1 character                    |
| `mobile`                   | ❌       | Indian mobile regex `^[6-9]\d{9}$` |
| `designation`              | ❌       | String                             |
| `dateOfJoiningGovt`        | ❌       | Coerced date                       |
| `dateOfJoiningAssociation` | ❌       | Coerced date                       |
| `membershipNumber`         | ❌       | String                             |

Default values for non-CSV columns: `role: ['MEMBER']`, `status: 'ACTIVE'`, `password: null`.

## Flow

1. **Multer** parses multipart upload via `createUploadMiddleware` with CSV MIME types (`text/csv`, `application/vnd.ms-excel`)
2. **Stream parse** the file buffer with `csv-parser`, collect all rows
3. **Validate every row** through `CsvUserImportRowSchema` (Zod) — collect errors per row
4. **Check existing emails** in DB for the user's association — mark matches as "skipped"
5. **Bulk create** remaining valid rows via `prisma.createMany()` with `password: null`
6. **Return summary response**

## Response

### Success (partial or full)

```json
{
  "success": true,
  "data": {
    "created": 45,
    "skipped": 3,
    "errors": [
      { "row": 3, "email": "bad@example.com", "reason": "Invalid email" },
      { "row": 7, "email": "existing@example.com", "reason": "Email already exists" }
    ]
  },
  "message": "Imported 45 users. 3 rows skipped.",
  "timestamp": "2026-06-13T..."
}
```

### All rows failed

HTTP 400 with the same error array structure.

## Files

| File                                       | Action                                     |
| ------------------------------------------ | ------------------------------------------ |
| `src/features/admin/routes/users.route.ts` | Create — full route handler                |
| `src/features/admin/routes/index.ts`       | Modify — register `POST /users/import-csv` |
| `package.json`                             | Modify — add `csv-parser` dependency       |

## Dependencies

- `csv-parser` ^3.0.0 — RFC-compliant CSV streaming parser
- `@types/csv-parser` — types (if needed, csv-parser includes types since 3.x)
