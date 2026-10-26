import { Component } from 'react';
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('HRMS ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('hrms_user');
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-600 mb-4">
              The portal encountered an unexpected display error. You can reload the page or reset your session.
            </p>
            {this.state.error?.message && (
              <div className="bg-slate-100 rounded-lg p-3 text-xs text-slate-700 text-left font-mono mb-6 overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Portal
              </button>
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Reset & Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
