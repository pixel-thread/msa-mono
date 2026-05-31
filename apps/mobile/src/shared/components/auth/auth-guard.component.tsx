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
  const { user, isAuthenticated, isAuthLoading, isHydrated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, [isMounted]);

  useEffect(() => {
    if (!isHydrated || !isMounted) return;

    const currentPath = '/' + segments.join('/');
    const isPublicRoute = publicRoutes.some((route) => currentPath.startsWith(route));

    if (isPublicRoute && isAuthenticated && user) {
      router.replace('/');
    } else if (!isPublicRoute && !isAuthenticated && !user) {
      router.replace('/(auth)/sign-in');
    }

    setIsChecking(false);
  }, [isHydrated, isMounted, isAuthenticated, user, segments, publicRoutes, router]);

  if (isChecking || isAuthLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};
