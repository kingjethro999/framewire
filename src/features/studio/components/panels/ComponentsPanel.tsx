import { useMemo, useState } from 'react'
import { Component, CopyPlus, Plus, Trash2, Unlink } from 'lucide-react'
import { useEditorStore } from '../../../../store/editorStore'
import { uid } from '../../../../lib/defaults'
import { withWorkspace } from '../../lib/workspaceDefaults'
import { EmptyPanel, PanelHeader, PanelSearch, SectionCard, StatusBadge } from '../PanelPrimitives'

export function ComponentsPanel() {
  const state = useEditorStore()
  const [query, setQuery] = useState('')
  const selected = state.project.elements.find((element) => element.id === state.selectedIds[0])
  const workspace = withWorkspace(state.project.workspace)
  const definitions = useMemo(() => workspace.components.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())), [workspace.components, query])

  const addVariant = (definitionId: string) => state.updateWorkspace((current) => ({ ...current, components: current.components.map((definition) => definition.id === definitionId ? { ...definition, variants: [...definition.variants, { id: uid('variant'), name: `Variant ${definition.variants.length + 1}`, propertyValues: { State: `Variant ${definition.variants.length + 1}` }, overrides: {} }] } : definition) }), 'Added a component variant')
  const removeDefinition = (definitionId: string) => state.updateWorkspace((current) => ({ ...current, components: current.components.filter((item) => item.id !== definitionId) }), 'Removed a component definition')

  return <div className="studio-panel">
    <PanelHeader title="Components and variants" description="Turn any canvas layer into a reusable master, insert linked instances, expose properties, and switch visual states." actions={<button className="button button-primary" disabled={!selected} onClick={() => selected && state.createComponentFromElement(selected.id)}><Plus size={14} /> Create from selection</button>} />
    <div className="studio-toolbar"><PanelSearch value={query} onChange={setQuery} placeholder="Search components" /><StatusBadge tone="brand">{workspace.components.length} masters</StatusBadge></div>
    {!definitions.length ? <EmptyPanel icon={<Component size={24} />} title="No reusable components yet" description="Select a layer on the canvas and create a master. Framewire adds Default, Hover, and Disabled variants automatically." /> : <div className="studio-card-grid">{definitions.map((definition) => {
      const instances = state.project.elements.filter((element) => element.componentDefinitionId === definition.id)
      return <SectionCard key={definition.id} title={definition.name} description={definition.description} actions={<button className="bare-icon" aria-label={`Delete ${definition.name}`} onClick={() => removeDefinition(definition.id)}><Trash2 size={14} /></button>}>
        <div className="studio-inline-meta"><StatusBadge>{instances.length} instances</StatusBadge><StatusBadge>{definition.variants.length} variants</StatusBadge></div>
        <div className="variant-list">{definition.variants.map((variant) => <button key={variant.id} onClick={() => selected?.componentDefinitionId === definition.id && state.applyComponentVariant(selected.id, variant.id)}><span>{variant.name}</span><small>{Object.values(variant.propertyValues).join(' · ')}</small></button>)}</div>
        <div className="studio-card-actions"><button className="button button-secondary" onClick={() => state.insertComponentInstance(definition.id)}><CopyPlus size={14} /> Insert instance</button><button className="button button-ghost" onClick={() => addVariant(definition.id)}><Plus size={14} /> Variant</button></div>
      </SectionCard>
    })}</div>}
    {selected?.componentDefinitionId && <div className="studio-sticky-action"><div><strong>{selected.name}</strong><span>Linked component instance</span></div><button className="button button-secondary" onClick={() => state.detachComponentInstance(selected.id)}><Unlink size={14} /> Detach instance</button></div>}
  </div>
}
