import React from 'react';
import { View } from 'react-native';
import { Text } from '@src/shared/components/ui';
import { cn } from '@lib/cn';

interface ContentSection {
  title: string;
  content: string;
}

interface ModuleContentProps {
  content: string | { sections: ContentSection[] };
}

export const ModuleContent = ({ content }: ModuleContentProps) => (
  <View className="px-4 pb-8">
    <Text variant="heading" size="lg" className="mb-4 px-1 text-slate-900 dark:text-white">
      Module Content
    </Text>
    <View className="border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {typeof content === 'string' ? (
        <Text className="leading-relaxed text-slate-700 dark:text-slate-300">{content}</Text>
      ) : (
        <View className="gap-y-6">
          {content.sections?.map((section, index) => (
            <View
              key={index}
              className={cn(
                'gap-y-2',
                index !== 0 && 'border-t border-slate-50 pt-6 dark:border-slate-800'
              )}>
              <Text variant="heading" size="lg" className="text-slate-900 dark:text-white">
                {section.title}
              </Text>
              <Text className="leading-relaxed text-slate-700 dark:text-slate-300">
                {section.content}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  </View>
);
