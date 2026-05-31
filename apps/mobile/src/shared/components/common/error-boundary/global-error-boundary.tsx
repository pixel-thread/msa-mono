import React, { ReactNode } from 'react';
import { BaseErrorBoundary } from './base-error-boundary';
import { ErrorScreen } from '../../screens/error-screen';

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

export const GlobalErrorBoundary = ({ children }: GlobalErrorBoundaryProps) => {
  return (
    <BaseErrorBoundary
      fallback={({ resetError }) => (
        <ErrorScreen
          title="Critical Error"
          message="The application encountered an unexpected problem and needs to restart."
          onRetry={resetError}
          retryText="Restart App"
        />
      )}>
      {children}
    </BaseErrorBoundary>
  );
};
