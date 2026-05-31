import * as React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { cn } from '@lib/cn';

interface InputProps extends TextInputProps {
  className?: string;
  error?: boolean;
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        className={cn(
          'h-10 pl-2 w-full min-w-0 border border-transparent border-b-input bg-transparent px-0 py-1 text-base text-foreground',
          'focus:border-b-ring',
          error && 'border-b-destructive',
          className
        )}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
