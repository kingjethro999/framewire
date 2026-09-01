import { useState } from 'react'
import { GitBranch, History, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useEditorStore } from '../../../../store/editorStore'
import { useStudioStore } from '../../store/studioStore'
import { ConfirmDialog } from '../../../../components/ui/ConfirmDialog'
import { EmptyPanel, Metric, PanelHeader, SectionCard, StatusBadge } from '../PanelPrimitives'

export function HistoryPanel() {
  const state = useEditorStore()
  const studio = useStudioStore()
  const [name, setName] = useState('')
  const [branch, setBranch] = useState('main')
  const [restoreId, setRestoreId] = useState<string | null>(null)
  const restoring = studio.versions.find((version) => version.id === restoreId)
  const create = () => { studio.createVersion(state.project, name.trim() || `Version ${studio.versions.length + 1}`, branch.trim() || 'main'); setName('') }
  return <div className="studio-panel">
    <PanelHeader title="Version history" description="Create named snapshots, branch experiments, compare structural changes, and restore safely. Framewire keeps the twelve newest versions to bound memory usage." />
    <div className="studio-metrics"><Metric label="Snapshots" value={studio.versions.length} detail="12 maximum" /><Metric label="Undo states" value={state.past.length} detail="Current session" /><Metric label="Project version" value={state.project.version} /></div>
    <SectionCard title="Create snapshot" description="Record the current pages, layouts, interactions, and project systems."><div className="studio-inline-form"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Version name" /><input value={branch} onChange={(event) => setBranch(event.target.value)} placeholder="Branch" /><button className="button button-primary" onClick={create}><Plus size={14} /> Save snapshot</button></div></SectionCard>
    {!studio.versions.length ? <EmptyPanel icon={<History size={24} />} title="No saved versions" description="Create a snapshot before a major redesign or AI operation." /> : <div className="version-list">{studio.versions.map((version) => {
      const pageDelta = state.project.pages.length - version.document.pages.length
      const layerDelta = state.project.elements.length - version.document.elements.length
      return <div className="version-row" key={version.id}><span className="version-icon"><GitBranch size={15} /></span><div><strong>{version.name}</strong><small>{new Date(version.createdAt).toLocaleString()} · {version.branch}</small></div><div className="version-deltas"><StatusBadge tone={pageDelta ? 'warning' : 'neutral'}>{pageDelta >= 0 ? '+' : ''}{pageDelta} pages</StatusBadge><StatusBadge tone={layerDelta ? 'warning' : 'neutral'}>{layerDelta >= 0 ? '+' : ''}{layerDelta} layers</StatusBadge>{!version.assetsIncluded && <StatusBadge tone="warning">Asset payloads omitted</StatusBadge>}</div><button className="bare-icon" aria-label={`Restore ${version.name}`} onClick={() => setRestoreId(version.id)}><RotateCcw size={14} /></button><button className="bare-icon" aria-label={`Delete ${version.name}`} onClick={() => studio.removeVersion(version.id)}><Trash2 size={14} /></button></div>
    })}</div>}
    <ConfirmDialog open={Boolean(restoring)} title={`Restore ${restoring?.name ?? 'version'}?`} message="The current project will be placed in undo history before this version is restored." confirmLabel="Restore version" onClose={() => setRestoreId(null)} onConfirm={() => { if (restoring) state.replaceProject(restoring.document); setRestoreId(null) }} />
  </div>
}
