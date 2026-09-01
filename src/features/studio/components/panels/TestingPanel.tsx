import { useMemo } from 'react'
import { CheckCircle2, FlaskConical, LocateFixed, Play, Trash2 } from 'lucide-react'
import { useEditorStore } from '../../../../store/editorStore'
import { uid } from '../../../../lib/defaults'
import { auditProject } from '../../lib/projectAudit'
import { withWorkspace } from '../../lib/workspaceDefaults'
import { EmptyPanel, Metric, PanelHeader, SectionCard, StatusBadge } from '../PanelPrimitives'
import type { TestRun } from '../../../../types'

export function TestingPanel() {
  const state = useEditorStore()
  const workspace = withWorkspace(state.project.workspace)
  const currentIssues = useMemo(() => auditProject(state.project), [state.project])
  const run = () => {
    const testRun: TestRun = { id: uid('test'), createdAt: new Date().toISOString(), status: currentIssues.some((issue) => issue.severity === 'error') ? 'failed' : 'passed', issues: currentIssues }
    state.updateWorkspace((current) => ({ ...current, testRuns: [testRun, ...current.testRuns].slice(0, 20) }), `Ran site checks with ${currentIssues.length} findings`)
  }
  const latest = workspace.testRuns[0]
  return <div className="studio-panel">
    <PanelHeader title="Testing inside the builder" description="Run deterministic checks for overflow, layer overlap, missing destinations, accessibility, responsive coverage, page structure, and SEO readiness." actions={<button className="button button-primary" onClick={run}><Play size={14} /> Run all checks</button>} />
    <div className="studio-metrics"><Metric label="Current findings" value={currentIssues.length} /><Metric label="Errors" value={currentIssues.filter((issue) => issue.severity === 'error').length} /><Metric label="Warnings" value={currentIssues.filter((issue) => issue.severity === 'warning').length} /><Metric label="Saved runs" value={workspace.testRuns.length} /></div>
    <div className="studio-two-column"><SectionCard title="Latest run" description={latest ? new Date(latest.createdAt).toLocaleString() : 'No saved test run yet.'}>{!latest ? <EmptyPanel icon={<FlaskConical size={22} />} title="Checks have not run" description="Run all checks to create a persistent QA record." /> : <><div className="studio-inline-meta"><StatusBadge tone={latest.status === 'passed' ? 'success' : 'danger'}>{latest.status}</StatusBadge><StatusBadge>{latest.issues.length} findings</StatusBadge></div><div className="test-category-list">{[...new Set(latest.issues.map((issue) => issue.category))].map((category) => <div key={category}><strong>{category}</strong><span>{latest.issues.filter((issue) => issue.category === category).length}</span></div>)}</div></>}</SectionCard><SectionCard title="Run history" description="The newest twenty results are retained."><div className="test-run-list">{workspace.testRuns.map((item) => <div key={item.id}><span className={item.status === 'passed' ? 'run-pass' : 'run-fail'}>{item.status === 'passed' ? <CheckCircle2 size={14} /> : <FlaskConical size={14} />}</span><div><strong>{item.status === 'passed' ? 'Passed' : 'Needs attention'}</strong><small>{new Date(item.createdAt).toLocaleString()} · {item.issues.length} findings</small></div><button className="bare-icon" onClick={() => state.updateWorkspace((current) => ({ ...current, testRuns: current.testRuns.filter((runItem) => runItem.id !== item.id) }))}><Trash2 size={13} /></button></div>)}</div></SectionCard></div>
    <SectionCard title="Current findings" description="Select a finding to locate its layer on the canvas.">{!currentIssues.length ? <EmptyPanel icon={<CheckCircle2 size={22} />} title="All checks pass" description="No static issues are present in the current project." /> : <div className="issue-list">{currentIssues.map((issue) => <button key={issue.id} onClick={() => issue.elementId ? state.select([issue.elementId]) : issue.pageId && state.setActivePage(issue.pageId)}><span className={`issue-dot issue-${issue.severity}`} /><div><strong>{issue.message}</strong><small>{issue.category}</small></div><StatusBadge tone={issue.severity === 'error' ? 'danger' : issue.severity === 'warning' ? 'warning' : 'neutral'}>{issue.severity}</StatusBadge><LocateFixed size={14} /></button>)}</div>}</SectionCard>
  </div>
}
