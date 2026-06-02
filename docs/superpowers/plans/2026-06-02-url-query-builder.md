# URL Query Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a `buildUrlWithQuery` helper function in `@repo/shared` to build URLs with query parameters, supporting both Web and Expo environments.

**Architecture:** Use the standard `URL` and `URLSearchParams` APIs to handle URL parsing and query string building. Provide a robust way to handle both absolute and relative URLs by using a temporary base for relative paths.

**Tech Stack:** TypeScript, standard URL APIs.

---

### Task 1: Scaffolding and Setup

**Files:**
- Create: `packages/shared/src/utils/url.ts`
- Modify: `packages/shared/src/utils/index.ts`

- [ ] **Step 1: Create the URL utility file**
- [ ] **Step 2: Export the utility from the shared utils index**

```typescript
// packages/shared/src/utils/index.ts
export * from './url';
```

- [ ] **Step 3: Commit scaffolding**

```bash
git add packages/shared/src/utils/url.ts packages/shared/src/utils/index.ts
git commit -m "chore: scaffold url utility in shared package"
```

---

### Task 2: Implement buildUrlWithQuery

**Files:**
- Modify: `packages/shared/src/utils/url.ts`

- [ ] **Step 1: Implement the logic for buildUrlWithQuery**

```typescript
/**
 * Builds a URL with query parameters.
 * Handles both absolute and relative URLs.
 * Overwrites existing query parameters if they exist in the query object.
 * Filters out null or undefined values.
 */
export function buildUrlWithQuery(
  url: string,
  query: Record<string, string | number | boolean | null | undefined>
): string {
  const isAbsolute = url.startsWith('http://') || url.startsWith('https://');
  const dummyBase = 'http://localhost';
  const urlObj = new URL(url, isAbsolute ? undefined : dummyBase);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      urlObj.searchParams.set(key, String(value));
    }
  });

  if (isAbsolute) {
    return urlObj.toString();
  }

  // Return relative path + search + hash
  return urlObj.pathname + urlObj.search + urlObj.hash;
}
```

- [ ] **Step 2: Commit implementation**

```bash
git add packages/shared/src/utils/url.ts
git commit -m "feat: implement buildUrlWithQuery helper"
```

---

### Task 3: Test Verification (Manual/Integration)

**Files:**
- Create: `packages/shared/src/utils/__tests__/url.test.ts` (if possible) or verify in backend/web.

Since `packages/shared` doesn't have a test runner yet, we will verify by adding a test file and running it via `tsx` or within the backend's Jest environment.

- [ ] **Step 1: Create a test file for verification**

```typescript
import { buildUrlWithQuery } from '../url';

const tests = [
  {
    name: 'Simple absolute URL',
    url: 'https://example.com',
    query: { a: '1', b: '2' },
    expected: 'https://example.com/?a=1&b=2'
  },
  {
    name: 'URL with existing params (overwrite)',
    url: 'https://example.com?a=0',
    query: { a: '1', b: '2' },
    expected: 'https://example.com/?a=1&b=2'
  },
  {
    name: 'Relative URL',
    url: '/api/data',
    query: { x: 'y' },
    expected: '/api/data?x=y'
  },
  {
    name: 'Filtering null/undefined',
    url: '/api/data',
    query: { a: '1', b: null, c: undefined },
    expected: '/api/data?a=1'
  },
  {
    name: 'Special characters encoding',
    url: 'https://example.com',
    query: { 'q space': 'val&ue' },
    expected: 'https://example.com/?q+space=val%26ue'
  }
];

tests.forEach(t => {
  const result = buildUrlWithQuery(t.url, t.query);
  if (result === t.expected) {
    console.log(`✅ PASS: ${t.name}`);
  } else {
    console.error(`❌ FAIL: ${t.name}\n  Expected: ${t.expected}\n  Actual:   ${result}`);
    process.exit(1);
  }
});
```

- [ ] **Step 2: Run verification**

Run: `npx tsx packages/shared/src/utils/__tests__/url.test.ts`
Expected: All tests pass.

- [ ] **Step 3: Commit tests**

```bash
git add packages/shared/src/utils/__tests__/url.test.ts
git commit -m "test: add unit tests for buildUrlWithQuery"
```
