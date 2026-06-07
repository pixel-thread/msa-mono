# MFSA Connect — Security-First Technical PRD

**Version:** 3.0.0 | **Date:** 2026-05-31
**Organization:** Meghalaya Finance Service Association (MFSA)
**Stack:** Express 5 · Prisma · PostgreSQL · Redis (Upstash) · Zod · JWT/Bcrypt

> **v3.0 Changes:**
>
> - Migration from Next.js to Express 5 for improved backend control and mobile-first API performance
> - Replaced Clerk with custom JWT + Bcrypt authentication system for full identity ownership
> - Feature-based modular architecture (SOLID)
> - Centralized validation via Zod middleware
> - Association context injected via custom `contextMiddleware` and `ContextStore` (AsyncLocalStorage)

---

## 1. Executive Summary & Stack Alignment

### 1.1 Why This Stack Satisfies Core Objectives

MFSA Connect is a finance-sector member platform for government-affiliated bodies in North-East India. The same backend serves multiple independent associations (MFSA, MPSA, …) with full data isolation. The platform must satisfy the **Digital Personal Data Protection (DPDP) Act 2023** and handle financial ledger operations with zero tolerance for security compromise.

| Core Objective                  | Stack Solution                                                                                                                                             |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Multi-Association Isolation** | Every table carries `associationId`; ContextStore auto-injects it on every query via feature services; Multi-tenant scoping enforced at the service layer. |
| **DPDP Consent Management**     | Consent receipts tracked in DB scoped to association; every action is immutable and timestamped.                                                           |
| **Data Subject Rights (DSAR)**  | `DsarTicket` table with auto-computed `responseDeadline` (created + 21 days) and association scope.                                                        |
| **Enterprise-Grade Security**   | Custom middleware chain enforces JWT verification, security headers, and rate limiting before route handlers run.                                          |
| **Role-Based Access Control**   | Granular RBAC (`SUPER_ADMIN`, `PRESIDENT`, `SECRETARY`, `FINANCE`, `DPO`, `MEMBER`) enforced via `withRole()` utility.                                     |
| **Audit Trail**                 | Services intercept mutations and write to `AuditLog` table — scoped to the association — in the same transaction.                                          |
| **Data Retention (7 years)**    | `dataRetentionUntil` tracked on user; Cron jobs handle anonymization of expired data.                                                                      |

### 1.2 Key Architectural Decisions

- **Single Codebase, Multi-Association:** One Express deployment serves multiple associations. The association is resolved from headers/tokens and scoped via `ContextStore`.
- **Custom Identity Plane:** Uses `bcryptjs` for secure password hashing and `jose` for JWT management. Tokens are delivered via `httpOnly` secure cookies.
- **Prisma as the Single DB Gate:** All database access goes through Prisma. Access is encapsulated in service files within each feature module.
- **Zod at Every Boundary:** All external input — request bodies, query params, route params — is validated with Zod before touching business logic.
- **Redis as Rate-Limit Ledger:** Upstash Redis stores sliding-window counters for API protection.

---

## 2. API Architecture

### 2.1 Feature-Based Structure

The backend is organized into domain-specific features in `src/features/`.

```
src/features/<feature-name>/
├── routes/          # Express route definitions & handlers
├── services/        # Business logic & Prisma data access
├── types/           # Domain types
├── validators/      # Zod schemas for input validation
└── utils/           # Feature-specific helpers
```

### 2.2 Global Infrastructure

Common functionality lives in `src/shared/` and `src/middleware/`.

---

## 3. Core Security Implementation

### 3.1 Authentication Pipeline

1. **JWT Verification:** `auth` middleware extracts and verifies the access token from cookies or Authorization header.
2. **Context Injection:** `contextMiddleware` initializes `ContextStore` (AsyncLocalStorage) with `traceId`.
3. **Session Enrichment:** `auth` middleware fetches user data and populates `req.user` and `ContextStore` with `userId`, `associationId`, and `role`.

### 3.2 Authorization

Handled at the route level using the `withRole(req, minRole)` utility, ensuring users only access resources permitted by their role hierarchy.

### 3.3 Multi-Tenancy

Every service operation MUST include `associationId` in its Prisma filters. The `associationId` is typically retrieved from `req.user` or `ContextStore`.

---

## 4. Feature Specifications

### 4.1 Meetings & Governance

- Admins (Secretary+) can schedule meetings and assign specific members as attendees.
- Members receive notifications and can RSVP (Accepted/Declined).
- Attendance and minutes are recorded and can be exported as PDF.

### 4.2 Financial Ledger

- Implements double-entry bookkeeping.
- Finance officers post entries; Presidents approve them.
- Scoped strictly by association.

### 4.3 Audit Logging

- Append-only log of all critical system actions.
- Tracks actor, action, resource, changes, and trace ID.

---

_MFSA Connect Technical PRD v3.0.0 — 2026-05-31_
_Multi-Association · DPDP Act 2023 Compliant · Security-First_
