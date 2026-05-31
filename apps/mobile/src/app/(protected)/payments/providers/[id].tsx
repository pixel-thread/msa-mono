import { useLocalSearchParams } from 'expo-router';
import { ProviderDetailScreen } from '@src/features/payment-providers/screens/ProviderDetailScreen';

export default function ProviderDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id) return null;
  return <ProviderDetailScreen id={id} />;
}
