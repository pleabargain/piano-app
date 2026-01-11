// https://github.com/pleabargain/piano-app
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Error handling for root element
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found. Make sure index.html has a <div id="root"></div> element.')
}

// Global error handler
window.addEventListener('error', (event) => {
  console.error('[Global Error Handler] Uncaught error:', event.error);
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e195f0d9-c6a3-4271-b290-bc8c7ddcceed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:15',message:'Global error handler',data:{error:event.error?.message,stack:event.error?.stack,filename:event.filename,lineno:event.lineno},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Global Error Handler] Unhandled promise rejection:', event.reason);
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e195f0d9-c6a3-4271-b290-bc8c7ddcceed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:22',message:'Unhandled promise rejection',data:{reason:event.reason?.toString(),stack:event.reason?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
});

// Error boundary for rendering
try {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
} catch (error) {
  console.error('Failed to render app:', error)
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e195f0d9-c6a3-4271-b290-bc8c7ddcceed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:35',message:'Render failed',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  rootElement.innerHTML = `
    <div style="padding: 20px; color: red; font-family: monospace;">
      <h1>Error: Failed to render application</h1>
      <p>${error.message}</p>
      <p>Please check the browser console for more details.</p>
    </div>
  `
}
