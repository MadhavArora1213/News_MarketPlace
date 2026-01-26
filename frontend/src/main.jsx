import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global error handler for ResizeObserver errors
const resizeObserverErrHandler = (error) => {
  if (!error) return;

  const message = error.message || '';
  const stack = error.stack || '';

  // Silence "ResizeObserver loop limit exceeded" (standard harmless error)
  if (message.includes('ResizeObserver')) {
    return;
  }

  // Silence the specific null clientWidth error that's crashing the app in FloatingLines
  // This usually happens during unmounting when ResizeObserver fires one last time
  if (message.includes('clientWidth') && (stack.includes('ResizeObserver') || stack.includes('setSize'))) {
    console.warn('Caught and silenced ResizeObserver clientWidth error');
    return;
  }

  // Re-throw other errors
  throw error;
};

// Add global error handler
window.addEventListener('error', (event) => {
  resizeObserverErrHandler(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('ResizeObserver')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
