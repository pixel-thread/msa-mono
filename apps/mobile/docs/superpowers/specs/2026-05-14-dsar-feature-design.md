# Design Spec: Data Subject Access Request (DSAR) Feature

**Status:** DRAFT
**Author:** Gemini CLI
**Date:** 2026-05-14
**PRD Reference:** DSAR API Documentation
**Tech Stack:** React Native (Expo), TanStack Query, React Hook Form, Zod, Tailwind CSS (NativeWind)

## 1. Overview
Implementation of the Data Subject Access Request (DSAR) feature to allow members to request their data and administrators (DPOs) to manage these requests within the 21-day legal SLA.

## 2. Architecture (SOLID)
Following the project's modular feature pattern, all DSAR-related logic will reside in `src/features/dsar`.

### Directory Structure
```
src/features/dsar/
├── components/          # Focused UI components
├── hooks/               # React Query hooks for API interaction
├── screens/             # Feature-specific screen implementations
├── services/            # API service layer (dsar.service.ts)
├── types/               # TypeScript interfaces and enums
├── utils/               # SLA calculations and formatting
├── validators/          # Zod schemas for form validation
└── index.ts             # Public feature API
```

## 3. Data Flow
- **Fetching:** `useQuery` via TanStack Query for list and report data.
- **Mutations:** `useMutation` for submitting, responding, and assigning tickets.
- **Forms:** `react-hook-form` with `zod` for request submission and admin responses.
- **Validation:** Enforce mandatory selection of at least one data category.

## 4. UI/UX Design

### Member Experience
- **Entry Point:** "Privacy" section in Profile.
- **Request List:** View status and human-readable ticket numbers.
- **Submit Form:** Checkbox list of data categories (`PROFILE_DATA`, `PAYMENT_HISTORY`, etc.) and a description field.

### Admin Experience (DPO+)
- **Dashboard:** Unified view of all requests.
- **Priority Sorting:** Requests sorted by `responseDeadline` (21 days from creation).
- **SLA Visuals:** 
  - 🔴 **Breached:** Past 21 days.
  - 🟠 **At Risk:** 15-21 days elapsed.
  - 🟢 **On Track:** < 15 days elapsed.
- **Response Flow:** Update status, add notes, and link to secure storage keys.

## 5. Security & RBAC
- **Member Scoping:** Authenticated users can only see their own requests (`/api/dsar/my`).
- **Admin Scoping:** Access to association-wide requests restricted to `DPO`, `SECRETARY`, `PRESIDENT`, `SUPER_ADMIN`.
- **Validation:** All inputs sanitized via Zod before API submission.

## 6. Testing Strategy
- **Unit Tests:** Service methods and SLA calculation logic.
- **Component Tests:** Form validation and status badge rendering.
- **Integration Tests:** Mocking API responses for list and submission flows.
