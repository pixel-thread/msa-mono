# Meeting Detail Screen Redesign Spec

**Date:** 2026-05-21
**Topic:** Meeting Detail Screen Redesign
**Aesthetic Direction:** Modern Civic (Government App Standard)

## Overview
The goal is to redesign the `MeetingDetailScreen` to look more premium and professional, aligning with a "Modern Civic" government app aesthetic. This involves moving away from playful, bubbly UI elements (like large border radii and bright drop shadows) towards a structured, high-contrast, and highly accessible design.

## UI/UX Principles (Modern Civic)
- **High Legibility & Contrast:** Rely on strict `slate-900` for primary text and `slate-600` for secondary text.
- **Whitespace & Structure:** Increase padding/margins to let content breathe.
- **Subdued & Serious Elements:** Use `rounded-md` or `rounded-lg` instead of `rounded-2xl`. Avoid large colored drop shadows.
- **Authoritative Typography:** Clean sans-serif with clear weight distinction.

## Section-by-Section Changes

### 1. Hero Section & Badges
- **Meeting Type Badge:** Replace bright indigo background with a deep navy or dark slate (`bg-slate-900` or `bg-slate-800`), with white text.
- **Status Badge:** Replace tinted background with a transparent background and a solid subtle border (e.g., `border-slate-300`), using `slate-700` text for "Scheduled" instead of bright emerald/blue.
- **Title & Description:** Ensure title uses `slate-900` and description uses `slate-600` with increased line height.

### 2. Quick Info Grid & Alerts
- **MeetingInfoCard:** Ensure borders are sharp and subtle (`border-slate-200`). Use clean, un-tinted background.
- **Attendance Alert:** Keep the warning legible. Maintain the destructive variant for importance, but ensure it uses standard accessible red/amber without feeling overly alarming.

### 3. Action Buttons (RSVP)
- **Primary Button (Confirm):** Change from `bg-indigo-600` with `shadow-indigo-100` to a solid `bg-slate-900` or deep blue. Change `rounded-2xl` to `rounded-lg`. Remove the shadow.
- **Secondary Button (Decline):** Use `variant="outline"` with a crisp `border-slate-300` and `text-slate-700`. Match `rounded-lg`.
- **Button Heights:** Keep at `h-14` for accessibility/touch targets, but with the new border radii.

### 4. Agenda & Attendance (Lists & Cards)
- **Card Containers:** Sharpen borders by removing heavy shadows and ensuring standard `rounded-lg` or `rounded-xl` instead of default larger radii.
- **List Numbering:** Remove the playful circular backgrounds (`h-6 w-6 rounded-full bg-slate-50`). Replace with clean, bold, unboxed text (e.g., `01.`, `02.`) using `slate-400` or `slate-500`.
- **Dividers:** Ensure list item dividers (`border-b`) are crisp and use `border-slate-100`.
- **Institutional Lead Icon:** Remove the tinted `bg-indigo-50` circular background. Use a simple, bold initial or a highly understated square-ish container (`rounded-md`).

## Out of Scope
- Adding new functionality or data fields to the meeting detail screen.
- Modifying the underlying data fetching hooks or API calls.
- Modifying screens other than `MeetingDetailScreen` and its immediate child components (like `MeetingInfoCard`) if needed.
