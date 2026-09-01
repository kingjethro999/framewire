/// <reference types="vite/client" />

interface Window {
  FramewirePlugins: typeof import('./features/plugins/lib/pluginRegistry').framewirePluginRegistry
}
