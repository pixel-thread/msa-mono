# Split Declarations from Contributions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the declarations feature from the contributions backend module into its own standalone feature, with updated API paths (`/api/v1/declarations`), new shared package exports (`ENDPOINTS.DECLARATION`, `QUERY_KEYS.DECLARATIONS_KEYS`), and updated web/mobile frontend hooks.

**Architecture:**

- Backend: New `src/features/declarations/` with its own router, services, validators — mounted at `/api/v1/declarations`
- Shared package: New `DECLARATION` endpoints and `DECLARATIONS_KEYS` query keys — independent from `CONTRIBUTION`
- Web frontend: Hooks under `features/contributions/hooks/declarations/` stay put but update to new endpoint/query-key references
- Mobile: Hooks update to new shared package references

**Tech Stack:** Express, Prisma, Zod, TanStack Query (web + mobile), TypeScript

---

### Task 1: Create Backend Declarations Feature — Files

**Files:**

- Create: `apps/backend/src/features/declarations/index.ts`
- Create: `apps/backend/src/features/declarations/routes/index.ts`
- Create: `apps/backend/src/features/declarations/routes/declarations.route.ts`
- Create: `apps/backend/src/features/declarations/services/declarations.service.ts`
- Create: `apps/backend/src/features/declarations/validators/declaration.ts`
- Create: `apps/backend/src/features/declarations/types/index.ts`

- [ ] **Step 1: Create `types/index.ts`**

```typescript
// This file is intentionally left empty — declaration-specific types
// are inferred from Prisma and Zod.
export {};
```

- [ ] **Step 2: Create `validators/declaration.ts`**

Copy from `apps/backend/src/features/contributions/validators/declaration.ts`:

```typescript
import { DeclarationStatus } from '@prisma/client';
import { pageNumberValidation } from '@validator';
import z from 'zod';

const remakeValidiation = z.string('Remark is required').min(3, 'Remark must atleast of 3 in char');

export const ApproveDeclarationSchema = z
  .object({
    remark: remakeValidiation,
  })
  .strict();

export type ApproveDeclarationInput = z.infer<typeof ApproveDeclarationSchema>;

export const RejectDeclarationSchema = ApproveDeclarationSchema;

export type RejectDeclarationInput = z.infer<typeof RejectDeclarationSchema>;

export const CreateUserDeclarations = z.object({
  amount: z
    .number('Amount is required')
    .int('Amount must be an integer')
    .min(1, 'Amount must be greater than 0')
    .max(10000, 'Amount must be less than 10000'),
});

export type CreateUserDeclarationsInput = z.infer<typeof CreateUserDeclarations>;

export const DeclarationParamsSchema = z.object({ id: z.string() });

const filterStatusEnum = [
  DeclarationStatus.PENDING,
  DeclarationStatus.APPROVED,
  DeclarationStatus.REJECTED,
  'ALL',
];
export const ListDeclarationsQuerySchema = z
  .object({
    page: pageNumberValidation,
    status: z.enum(filterStatusEnum).optional(),
  })
  .strict();

export type ListDeclarationsQueryInput = z.infer<typeof ListDeclarationsQuerySchema>;
```

- [ ] **Step 3: Create `services/declarations.service.ts`**

Copy from `apps/backend/src/features/contributions/services/declarations.service.ts`. Exact same content — no changes needed since it doesn't import anything from contributions.

