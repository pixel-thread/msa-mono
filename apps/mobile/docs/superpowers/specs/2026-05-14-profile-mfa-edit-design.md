# Profile MFA & Edit Profile Design Spec

**Date:** 2026-05-14
**Topic:** Profile MFA and Edit Profile Features

## Overview
Enhance the existing Profile tab by allowing users to enable/disable Multi-Factor Authentication (MFA) and edit their profile details (Name, Avatar, and Email).

## Architecture & Navigation
- **Profile Screen Updates:** 
  - Add an "Edit Profile" button directly below the user's name and email in the profile header on the `ProfileScreen`.
  - Add an "Enable MFA" (or "Disable MFA" depending on current state) button inside the existing Security accordion under the Preferences section.
- **New Screen:** Create a dedicated screen for profile editing at `src/features/profile/screens/edit-profile.screen.tsx`.
- **Routing:** Expose the new screen in the app router, likely at `src/app/(protected)/profile/edit.tsx` (or a similar path aligned with the app's routing structure).

## Components & Data Flow
- **EditProfileScreen:** 
  - A form interface allowing updates to Name, Email, and Avatar.
  - Avatar component will be interactive, allowing users to select a new image.
  - Form state and validation will be managed by `react-hook-form` paired with `zod`.
- **State Management:**
  - Upon successful form submission, the updated user details will be persisted to `src/shared/store/auth.store.ts` via the `setUser` action.
  - Toggling the MFA button will optimistically update the `mfaEnabled` status in the auth store and simulate an API call.

## Error Handling
- **Form Validation:** Inline error messages will be displayed under form fields (e.g., if the email format is invalid or the name is empty).
- **API Errors:** Simulated or real API failures (such as a network error or email already in use) will trigger a global toast notification.

## Testing Strategy
- Unit tests for the new `EditProfileScreen` to verify form validation and rendering.
- Tests to ensure the `useAuthStore` is correctly updated when the profile form is submitted.
- Tests for the "Enable MFA" button interaction in the `ProfileScreen` to confirm the state change.
