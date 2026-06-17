import React from 'react';
import { View } from 'react-native';
import { Card, CardContent, Text } from '@src/shared/components/ui';
import { cn } from '@lib/cn';
import { MeetingMinute } from '../types/minute';

export const MinuteCard = ({ minute }: { minute: MeetingMinute }) => (
  <Card
    className={cn(
      'mb-4 border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'
    )}>
    <CardContent className="p-4">
      <View className="flex-row justify-between">
        <View className="flex-1">
          <Text
            variant="heading"
            size="sm"
            weight="semibold"
            className="text-slate-900 dark:text-white"
            accessibilityRole="header"
            selectable>
            {minute.agendaPoint}
          </Text>
          <View className="mt-1.5">
            <Text variant="subtext" size="sm" selectable>
              {minute.decision}
            </Text>
          </View>
        </View>
      </View>
    </CardContent>
  </Card>
);
