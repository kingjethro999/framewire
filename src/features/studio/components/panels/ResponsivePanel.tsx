import { Columns3, Grid2X2, Rows3, Smartphone, Tablet } from 'lucide-react'
import { useEditorStore } from '../../../../store/editorStore'
import { CustomSelect } from '../../../../components/ui/CustomSelect'
import { defaultLayout } from '../../lib/workspaceDefaults'
import { PanelHeader, SectionCard, StatusBadge } from '../PanelPrimitives'
import type { LayoutSettings } from '../../../../types'

const options = (values: string[]) => values.map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1).replace('-', ' ') }))

export function ResponsivePanel() {
  const state = useEditorStore()
  const selected = state.project.elements.find((element) => element.id === state.selectedIds[0])
  const layout = selected?.layout ?? defaultLayout
  const updateLayout = (changes: Partial<LayoutSettings>) => selected && state.updateElement(selected.id, { layout: { ...layout, ...changes } })
  const frames = state.project.frames.filter((frame) => frame.pageId === state.activePageId)
  return <div className="studio-panel">
    <PanelHeader title="Responsive constraints" description="Use deterministic auto layout and breakpoint rules for reliable responsive sites. AI responsive frames remain fully editable alongside these controls." actions={<div className="studio-inline-meta"><StatusBadge tone={frames.some((frame) => frame.device === 'tablet') ? 'success' : 'neutral'}><Tablet size={12} /> Tablet</StatusBadge><StatusBadge tone={frames.some((frame) => frame.device === 'mobile') ? 'success' : 'neutral'}><Smartphone size={12} /> Mobile</StatusBadge></div>} />
    <div className="studio-two-column">
      <SectionCard title="Frame auto layout" description="Arrange all visible layers in the active frame with one undoable operation.">
        <div className="layout-action-grid"><button onClick={() => state.autoArrangeFrame('row', 24)}><Columns3 size={18} /><strong>Row</strong><small>Horizontal flow</small></button><button onClick={() => state.autoArrangeFrame('column', 24)}><Rows3 size={18} /><strong>Column</strong><small>Vertical flow</small></button><button onClick={() => state.autoArrangeFrame('grid', 24, 2)}><Grid2X2 size={18} /><strong>Grid</strong><small>Two columns</small></button></div>
      </SectionCard>
      <SectionCard title="Device frames" description="Create explicit canvases for editing and source export."><div className="stacked-actions"><button className="button button-secondary" onClick={() => state.addFrame('tablet')}><Tablet size={14} /> Add tablet frame</button><button className="button button-secondary" onClick={() => state.addFrame('mobile')}><Smartphone size={14} /> Add mobile frame</button><p className="studio-help">Open Preview on tablet or mobile to let Groq rewrite the desktop layout into these device frames.</p></div></SectionCard>
    </div>
    <SectionCard title="Selected layer constraints" description={selected ? `Rules for ${selected.name}` : 'Select a layer on the canvas to edit responsive behavior.'}>
      {!selected ? <p className="studio-muted">No layer selected.</p> : <div className="studio-form-grid">
        <label><span>Layout mode</span><CustomSelect label="Layout mode" value={layout.mode} options={options(['absolute', 'flex', 'grid'])} onChange={(value) => updateLayout({ mode: value as LayoutSettings['mode'] })} /></label>
        <label><span>Direction</span><CustomSelect label="Direction" value={layout.direction} options={options(['row', 'column'])} onChange={(value) => updateLayout({ direction: value as LayoutSettings['direction'] })} /></label>
        <label><span>Width</span><CustomSelect label="Width mode" value={layout.widthMode} options={options(['fixed', 'fill', 'hug'])} onChange={(value) => updateLayout({ widthMode: value as LayoutSettings['widthMode'] })} /></label>
        <label><span>Height</span><CustomSelect label="Height mode" value={layout.heightMode} options={options(['fixed', 'fill', 'hug'])} onChange={(value) => updateLayout({ heightMode: value as LayoutSettings['heightMode'] })} /></label>
        <label><span>Horizontal constraint</span><CustomSelect label="Horizontal constraint" value={layout.constraintX} options={options(['left', 'right', 'left-right', 'center', 'scale'])} onChange={(value) => updateLayout({ constraintX: value as LayoutSettings['constraintX'] })} /></label>
        <label><span>Vertical constraint</span><CustomSelect label="Vertical constraint" value={layout.constraintY} options={options(['top', 'bottom', 'top-bottom', 'center', 'scale'])} onChange={(value) => updateLayout({ constraintY: value as LayoutSettings['constraintY'] })} /></label>
        <label><span>Gap</span><input type="number" value={layout.gap} onChange={(event) => updateLayout({ gap: Math.max(0, Number(event.target.value)) })} /></label>
        <label className="check-row"><input type="checkbox" checked={layout.wrap} onChange={(event) => updateLayout({ wrap: event.target.checked })} /><span>Wrap children</span></label>
      </div>}
    </SectionCard>
  </div>
}
