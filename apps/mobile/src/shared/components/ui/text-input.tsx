import { forwardRef } from 'react';
import { TextInput as RNTextInput, TextInputProps as RNTextInputProps, View } from 'react-native';
import { Text } from './text';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
}

export const TextInput = forwardRef<RNTextInput, TextInputProps>(
  ({ label, error, value, onChangeText, className, ...props }, ref) => {
    return (
      <View className="flex gap-1">
        {label && (
          <Text variant="label" className="mb-1">
            {label}
          </Text>
        )}
        <RNTextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          className={`border border-border bg-background px-4 py-3 text-foreground ${
            error ? 'border-destructive' : ''
          } ${className ?? ''}`}
          placeholderTextColor="#7c828a"
          {...props}
        />
        {error && (
          <Text variant="error" size="xs" className="mt-1">
            {error}
          </Text>
        )}
      </View>
    );
  }
);

TextInput.displayName = 'TextInput';
