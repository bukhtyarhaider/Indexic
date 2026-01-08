import * as React from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  readonly state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
    window.location.href = "/";
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full glass rounded-3xl p-8 text-center border border-white/5">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h2 className="text-2xl font-display font-bold text-white mb-3">
              Something went wrong
            </h2>

            <p className="text-text-secondary mb-2">
              We encountered an unexpected error. Please try refreshing the
              page.
            </p>

            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-text-secondary cursor-pointer hover:text-primary transition-colors">
                  Error details
                </summary>
                <pre className="mt-2 p-3 bg-surface/40 rounded-lg text-xs text-red-400 overflow-auto border border-red-900/20">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              className="mt-6 w-full px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-all shadow-glow"
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