```typescript
import { BadRequestError, NotFoundError } from '@errors';
import { prisma } from '@lib';
import type { Prisma } from '@prisma/client';
import { DeclarationStatus } from '@prisma/client';
import { buildPagination, buildPaginationParams } from '@utils';
import { addMonths, differenceInCalendarMonths, endOfMonth, startOfMonth } from 'date-fns';

type DbClient = Prisma.TransactionClient | typeof prisma;

type Props = {
  where: Prisma.DeclarationsWhereInput;
  include?: Prisma.DeclarationsInclude;
  page?: number;
};

export async function findDeclarations({
  where,
  include,
  page = 1,
  db = prisma,
}: Props & { db?: DbClient }) {
  const { skip, take } = buildPaginationParams(page);
  const declaration = await db.declarations.findMany({ where, include, take, skip });
  const total = await db.declarations.count({ where });
  const pagination = buildPagination(total, page);
  return { declaration, pagination };
}

type FindUniqueDeclarationsProps = {
  where: Prisma.DeclarationsWhereUniqueInput;
  include?: Prisma.DeclarationsInclude;
};

export async function findUniqueDeclaration(
  { where, include }: FindUniqueDeclarationsProps,
  db: DbClient = prisma,
) {
  return await db.declarations.findUnique({ where, include });
}

export async function submitDeclaration(
  memberId: string,
  associationId: string,
  amount: number,
  db: DbClient = prisma,
) {
  const lastDeclaration = await db.declarations.findFirst({
    where: { memberId, status: DeclarationStatus.APPROVED },
    orderBy: { lastDeclarationDate: 'desc' },
    take: 1,
  });

  const today = new Date();

  let startDate: Date;

  if (lastDeclaration) {
    const lastEndDate = new Date(lastDeclaration.declerationEndDate);
    const monthSinceLastDeclaration = differenceInCalendarMonths(today, lastEndDate);
    if (monthSinceLastDeclaration < 1) {
      throw new BadRequestError('You must wait at least 1 months between declarations.');
    }
    startDate = startOfMonth(addMonths(lastEndDate, 1));
  } else {
    startDate = startOfMonth(today);
  }

  const endDate = endOfMonth(today);

  return db.declarations.create({
    data: {
      memberId,
      associationId,
      declerationStartDate: startDate,
      declerationEndDate: endDate,
      amount,
      status: DeclarationStatus.PENDING,
    },
  });
}

export async function approveDeclaration(
  id: string,
  associationId: string,
  reviewBy: string,
  remark: string,
  db: DbClient = prisma,
) {
  const existing = await db.declarations.findUnique({
    where: { id, associationId },
  });

  if (!existing) throw new NotFoundError('Declaration not found');

  if (existing.status === DeclarationStatus.APPROVED) {
    return { declaration: existing, wasAlreadyApproved: true };
  }

  const updated = await db.declarations.update({
    where: { id, associationId },
    data: {
      status: DeclarationStatus.APPROVED,
      reviewBy,
      reviewAt: new Date(),
      remark,
      lastDeclarationDate: endOfMonth(new Date()),
    },
  });

  return { declaration: updated, wasAlreadyApproved: false };
}

export async function rejectDeclaration(
  id: string,
  associationId: string,
  reviewBy: string,
  remark: string,
  db: DbClient = prisma,
) {
  const existing = await db.declarations.findUnique({
    where: { id, associationId },
  });

  if (!existing) throw new NotFoundError('Declaration not found');

  if (existing.status === DeclarationStatus.APPROVED) {
    throw new BadRequestError('Cannot change approved declaration.');
  }

  if (existing.status === DeclarationStatus.REJECTED) {
    return { declaration: existing, wasAlreadyRejected: true };
  }

  const updated = await db.declarations.update({
    where: { id, associationId },
    data: {
      status: DeclarationStatus.REJECTED,
      reviewBy,
      reviewAt: new Date(),
      remark,
    },
  });

  return { declaration: updated, wasAlreadyRejected: false };
}
```

- [ ] **Step 4: Create `routes/declarations.route.ts`**

Copy from `apps/backend/src/features/contributions/routes/declarations.route.ts` BUT update the import paths to point to the new locations instead of `../services/declarations.service` and `../validators`:

