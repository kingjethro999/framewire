import { useState } from 'react'
import { Link2, Palette, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useEditorStore } from '../../../../store/editorStore'
import { uid } from '../../../../lib/defaults'
import { withWorkspace } from '../../lib/workspaceDefaults'
import { CustomSelect } from '../../../../components/ui/CustomSelect'
import { PanelHeader, SectionCard, StatusBadge } from '../PanelPrimitives'
import type { TokenAlias } from '../../../../types'

export function DesignSystemPanel() {
  const state = useEditorStore()
  const workspace = withWorkspace(state.project.workspace)
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [category, setCategory] = useState<TokenAlias['category']>('color')
  const [replaceFrom, setReplaceFrom] = useState('')
  const [replaceTo, setReplaceTo] = useState('')
  const add = () => { if (!name.trim() || !value.trim()) return; state.updateWorkspace((current) => ({ ...current, tokenAliases: [...current.tokenAliases, { id: uid('token'), name: name.trim(), value: value.trim(), category }] }), `Created token ${name}`); setName(''); setValue('') }
  return <div className="studio-panel">
    <PanelHeader title="Design-system manager" description="Manage semantic colors, spacing, radii, shadows, typography, and breakpoints with aliases and project-wide replacement." actions={<StatusBadge tone="brand">{workspace.tokenAliases.length} tokens</StatusBadge>} />
    <div className="studio-two-column"><SectionCard title="Add token" description="Use semantic names that describe intent, not a single visual value."><div className="studio-form-stack"><CustomSelect label="Token category" value={category} options={['color', 'spacing', 'radius', 'shadow', 'type', 'breakpoint'].map((item) => ({ value: item, label: item[0].toUpperCase() + item.slice(1) }))} onChange={(next) => setCategory(next as TokenAlias['category'])} /><input value={name} onChange={(event) => setName(event.target.value)} placeholder="color.action.primary" /><input value={value} onChange={(event) => setValue(event.target.value)} placeholder="#4f5ff7 or 16px" /><button className="button button-primary" onClick={add}><Plus size={14} /> Add token</button></div></SectionCard><SectionCard title="Bulk replace" description="Replace exact style values across every canvas element in one undoable change."><div className="studio-form-stack"><input value={replaceFrom} onChange={(event) => setReplaceFrom(event.target.value)} placeholder="Existing value" /><input value={replaceTo} onChange={(event) => setReplaceTo(event.target.value)} placeholder="Replacement value" /><button className="button button-secondary" disabled={!replaceFrom || !replaceTo} onClick={() => state.replaceStyleValue(replaceFrom, replaceTo)}><RefreshCw size={14} /> Replace project-wide</button></div></SectionCard></div>
    <SectionCard title="Token library" description="Aliases can reference another token while keeping a readable public name."><div className="token-table">{workspace.tokenAliases.map((token) => <div key={token.id}><span className="token-swatch" style={{ background: token.category === 'color' ? token.value : undefined }}><Palette size={13} /></span><div><strong>{token.name}</strong><small>{token.category}</small></div><input value={token.value} onChange={(event) => state.updateWorkspace((current) => ({ ...current, tokenAliases: current.tokenAliases.map((item) => item.id === token.id ? { ...item, value: event.target.value } : item) }))} /><span><Link2 size={12} />{token.aliasOf ? workspace.tokenAliases.find((item) => item.id === token.aliasOf)?.name : 'Direct value'}</span><button className="bare-icon" aria-label={`Delete ${token.name}`} onClick={() => state.updateWorkspace((current) => ({ ...current, tokenAliases: current.tokenAliases.filter((item) => item.id !== token.id) }))}><Trash2 size={13} /></button></div>)}</div></SectionCard>
  </div>
}
