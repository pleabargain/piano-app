// https://github.com/pleabargain/piano-app
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
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
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Global Error Handler] Unhandled promise rejection:', event.reason);
});

// Error boundary for rendering
try {
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </BrowserRouter>
    </StrictMode>,
  )
} catch (error) {
  console.error('Failed to render app:', error)
  rootElement.innerHTML = `
    <div style="padding: 20px; color: red; font-family: monospace;">
      <h1>Error: Failed to render application</h1>
      <p>${error.message}</p>
      <p>Please check the browser console for more details.</p>
    </div>
  `
}