```typescript
import { NotFoundError } from '@errors';
import { validate } from '@lib/validate';
import { AuditAction, DeclarationStatus, UserRole } from '@prisma/client';
import { logAction } from '@services/audit-logs';
import { hasHighRoleAccess } from '@utils';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';

import {
  approveDeclaration,
  findDeclarations,
  findUniqueDeclaration,
  rejectDeclaration,
  submitDeclaration,
} from '../services/declarations.service';
import type { CreateUserDeclarationsInput } from '../validators';
import {
  ApproveDeclarationSchema,
  CreateUserDeclarations,
  DeclarationParamsSchema,
  ListDeclarationsQuerySchema,
  RejectDeclarationSchema,
} from '../validators';

export const createUserDeclarationHandler: RequestHandler[] = [
  validate({ body: CreateUserDeclarations }),
  asyncHandler(async (req, res) => {
    const traceId = (req.traceId as string) || '';
    const associationId = req.user?.associationId;
    const user = await withRole(req, UserRole.MEMBER);

    const { amount } = req.body as CreateUserDeclarationsInput;

    const declear = await submitDeclaration(user.id, associationId || '', amount);

    await logAction({
      associationId: associationId || '',
      actorId: user.id,
      action: AuditAction.CREATE,
      resourceType: 'Declaration',
      resourceId: declear.id,
      newValues: {
        amount: req.body.amount,
        declerationStartDate: declear.declerationStartDate,
        declerationEndDate: declear.declerationEndDate,
      },
      traceId,
    });

    return success(res, {
      data: {
        id: declear.id,
        status: DeclarationStatus.PENDING,
        declerationStartDate: declear.declerationStartDate,
        declerationEndDate: declear.declerationEndDate,
        amount: declear.amount,
      },
      message: 'Declaration submitted successfully.',
    });
  }),
];

export const getDeclarationHandler: RequestHandler[] = [
  validate({ params: DeclarationParamsSchema }),
  asyncHandler(async (req, res) => {
    const associationId = req.user?.associationId;
    const declarationId = req.params.id as string;
    const user = await withRole(req, UserRole.MEMBER);

    const declarations = await findUniqueDeclaration({
      where: {
        id: declarationId,
        memberId: user.id,
        associationId: associationId,
      },
      include: {
        reviewer: { select: { name: true, email: true, mobile: true } },
        member: { select: { name: true, email: true, mobile: true } },
      },
    });

    return success(res, {
      data: declarations,
      message: 'Declarations successfully fetch.',
    });
  }),
];

export const listDeclarationsHandler: RequestHandler[] = [
  validate({ query: ListDeclarationsQuerySchema }),
  asyncHandler(async (req, res) => {
    const user = await withRole(req, UserRole.MEMBER);

    const page = req.query.page;
    const status = req.query.status;
    const associationId = req.user?.associationId;

    const where: Record<string, unknown> = { associationId: associationId };

    if (status) where.status = status;

    if (status === 'ALL') delete where.status;

    let result;

    if (hasHighRoleAccess(user.role)) {
      result = await findDeclarations({
        where,
        include: {
          member: { select: { name: true, email: true, mobile: true } },
        },
        page: parseInt(page as string),
      });
    } else {
      where.memberId = user.id;
      result = await findDeclarations({
        where,
        include: {
          member: { select: { name: true, email: true, mobile: true } },
        },
        page: parseInt(page as string),
      });
    }

    return success(res, {
      data: result.declaration,
      meta: result.pagination,
      message: 'Declarations successfully fetch.',
    });
  }),
];

export const approveDeclarationsHandler: RequestHandler[] = [
  validate({ params: DeclarationParamsSchema, body: ApproveDeclarationSchema }),
  asyncHandler(async (req, res) => {
    const declarationId = req.params.id as string;
    const associationId = req.user?.associationId;
    const userId = req.user?.id;

    if (!userId) {
      throw new NotFoundError('User not found');
    }

    await withRole(req, UserRole.FINANCE);

    const { declaration, wasAlreadyApproved } = await approveDeclaration(
      declarationId,
      associationId!,
      userId,
      req.body.remark,
    );

    if (!wasAlreadyApproved) {
      await logAction({
        associationId: associationId!,
        actorId: userId,
        action: AuditAction.UPDATE,
        resourceType: 'Declaration',
        resourceId: declarationId,
        newValues: { status: 'APPROVED', remark: req.body.remark },
        traceId: (req.traceId as string) || '',
      });
    }

    return success(res, {
      data: declaration,
      message: wasAlreadyApproved
        ? 'Declaration already approved.'
        : 'Declarations successfully approved and contribution periods generated.',
    });
  }),
];

export const rejectDeclarationsHandler: RequestHandler[] = [
  validate({ params: DeclarationParamsSchema, body: RejectDeclarationSchema }),
  asyncHandler(async (req, res) => {
    const declarationId = req.params.id as string;
    const associationId = req.user?.associationId;
    const userId = req.user?.id;

    if (!userId) {
      throw new NotFoundError('User not found');
    }

    await withRole(req, UserRole.FINANCE);

    const { declaration, wasAlreadyRejected } = await rejectDeclaration(
      declarationId,
      associationId!,
      userId,
      req.body.remark,
    );

    if (!wasAlreadyRejected) {
      await logAction({
        associationId: associationId!,
        actorId: userId,
        action: AuditAction.UPDATE,
        resourceType: 'Declaration',
        resourceId: declarationId,
        newValues: { status: 'REJECTED', remark: req.body.remark },
        traceId: (req.traceId as string) || '',
      });
    }

    return success(res, {
      data: declaration,
      message: wasAlreadyRejected
        ? 'Declaration already rejected.'
        : 'Declarations successfully rejected.',
    });
  }),
];
```

