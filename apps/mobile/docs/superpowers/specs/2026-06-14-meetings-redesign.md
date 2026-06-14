# Meetings Feature Redesign

**Status:** APPROVED
**Date:** 2026-06-14
**Designer:** AI Agent

## Goals

1. **Modern, minimal Apple Calendar/Mail aesthetic** — clean, sparse, strong typography hierarchy
2. **Accessibility** — proper roles, labels, hints, contrast, touch targets
3. **Code quality** — fix "minuite" typos, barrel exports, empty directories

## Design Decisions

| Decision           | Choice                                    |
| ------------------ | ----------------------------------------- |
| Corner radius      | Keep zero-radius (design system)          |
| Card layout        | Keep card-based (modernize)               |
| StackHeader        | Keep custom (not native)                  |
| Icons              | Keep Ionicons                             |
| Info card wrappers | Keep card wrappers                        |
| RSVP buttons       | Two-button (Accept/Decline)               |
| Scroll behavior    | Keep current (RefreshControl + Container) |
| Attendee list      | Always expanded (no accordion)            |
| Style inspiration  | Apple Calendar / Apple Mail               |

## Changes by File

### 1. Code Cleanup

| File                                   | Change                                                     |
| -------------------------------------- | ---------------------------------------------------------- |
| `hooks/use-create-meeting-minuite.ts`  | Rename → `use-create-meeting-minute.ts`                    |
| `hooks/use-delete-meeting-minute.ts`   | Fix typo in function name                                  |
| `hooks/use-meeting-minuite.ts`         | Rename → `use-meeting-minute.ts`                           |
| `hooks/use-update-meeting-minuites.ts` | Rename → `use-update-meeting-minutes.ts`                   |
| `hooks/index.ts`                       | Update exports with new names                              |
| `validators/minuites.ts`               | Rename → `validators/minutes.ts`                           |
| `types/index.ts`                       | Add re-exports for `agenda.ts`, `attendee.ts`, `minute.ts` |
| `components/index.ts`                  | Add exports for `MeetingInfoCard`, `MinuteCard`            |
| `utils/constants/`                     | Remove empty directory                                     |
| `store/`                               | Remove empty directory                                     |
| `services/`                            | Remove empty directory                                     |

### 2. Components

#### `meeting-card.component.tsx`

- Add `accessibilityRole="button"`, `accessibilityLabel`, `accessibilityHint` to card wrapper
- Replace Ionicons chevron-forward with a cleaner disclosure indicator
- Make touch target at least 44pt (increase card tap area)
- Status badge: use bullet dot + text label, no colored background (monochrome approach)
- Improve typography: title in semibold, metadata in caption with `tabular-nums`
- Clean up spacing with gap-based layout

#### `meeting-info-card.tsx`

- Remove colored background from icon circle
- Thinner card border
- Smaller icon size
- Keep card wrapper structure

#### `meeting-minute-card.tsx`

- Remove colored background from decision area
- Stronger heading hierarchy for agenda point
- Add `accessibilityRole="header"` on agenda point text
- Better spacing between agenda point and decision

### 3. Screens

#### `meeting-list.screen.tsx`

- Add proper accessibility roles on all interactive elements
- Improve empty state message
- Cleaner loading state with Skeleton components where available

#### `meeting-detail.screen.tsx`

- **Hero section**: Larger title, description in secondary weight, inline status chip near title
- **Info cards**: Thinner borders, smaller icons, lighter visual weight
- **RSVP**: Clear active/disabled button states using color + opacity + text; accepted/declined shown with icon + text, not color alone; selected button visually distinct
- **Agenda**: Cleaner numbered list with section header, better spacing
- **Attendees**: Always expanded (no Accordion), avatar initial circle + name + role + status dot; each attendee row with `accessibilityLabel`
- **Organizer**: Larger avatar initial, cleaner layout
- **Accessibility**: `accessibilityRole="header"` on all section titles, `accessibilityLabel` + `accessibilityHint` on all buttons, meets color contrast minimums

#### `meeting-minutes.screen.tsx`

- Remove card wrapper's colored decision background
- Add `accessibilityRole="header"` per minute card heading
- Improve empty state messaging

## Accessibility Checklist

- [ ] All `TouchableOpacity`/`Pressable` have `accessibilityRole`, `accessibilityLabel`, `accessibilityHint`
- [ ] Color is never the sole indicator of state (text + icon + color combination)
- [ ] Minimum touch target 44x44pt on all interactive elements
- [ ] `selectable` prop on data-displaying `<Text>` elements
- [ ] Section titles use `accessibilityRole="header"`
- [ ] Sufficient text contrast against backgrounds

## Out of Scope

- No new screens (create/edit meeting)
- No routing changes
- No backend API changes
- No migration to native Stack headers
- No migration to SF Symbols
