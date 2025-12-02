import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Error handling for root element
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found. Make sure index.html has a <div id="root"></div> element.')
}

// Error boundary for rendering
try {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
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
