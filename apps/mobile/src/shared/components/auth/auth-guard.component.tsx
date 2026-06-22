import { useEffect, useState } from 'react';
import { useSegments, useRouter, Route } from 'expo-router';

import { useAuthStore } from '@src/shared/store';
import { LoadingScreen } from '../screens';

interface AuthGuardProps {
  children: React.ReactNode;
  publicRoutes?: Route[];
}

const authRoutes: Route[] = [
  '/(auth)/sign-in',
  '/(auth)/sign-in-verify',
  '/(auth)/sign-up',
  '/(auth)/forgot-password',
  '/(auth)/reset-password',
];

export const AuthGuard = ({ children, publicRoutes = authRoutes }: AuthGuardProps) => {
  const router = useRouter();
  const segments = useSegments();
  const { user, isAuthLoading, isHydrated } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !isMounted) return;

    const currentPath = '/' + segments.join('/');
    const isPublicRoute = publicRoutes.some((route) => currentPath.startsWith(route));

    if (isPublicRoute && user) {
      router.replace('/');
    } else if (!isPublicRoute && !user) {
      router.replace('/(auth)/sign-in');
    }
  }, [isHydrated, isMounted, user, segments, publicRoutes, router]);

  if (!isHydrated || !isMounted || isAuthLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};
