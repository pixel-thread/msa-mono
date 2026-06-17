import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { DeclarationDetailScreen } from '@src/features/declaration';

export default function DeclarationDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DeclarationDetailScreen id={id} />;
}
