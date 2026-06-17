'use client';

import { Redirect } from '@components/redirect';
import { Toaster } from '@components/ui/sonner';
import { TooltipProvider } from '@components/ui/tooltip';

import { AuthProvider } from './auth-provider';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <Redirect>{children}</Redirect>
            <Toaster position="top-right" />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
