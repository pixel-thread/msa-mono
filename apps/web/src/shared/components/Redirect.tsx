'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loading } from '@components/loading';
import { useLocation, useNavigate } from '@tanstack/react-router';

import { ROUTE_ROLE } from '../constants';
import { useAuthStore } from '../stores/auth';

type PropsT = {
  children: React.ReactNode;
};

const pageAccessOnlyIfUnAuthenticated: string[] = [
  '/sign-in',
  '/sign-up',
  '/reset-password',
  '/forgot-password',
  '/verify-email',
  '/',
];

export const Redirect = ({ children }: PropsT) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect');
  const navigate = useNavigate();
  const pathName = location.pathname;
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: isAuthLoading, isSignedIn } = useAuthStore();
  const userRoles = useMemo(() => user?.role || ['MEMBER'], [user]);
  const isAuthenticated = !!user && isSignedIn;

  useEffect(() => {
    if (isAuthLoading) return;
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [isAuthLoading, pathName]);

  useEffect(() => {
    if (isAuthLoading) return;

    const currentRoute = ROUTE_ROLE.find((route) => {
      if (route.url === pathName) return true;
      if (route.url.endsWith('/*')) {
        const basePath = route.url.replace('/*', '');
        return pathName.startsWith(basePath);
      }
      return false;
    });

    if (currentRoute) {
      if (currentRoute.needAuth && !isAuthenticated) {
        navigate({ to: `/sign-in?redirect=${encodeURIComponent(pathName)}`, replace: true });
        return;
      }

      if (isAuthenticated) {
        const hasRequiredRole = currentRoute.role.some((role) =>
          userRoles.some((userRole) => userRole === role),
        );

        if (!hasRequiredRole) {
          navigate({ to: currentRoute.redirect || '/', replace: true });
          return;
        }
      }
    }
  }, [pathName, isAuthenticated, userRoles, navigate, isAuthLoading]);

  useEffect(() => {
    if (isAuthLoading || isLoading) return;
    if (isAuthenticated && pageAccessOnlyIfUnAuthenticated.includes(pathName)) {
      navigate({ to: redirectTo || '/' });
    }
  }, [isAuthenticated, pathName, redirectTo, navigate, isAuthLoading, isLoading]);

  if (isAuthLoading) {
    return <Loading label={'Loading...'} />;
  }

  return <>{children}</>;
};
