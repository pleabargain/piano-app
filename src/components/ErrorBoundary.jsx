// https://github.com/pleabargain/piano-app
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace', background: '#1a1a1a', minHeight: '100vh' }}>
          <h1>⚠️ Application Error</h1>
          <p><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
          {this.state.errorInfo && (
            <details style={{ marginTop: '20px' }}>
              <summary>Stack Trace</summary>
              <pre style={{ background: '#2a2a2a', padding: '10px', overflow: 'auto' }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
