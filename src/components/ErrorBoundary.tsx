import React, { ReactNode, ReactElement } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches React render errors
 * Displays user-friendly error message with retry button
 *
 * @example
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught error:', error);
      console.error('Error Info:', errorInfo);
    }

    // Log to analytics service (when available)
    try {
      const analyticsService = (window as any).__analyticsService;
      if (analyticsService?.logError) {
        analyticsService.logError(error, {
          componentStack: errorInfo.componentStack,
          isCaught: true
        });
      }
    } catch (e) {
      // Silently fail if analytics not available
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // Default error UI
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa] px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              {/* Error Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              {/* Error Message */}
              <h1 className="text-2xl font-semibold text-[#202124] mb-2">
                Something went wrong
              </h1>
              <p className="text-[#5f6368] mb-6">
                We encountered an unexpected error. Please try again or contact support if the problem persists.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left bg-[#f8f9fa] rounded p-4">
                  <summary className="text-xs font-medium text-[#5f6368] cursor-pointer mb-2">
                    Error Details
                  </summary>
                  <pre className="text-xs text-red-600 overflow-auto max-h-32 font-mono">
                    {this.state.error.toString()}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              {/* Reset Button */}
              <Button
                onClick={this.handleReset}
                className="w-full bg-[#4285f4] hover:bg-[#3367d6] text-white rounded-lg h-10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              {/* Home Link */}
              <button
                onClick={() => (window.location.href = '/')}
                className="w-full mt-3 text-[#4285f4] hover:underline text-sm"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
