# Design Spec: Button Refactor (shadcn-style)

**Version:** 1.0.0
**Status:** DRAFT
**Created:** 2026-05-10
**PRD Reference:** .agents/prd/core_prd.md (Webflow Inspired)

## 1. Overview
Refactor the existing `Button` component to follow the shadcn/ui pattern using `class-variance-authority` (CVA) and `tailwind-merge`. The styling will align with the Webflow-inspired design system defined in `DESIGN.md`.

## 2. Architecture

### 2.1 Component Structure
- **Base:** `TouchableOpacity` (from `react-native`)
- **Internal Content:** `Text` component (from `react-native`)
- **Variant Engine:** `class-variance-authority` (CVA)
- **Class Concatenation:** `cn` utility (using `tailwind-merge` and `clsx`)

### 2.2 Variants (CVA Definition)

| Variant | Styling (NativeWind Classes) | Text Style |
|---------|-----------------------------|------------|
| `default` | `bg-primary shadow-wf-cascade` | `text-primary-foreground` |
| `secondary` | `bg-secondary` | `text-secondary-foreground` |
| `destructive` | `bg-destructive` | `text-destructive-foreground` |
| `outline` | `border border-input bg-background` | `text-foreground` |
| `ghost` | `bg-transparent` | `text-foreground` |
| `link` | `bg-transparent underline` | `text-primary` |

### 2.3 Sizes

| Size | Styling (NativeWind Classes) |
|------|-----------------------------|
| `default` | `h-14 px-4 py-2` |
| `sm` | `h-10 px-3` |
| `lg` | `h-16 px-8` |
| `icon` | `h-10 w-10` |

### 2.4 Design System Rules
- **Font:** `WF Visual Sans Variable` (weight 500)
- **Radius:** Conservative 4px (`rounded-md` based on `tailwind.config.js`)
- **Press State:** Basic opacity change (default `TouchableOpacity` behavior)

## 3. Interfaces

```typescript
import { type VariantProps } from 'class-variance-authority';
import { TouchableOpacityProps } from 'react-native';

export interface ButtonProps extends TouchableOpacityProps, VariantProps<typeof buttonVariants> {
  title?: string; // Optional for icon-only buttons
  loading?: boolean;
}
```

## 4. Implementation Steps
1. Define `buttonVariants` using `cva`.
2. Refactor `src/shared/components/ui/Button.tsx`.
3. Update consumers if necessary (though current usage seems minimal).
4. Verify styles in the app.

## 5. Security & Accessibility
- **A11y:** Ensure `accessibilityRole="button"` and `accessibilityState={{ disabled }}` are passed correctly.
- **SSRF:** N/A (Client-side UI component).
