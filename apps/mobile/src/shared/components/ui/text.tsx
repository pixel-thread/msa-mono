import * as React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/cn';

const textVariants = cva('text-foreground font-sans', {
  variants: {
    variant: {
      default: 'text-base',
      heading: 'font-sans-bold',
      subtext: 'text-muted-foreground',
      error: 'text-destructive',
      link: 'text-primary',
      label: 'text-sm text-muted-foreground font-sans-medium',
    },
    size: {
      default: 'text-base',
      xs: 'text-xs',
      sm: 'text-sm',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
    },
    weight: {
      default: '',
      light: 'font-light',
      medium: 'font-sans-medium',
      semibold: 'font-sans-bold',
      bold: 'font-sans-bold',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    weight: 'default',
  },
});

export interface TextProps extends RNTextProps, VariantProps<typeof textVariants> {
  className?: string;
}

const Text = React.forwardRef<RNText, TextProps>(
  ({ className, variant, size, weight, ...props }, ref) => {
    return (
      <RNText
        className={cn(textVariants({ variant, size, weight, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';

export { Text, textVariants };
