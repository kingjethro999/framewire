import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  compact?: boolean
}

export function ErrorState({ title = 'Something went wrong', message, onRetry, compact }: ErrorStateProps) {
  return (
    <div className={compact ? 'error-state is-compact' : 'error-state'} role="alert">
      <span className="error-state-icon"><AlertCircle size={compact ? 15 : 20} /></span>
      <div><strong>{title}</strong><p>{message}</p></div>
      {onRetry && <button className="button button-secondary" onClick={onRetry}><RefreshCw size={13} /> Retry</button>}
    </div>
  )
}
