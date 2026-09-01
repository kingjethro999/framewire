import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'
import { AppErrorBoundary } from './providers/AppErrorBoundary'
import { framewirePluginRegistry } from './features/plugins/lib/pluginRegistry'

window.FramewirePlugins = framewirePluginRegistry

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary><App /></AppErrorBoundary>
  </StrictMode>,
)
