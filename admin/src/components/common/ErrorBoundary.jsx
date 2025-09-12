import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log error for monitoring
    console.error(
      "Dashboard Error Boundary caught an error:",
      error,
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
          <div className="flex items-center mb-4">
            <i className="fas fa-exclamation-triangle text-red-500 text-xl mr-3"></i>
            <h3 className="text-lg font-semibold text-red-800">
              Something went wrong
            </h3>
          </div>

          <p className="text-red-700 mb-4">
            We encountered an error while loading the dashboard. Please try
            refreshing the page.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Refresh Page
          </button>

          {import.meta.env.DEV && (
            <details className="mt-4">
              <summary className="cursor-pointer text-red-600 font-medium">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-sm text-red-700 bg-red-100 p-3 rounded overflow-auto">
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
