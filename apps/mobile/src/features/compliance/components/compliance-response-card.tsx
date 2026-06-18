import React from 'react';
import { View } from 'react-native';
import { Text } from '@src/shared/components/ui/text';
import { Card, CardContent } from '@src/shared/components/ui/card';
import { ComplianceResponse } from '../types/compliance.types';
import { formatDate } from '@src/shared/utils/format';
import { cn } from '@src/shared/lib/cn';

interface Props {
  response: ComplianceResponse;
}

export const ComplianceResponseCard = ({ response }: Props) => {
  const isResolution = response.responseType === 'RESOLUTION';

  return (
    <Card className={cn('mb-3', isResolution ? 'border-green-200' : '')}>
      <CardContent className="p-4">
        <View className="mb-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="h-8 w-8 items-center justify-center bg-indigo-100">
              <Text weight="bold" size="xs" className="text-indigo-700">
                {response.createdBy.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text weight="semibold" size="sm" className="text-slate-900">
                {response.createdBy.name}
              </Text>
              {isResolution && (
                <Text size="xs" className="text-green-600">
                  Resolution
                </Text>
              )}
            </View>
          </View>
          <Text variant="subtext" size="xs" className="text-slate-400">
            {formatDate(response.createdAt)}
          </Text>
        </View>

        <Text size="sm" className="leading-relaxed text-slate-700">
          {response.message}
        </Text>
      </CardContent>
    </Card>
  );
};
