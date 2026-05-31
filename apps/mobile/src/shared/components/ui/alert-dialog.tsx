import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';
import { Button } from './button';
import { cn } from '@lib/cn';

/**
 * AlertDialog Root
 * Reuses the base Dialog logic for state and modal management.
 */
export const AlertDialog = Dialog;

export const AlertDialogContent = DialogContent;

export const AlertDialogHeader = DialogHeader;

export const AlertDialogFooter = DialogFooter;

export const AlertDialogTitle = DialogTitle;

export const AlertDialogDescription = DialogDescription;

interface AlertDialogActionProps extends React.ComponentProps<typeof Button> {
  variant?: 'primary' | 'destructive' | 'outline' | 'ghost';
}

/**
 * Standardized Action Button for alerts.
 * Defaults to 'destructive' if it's a dangerous action.
 */
export const AlertDialogAction = ({
  className,
  variant = 'primary',
  ...props
}: AlertDialogActionProps) => (
  <Button className={cn('flex-1', className)} variant={variant} {...props} />
);

/**
 * Standardized Cancel Button for alerts.
 */
export const AlertDialogCancel = ({
  className,
  children = 'Cancel',
  ...props
}: React.ComponentProps<typeof Button>) => (
  <Button className={cn('flex-1', className)} variant="outline" {...props}>
    {children}
  </Button>
);
