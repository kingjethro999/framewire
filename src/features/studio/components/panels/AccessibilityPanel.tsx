import { useMemo } from 'react'
import { Accessibility, CheckCircle2, LocateFixed, ScanLine, Wand2 } from 'lucide-react'
import { useEditorStore } from '../../../../store/editorStore'
import { auditProject, suggestedFix } from '../../lib/projectAudit'
import { EmptyPanel, Metric, PanelHeader, SectionCard, StatusBadge } from '../PanelPrimitives'

export function AccessibilityPanel() {
  const state = useEditorStore()
  const issues = useMemo(() => auditProject(state.project).filter((issue) => issue.category === 'Accessibility'), [state.project])
  const errors = issues.filter((issue) => issue.severity === 'error').length
  const warnings = issues.filter((issue) => issue.severity === 'warning').length
  const fixAll = () => {
    const ids = [...new Set(issues.map((issue) => issue.elementId).filter(Boolean))] as string[]
    state.applyElementFixes(ids.flatMap((id) => { const element = state.project.elements.find((item) => item.id === id); return element ? [{ id, changes: suggestedFix(element) }] : [] }), 'Applied accessibility fixes')
  }
  return <div className="studio-panel">
    <PanelHeader title="Accessibility assistant" description="Check WCAG-oriented contrast, alternative text, control labels, semantics, touch targets, and keyboard readiness across the whole project." actions={<button className="button button-primary" disabled={!issues.length} onClick={fixAll}><Wand2 size={14} /> Apply safe fixes</button>} />
    <div className="studio-metrics"><Metric label="Errors" value={errors} /><Metric label="Warnings" value={warnings} /><Metric label="Layers checked" value={state.project.elements.length} /><Metric label="Reduced motion" value="Supported" /></div>
    <SectionCard title="Audit results" description="Safe fixes add missing labels and alt text and enlarge undersized controls. Color changes remain manual to protect brand intent.">
      {!issues.length ? <EmptyPanel icon={<CheckCircle2 size={24} />} title="No accessibility issues found" description="The current project passes Framewire’s built-in static checks." /> : <div className="issue-list">{issues.map((issue) => <button key={issue.id} onClick={() => issue.elementId && state.select([issue.elementId])}><span className={`issue-dot issue-${issue.severity}`} /><div><strong>{issue.message}</strong><small>{issue.category}</small></div><StatusBadge tone={issue.severity === 'error' ? 'danger' : 'warning'}>{issue.severity}</StatusBadge>{issue.elementId && <LocateFixed size={14} />}</button>)}</div>}
    </SectionCard>
    <div className="studio-notice"><Accessibility size={15} /><span>Preview includes visible keyboard focus. Exported pages include language, viewport, semantic tags, accessible images, and reduced-motion-compatible runtime behavior.</span><ScanLine size={15} /></div>
  </div>
}
