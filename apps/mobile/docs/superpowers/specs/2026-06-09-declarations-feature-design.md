# Declarations Feature Design

**Date:** 2026-06-09
**Status:** Approved
**App:** Mobile (Expo SDK 54)

## Overview

Add a Declarations feature to the mobile app — accessible from the drawer navigation — with a list screen showing all declarations and a create screen for submitting new declarations.

## Feature Structure

```
src/features/contributions/
├── screens/
│   ├── declaration-list.screen.tsx
│   ├── create-declaration.screen.tsx
│   └── index.ts
├── components/
│   ├── declaration-card.tsx
│   ├── declaration-status-badge.tsx
│   └── index.ts
├── hooks/
│   ├── use-declarations.ts
│   ├── use-create-declaration.ts
│   └── index.ts
├── types/
│   ├── declaration.types.ts
│   └── index.ts
└── index.ts
```

## Navigation & Routing

- Route: `src/app/(protected)/declarations/index.tsx` → `DeclarationListScreen`
- Route: `src/app/(protected)/declarations/create.tsx` → `CreateDeclarationScreen`
- Drawer menu: add "Declarations" item under "Main Menu" in `drawerMenuGroups`, icon `document-text-outline`, href `/(protected)/declarations`

## Types

```ts
export type DeclarationStatus = 'PENDING' | 'APPROVE' | 'REJECT';

export interface DeclarationMember {
  name: string;
  email: string;
  mobile: string;
}

export interface Declaration {
  id: string;
  memberId: string;
  associationId: string;
  declerationStartDate: string;
  declerationEndDate: string;
  amount: string;
  status: DeclarationStatus;
  lastDeclarationDate: string | null;
  reviewBy: string | null;
  reviewAt: string | null;
  remark: string | null;
  member: DeclarationMember;
}
```

## Screens

### Declaration List Screen

- `useDeclarations()` hook → `{ data, isLoading, isError, refetch, isRefetching }`
- Loading → `<LoadingScreen message="Loading declarations..." />`
- Error → `<ErrorScreen>` with retry
- Content → `<Container>` + `<StackHeader title="Declarations" showBackButton />` with right "+" button
- `<FlashList>` with `<DeclarationCard>` items, `RefreshControl`, empty state
- Each card shows: amount, status badge, date range, member name, remark (if any)
- "+" button → `router.push('/(protected)/declarations/create')`

### Create Declaration Screen

- `<Container>` + `<StackHeader title="New Declaration" showBackButton />`
- Amount input (numeric) using `<FieldInput>`
- Submit button → `useCreateDeclaration().mutate({ amount })`
- On success → `router.back()` with toast and list auto-refresh

## Components

### DeclarationCard

- Card showing: amount (formatted), status badge, date range, member name + email, remark
- Pressable (future detail view)

### DeclarationStatusBadge

- Colored badge: PENDING (amber), APPROVE (green), REJECT (red)

## Hooks (stubbed, ready for real API)

### useDeclarations

- Query key: `QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATIONS()`
- Endpoint: `ENDPOINTS.CONTRIBUTION.DECLARATIONS`
- Returns `ApiResponse<Declaration[]>`

### useCreateDeclaration

- Mutation with `{ amount: number }`
- On success: invalidate declarations query, show toast

## Shared Package

Endpoints and query keys are already defined in `@repo/shared`:

- `ENDPOINTS.CONTRIBUTION.DECLARATIONS` → `/contributions/declarations`
- `ENDPOINTS.CONTRIBUTION.DECLARATION(id)` → `/contributions/declarations/${id}`
- `QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATIONS(page?, status?, search?)`
- `QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATION(id)`
