# Design Spec: Profile Feature Refactor & Edit

**Version:** 1.0.0
**Status:** DRAFT
**Created:** 2026-05-10
**PRD Reference:** .agents/prd/core_prd.md (Webflow Inspired)

## 1. Overview
Refactor the monolithic profile screen into a modular feature-based structure within `src/features/profile`. Additionally, implement a "Edit Profile" feature using a separate screen and a validation-driven form.

## 2. Architecture

### 2.1 Directory Structure (`src/features/profile`)
- `screens/`: `profile.screen.tsx`, `edit-profile.screen.tsx`
- `components/`: `profile-header.tsx`, `profile-info-card.tsx`, `profile-menu-card.tsx`
- `hooks/`: `use-update-profile.hook.ts`
- `validators/`: `profile.validator.ts`
- `index.ts`: Public API for the feature.

### 2.2 UI Components
- **Button Integration**: Use the shadcn-style `Button` component for all primary actions.
  - Logout: `variant="destructive"`
  - Edit Profile: `variant="outline"`
  - Save Changes: `variant="default"`
- **TextInput**: Use the `TextInput` component for the edit form.

### 2.3 Data & State
- **Store**: Reads from and updates `useAuthStore` (Zustand).
- **Form**: `react-hook-form` with `zodResolver`.
- **API**: Mocked or implemented via `http` utility with `useMutation` (React Query).

## 3. Interfaces & Logic

### 3.1 Profile Schema
```typescript
import { z } from 'zod';

export const ProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

export type ProfileFormData = z.infer<typeof ProfileSchema>;
```

### 3.2 Navigation Paths
- View Profile: `/(protected)/(tabs)/profile` (Existing, but points to `ProfileScreen` in features)
- Edit Profile: `/(protected)/profile/edit` (New route)

## 4. Implementation Steps
1. Create validators and components in `src/features/profile`.
2. Implement `useUpdateProfile` hook.
3. Build `ProfileScreen` and `EditProfileScreen`.
4. Create the `/(protected)/profile/edit.tsx` route.
5. Update the entry point in `src/app/(protected)/(tabs)/profile/index.tsx`.
6. Verify integration and UI consistency.

## 5. Security & Accessibility
- **Auth**: Protected by the existing `(protected)` route group.
- **Validation**: Strict Zod schema for profile updates.
- **A11y**: Proper button roles and text input labels.
