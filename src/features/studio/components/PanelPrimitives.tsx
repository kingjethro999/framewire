import type { ReactNode } from 'react'
import { Search } from 'lucide-react'

export function PanelHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return <header className="studio-panel-header"><div><h2>{title}</h2><p>{description}</p></div>{actions && <div className="studio-header-actions">{actions}</div>}</header>
}

export function PanelSearch({ value, onChange, placeholder = 'Search' }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="studio-search"><Search size={15} /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>
}

export function SectionCard({ title, description, actions, children }: { title: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  return <section className="studio-card"><div className="studio-card-header"><div><h3>{title}</h3>{description && <p>{description}</p>}</div>{actions}</div>{children}</section>
}

export function EmptyPanel({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return <div className="studio-empty"><span>{icon}</span><strong>{title}</strong><p>{description}</p>{action}</div>
}

export function StatusBadge({ tone = 'neutral', children }: { tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand'; children: ReactNode }) {
  return <span className={`status-badge status-${tone}`}>{children}</span>
}

export function Metric({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return <div className="studio-metric"><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</div>
}
