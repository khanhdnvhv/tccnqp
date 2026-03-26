import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  /** Optional fallback UI; if not provided, default error card is shown */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // In production, you'd send this to an error tracking service
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex-1 flex items-center justify-center p-6" role="alert" aria-live="assertive">
          <div
            className="w-full max-w-md bg-card rounded-2xl border border-border p-8 text-center"
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-5" aria-hidden="true">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>

            {/* Title */}
            <h2
              id="error-boundary-title"
              className="text-foreground mb-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Đã xảy ra lỗi
            </h2>

            {/* Description */}
            <p id="error-boundary-desc" className="text-[13px] text-muted-foreground mb-6 leading-relaxed">
              Một lỗi không mong muốn đã xảy ra. Vui lòng thử tải lại trang hoặc quay về trang chủ.
            </p>

            {/* Error detail (collapsible in dev) */}
            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-[12px] text-muted-foreground cursor-pointer hover:text-muted-foreground transition-colors select-none">
                  Chi tiết lỗi
                </summary>
                <div className="mt-2 p-3 bg-surface-2 rounded-xl overflow-auto max-h-40">
                  <pre className="text-[11px] text-red-500 dark:text-red-400 whitespace-pre-wrap break-words">
                    {this.state.error.message}
                  </pre>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="text-[10px] text-muted-foreground/50 whitespace-pre-wrap break-words mt-2 pt-2 border-t border-border/30">
                      {this.state.errorInfo.componentStack.slice(0, 500)}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="flex items-center justify-center gap-3" role="group" aria-label="Hành động khắc phục lỗi">
              <button
                onClick={this.handleReset}
                aria-describedby="error-boundary-desc"
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-[13px] hover:opacity-90 transition-all active:scale-[0.98]"
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <RefreshCw className="w-4 h-4" />
                Thử lại
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] text-muted-foreground hover:bg-accent transition-colors"
              >
                <Home className="w-4 h-4" />
                Trang chủ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}