- [ ] **Step 5: Create `routes/index.ts`** — declarations router with auth middleware

```typescript
import { auth } from '@src/middleware';
import { Router } from 'express';

import {
  approveDeclarationsHandler,
  createUserDeclarationHandler,
  getDeclarationHandler,
  listDeclarationsHandler,
  rejectDeclarationsHandler,
} from './declarations.route';

const router: Router = Router();

router.use(auth);

router.post('/', createUserDeclarationHandler);
router.get('/:id', getDeclarationHandler);
router.get('/', listDeclarationsHandler);
router.post('/:id/approve', approveDeclarationsHandler);
router.post('/:id/reject', rejectDeclarationsHandler);

export default router;
```

- [ ] **Step 6: Create `index.ts`** — barrel export

```typescript
export * from './routes';
export * from './services';
export * from './types';
export * from './validators';
```

---

### Task 2: Remove Declarations from Backend Contributions Feature

**Files:**

- Modify: `apps/backend/src/features/contributions/routes/index.ts`
- Modify: `apps/backend/src/features/contributions/validators/index.ts`
- Delete: `apps/backend/src/features/contributions/routes/declarations.route.ts`
- Delete: `apps/backend/src/features/contributions/services/declarations.service.ts`
- Delete: `apps/backend/src/features/contributions/validators/declaration.ts`

- [ ] **Step 1: Remove declaration imports and routes from `routes/index.ts`**

Remove the `approveDeclarationsHandler`/etc. import block and the 5 route lines using them:

```
// Remove these imports:
import {
  approveDeclarationsHandler,
  createUserDeclarationHandler,
  getDeclarationHandler,
  listDeclarationsHandler,
  rejectDeclarationsHandler,
} from './declarations.route';

// Remove these routes:
router.post('/declarations', createUserDeclarationHandler);
router.get('/declarations/:id', getDeclarationHandler);
router.get('/declarations', listDeclarationsHandler);
router.post('/declarations/:id/approve', approveDeclarationsHandler);
router.post('/declarations/:id/reject', rejectDeclarationsHandler);
```

The resulting file should be:

```typescript
import { auth } from '@src/middleware';
import { Router } from 'express';

import { recordContributionHandler } from './contribution-payment.route';
import {
  generateContributionsHandler,
  generateUserContributionsHandler,
  getContributionHandler,
  listContributionsHandler,
  myContributionsHandler,
  waiveContributionHandler,
} from './contributions.route';
import { listUserContributionsHandler } from './user-contributions.route';

const router: Router = Router();

router.use(auth);

// Contributions
router.get('/', listContributionsHandler);
router.get('/my', myContributionsHandler);
router.post('/generate-periodic', generateContributionsHandler);
router.patch('/waive', waiveContributionHandler);
router.get('/:contributionId', getContributionHandler);

// User Contributions
router.get('/users/:userId', listUserContributionsHandler);
router.post('/users/:userId', generateUserContributionsHandler);

// ADMIN
router.post('/record', recordContributionHandler);

export default router;
```

- [ ] **Step 2: Remove declaration from validators `index.ts`**

Remove `export * from './declaration';` line.

- [ ] **Step 3: Delete the 3 declaration files from contributions**

