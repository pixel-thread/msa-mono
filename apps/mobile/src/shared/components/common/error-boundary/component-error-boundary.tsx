import React, { ReactNode } from 'react';
import { BaseErrorBoundary } from './base-error-boundary';
import { CompactError } from './compact-error.component';

interface ErrorBoundaryProps {
  children: ReactNode;
  errorMessage?: string;
  isComponentError?: boolean;
  componentName?: string;
}

export const ErrorBoundary = ({
  children,
  errorMessage,
  isComponentError = true,
  componentName,
}: ErrorBoundaryProps) => {
  return (
    <BaseErrorBoundary
      isComponentError={isComponentError}
      name={componentName}
      fallback={({ resetError }) => <CompactError message={errorMessage} onRetry={resetError} />}>
      {children}
    </BaseErrorBoundary>
  );
};
