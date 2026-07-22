import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("InkReal ErrorBoundary caught:", error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <h1 className="mb-2 font-serif text-2xl font-semibold text-ink-100">
              Something went wrong
            </h1>
            <p className="mb-2 text-sm text-ink-400">
              An unexpected error occurred while rendering InkReal.
            </p>
            {this.state.error && (
              <pre className="mb-6 overflow-x-auto rounded-lg border border-ink-800 bg-ink-900 p-4 text-left text-xs text-ink-400">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 rounded-lg bg-accent-400 px-6 py-3 font-medium text-ink-950 transition-colors hover:bg-accent-500"
            >
              <RefreshCw className="h-4 w-4" />
              Reload InkReal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
