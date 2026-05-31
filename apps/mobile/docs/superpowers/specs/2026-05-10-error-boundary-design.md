# Design Document: Specialized Error Boundaries

**Date:** 2026-05-10
**Status:** DRAFT
**PRD Reference:** N/A (Feature Request)
**Model Used:** Gemini CLI (Interactive)

## 1. Purpose
The goal is to provide a robust error handling mechanism for the React Native application using Expo Router. We need both a **Global** error boundary to catch catastrophic failures and a **Component-level** error boundary for localized failures, ensuring a better user experience and preventing the entire app from crashing due to a single component error.

## 2. Architecture
We will use a specialized composition-based approach for error boundaries. React Error Boundaries must be class components to utilize `getDerivedStateFromError` and `componentDidCatch`.

### 2.1. Base Implementation
- **`BaseErrorBoundary`**: A core class component that handles the logic of catching errors, logging them via the internal `logger`, and maintaining the `hasError` state. It will accept a `fallback` component or render function.

### 2.2. Specialized Components
- **`GlobalErrorBoundary`**: 
  - Wraps the entire application in `src/app/_layout.tsx`.
  - Uses the existing `ErrorScreen` (full-screen UI).
  - Recovery: Resets the entire boundary state and potentially clears caches (QueryClient).
- **`ErrorBoundary` (Component-level)**:
  - Used to wrap specific features or components (e.g., individual cards, list sections).
  - Fallback: A new `CompactError` component (inline banner).
  - Recovery: Localized "Try again" action.

## 3. Component Details

### 3.1. BaseErrorBoundary
- **State**: `{ hasError: boolean, error: Error | null }`
- **Methods**:
  - `getDerivedStateFromError(error)`: Updates state to trigger fallback UI.
  - `componentDidCatch(error, errorInfo)`: Logs the error using `logger.error`.
  - `resetError()`: Resets the state to `null` to allow re-rendering.

### 3.2. GlobalErrorBoundary
- **Props**: `children: React.ReactNode`
- **Implementation**: Wraps `BaseErrorBoundary` with `fallback={<ErrorScreen onRetry={resetError} />}`.
- **Location**: `src/shared/components/common/error-boundary/global-error-boundary.tsx`

### 3.3. ErrorBoundary (Component-level)
- **Props**: `children: React.ReactNode`, `errorMessage?: string`
- **Implementation**: Wraps `BaseErrorBoundary` with `fallback={<CompactError message={errorMessage} onRetry={resetError} />}`.
- **Location**: `src/shared/components/common/error-boundary/component-error-boundary.tsx`

### 3.4. CompactError Component
- **UI**: A small, styled container (red background/border) with an error icon, a short message, and a "Try again" button.
- **Location**: `src/shared/components/common/error-boundary/compact-error.component.tsx`

## 4. Directory Structure
```
src/shared/components/
├── common/
│   └── error-boundary/
│       ├── index.ts
│       ├── base-error-boundary.tsx
│       ├── global-error-boundary.tsx
│       ├── component-error-boundary.tsx
│       └── compact-error.component.tsx
└── screens/
    └── error-screen.tsx (Existing)
```

## 5. Integration Plan
1.  **Scaffold**: Create the new directory and files.
2.  **Base Class**: Implement `BaseErrorBoundary`.
3.  **Components**: Implement `CompactError`, `GlobalErrorBoundary`, and the standard `ErrorBoundary`.
4.  **Export**: Update `src/shared/components/common/error-boundary/index.ts` and potentially the main `src/shared/components/index.ts`.
5.  **Global Integration**: Wrap `RootLayout` in `src/app/_layout.tsx` with `GlobalErrorBoundary`.
6.  **Example Usage**: Wrap a feature component (e.g., `MeetingList`) with `ErrorBoundary` to demonstrate local failure handling.

## 6. Testing Strategy
- **Unit Tests**: Test `BaseErrorBoundary` by forcing a child component to throw an error and verifying the fallback is rendered and the logger is called.
- **Integration Tests**: Verify `GlobalErrorBoundary` catches errors in the root layout.
- **Manual Verification**: Create a "CrashTest" component that throws on render and place it inside both boundaries to see the visual results.
