import { Check, ChevronDown, Search } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'

export interface SelectOption {
  value: string
  label: string
  description?: string
  group?: string
}

interface CustomSelectProps {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  label: string
  placeholder?: string
  searchable?: boolean
  disabled?: boolean
  align?: 'left' | 'right'
}

export function CustomSelect({ value, options, onChange, label, placeholder = 'Select an option', searchable, disabled, align = 'left' }: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const showSearch = searchable ?? options.length > 8
  const selected = options.find((option) => option.value === value)
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return options
    return options.filter((option) => `${option.label} ${option.description ?? ''} ${option.group ?? ''}`.toLowerCase().includes(normalized))
  }, [options, query])

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value)))
    if (showSearch) requestAnimationFrame(() => searchRef.current?.focus())
  }, [open, options, showSearch, value])

  const choose = (option: SelectOption) => {
    onChange(option.value)
    setOpen(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); return }
    if (event.key === 'ArrowDown') { event.preventDefault(); if (!open) setOpen(true); else setActiveIndex((index) => Math.min(index + 1, filtered.length - 1)); return }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((index) => Math.max(index - 1, 0)); return }
    if (event.key === 'Enter' && open && filtered[activeIndex]) { event.preventDefault(); choose(filtered[activeIndex]) }
  }

  return (
    <div ref={rootRef} className="custom-select" onKeyDown={handleKeyDown}>
      <button
        type="button"
        className={clsx('custom-select-trigger', open && 'is-open')}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected?.label ?? placeholder}</span><ChevronDown size={13} />
      </button>
      {open && (
        <div className={clsx('custom-select-popover', align === 'right' && 'align-right')}>
          {showSearch && <div className="select-search"><Search size={13} /><input ref={searchRef} value={query} onChange={(event) => { setQuery(event.target.value); setActiveIndex(0) }} placeholder="Search options" aria-label={`Search ${label}`} /></div>}
          <div id={listId} className="custom-select-list" role="listbox" aria-label={label}>
            {filtered.map((option, index) => (
              <button
                type="button"
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                className={clsx('custom-select-option', index === activeIndex && 'is-active', option.value === value && 'is-selected')}
                onPointerMove={() => setActiveIndex(index)}
                onClick={() => choose(option)}
              >
                <span>{option.label}{option.description && <small>{option.description}</small>}</span>
                {option.value === value && <Check size={13} />}
              </button>
            ))}
            {!filtered.length && <div className="select-empty">No matching options</div>}
          </div>
        </div>
      )}
    </div>
  )
}
