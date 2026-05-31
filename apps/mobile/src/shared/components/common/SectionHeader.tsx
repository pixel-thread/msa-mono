import React from 'react';
import { View } from 'react-native';
import { Text } from '../ui';
import { cn } from '@src/shared/lib/cn';
type Props = {
  title: string;
  subtitle?: string;
};

const SectionHeader: React.FC<Props> = ({ title, subtitle }) => {
  return (
    <View className={cn('p-4', !!subtitle ? 'gap-y-2' : 'gap-y-0')}>
      {/* Title */}
      <Text size={'3xl'} weight={'semibold'} className="leading-10 tracking-wide">
        {title}
      </Text>

      {/* Subtitle */}
      {subtitle ? (
        <Text size={'sm'} variant={'subtext'} className="leading-6">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

export default SectionHeader;
