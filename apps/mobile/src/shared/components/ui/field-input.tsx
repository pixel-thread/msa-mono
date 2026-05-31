import React from 'react';
import { View } from 'react-native';
import { Controller, Control, RegisterOptions, useFormContext } from 'react-hook-form';
import { Input } from './input';
import { Text } from './text';
import { cn } from '@lib/cn';

interface FieldInputProps extends React.ComponentProps<typeof Input> {
  name: string;
  control?: Control<any>; // Now optional
  label?: string;
  description?: string;
  rules?: RegisterOptions;
  defaultValue?: any;
}

/**
 * FieldInput is a wrapper around the base Input component that integrates with react-hook-form.
 * It is context-aware: if no 'control' is provided, it attempts to use 'useFormContext'.
 * This follows the shadcn/ui pattern for modular, clean form construction.
 */
export const FieldInput = ({
  name,
  control: propControl,
  label,
  description,
  rules,
  defaultValue,
  className,
  ...props
}: FieldInputProps) => {
  const formContext = useFormContext();
  const control = propControl || formContext?.control;

  if (!control) {
    throw new Error(
      'FieldInput must be used within a FormProvider or have a control prop provided.'
    );
  }

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className={cn('my-2 w-full', className)}>
          {label && (
            <Text
              variant={error ? 'error' : 'heading'}
              className="mb-2 ml-1 font-semibold uppercase">
              {label}
            </Text>
          )}

          <Input
            value={value?.toString()}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!error}
            {...props}
          />

          {description && !error && (
            <Text variant="subtext" size="xs" className="ml-1 mt-2">
              {description}
            </Text>
          )}

          {error && (
            <Text variant="error" size="xs" className="ml-1 mt-2">
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
};

FieldInput.displayName = 'FieldInput';
