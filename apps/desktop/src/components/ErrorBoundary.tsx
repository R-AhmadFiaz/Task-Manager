import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error("Unhandled error in app tree:", error, info.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ error: null });
  };

  render(): React.ReactNode {
    if (this.state.error) {
      return (
        <div className="centered">
          <div className="error-boundary">
            <p className="error-boundary-title">Something went wrong</p>
            <p className="error-boundary-message">{this.state.error.message}</p>
            <button type="button" className="primary-button" onClick={this.handleRetry}>
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
