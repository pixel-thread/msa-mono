# Dashboard Refactor Design Spec

## Overview
Update the `DashboardScreen` to be more detailed, modern, and data-rich, utilizing 2026 UI trends like Bento Grid layouts. The dashboard will integrate multiple features: Meetings, Training, Announcements, and Notifications into a single, cohesive view.

## Core Features & Modules
1. **Welcome Header:** Personalized greeting with Date/Time context.
2. **Quick Actions (Bento Cells):** High-contrast buttons for frequent actions.
3. **Next Briefing / Meeting:** Highlight the next immediate meeting using `useMeetings`.
4. **Training Progress:** Show pending or incomplete training assignments using `useTrainingModules` and `useTrainingAssignments`.
5. **Activity Feed (Announcements & Notifications):** Combine announcements (`useAnnouncements`) and recent notifications (`useNotifications`) into a unified feed.

## Visual Design (Bento Box Trend)
- **Layout:** Use a masonry/bento-box style grid. Since React Native doesn't have true CSS Grid, we will use flexible rows (`flex-row`) and flexible columns (`flex-1`) with consistent gaps (`gap-4`).
- **Styling:** "Liquid glass" aesthetics (where supported by `expo-blur`) or clean rounded cards (`rounded-3xl`) with subtle shadows and minimalistic borders.
- **Typography:** Clear, bold headings with low-contrast descriptive text.

## Hooks Integration
- `@features/meetings/hooks`: `useMeetings({ limit: 1 })`
- `@features/training/hooks`: `useTrainingModules()` or `useTrainingAssignments(moduleId)` to find pending tasks.
- `@features/announcements/hooks`: `useAnnouncements()`
- `@shared/hooks`: `useNotifications()`

## Error Handling & Loading
- Maintain the current `LoadingScreen` while initial data fetches.
- Handle missing data gracefully by hiding the respective bento cell.