```bash
rm apps/backend/src/features/contributions/routes/declarations.route.ts
rm apps/backend/src/features/contributions/services/declarations.service.ts
rm apps/backend/src/features/contributions/validators/declaration.ts
```

---

### Task 3: Register Declarations Router in Main App

**File:**

- Modify: `apps/backend/src/index.ts`

- [ ] **Step 1: Add import and mount in `apps/backend/src/index.ts`**

Add import (alphabetically after `cronRouter`):

```typescript
import declarationsRouter from '@feature/declarations/routes/index';
```

Add mount (alphabetically after `declarations`):

```typescript
app.use('/api/v1/declarations', declarationsRouter);
```

---

### Task 4: Create Shared Package — Declaration Endpoints & Query Keys

**Files:**

- Create: `packages/shared/src/constants/endpoints/declarations.ts`
- Create: `packages/shared/src/constants/query-keys/declarations.ts`
- Modify: `packages/shared/src/constants/endpoints/index.ts`
- Modify: `packages/shared/src/constants/endpoints/contributions.ts`
- Modify: `packages/shared/src/constants/query-keys/index.ts`
- Modify: `packages/shared/src/constants/query-keys/contributions.ts`

- [ ] **Step 1: Create `endpoints/declarations.ts`**

```typescript
export const DECLARATION = {
  LIST: '/declarations',
  DETAIL: (id: string) => `/declarations/${id}`,
  APPROVE: (id: string) => `/declarations/${id}/approve`,
  REJECT: (id: string) => `/declarations/${id}/reject`,
} as const;
```

- [ ] **Step 2: Create `query-keys/declarations.ts`**

```typescript
export const DECLARATIONS_KEYS = {
  LIST: (page?: number, status?: string, search?: string) =>
    ['declarations', page, status, search].filter(Boolean),
  DETAIL: (id: string) => ['declaration', id].filter(Boolean),
};
```

- [ ] **Step 3: Update `endpoints/contributions.ts`** — remove declaration entries

Remove these 4 lines:

```typescript
  DECLARATIONS: '/contributions/declarations',
  DECLARATION: (id: string) => `/contributions/declarations/${id}`,
  APPROVE_DECLARATION: (id: string) => `/contributions/declarations/${id}/approve`,
  REJECT_DECLARATION: (id: string) => `/contributions/declarations/${id}/reject`,
```

The file should look like:

```typescript
export const CONTRIBUTION = {
  LIST: '/contributions',
  MY: '/contributions/my',
  GENERATE: '/contributions/generate-periodic',
  WAIVE: '/contributions/waive',
  DETAIL: (id: string) => `/contributions/${id}`,

  USER: (userId: string) => `/contributions/users/${userId}`,

  RECORD_CONTRIBUTION: '/contributions/record',
} as const;
```

- [ ] **Step 4: Update `query-keys/contributions.ts`** — remove declaration entries

Remove these 2 lines:

```typescript
  DECLARATIONS: (page?: number, status?: string, search?: string) =>
    ['declarations', page, status, search].filter(Boolean),
  DECLARATION:  (id: string) => ['declaration', id].filter(Boolean),
```

- [ ] **Step 5: Update `endpoints/index.ts`** — add DECLARATION import and entry

Add import:

```typescript
import { DECLARATION } from './declarations';
```

Add to ENDPOINTS object (alphabetically, after `DASHBOARD`):

```typescript
  DECLARATION,
```

- [ ] **Step 6: Update `query-keys/index.ts`** — add DECLARATIONS_KEYS import and entry

Add import:

```typescript
import { DECLARATIONS_KEYS } from './declarations';
```

Add to QUERY_KEYS object (alphabetically, after `DASHBOARD_KEYS`):

```typescript
  DECLARATIONS_KEYS,
```

---

### Task 5: Update Web Frontend Hooks

**Files:**

- Modify: `apps/web/src/features/contributions/hooks/declarations/use-declarations.ts`
- Modify: `apps/web/src/features/contributions/hooks/declarations/use-declaration-detail.ts`
- Modify: `apps/web/src/features/contributions/hooks/declarations/use-declaration-mutations.ts`

