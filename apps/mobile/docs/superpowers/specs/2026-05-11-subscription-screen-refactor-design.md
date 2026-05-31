# Design Spec: Subscription Screen Refactor (Hero Marketing Layout)

**Date:** 2026-05-11
**Status:** DRAFT
**PRD Reference:** N/A (Based on user request)

## 1. Objective
Refactor the existing `SubscriptionScreen` to replace the list-style card with a single, high-impact "Hero Marketing" card that fills the screen. This design aims to provide a premium feel and better utilize the available screen space for single-plan displays.

## 2. Architecture & Layout
The screen will transition from a standard list view to a single-card detail view.

- **Container:** `Container` component from `@src/shared/components`.
- **Scrolling:** `ScrollView` with `contentContainerStyle={{ flexGrow: 1 }}` to ensure the card can expand to fill the viewport and remain scrollable on smaller devices.
- **Card Wrapper:** A single `Card` that occupies the majority of the screen width and height.
- **Internal Sections:**
    - **Hero Header (Top):** Centered layout for Plan Name (Uppercase Label) and Price (Large Display).
    - **Feature Grid (Middle):** A 2-column wrapping grid (`flex-row`, `flex-wrap`) to display plan benefits.
    - **Metadata & CTA (Bottom):** Bottom-aligned area for billing cycle info and the primary Action Button.

## 3. UI Components & Styling
Following the Webflow-inspired design system (`DESIGN.md`):

### 3.1. Typography
| Element | Style | Color |
|---------|-------|-------|
| Plan Name | Uppercase Label (15px, weight 600, 1.5px spacing) | Gray 800 (`#222222`) |
| Price | Display/Section Heading (32px-40px, weight 600) | Webflow Blue (`#146ef5`) |
| Feature Text | Body Standard (16px, weight 500) | Near Black (`#080808`) |
| Billing Cycle | Caption (14px, weight 400) | Gray 700 (`#363636`) |

### 3.2. Visual Elements
- **Icons:** `Ionicons` (e.g., `checkmark-circle-outline`) in Webflow Blue for feature items.
- **Card Radius:** Conservative `4px` or `8px`.
- **Shadow:** 5-layer cascading shadow system:
  - `rgba(0,0,0,0.09) 0px 3px 7px`
  - `rgba(0,0,0,0.08) 0px 13px 13px`
  - `rgba(0,0,0,0.04) 0px 30px 18px`
  - `rgba(0,0,0,0.01) 0px 54px 22px`
  - `rgba(0,0,0,0) 0px 84px 24px`
- **Button:** Webflow Blue (`#146ef5`) background, `4px` radius, white text.

## 4. Data Flow
- **Source:** Continues to use `useSubscriptionPlans()` hook.
- **Selection:** Explicitly picks `plans[0]` (the primary/only plan) as per the single-plan requirement.
- **Features Mapping:** Iterates over the `features` object in `SubscriptionPlan` to generate the feature grid dynamically.

## 5. Error & Loading States
- **Loading:** Existing `ActivityIndicator` centered in the container.
- **Error:** Existing `ErrorScreen` with retry logic.
- **Empty State:** Retains the existing "No plans available" view if the array is empty.

## 6. Implementation Notes
- Use `View` with `flex-direction: row` and `flex-wrap: wrap` for the feature grid.
- Each feature item should take up `50%` width to create the 2-column effect.
- Ensure `Container` padding and `Card` margins are balanced to maintain the "full screen" look.
