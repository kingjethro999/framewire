import { useState } from 'react'
import { CloudUpload, ExternalLink, RefreshCw, Rocket, RotateCcw } from 'lucide-react'
import { useEditorStore } from '../../../../store/editorStore'
import { uid } from '../../../../lib/defaults'
import { withWorkspace } from '../../lib/workspaceDefaults'
import { ErrorState } from '../../../../components/ui/ErrorState'
import { CustomSelect } from '../../../../components/ui/CustomSelect'
import { EmptyPanel, PanelHeader, SectionCard, StatusBadge } from '../PanelPrimitives'
import type { DeploymentRecord, DeploymentSettings } from '../../../../types'

export function DeployPanel() {
  const state = useEditorStore()
  const workspace = withWorkspace(state.project.workspace)
  const settings = workspace.deploymentSettings
  const [environment, setEnvironment] = useState<'preview' | 'production'>('preview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const updateSettings = (changes: Partial<DeploymentSettings>) => state.updateWorkspace((current) => ({ ...current, deploymentSettings: { ...current.deploymentSettings, ...changes } }))
  const deploy = async (restoreId?: string) => {
    setLoading(true); setError(null)
    try {
      const response = await fetch('/api/vercel-deploy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project: state.project, settings, environment, restoreDeploymentId: restoreId }) })
      const body = await response.json() as { id?: string; url?: string; status?: string; error?: string }
      if (!response.ok || !body.id) throw new Error(body.error || 'Vercel rejected the deployment.')
      const record: DeploymentRecord = { id: uid('deployment'), providerId: body.id, environment, status: body.status === 'READY' ? 'ready' : 'building', url: body.url ? `https://${body.url}` : undefined, createdAt: new Date().toISOString() }
      state.updateWorkspace((current) => ({ ...current, deployments: [record, ...current.deployments].slice(0, 30) }), `${restoreId ? 'Restored' : 'Created'} ${environment} deployment`)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Deployment failed.') } finally { setLoading(false) }
  }
  const refresh = async (record: DeploymentRecord) => {
    if (!record.providerId) return
    try {
      const response = await fetch(`/api/vercel-deploy?id=${encodeURIComponent(record.providerId)}&teamId=${encodeURIComponent(settings.teamId)}`)
      const body = await response.json() as { status?: string; url?: string; error?: string }
      if (!response.ok) throw new Error(body.error || 'Status could not be refreshed.')
      state.updateWorkspace((current) => ({ ...current, deployments: current.deployments.map((item) => item.id === record.id ? { ...item, status: body.status === 'READY' ? 'ready' : body.status === 'ERROR' ? 'failed' : 'building', url: body.url ? `https://${body.url}` : item.url } : item) }))
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Status could not be refreshed.') }
  }
  return <div className="studio-panel">
    <PanelHeader title="Deployment workflow" description="Ship self-contained static deployments to Vercel preview or production environments, track status, open releases, and restore a previous deployment by redeploying it." actions={<button className="button button-primary" disabled={loading || !settings.projectName || !state.project.pages.length} onClick={() => void deploy()}>{loading ? <RefreshCw className="spin" size={14} /> : <Rocket size={14} />} {loading ? 'Deploying' : 'Deploy now'}</button>} />
    {error && <ErrorState compact title="Deployment failed" message={error} onRetry={() => void deploy()} />}
    <div className="studio-two-column"><SectionCard title="Vercel project" description="The access token stays server-side in VERCEL_TOKEN. Team ID is optional for personal projects."><div className="studio-form-stack"><label><span>Project name</span><input value={settings.projectName} onChange={(event) => updateSettings({ projectName: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} placeholder="framewire-site" /></label><label><span>Team ID</span><input value={settings.teamId} onChange={(event) => updateSettings({ teamId: event.target.value })} placeholder="Optional team_…" /></label><label><span>Production branch</span><input value={settings.productionBranch} onChange={(event) => updateSettings({ productionBranch: event.target.value })} /></label><label><span>Custom domain</span><input value={settings.customDomain} onChange={(event) => updateSettings({ customDomain: event.target.value })} placeholder="www.example.com" /></label></div></SectionCard><SectionCard title="Release target" description="Preview creates an isolated URL. Production assigns the project’s production aliases."><CustomSelect label="Deployment environment" value={environment} options={[{ value: 'preview', label: 'Preview' }, { value: 'production', label: 'Production' }]} onChange={(value) => setEnvironment(value as typeof environment)} /><div className="deploy-summary"><CloudUpload size={22} /><div><strong>{state.project.pages.length} pages · {state.project.elements.length} layers</strong><p>HTML, CSS, runtime, robots.txt, sitemap.xml, redirect rules, and project metadata will be generated server-side.</p></div></div></SectionCard></div>
    <SectionCard title="Deployment history" description="The newest thirty releases are stored locally with the project.">{!workspace.deployments.length ? <EmptyPanel icon={<CloudUpload size={23} />} title="No deployments" description="Set a project name and create a preview release." /> : <div className="deployment-list">{workspace.deployments.map((record) => <div key={record.id}><span className={`deploy-state deploy-${record.status}`} /><div><strong>{record.environment}</strong><small>{new Date(record.createdAt).toLocaleString()} · {record.providerId ?? 'Pending provider ID'}</small></div><StatusBadge tone={record.status === 'ready' ? 'success' : record.status === 'failed' ? 'danger' : 'warning'}>{record.status}</StatusBadge>{record.url && <a className="bare-icon" href={record.url} target="_blank" rel="noreferrer" aria-label="Open deployment"><ExternalLink size={14} /></a>}<button className="bare-icon" onClick={() => void refresh(record)} aria-label="Refresh deployment"><RefreshCw size={14} /></button><button className="bare-icon" disabled={!record.providerId} onClick={() => void deploy(record.providerId)} aria-label="Restore deployment"><RotateCcw size={14} /></button></div>)}</div>}</SectionCard>
  </div>
}
