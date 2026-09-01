import { useState } from 'react'
import { Boxes, Plus, Shield, Trash2 } from 'lucide-react'
import { useEditorStore } from '../../../../store/editorStore'
import { uid } from '../../../../lib/defaults'
import { withWorkspace } from '../../lib/workspaceDefaults'
import { CustomSelect } from '../../../../components/ui/CustomSelect'
import { EmptyPanel, PanelHeader, SectionCard, StatusBadge } from '../PanelPrimitives'
import type { PluginManifest } from '../../../../types'

export function PluginsPanel() {
  const state = useEditorStore()
  const workspace = withWorkspace(state.project.workspace)
  const [name, setName] = useState('')
  const [slot, setSlot] = useState<PluginManifest['slot']>('component')
  const add = () => { if (!name.trim()) return; const plugin: PluginManifest = { id: uid('plugin'), name: name.trim(), description: 'Local Framewire extension manifest', version: '0.1.0', enabled: false, permissions: ['read-project'], slot }; state.updateWorkspace((current) => ({ ...current, plugins: [...current.plugins, plugin] }), `Registered plugin ${plugin.name}`); setName('') }
  return <div className="studio-panel">
    <PanelHeader title="Plugin architecture" description="Register permission-scoped extensions for components, exporters, data sources, inspector panels, and AI tools. Manifests never execute arbitrary code automatically." actions={<StatusBadge tone="brand">{workspace.plugins.filter((item) => item.enabled).length} enabled</StatusBadge>} />
    <SectionCard title="Register manifest" description="Create a disabled manifest, review permissions, then enable it explicitly."><div className="studio-inline-form"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Plugin name" /><CustomSelect label="Plugin slot" value={slot} options={[{ value: 'component', label: 'Component library' }, { value: 'exporter', label: 'Exporter' }, { value: 'data-source', label: 'Data source' }, { value: 'inspector', label: 'Inspector panel' }, { value: 'ai-tool', label: 'AI tool' }]} onChange={(value) => setSlot(value as PluginManifest['slot'])} /><button className="button button-primary" onClick={add}><Plus size={14} /> Register</button></div></SectionCard>
    {!workspace.plugins.length ? <EmptyPanel icon={<Boxes size={24} />} title="No plugins registered" description="Create a permission-scoped extension manifest." /> : <div className="studio-card-grid">{workspace.plugins.map((plugin) => <SectionCard key={plugin.id} title={plugin.name} description={plugin.description} actions={<button className="bare-icon" disabled={plugin.id.startsWith('builtin-')} onClick={() => state.updateWorkspace((current) => ({ ...current, plugins: current.plugins.filter((item) => item.id !== plugin.id) }))}><Trash2 size={13} /></button>}><div className="studio-inline-meta"><StatusBadge>{plugin.slot}</StatusBadge><StatusBadge>v{plugin.version}</StatusBadge></div><div className="permission-list">{plugin.permissions.map((permission) => <span key={permission}><Shield size={12} />{permission}</span>)}</div><label className="switch-row"><span><strong>Enabled</strong><small>Allow this manifest to contribute to its registered slot.</small></span><input type="checkbox" checked={plugin.enabled} onChange={(event) => state.updateWorkspace((current) => ({ ...current, plugins: current.plugins.map((item) => item.id === plugin.id ? { ...item, enabled: event.target.checked } : item) }), `${event.target.checked ? 'Enabled' : 'Disabled'} ${plugin.name}`)} /></label></SectionCard>)}</div>}
  </div>
}
