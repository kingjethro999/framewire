import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorState } from '../components/ui/ErrorState'
import { logger } from '../lib/logger'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('app', 'Unhandled rendering error', error, { componentStack: info.componentStack ?? '' })
  }

  render() {
    if (this.state.error) {
      return <main className="fatal-error"><img src="/framewire-icon.png" alt="Framewire" /><ErrorState title="Framewire could not open this project" message={this.state.error.message || 'An unexpected rendering error occurred.'} onRetry={() => { localStorage.removeItem('framewire-editor-v1'); location.reload() }} /></main>
    }
    return this.props.children
  }
}
