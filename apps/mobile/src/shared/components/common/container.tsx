import { cn } from '@src/shared/lib/cn';
import React from 'react';
import { View, ViewBase } from 'react-native';

interface ContainerProps extends React.ComponentProps<typeof ViewBase> {
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({ children, className, ...props }) => {
  return (
    <View className={cn('flex-1 bg-gray-100', className)} {...props}>
      {children}
    </View>
  );
};