- [ ] **Step 1: Update `use-declarations.ts`**

Change:

```typescript
const url = buildUrlWithQuery(ENDPOINTS.CONTRIBUTION.DECLARATIONS, {
```

To:

```typescript
const url = buildUrlWithQuery(ENDPOINTS.DECLARATION.LIST, {
```

Change:

```typescript
queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATIONS(page, status, search),
```

To:

```typescript
queryKey: QUERY_KEYS.DECLARATIONS_KEYS.LIST(page, status, search),
```

- [ ] **Step 2: Update `use-declaration-detail.ts`**

Change:

```typescript
queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATION(id),
queryFn: () => http.get<Declaration>(ENDPOINTS.CONTRIBUTION.DECLARATION(id)),
```

To:

```typescript
queryKey: QUERY_KEYS.DECLARATIONS_KEYS.DETAIL(id),
queryFn: () => http.get<Declaration>(ENDPOINTS.DECLARATION.DETAIL(id)),
```

- [ ] **Step 3: Update `use-declaration-mutations.ts`**

Change `useApproveDeclaration`:

```typescript
mutationFn: ({ id, remark }: { id: string; remark?: string }) =>
  http.post(ENDPOINTS.CONTRIBUTION.APPROVE_DECLARATION(id), { remark }),
onSuccess: () => {
  toast.success('Declaration approved successfully');
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATIONS() });
},
```

To:

```typescript
mutationFn: ({ id, remark }: { id: string; remark?: string }) =>
  http.post(ENDPOINTS.DECLARATION.APPROVE(id), { remark }),
onSuccess: () => {
  toast.success('Declaration approved successfully');
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DECLARATIONS_KEYS.LIST() });
},
```

Change `useRejectDeclaration`:

```typescript
mutationFn: ({ id, remark }: { id: string; remark?: string }) =>
  http.post(ENDPOINTS.CONTRIBUTION.REJECT_DECLARATION(id), { remark }),
onSuccess: () => {
  toast.success('Declaration rejected');
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATIONS() });
},
```

To:

```typescript
mutationFn: ({ id, remark }: { id: string; remark?: string }) =>
  http.post(ENDPOINTS.DECLARATION.REJECT(id), { remark }),
onSuccess: () => {
  toast.success('Declaration rejected');
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DECLARATIONS_KEYS.LIST() });
},
```

---

### Task 6: Update Mobile Frontend Hooks

**Files:**

- Modify: `apps/mobile/src/features/declaration/hooks/use-declarations.ts`
- Modify: `apps/mobile/src/features/declaration/hooks/use-create-declaration.ts`
- Modify: `apps/mobile/src/features/declaration/hooks/use-declaration.ts`

- [ ] **Step 1: Update `use-declarations.ts`**

Change:

```typescript
queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATIONS(1, status),
```

To:

```typescript
queryKey: QUERY_KEYS.DECLARATIONS_KEYS.LIST(1, status),
```

Change:

```typescript
buildUrlWithQuery(ENDPOINTS.CONTRIBUTION.DECLARATIONS, { page: pageParam, status });
```

To:

```typescript
buildUrlWithQuery(ENDPOINTS.DECLARATION.LIST, { page: pageParam, status });
```

- [ ] **Step 2: Update `use-create-declaration.ts`**

Change:

```typescript
mutationFn: (data: { amount: number }) => http.post(ENDPOINTS.CONTRIBUTION.DECLARATIONS, data),
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATIONS() });
},
```

To:

```typescript
mutationFn: (data: { amount: number }) => http.post(ENDPOINTS.DECLARATION.LIST, data),
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DECLARATIONS_KEYS.LIST() });
},
```

- [ ] **Step 3: Update `use-declaration.ts`**

Change:

```typescript
queryFn: () => http.get<Declaration>(ENDPOINTS.CONTRIBUTION.DECLARATION(id)),
queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATION(id),
```

To:

```typescript
queryFn: () => http.get<Declaration>(ENDPOINTS.DECLARATION.DETAIL(id)),
queryKey: QUERY_KEYS.DECLARATIONS_KEYS.DETAIL(id),
```
