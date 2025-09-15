import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import ErrorBoundary from './ErrorBoundary'
import SimpleApp from './SimpleApp'
import './styles.css'

console.log('main.jsx is loading...')
console.log('React version:', React.version)

const rootElement = document.getElementById('root')
console.log('Root element found:', !!rootElement)

if (rootElement) {
  console.log('Creating React root...')
  const root = createRoot(rootElement)
  console.log('Rendering app...')
  
  // Switch back to full app once simple app works
  const USE_SIMPLE_APP = false
  
  root.render(
    <ErrorBoundary>
      {USE_SIMPLE_APP ? <SimpleApp /> : <App />}
    </ErrorBoundary>
  )
  
  console.log('App rendered successfully')
} else {
  console.error('Root element not found!')
}
