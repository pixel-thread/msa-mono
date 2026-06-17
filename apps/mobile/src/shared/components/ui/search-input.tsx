import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@lib/cn';

interface SearchInputProps extends TextInputProps {
  containerClassName?: string;
}

export const SearchInput = ({ containerClassName, ...props }: SearchInputProps) => (
  <View
    className={cn(
      'flex-row items-center border border-border bg-muted px-4 py-3',
      containerClassName
    )}>
    <Ionicons name="search" size={16} color="#7c828a" className="mr-2" />
    <TextInput
      className="flex-1 text-base text-foreground"
      placeholderTextColor="#7c828a"
      {...props}
    />
  </View>
);
