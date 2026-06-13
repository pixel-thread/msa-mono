# CSV User Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `POST /api/v1/admin/users/import-csv` endpoint that parses a CSV, validates rows with Zod, skips duplicates, and bulk-creates users with `password: null`.

**Architecture:** Single synchronous endpoint under the admin feature. Uses `csv-parser` (streaming) to parse uploaded CSV, validates all rows upfront with Zod before any DB writes, checks existing emails per association, then bulk-creates via Prisma `createMany`. Uses `createUploadMiddleware` from the existing file-upload middleware.

**Tech Stack:** Express 5, Prisma, Zod, csv-parser, multer

---

### File Structure

| File                                                  | Action | Responsibility                                                                    |
| ----------------------------------------------------- | ------ | --------------------------------------------------------------------------------- |
| `package.json`                                        | Modify | Add `csv-parser` dependency                                                       |
| `src/features/admin/routes/users.route.ts`            | Create | Route handler: parse CSV, validate, check duplicates, bulk create, return summary |
| `src/features/admin/routes/index.ts`                  | Modify | Import and register `POST /users/import-csv`                                      |
| `src/__tests__/routes/admin.users.import-csv.test.ts` | Create | Integration tests: success, validation errors, duplicates, no file, empty CSV     |

---

### Task 1: Add csv-parser dependency

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install csv-parser**

Run: `npm install csv-parser`

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add csv-parser dependency"
```

---

### Task 2: Create the route handler

**Files:**

- Create: `src/features/admin/routes/users.route.ts`

- [ ] **Step 1: Write the route handler**

```ts
import { BadRequestError } from '@errors';
import { createUploadMiddleware } from '@src/middleware/file-upload';
import { withRole } from '@utils/with-role';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { UserRole } from '@prisma/client';
import { prisma } from '@lib/prisma';
import { logger } from '@src/shared/logger';
import { z } from 'zod';
import csvParser from 'csv-parser';
import { Readable } from 'node:stream';
import type { Request, Response } from 'express';
import type { RequestHandler } from 'express';

const csvUpload = createUploadMiddleware({
  maxFileSizeMB: 10,
  allowedMimeTypes: ['text/csv', 'application/vnd.ms-excel'],
});

const CsvUserImportRowSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(1, 'Name is required'),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number')
    .optional()
    .nullable(),
  designation: z.string().optional().nullable(),
  dateOfJoiningGovt: z.coerce.date().optional().nullable(),
  dateOfJoiningAssociation: z.coerce.date().optional().nullable(),
  membershipNumber: z.string().optional().nullable(),
});

type CsvImportError = { row: number; email: string; reason: string };

export const importUsersCsv: RequestHandler[] = [
  csvUpload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    const traceId = (req.traceId as string) || '';
    const user = await withRole(req, UserRole.SECRETARY);

    const file = req.file;
    if (!file) throw new BadRequestError('CSV file is required');
    if (!file.size) throw new BadRequestError('CSV file is empty');

    logger.info(
      { traceId, size: file.size },
      'POST /api/v1/admin/users/import-csv - File received',
    );

    // Parse CSV rows using streaming parser
    const rows: Record<string, string>[] = [];
    await new Promise<void>((resolve, reject) => {
      Readable.from([file.buffer])
        .pipe(csvParser())
        .on('data', (row: Record<string, string>) => rows.push(row))
        .on('end', () => resolve())
        .on('error', () =>
          reject(new BadRequestError('Failed to parse CSV file. Check the file format.')),
        );
    });

    if (rows.length === 0) throw new BadRequestError('CSV file is empty');

    logger.info(
      { traceId, totalRows: rows.length },
      'POST /api/v1/admin/users/import-csv - CSV parsed',
    );

    // Validate every row with Zod, collecting all errors
    const errors: CsvImportError[] = [];
    const validRows: z.output<typeof CsvUserImportRowSchema>[] = [];

    for (const [index, row] of rows.entries()) {
      const result = CsvUserImportRowSchema.safeParse(row);
      if (!result.success) {
        errors.push({
          row: index + 2,
          email: row.email || '(missing)',
          reason: result.error.issues[0]?.message || 'Invalid row',
        });
      } else {
        validRows.push(result.data);
      }
    }

    // Check for existing emails in DB within the same association
    const existingEmails = await prisma.user.findMany({
      where: {
        associationId: user.associationId,
        email: { in: validRows.map((r) => r.email) },
      },
      select: { email: true },
    });
    const existingEmailSet = new Set(existingEmails.map((u) => u.email));

    const toCreate = validRows.filter((r) => {
      if (existingEmailSet.has(r.email)) {
        errors.push({
          row: rows.findIndex((raw) => raw.email === r.email) + 2,
          email: r.email,
          reason: 'Email already exists',
        });
        return false;
      }
      return true;
    });

    if (toCreate.length === 0) {
      throw new BadRequestError('No valid rows to import', { errors });
    }

    // Bulk create users with password=null (forces first-login reset)
    await prisma.user.createMany({
      data: toCreate.map((r) => ({
        associationId: user.associationId,
        email: r.email,
        name: r.name,
        mobile: r.mobile ?? null,
        designation: r.designation ?? null,
        dateOfJoiningGovt: r.dateOfJoiningGovt ?? null,
        dateOfJoiningAssociation: r.dateOfJoiningAssociation ?? null,
        membershipNumber: r.membershipNumber ?? null,
        role: ['MEMBER'],
        password: null,
        status: 'ACTIVE',
      })),
    });

    const created = toCreate.length;
    const skipped = errors.length;

    logger.info({ traceId, created, skipped }, 'POST /api/v1/admin/users/import-csv - Completed');

    return success(
      res,
      {
        data: { created, skipped, errors },
        message: `${created} user(s) imported. ${skipped} row(s) skipped.`,
      },
      201,
    );
  }),
];
```

- [ ] **Step 2: Check for lint issues**

Run: `npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/features/admin/routes/users.route.ts
git commit -m "feat: add CSV user import route handler"
```

---

### Task 3: Register the route in admin routes index

**Files:**

- Modify: `src/features/admin/routes/index.ts`

- [ ] **Step 1: Add the import and route registration**

Add import:

```ts
import { importUsersCsv } from './users.route';
```

Add route registration after the associations section (before membership-applications):

```ts
// ---------------------------------------------------------------------------
// Users — CSV import
// ---------------------------------------------------------------------------

