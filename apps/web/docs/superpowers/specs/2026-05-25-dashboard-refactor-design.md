# Design Spec: Dashboard Feature Refactor

**Status:** APPROVED
**Date:** 2026-05-25
**Feature:** Dashboard

## 1. Goal

Refactor the Dashboard page from the Next.js `app/` directory into a dedicated feature module in `src/features/dashboard/`. This aligns the dashboard with the project's architectural standards as defined in `GEMINI.md`.

## 2. Proposed Changes

### 2.1. Feature Page Component

- **Path:** `src/features/dashboard/pages/DashboardPage.tsx`
- **Responsibility:** Main presentation component for the dashboard.
- **Logic:**
  - Uses `useDashboard` hook for data fetching.
  - Renders `SectionHeader`, `StatsCards`, and various charts/tables.
  - Handles loading and error states.
- **Standards:**
  - Exported as a named component: `export function DashboardPage() { ... }`.
  - Includes JSDoc documentation.
  - Uses `@src/*` and `@feature/*` path aliases.

### 2.2. Feature Pages Index

- **Path:** `src/features/dashboard/pages/index.ts`
- **Responsibility:** Barrel export for the dashboard feature's pages.
- **Export:** `export * from './DashboardPage';`

### 2.3. App Router Wrapper

- **Path:** `src/app/(dashboard)/dashboard/page.tsx`
- **Responsibility:** Thin wrapper for the dashboard route.
- **Content:**

  ```tsx
  'use client';
  import { DashboardPage } from '@feature/dashboard/pages';

  export default function DashboardPageRoute() {
    return <DashboardPage />;
  }
  ```

## 3. Verification Plan

- **Build Check:** Ensure the project builds without errors.
- **Visual Verification:** Check that the dashboard renders correctly with all its components (Stats, Charts, Tables).
- **Error/Loading Check:** Verify that skeleton and error UI still work correctly.
