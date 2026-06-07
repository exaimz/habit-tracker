import { registerSW } from 'virtual:pwa-register'

// Automatically check for app updates every hour and register the service worker
registerSW({ immediate: true })
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
