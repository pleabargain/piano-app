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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e195f0d9-c6a3-4271-b290-bc8c7ddcceed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ErrorBoundary.jsx:15',message:'Error boundary caught error',data:{error:error.message,stack:error.stack,componentStack:errorInfo.componentStack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
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
