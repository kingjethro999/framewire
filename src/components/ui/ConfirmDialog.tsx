import { AlertTriangle, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { IconButton } from './IconButton'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onClose }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => cancelRef.current?.focus())
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [onClose, open])
  if (!open) return null
  return (
    <div className="modal-backdrop confirm-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
      <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
        <div className="confirm-icon"><AlertTriangle size={19} /></div>
        <div className="confirm-copy"><h2 id="confirm-title">{title}</h2><p id="confirm-message">{message}</p></div>
        <IconButton label="Close" className="confirm-close" onClick={onClose}><X size={16} /></IconButton>
        <div className="confirm-actions"><button ref={cancelRef} className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-danger" onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</button></div>
      </section>
    </div>
  )
}
