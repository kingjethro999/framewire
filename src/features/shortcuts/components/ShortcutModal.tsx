import { Keyboard, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { IconButton } from '../../../components/ui/IconButton'
import { shortcutDefinitions } from '../lib/shortcutDefinitions'

interface ShortcutModalProps { open: boolean; onClose: () => void }

const categories = ['Tools', 'Editing', 'View', 'Workspace'] as const

export function ShortcutModal({ open, onClose }: ShortcutModalProps) {
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const filtered = useMemo(() => shortcutDefinitions.filter((shortcut) => shortcut.label.toLowerCase().includes(query.toLowerCase())), [query])
  useEffect(() => { if (open) requestAnimationFrame(() => searchRef.current?.focus()) }, [open])
  if (!open) return null
  const modLabel = navigator.platform.toLowerCase().includes('mac') ? '⌘' : 'Ctrl'
  return (
    <div className="modal-backdrop shortcuts-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
      <section className="shortcut-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcut-title">
        <header><div className="shortcut-title"><span><Keyboard size={18} /></span><div><h2 id="shortcut-title">Keyboard shortcuts</h2><p>Move through Framewire without leaving the canvas.</p></div></div><IconButton label="Close shortcuts" onClick={onClose}><X size={17} /></IconButton></header>
        <div className="shortcut-search"><Search size={14} /><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search shortcuts" aria-label="Search shortcuts" /></div>
        <div className="shortcut-groups">
          {categories.map((category) => {
            const shortcuts = filtered.filter((item) => item.category === category)
            if (!shortcuts.length) return null
            return <section key={category}><h3>{category}</h3><div>{shortcuts.map((shortcut) => <div className="shortcut-row" key={shortcut.label}><span>{shortcut.label}</span><kbd>{shortcut.keys.map((key) => key === 'Mod' ? modLabel : key).join(' + ')}</kbd></div>)}</div></section>
          })}
          {!filtered.length && <div className="shortcut-empty">No matching shortcuts</div>}
        </div>
      </section>
    </div>
  )
}
