# Error Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a robust dual-layer Error Boundary system (Global and Component-level) using a shared BaseErrorBoundary class.

**Architecture:** A BaseErrorBoundary class handles error catching and logging. Specialized wrappers provide either a full-screen recovery UI (Global) or a compact inline recovery UI (Component-level).

**Tech Stack:** React (Class Components), React Native, Tailwind CSS (NativeWind), Ionicons.

---

### Task 1: BaseErrorBoundary Implementation

**Files:**

- Create: `src/shared/components/common/error-boundary/base-error-boundary.tsx`

- [ ] **Step 1: Write the BaseErrorBoundary implementation**

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@src/shared/utils/logger';

interface BaseErrorBoundaryProps {
  children: ReactNode;
  fallback: (props: { error: Error | null; resetError: () => void }) => ReactNode;
}

interface BaseErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class BaseErrorBoundary extends Component<BaseErrorBoundaryProps, BaseErrorBoundaryState> {
  constructor(props: BaseErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): BaseErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Error Boundary caught an error', {
      error,
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback({
        error: this.state.error,
        resetError: this.resetError,
      });
    }

    return this.props.children;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/components/common/error-boundary/base-error-boundary.tsx
git commit -m "feat(shared): add BaseErrorBoundary class component"
```

---

### Task 2: CompactError UI Component

**Files:**

- Create: `src/shared/components/common/error-boundary/compact-error.component.tsx`

- [ ] **Step 1: Implement the CompactError UI**

```tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CompactErrorProps {
  message?: string;
  onRetry: () => void;
}

export const CompactError = ({ message = 'Something went wrong', onRetry }: CompactErrorProps) => {
  return (
    <View className="my-2 rounded-lg border border-red-100 bg-red-50 p-4">
      <div className="flex-row items-center gap-x-3">
        <Ionicons name="alert-circle" size={20} color="#ef4444" />
        <View className="ml-2 flex-1">
          <Text className="text-sm font-medium text-red-800">{message}</Text>
          <TouchableOpacity onPress={onRetry} className="mt-1">
            <Text className="text-xs font-bold text-red-600 underline">Try again</Text>
          </TouchableOpacity>
        </View>
      </div>
    </View>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/components/common/error-boundary/compact-error.component.tsx
git commit -m "feat(shared): add CompactError UI component"
```

---

### Task 3: Specialized Wrappers Implementation

**Files:**

- Create: `src/shared/components/common/error-boundary/global-error-boundary.tsx`
- Create: `src/shared/components/common/error-boundary/component-error-boundary.tsx`
- Create: `src/shared/components/common/error-boundary/index.ts`

- [ ] **Step 1: Implement GlobalErrorBoundary**

```tsx
import React, { ReactNode } from 'react';
import { BaseErrorBoundary } from './base-error-boundary';
import { ErrorScreen } from '../../screens/error-screen';

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

export const GlobalErrorBoundary = ({ children }: GlobalErrorBoundaryProps) => {
  return (
    <BaseErrorBoundary
      fallback={({ resetError }) => (
        <ErrorScreen
          title="Critical Error"
          message="The application encountered an unexpected problem and needs to restart."
          onRetry={resetError}
          retryText="Restart App"
        />
      )}>
      {children}
    </BaseErrorBoundary>
  );
};
```

- [ ] **Step 2: Implement Component-level ErrorBoundary**

```tsx
import React, { ReactNode } from 'react';
import { BaseErrorBoundary } from './base-error-boundary';
import { CompactError } from './compact-error.component';

interface ErrorBoundaryProps {
  children: ReactNode;
  errorMessage?: string;
}

export const ErrorBoundary = ({ children, errorMessage }: ErrorBoundaryProps) => {
  return (
    <BaseErrorBoundary
      fallback={({ resetError }) => <CompactError message={errorMessage} onRetry={resetError} />}>
      {children}
    </BaseErrorBoundary>
  );
};
```

- [ ] **Step 3: Create index export file**

```tsx
export * from './global-error-boundary';
export * from './component-error-boundary';
```

- [ ] **Step 4: Commit**

```bash
git add src/shared/components/common/error-boundary/global-error-boundary.tsx \
        src/shared/components/common/error-boundary/component-error-boundary.tsx \
        src/shared/components/common/error-boundary/index.ts
git commit -m "feat(shared): add Global and Component-level ErrorBoundary wrappers"
```

---

### Task 4: Export to Main Component Index

**Files:**

- Modify: `src/shared/components/index.ts`

- [ ] **Step 1: Export ErrorBoundary components from main index**

```tsx
// ... existing exports
export { GlobalErrorBoundary, ErrorBoundary } from './common/error-boundary';
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/components/index.ts
git commit -m "feat(shared): export ErrorBoundary components from main index"
```

---

### Task 5: Root Layout Integration

**Files:**

- Modify: `src/app/_layout.tsx`

- [ ] **Step 1: Wrap root layout with GlobalErrorBoundary**

```tsx
import { GlobalErrorBoundary } from '@components/index';
// ... rest of imports

export default function RootLayout() {
  return (
    <GlobalErrorBoundary>
      <SafeAreaProvider>{/* ... rest of the layout */}</SafeAreaProvider>
    </GlobalErrorBoundary>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/_layout.tsx
git commit -m "feat(app): integrate GlobalErrorBoundary into root layout"
```

---

### Task 6: Verification

**Files:**

- Modify: `src/app/(protected)/(tabs)/index.tsx` (temporarily)

- [ ] **Step 1: Create a CrashTrigger component for testing**

```tsx
const CrashTrigger = () => {
  throw new Error('Test crash!');
  return null;
};
```

- [ ] **Step 2: Test Component-level Boundary**
      Wrap `CrashTrigger` with `ErrorBoundary` in a screen and verify `CompactError` shows.

- [ ] **Step 3: Test Global Boundary**
      Place `CrashTrigger` directly in `RootLayout` or outside any local boundary and verify `ErrorScreen` shows.

- [ ] **Step 4: Cleanup and Final Commit**
      Remove `CrashTrigger` and verify app works normally.

```bash
git commit -m "test: verify ErrorBoundary implementation"
```
