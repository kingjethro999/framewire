import { useState } from 'react'
import { Box, GitBranch, MousePointerClick, Plus, Trash2, Variable } from 'lucide-react'
import { useEditorStore } from '../../../../store/editorStore'
import { uid } from '../../../../lib/defaults'
import { CustomSelect } from '../../../../components/ui/CustomSelect'
import { withWorkspace } from '../../lib/workspaceDefaults'
import { EmptyPanel, PanelHeader, SectionCard, StatusBadge } from '../PanelPrimitives'
import type { InteractionCondition, ProjectVariable } from '../../../../types'

export function InteractionsPanel() {
  const state = useEditorStore()
  const workspace = withWorkspace(state.project.workspace)
  const [variableName, setVariableName] = useState('')
  const addVariable = () => {
    if (!variableName.trim()) return
    const variable: ProjectVariable = { id: uid('variable'), name: variableName.trim(), type: 'string', value: '' }
    state.updateWorkspace((current) => ({ ...current, variables: [...current.variables, variable] }), `Created variable ${variable.name}`)
    setVariableName('')
  }
  const updateVariable = (id: string, changes: Partial<ProjectVariable>) => state.updateWorkspace((current) => ({ ...current, variables: current.variables.map((item) => item.id === id ? { ...item, ...changes } : item) }))
  const conditionFor = (connectionId: string, variableId: string): InteractionCondition => state.project.connections.find((item) => item.id === connectionId)?.condition ?? { variableId, operator: 'equals', value: '' }
  return <div className="studio-panel">
    <PanelHeader title="Advanced interactions" description="Use project variables and conditional branches with component states, overlays, form actions, animation, and the existing prototype triggers." actions={<StatusBadge tone="brand">{state.project.connections.length} flows</StatusBadge>} />
    <div className="studio-two-column">
      <SectionCard title="Project variables" description="Variables are available to conditions and set-variable actions."><div className="studio-inline-form"><input value={variableName} onChange={(event) => setVariableName(event.target.value)} placeholder="Variable name" /><button className="button button-primary" onClick={addVariable}><Plus size={14} /> Add</button></div><div className="variable-list">{workspace.variables.map((variable) => <div key={variable.id}><Variable size={14} /><input value={variable.name} onChange={(event) => updateVariable(variable.id, { name: event.target.value })} /><CustomSelect label={`${variable.name} type`} value={variable.type} options={[{ value: 'string', label: 'Text' }, { value: 'number', label: 'Number' }, { value: 'boolean', label: 'Boolean' }]} onChange={(type) => updateVariable(variable.id, { type: type as ProjectVariable['type'] })} /><input value={variable.value} onChange={(event) => updateVariable(variable.id, { value: event.target.value })} placeholder="Initial value" /><button className="bare-icon" aria-label={`Delete ${variable.name}`} onClick={() => state.updateWorkspace((current) => ({ ...current, variables: current.variables.filter((item) => item.id !== variable.id) }))}><Trash2 size={13} /></button></div>)}</div>{!workspace.variables.length && <p className="studio-muted">No variables defined.</p>}</SectionCard>
      <SectionCard title="Supported behavior" description="Prototype runtime and exported sites share the same interaction model."><div className="capability-list"><span><MousePointerClick size={14} /> Click, double click, hover, hold, key, submit, and in-view triggers</span><span><GitBranch size={14} /> Conditional branches using equals, contains, and numeric comparison</span><span><Box size={14} /> Navigate, overlay, visibility, variable, variant, text, form, and animation actions</span></div></SectionCard>
    </div>
    <SectionCard title="Conditional flows" description="Add a base interaction from Prototype mode, then attach an optional condition here.">
      {!state.project.connections.length ? <EmptyPanel icon={<GitBranch size={23} />} title="No prototype flows" description="Select a layer, open Prototype, and add an interaction first." /> : <div className="flow-table">{state.project.connections.map((connection, index) => {
        const variable = workspace.variables.find((item) => item.id === connection.condition?.variableId)
        const source = state.project.elements.find((item) => item.id === connection.sourceId)?.name ?? 'Layer'
        return <div className="flow-row" key={connection.id}><StatusBadge>Flow {index + 1}</StatusBadge><div><strong>{source}</strong><small>{connection.trigger} → {connection.action}</small></div><CustomSelect label="Condition variable" value={variable?.id ?? ''} placeholder="Always" options={[{ value: '', label: 'Always' }, ...workspace.variables.map((item) => ({ value: item.id, label: item.name }))]} onChange={(variableId) => state.updateConnection(connection.id, { condition: variableId ? conditionFor(connection.id, variableId) : undefined })} />{variable && <><CustomSelect label="Condition operator" value={connection.condition?.operator ?? 'equals'} options={[{ value: 'equals', label: 'Equals' }, { value: 'notEquals', label: 'Does not equal' }, { value: 'contains', label: 'Contains' }, { value: 'greaterThan', label: 'Greater than' }, { value: 'lessThan', label: 'Less than' }]} onChange={(operator) => state.updateConnection(connection.id, { condition: { ...conditionFor(connection.id, variable.id), operator: operator as InteractionCondition['operator'] } })} /><input value={connection.condition?.value ?? ''} placeholder="Compare value" onChange={(event) => state.updateConnection(connection.id, { condition: { ...conditionFor(connection.id, variable.id), value: event.target.value } })} /></>}</div>
      })}</div>}
    </SectionCard>
  </div>
}
