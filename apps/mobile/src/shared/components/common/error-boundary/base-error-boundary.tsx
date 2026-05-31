import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@src/shared/utils/logger';

interface BaseErrorBoundaryProps {
  children: ReactNode;
  fallback: (props: { error: Error | null; resetError: () => void }) => ReactNode;
  isComponentError?: boolean;
  name?: string;
}

interface BaseErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class BaseErrorBoundary extends Component<BaseErrorBoundaryProps, BaseErrorBoundaryState> {
  constructor(props: BaseErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): BaseErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { isComponentError, name } = this.props;

    // Try to identify the specific feature or component name
    const context = name || 'UnknownSource';
    const scope = isComponentError ? `Component:[${context}]` : 'GlobalBoundary';

    // logger.error(`[ErrorBoundary] ${scope} - ${error.message}`, {
    //   error: {
    //     name: error.name,
    //     message: error.message,
    //     stack: error.stack,
    //   },
    //   errorInfo: {
    //     componentStack: errorInfo.componentStack,
    //   },
    //   tags: {
    //     isComponentError,
    //     source: context,
    //   },
    // });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback({
        error: this.state.error,
        resetError: this.resetError,
      });
    }

    return this.props.children;
  }
}
