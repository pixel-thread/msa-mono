import React from 'react';
import { ScrollView } from 'react-native';
import { Text } from '@components/ui';
import { Link } from 'expo-router';
import { useGrantConsent, useMyConsent, useRevokeConsent } from '@src/features/consent/hooks';
import { ConsentToggleCard } from '@src/features/consent/components';
import { ConsentPurpose, ConsentStatus } from '@src/features/consent/types';
import { Container, StackHeader } from '@src/shared/components';
import { useRateLimit } from '@src/shared/hooks/use-rate-limiting';
import { RefreshControl } from 'react-native-gesture-handler';
import { cn } from '@src/shared/lib/cn';

export default function MemberConsentScreen() {
  const { data: myConsent, isFetching, refetch } = useMyConsent();

  const { isLimited, isProcessing, executeWithLimit } = useRateLimit('CONSENT_TOGGLE_BUTTON', {
    limit: 2,
    windowMs: 5000,
  });

  const grantConsent = useGrantConsent();

  const revokeConsent = useRevokeConsent();

  const handleToggle = (purpose: ConsentPurpose, grant: boolean) => {
    if (grant) {
      executeWithLimit(() => grantConsent.mutate({ purposes: [purpose], channel: 'mobile' }));
    } else {
      executeWithLimit(() => revokeConsent.mutate({ purposes: [purpose], channel: 'mobile' }));
    }
  };

  const getConsentStatus = (purpose: ConsentPurpose): ConsentStatus => {
    if (myConsent && myConsent?.length > 0) {
      const consent = myConsent.find((c) => c.purpose === purpose);
      if (consent) {
        return consent.status;
      }
    }
    return 'PENDING' as ConsentStatus;
  };

  return (
    <>
      <Container>
        <StackHeader showBackButton title="Manage Consent" />
        <ScrollView
          className="p-4"
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
          <Text className="mb-4 text-lg font-bold text-slate-800">Your Data Preferences</Text>
          {Object.values(ConsentPurpose).map((purpose) => (
            <ConsentToggleCard
              key={purpose}
              purpose={purpose}
              status={getConsentStatus(purpose)}
              isLoading={isProcessing || isFetching || isLimited}
              onToggle={handleToggle}
            />
          ))}
          <Link
            href="/consent/history"
            style={{ fontFamily: 'JetBrainsMono_400Regular' }}
            className={cn('mt-6 bg-indigo-50 p-4 text-center font-semibold text-indigo-700')}>
            View Consent Audit History
          </Link>
        </ScrollView>
      </Container>
    </>
  );
}
