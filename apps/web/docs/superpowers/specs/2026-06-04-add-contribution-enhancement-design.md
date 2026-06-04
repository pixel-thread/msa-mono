# Add Contribution Page Enhancement — Design Spec

**Date:** 2026-06-04
**Status:** Approved

## Overview

Enhance the Add Contribution page (`src/features/contributions/pages/add-contribution.tsx`) with a richer, govt-portal-style UI using progressive disclosure. The page currently shows a member search, a bare summary bar, and a data table. This spec adds collapsible Member Profile and Contribution Statistics sections, an itemized payment summary, and better status indicators.

## Architecture

Single-page enhancement — no new routes, no new API endpoints. All data is already available from the existing `useUserContributions` hook (`user`, `summary`, `contributions`). Uses existing shadcn/ui `Collapsible`, `Badge`, `Progress`, and `Card` components.

## Sections

### 1. Member Profile Card (collapsible)

**Trigger:** Appears when a member is selected from `MemberCombobox` (i.e., `userId` is set + `user` data has loaded from `useUserContributions`).

**Content:**
- Member name (large text)
- Email
- Membership number as a `Badge` (formatted `#M-{number}`)
- Member ID (UUID, truncated for display)
- Three stat mini-cards in a row:
  - **Periods** — total count of contribution periods
  - **Paid** — `formattedAmount(summary.totalPaid)`
  - **Compliance** — calculated from `summary.paidMonths / (paidMonths + partialMonths + overdueMonths + waivedMonths) * 100`, displayed as a percentage

**Implementation:** Uses shadcn/ui `Collapsible` (default collapsed). The card has a title row "Member Profile" with a collapse toggle icon.

### 2. Contribution Statistics Panel (collapsible)

**Trigger:** Appears when contribution data has loaded.

**Content:**
- Three summary stat cards in a row:
  - **Total Expected** — `formattedAmount(summary.totalExpected)`
  - **Total Paid** — `formattedAmount(summary.totalPaid)` (green)
  - **Total Due** — `formattedAmount(summary.totalDue)` (red)
- **Status Breakdown** — five `Badge` components in a row showing counts: Paid, Partial, Due, Overdue, Waived. Each badge is color-coded:
  - PAID: green
  - PARTIAL: blue
  - DUE: yellow/warning
  - OVERDUE: red/destructive
  - WAIVED: gray/secondary
- **Compliance Progress Bar** — a `Progress` component showing compliance percentage with a label
- **Recent Periods** — last 6 contribution periods listed as compact rows showing month/year + colored status dot

**Implementation:** Uses `Collapsible` (default collapsed). Progress bar from `@/shared/components/ui/progress`.

### 3. Enhanced Payment Summary Bar

**Trigger:** Appears when contribution periods are selected via checkboxes.

**Current behavior preserved + enhanced:**
- Keep the 3 stat cards: Selected Periods count, Total Due (All), Paying Today
- **Add:** An itemized list of selected periods below the stat cards, each showing:
  - Month/Year (e.g., "Jan 2026")
  - Due amount
  - Status badge (small)
- The "Pay" button remains unchanged in behavior

### 4. Enhanced Data Table

**Change:** Only the status badge rendering — replace the generic `getStatusBadge` call with contribution-specific colors (see status mapping above). The column structure, checkbox behavior, and all other cells remain the same.

## Data Flow

No changes to data fetching. The existing `useUserContributions` hook already returns all required data:
- `user` → used in Member Profile card
- `summary` → used in Statistics panel
- `contributions` → used in Statistics panel (recent periods) and data table

Derived values computed client-side: compliance rate, total period count, filtered recent periods.

## Files Changed

| File | Change |
|------|--------|
| `src/features/contributions/pages/add-contribution.tsx` | Add Member Profile, Statistics, enhanced summary sections |
| `src/features/contributions/components/member-profile-card.tsx` | **Create** — Member profile card component |
| `src/features/contributions/components/contribution-stats-panel.tsx` | **Create** — Statistics panel component |
| `src/features/contributions/components/payment-summary-bar.tsx` | **Create** — Enhanced payment summary bar component |
| `src/features/contributions/components/contribution-status-badge.tsx` | **Create** — Contribution-specific status badge component |

## Out of Scope

- No new API endpoints
- No changes to existing hooks or types
- No routing changes
- No new packages or dependencies
