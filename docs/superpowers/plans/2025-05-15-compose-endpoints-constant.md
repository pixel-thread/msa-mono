# Compose Main ENDPOINTS Constant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize all endpoint constants into a single `ENDPOINTS` object for easier access.

**Architecture:** Instead of re-exporting everything from individual files, we will import the specific objects and wrap them in a consolidated `ENDPOINTS` constant.

**Tech Stack:** TypeScript

---

### Task 1: Modify Endpoints Index

**Files:**
- Modify: `packages/shared/src/constants/endpoints/index.ts`

- [ ] **Step 1: Update index.ts with centralized ENDPOINTS object**

```typescript
import { AUTH } from './auth';
import { USER } from './user';
import { ADMIN } from './admin';
import { ANNOUNCEMENTS } from './announcements';
import { HEALTH } from './health';

export const ENDPOINTS = {
  AUTH,
  USER,
  ADMIN,
  ANNOUNCEMENTS,
  HEALTH,
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add packages/shared/src/constants/endpoints/index.ts
git commit -m "feat(shared): compose centralized ENDPOINTS constant"
```
