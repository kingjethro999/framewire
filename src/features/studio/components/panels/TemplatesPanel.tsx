import { useMemo, useState } from 'react'
import { Blocks, Check, LayoutTemplate, Plus } from 'lucide-react'
import { useEditorStore } from '../../../../store/editorStore'
import { studioTemplates } from '../../lib/templates'
import { EmptyPanel, PanelHeader, PanelSearch, SectionCard, StatusBadge } from '../PanelPrimitives'

export function TemplatesPanel() {
  const state = useEditorStore()
  const [query, setQuery] = useState('')
  const [installed, setInstalled] = useState<string | null>(null)
  const templates = useMemo(() => studioTemplates.filter((item) => `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(query.toLowerCase())), [query])
  const apply = (id: string) => { const template = studioTemplates.find((item) => item.id === id); if (!template) return; state.insertPresetElements(template.elements, template.name); setInstalled(id); window.setTimeout(() => setInstalled(null), 1600) }
  return <div className="studio-panel">
    <PanelHeader title="Template marketplace" description="Install removable starter sites, sections, design recipes, and interaction patterns. Templates insert ordinary layers with no protected or hidden dependencies." actions={<StatusBadge tone="brand">Built-in library</StatusBadge>} />
    <div className="studio-toolbar"><PanelSearch value={query} onChange={setQuery} placeholder="Search templates" /><p className="studio-help">Every inserted layer can be edited, detached, or deleted immediately.</p></div>
    {!templates.length ? <EmptyPanel icon={<Blocks size={24} />} title="No matching templates" description="Try a broader search term." /> : <div className="template-grid">{templates.map((template) => <SectionCard key={template.id} title={template.name} description={template.description} actions={<StatusBadge>{template.category}</StatusBadge>}><div className="template-preview">{template.elements.slice(0, 5).map((element, index) => <span key={`${element.type}-${index}`} className={`preview-${element.type}`} />)}<LayoutTemplate size={22} /></div><div className="studio-inline-meta"><span>{template.elements.length} layers</span><button className="button button-primary" disabled={!state.activeFrameId} onClick={() => apply(template.id)}>{installed === template.id ? <Check size={14} /> : <Plus size={14} />}{installed === template.id ? 'Inserted' : 'Insert template'}</button></div></SectionCard>)}</div>}
  </div>
}
