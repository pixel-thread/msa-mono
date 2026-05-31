import { SubscriptionScreen } from '@src/features/subscription';
import { EmptyScreen } from '@src/shared/components/screens';
import { isExpoGo } from '@src/shared/utils';

export default function page() {
  const isExpo = isExpoGo();

  if (isExpo) {
    return <EmptyScreen title="This feature is not available on Expo Go" />;
  }

  return <SubscriptionScreen />;
}
