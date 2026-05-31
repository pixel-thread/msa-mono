import React from 'react';
import { View } from 'react-native';
import { Card, CardContent, Text } from '@src/shared/components/ui';
import { MeetingMinute } from '../types/minute';

export const MinuteCard = ({ minute }: { minute: MeetingMinute }) => (
  <Card className="mb-4 border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <CardContent className="p-4">
      <View className="flex-row justify-between">
        <View className="flex-1">
          <Text weight="bold" size="lg" className="text-slate-900 dark:text-white">
            {minute.agendaPoint}
          </Text>
          <View className="mt-2 bg-slate-50 p-3 dark:bg-slate-800">
            <Text size="sm" className="leading-relaxed text-slate-700 dark:text-slate-300">
              {minute.decision}
            </Text>
          </View>
        </View>
      </View>
    </CardContent>
  </Card>
);
