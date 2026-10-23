import { Component, ErrorInfo, ReactNode } from 'react';
import { StethoscopeLogo } from './StethoscopeLogo';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Canonify Uncaught Error Boundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '';
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#161320] text-slate-100 font-sans">
          <div className="max-w-md w-full bg-[#201c2c] border border-[#38314a] rounded-xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
            {/* Background Accent Glow */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#4c3f6b]/30 rounded-full blur-2xl pointer-events-none" />

            {/* Emblem */}
            <div className="w-14 h-14 rounded-full bg-[#322e45] border border-[#4c3f6b] mx-auto flex items-center justify-center text-violet-200 mb-4 shadow-inner">
              <StethoscopeLogo size={28} className="text-[#d3c8e8]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold mb-2">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Application Notice</span>
            </div>

            <h1 className="text-xl font-bold font-brand-serif text-white mb-2">
              Rendering Interrupted
            </h1>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              An unexpected error interrupted this view. Your cached data and preferences remain safe. You can reload the page or return to the directory overview.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#4c3f6b] hover:bg-[#5e4d84] text-white text-xs font-semibold shadow transition-all focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#272336] hover:bg-[#352f47] border border-[#38314a] text-slate-200 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <Home className="w-3.5 h-3.5 text-violet-300" aria-hidden="true" />
                <span>Return to Home</span>
              </button>
            </div>

            {this.state.error && import.meta.env.DEV && (
              <div className="mt-6 p-3 bg-[#161320] rounded border border-slate-800 text-left overflow-x-auto text-[10px] font-mono text-rose-300">
                {this.state.error.toString()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
