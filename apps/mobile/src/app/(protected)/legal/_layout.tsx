import { Stack } from 'expo-router';

export default function LegalLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="privacy-policy" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="about" />
    </Stack>
  );
}
