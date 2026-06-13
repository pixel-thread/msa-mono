import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, StackHeader } from '@src/shared/components';
import { Text } from '@src/shared/components/ui';
import { ErrorBoundary } from '@components/common/error-boundary';
import { MyContributions } from '../components/my-contributions';
import { PaymentHistory } from '../components/payment-history.component';

export const MyContributionsScreen = () => {
  const [activeTab, setActiveTab] = useState<'contributions' | 'history'>('contributions');

  return (
    <ErrorBoundary isComponentError componentName="MyContributionsScreen">
      <Container>
        <StackHeader title="Contribution" showBackButton />

        <View className="flex-row border-b border-slate-100 px-6 dark:border-slate-800">
          {(['contributions', 'history'] as const).map((tab) => {
            const active = activeTab === tab;
            return (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} className="flex-1 py-4">
                <View className="flex-row items-center justify-center gap-x-2">
                  <Ionicons
                    name={tab === 'contributions' ? 'wallet-outline' : 'receipt-outline'}
                    size={20}
                    color={active ? '#6366f1' : '#94a3b8'}
                  />
                  <Text
                    className={`text-center text-base font-semibold capitalize ${
                      active
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}>
                    {tab}
                  </Text>
                </View>
                {active && (
                  <View className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === 'contributions' ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}>
            <MyContributions />
          </ScrollView>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}>
            <PaymentHistory />
          </ScrollView>
        )}
      </Container>
    </ErrorBoundary>
  );
};