router.post('/users/import-csv', importUsersCsv);
```

- [ ] **Step 2: Check for lint issues**

Run: `npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/features/admin/routes/index.ts
git commit -m "feat: register POST /users/import-csv route"
```

---

### Task 4: Write integration tests

**Files:**

- Create: `src/__tests__/routes/admin.users.import-csv.test.ts`

- [ ] **Step 1: Write the test file**

```ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import type { Express } from 'express';
import { createAssociation, createUser, cleanupByPrefix } from '../helpers/factories';
import { signAccessToken, getBearerHeader } from '../helpers/auth';
import { prisma } from '@lib';

const PREFIX = `csv-import-test-${Date.now()}`;

describe('POST /api/v1/admin/users/import-csv', () => {
  let app: Express;
  let association: { id: string };
  let adminUser: { id: string };
  let adminToken: string;

  beforeAll(async () => {
    const mod = await import('@src/index');
    app = mod.default;

    association = await createAssociation({ slug: `${PREFIX}-assoc` });
    adminUser = await createUser({
      email: `${PREFIX}-admin@test.com`,
      role: ['SECRETARY'],
      associationId: association.id,
    });
    adminToken = await signAccessToken(adminUser.id);
  });

  afterAll(async () => {
    await cleanupByPrefix(PREFIX);
  });

  it('should import users from a valid CSV', async () => {
    const csvContent = [
      'email,name,mobile,designation',
      `${PREFIX}-1@test.com,User One,9876543210,Engineer`,
      `${PREFIX}-2@test.com,User Two,9876543211,Manager`,
    ].join('\n');

    const res = await request(app)
      .post('/api/v1/admin/users/import-csv')
      .set(getBearerHeader(adminToken))
      .attach('file', Buffer.from(csvContent), 'users.csv');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.created).toBe(2);
    expect(res.body.data.skipped).toBe(0);
    expect(res.body.data.errors).toEqual([]);

    // Verify users were created in DB
    const users = await prisma.user.findMany({
      where: {
        associationId: association.id,
        email: { in: [`${PREFIX}-1@test.com`, `${PREFIX}-2@test.com`] },
      },
    });
    expect(users).toHaveLength(2);
    expect(users[0].password).toBeNull();
    expect(users[0].role).toEqual(['MEMBER']);
    expect(users[0].status).toBe('ACTIVE');
  });

  it('should skip duplicate emails and report them', async () => {
    // Create a user that already exists
    await createUser({
      email: `${PREFIX}-existing@test.com`,
      role: ['MEMBER'],
      associationId: association.id,
    });

    const csvContent = [
      'email,name,mobile',
      `${PREFIX}-existing@test.com,Already Existing,9876543210`,
      `${PREFIX}-new@test.com,New User,9876543211`,
    ].join('\n');

    const res = await request(app)
      .post('/api/v1/admin/users/import-csv')
      .set(getBearerHeader(adminToken))
      .attach('file', Buffer.from(csvContent), 'users.csv');

    expect(res.status).toBe(201);
    expect(res.body.data.created).toBe(1);
    expect(res.body.data.skipped).toBe(1);
    expect(res.body.data.errors[0].reason).toBe('Email already exists');
  });

  it('should reject invalid rows with validation errors', async () => {
    const csvContent = [
      'email,name,mobile',
      `not-an-email,User One,9876543210`,
      `${PREFIX}-valid@test.com,,9876543210`,
    ].join('\n');

    const res = await request(app)
      .post('/api/v1/admin/users/import-csv')
      .set(getBearerHeader(adminToken))
      .attach('file', Buffer.from(csvContent), 'users.csv');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when no file is attached', async () => {
    const res = await request(app)
      .post('/api/v1/admin/users/import-csv')
      .set(getBearerHeader(adminToken));

    expect(res.status).toBe(400);
  });

  it('should return 401 without auth token', async () => {
    const csvContent = ['email,name', `${PREFIX}-noauth@test.com,No Auth`].join('\n');

    const res = await request(app)
      .post('/api/v1/admin/users/import-csv')
      .attach('file', Buffer.from(csvContent), 'users.csv');

    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run tests**

Run: `npm test -- --testPathPattern="admin.users.import-csv"`

Expected: All 5 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/routes/admin.users.import-csv.test.ts
git commit -m "test: add CSV user import integration tests"
```

---
