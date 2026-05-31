# Button Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the existing `Button` component to a shadcn/ui style using `class-variance-authority` (CVA) while adhering to the Webflow-inspired design system.

**Architecture:** Use CVA to define variants and sizes, combined with a `cn` utility for safe tailwind-merge concatenation. Internal `Text` styles are dynamically mapped to the container variant.

**Tech Stack:** React Native, NativeWind (Tailwind), class-variance-authority, tailwind-merge.

---

### Task 1: Refactor Button Component

**Files:**
- Modify: `src/shared/components/ui/Button.tsx`

- [ ] **Step 1: Implementation of CVA and component logic**

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { cn } from '@/shared/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary shadow-wf-cascade',
        secondary: 'bg-secondary',
        destructive: 'bg-destructive',
        outline: 'border border-input bg-background',
        ghost: 'bg-transparent',
        link: 'bg-transparent underline',
      },
      size: {
        default: 'h-14 px-4 py-2',
        sm: 'h-10 px-3',
        lg: 'h-16 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const textVariants = {
  default: 'text-primary-foreground',
  secondary: 'text-secondary-foreground',
  destructive: 'text-destructive-foreground',
  outline: 'text-foreground',
  ghost: 'text-foreground',
  link: 'text-primary',
};

export interface ButtonProps
  extends TouchableOpacityProps,
    VariantProps<typeof buttonVariants> {
  title?: string;
}

export const Button = forwardRef<View, ButtonProps>(
  ({ className, variant = 'default', size = 'default', title, children, ...props }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ disabled: props.disabled }}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {title ? (
          <Text
            className={cn(
              'font-medium',
              textVariants[variant as keyof typeof textVariants] || textVariants.default
            )}
          >
            {title}
          </Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';
```

- [ ] **Step 2: Verify Linting**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 3: Commit changes**

```bash
git add src/shared/components/ui/Button.tsx
git commit -m "feat: refactor Button to use CVA shadcn-style"
```
