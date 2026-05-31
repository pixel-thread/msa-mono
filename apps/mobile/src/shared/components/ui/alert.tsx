import * as React from 'react';
import { View, ViewProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { Text } from './text';
import { cn } from '@lib/cn';

const alertVariants = cva('relative w-full border p-4 flex-row items-start gap-x-3', {
  variants: {
    variant: {
      default: 'bg-muted border-border',
      destructive: 'bg-destructive/10 border-destructive/30',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface AlertProps extends ViewProps, VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
}

/**
 * Alert Component for inline feedback and status messages.
 */
const Alert = React.forwardRef<View, AlertProps>(
  ({ className, variant, icon, children, ...props }, ref) => (
    <View ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      {icon && <View className="mt-0.5">{icon}</View>}
      <View className="flex-1 gap-y-1">{children}</View>
    </View>
  )
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  View,
  React.ComponentPropsWithoutRef<typeof View> & { children?: React.ReactNode }
>(({ className, children, ...props }, ref) => (
  <View ref={ref} {...props}>
    <Text variant="heading" size="sm" weight="semibold" className={cn('leading-tight', className)}>
      {children}
    </Text>
  </View>
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  View,
  React.ComponentPropsWithoutRef<typeof View> & { children?: React.ReactNode }
>(({ className, children, ...props }, ref) => (
  <View ref={ref} {...props}>
    <Text variant="subtext" size="xs" className={cn('leading-relaxed opacity-90', className)}>
      {children}
    </Text>
  </View>
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
