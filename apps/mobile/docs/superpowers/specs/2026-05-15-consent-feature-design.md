# Consent Management System - Design Spec

**Date:** 2026-05-15
**Feature:** DPDP Act 2023 Compliant Consent Management System
**Platform:** React Native (Expo Router)

## Overview
The Consent Management System allows members to grant or withdraw consent for various purposes (Payments, Communications, Meetings, Analytics, Marketing). All changes are recorded as immutable receipts, compliant with the DPDP Act 2023. Admin (DPO) users have a dashboard to view consent metrics and an audit trail for the entire association.

## 1. Types & Enums (`src/features/consent/types/index.ts`)

```typescript
export enum ConsentPurpose {
  PAYMENTS = 'PAYMENTS',
  COMMUNICATIONS = 'COMMUNICATIONS',
  MEETINGS = 'MEETINGS',
  ANALYTICS = 'ANALYTICS',
  MARKETING = 'MARKETING',
}

export enum ConsentStatus {
  GRANTED = 'GRANTED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface ConsentReceipt {
  id: string;
  associationId: string;
  userId: string;
  purpose: ConsentPurpose;
  status: ConsentStatus;
  ipAddress?: string;
  userAgent?: string;
  channel: string; // e.g., 'web', 'mobile'
  metadata?: Record<string, any>;
  createdAt: string; // ISO string
}

export interface ConsentReport {
  [purpose: string]: {
    granted: number;
    withdrawn: number;
    rate: string; // e.g., '97.4%'
  };
}
```

## 2. API Services (`src/features/consent/services/index.ts`)

Axios-based API wrappers mapped to the backend endpoints:

- `fetchMyConsents()` -> `GET /api/consent/my`
- `grantConsent(purpose: ConsentPurpose)` -> `POST /api/consent/grant`
- `revokeConsent(purpose: ConsentPurpose)` -> `POST /api/consent/revoke`
- `fetchMyConsentHistory()` -> `GET /api/consent/history`
- `fetchAllConsents(filters)` -> `GET /api/consent/all` (Admin)
- `fetchConsentReport()` -> `GET /api/consent/report` (Admin)

## 3. Custom Hooks (`src/features/consent/hooks/index.ts`)

Using React Query for state management:

**Member Hooks:**
- `useMyConsents()`: Fetches the latest consent status for all purposes.
- `useConsentHistory()`: Fetches the chronological audit of the user's consent changes.
- `useUpdateConsent()`: A mutation hook that wraps both `grantConsent` and `revokeConsent` depending on the requested status. It will invalidate `useMyConsents` and `useConsentHistory` upon success.

**Admin Hooks:**
- `useAllConsents(filters)`: Fetches paginated consent receipts for the association.
- `useConsentReport()`: Fetches the consent rate aggregate report.

## 4. UI Components (`src/features/consent/components/`)

- `ConsentToggleCard`: A card component displaying the consent purpose, description, last updated date, and a toggle (Switch) to grant/revoke.
- `ConsentHistoryList`: A timeline or list view rendering the audit trail of consent changes for a user.
- `ConsentReportWidget`: A chart or stat-card widget for the DPO to view consent metrics.

## 5. Screens & Navigation

**Member Screens:**
- `src/app/(protected)/consent/index.tsx`: Main page to manage consent preferences using `ConsentToggleCard` components.
- `src/app/(protected)/consent/history.tsx`: Page displaying the `ConsentHistoryList` for the current user.

*Note: Navigation to these screens will be added to the Drawer or Profile menu.*

**Admin (DPO) Screens:**
- `src/app/(protected)/admin/consent/index.tsx`: The DPO Consent Dashboard showing the `ConsentReportWidget` and summary metrics.
- `src/app/(protected)/admin/consent/audit.tsx`: Full audit log page to search, filter, and view consent changes across the association.

## 6. Edge Cases & Considerations

- **Default State:** If a user has no prior record for a purpose, it is treated as implied/default based on association rules (typically GRANTED for core purposes like PAYMENTS, un-granted for MARKETING).
- **Error Handling:** If granting/revoking fails, the toggle must revert to its previous state (optimistic update rollback).
- **Compliance:** IP and User Agent will be collected on the backend from the request headers, so the frontend only needs to pass the `purpose`.
