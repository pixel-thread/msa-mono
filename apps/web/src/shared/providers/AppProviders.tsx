'use client';

import { Redirect } from '@components/Redirect';
import { Toaster } from '@components/ui/sonner';
import { TooltipProvider } from '@components/ui/tooltip';

import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';
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
