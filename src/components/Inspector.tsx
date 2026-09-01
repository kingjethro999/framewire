import {
  AlignCenter, AlignLeft, AlignRight, Blend, Box, ChevronDown, CircleDot, Component, Eye,
  EyeOff, Link2, Lock, LockOpen, MousePointerClick, Plus, Rows3, Sparkles,
  Trash2, Workflow,
} from 'lucide-react'
import clsx from 'clsx'
import { useEditorStore } from '../store/editorStore'
import type { ActionType, CanvasElement, PrototypeConnection, TriggerType } from '../types'
import { CustomSelect, type SelectOption } from './ui/CustomSelect'
import { defaultLayout, withWorkspace } from '../features/studio/lib/workspaceDefaults'

const triggers: { value: TriggerType; label: string }[] = [
  { value: 'click', label: 'On click' }, { value: 'doubleClick', label: 'On double click' },
  { value: 'hover', label: 'On hover' }, { value: 'longPress', label: 'On long press' },
  { value: 'hold', label: 'While holding' }, { value: 'submit', label: 'On submit' },
  { value: 'keyPress', label: 'On key press' }, { value: 'inView', label: 'When visible' },
  { value: 'mouseMove', label: 'On mouse movement' }, { value: 'scrollProgress', label: 'While scrolling' },
]

const actions: { value: ActionType; label: string }[] = [
  { value: 'navigate', label: 'Navigate to' }, { value: 'openUrl', label: 'Open URL' },
  { value: 'scrollTo', label: 'Scroll to' }, { value: 'show', label: 'Show layer' },
  { value: 'hide', label: 'Hide layer' }, { value: 'toggle', label: 'Toggle layer' },
  { value: 'setText', label: 'Set text' }, { value: 'animate', label: 'Play animation' },
  { value: 'setVariable', label: 'Set variable' }, { value: 'setVariant', label: 'Set component variant' },
  { value: 'openOverlay', label: 'Open overlay' }, { value: 'closeOverlay', label: 'Close overlay' },
  { value: 'submitForm', label: 'Submit form' },
  { value: 'scrollAnimate', label: 'Scroll-linked animation' },
]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="property-field"><span>{label}</span>{children}</label>
}

function NumberField({ label, value, onChange, suffix }: { label: string; value: number; onChange: (value: number) => void; suffix?: string }) {
  return <Field label={label}><div className="input-with-suffix"><input type="number" value={Math.round(value)} onChange={(event) => onChange(Number(event.target.value))} />{suffix && <small>{suffix}</small>}</div></Field>
}

function SelectField({ label, value, options, onChange, searchable }: { label: string; value: string; options: SelectOption[]; onChange: (value: string) => void; searchable?: boolean }) {
  return <div className="property-field"><span>{label}</span><CustomSelect label={label} value={value} options={options} onChange={onChange} searchable={searchable} /></div>
}

function ConnectionEditor({ connection }: { connection: PrototypeConnection }) {
  const state = useEditorStore()
  const workspace = withWorkspace(state.project.workspace)
  const variants = workspace.components.flatMap((component) => component.variants.map((variant) => ({ value: variant.id, label: `${component.name} · ${variant.name}` })))
  const allTargets = [
    ...state.project.pages.map((page) => ({ id: state.project.frames.find((frame) => frame.pageId === page.id)?.id ?? '', label: `Page · ${page.name}` })),
    ...state.project.elements.map((element) => ({ id: element.id, label: `Layer · ${element.name}` })),
  ].filter((item) => item.id)
  return (
    <div className="interaction-card">
      <div className="interaction-header"><span><CircleDot size={13} /> Interaction</span><button className="bare-icon" title="Delete interaction" aria-label="Delete interaction" onClick={() => state.removeConnection(connection.id)}><Trash2 size={13} /></button></div>
      <SelectField label="Trigger" value={connection.trigger} options={triggers} onChange={(trigger) => state.updateConnection(connection.id, { trigger: trigger as TriggerType })} />
      <SelectField label="Action" value={connection.action} options={actions} onChange={(action) => state.updateConnection(connection.id, { action: action as ActionType })} />
      <SelectField label="Destination" value={connection.targetId} options={allTargets.map((item) => ({ value: item.id, label: item.label }))} onChange={(targetId) => state.updateConnection(connection.id, { targetId })} searchable={allTargets.length > 6} />
      {(connection.action === 'openUrl' || connection.action === 'setText' || connection.action === 'animate') && <Field label="Value"><input value={connection.value ?? ''} placeholder={connection.action === 'openUrl' ? 'https://example.com' : 'Value'} onChange={(event) => state.updateConnection(connection.id, { value: event.target.value })} /></Field>}
      {connection.action === 'setVariable' && <><SelectField label="Variable" value={connection.variableId ?? ''} options={workspace.variables.map((variable) => ({ value: variable.id, label: variable.name }))} onChange={(variableId) => state.updateConnection(connection.id, { variableId })} /><Field label="Value"><input value={connection.value ?? ''} onChange={(event) => state.updateConnection(connection.id, { value: event.target.value })} /></Field></>}
      {connection.action === 'setVariant' && <SelectField label="Variant" value={connection.variantId ?? ''} options={variants} onChange={(variantId) => state.updateConnection(connection.id, { variantId })} searchable={variants.length > 8} />}
      {connection.trigger === 'keyPress' && <Field label="Key"><input value={connection.key ?? 'Enter'} onChange={(event) => state.updateConnection(connection.id, { key: event.target.value })} /></Field>}
      <div className="property-grid"><NumberField label="Delay" value={connection.delay} suffix="ms" onChange={(delay) => state.updateConnection(connection.id, { delay: Math.max(0, delay) })} /><NumberField label="Duration" value={connection.duration} suffix="ms" onChange={(duration) => state.updateConnection(connection.id, { duration: Math.max(0, duration) })} /></div>
      <SelectField label="Transition" value={connection.transition} options={[{ value: 'instant', label: 'Instant' }, { value: 'dissolve', label: 'Dissolve' }, { value: 'slide-left', label: 'Slide left' }, { value: 'slide-right', label: 'Slide right' }, { value: 'scale', label: 'Scale' }]} onChange={(transition) => state.updateConnection(connection.id, { transition: transition as PrototypeConnection['transition'] })} />
    </div>
  )
}

function DesignPanel({ element }: { element: CanvasElement }) {
  const state = useEditorStore()
  const workspace = withWorkspace(state.project.workspace)
  const component = workspace.components.find((item) => item.id === element.componentDefinitionId)
  const update = (changes: Partial<CanvasElement>) => state.updateElement(element.id, changes)
  const updateStyle = (changes: Partial<CanvasElement['style']>) => update({ style: { ...element.style, ...changes } })
  return (
    <div className="sidebar-scroll inspector-scroll">
      <section className="property-section">
        <div className="section-heading"><span>Layer</span><div className="inline-actions"><button className="bare-icon" title={element.visible ? 'Hide' : 'Show'} aria-label={element.visible ? 'Hide' : 'Show'} onClick={() => update({ visible: !element.visible })}>{element.visible ? <Eye size={14} /> : <EyeOff size={14} />}</button><button className="bare-icon" title={element.locked ? 'Unlock' : 'Lock'} aria-label={element.locked ? 'Unlock' : 'Lock'} onClick={() => update({ locked: !element.locked })}>{element.locked ? <Lock size={14} /> : <LockOpen size={14} />}</button></div></div>
        <Field label="Name"><input value={element.name} onChange={(event) => update({ name: event.target.value })} /></Field>
        {element.type !== 'rectangle' && element.type !== 'divider' && element.type !== 'image' && <Field label="Content"><textarea rows={4} value={element.content} onChange={(event) => update({ content: event.target.value })} /></Field>}
        {element.type === 'image' && <><Field label="Image URL"><input value={element.src ?? ''} onChange={(event) => update({ src: event.target.value })} /></Field><Field label="Alt text"><input value={element.alt ?? ''} onChange={(event) => update({ alt: event.target.value })} /></Field></>}
      </section>

      {component && <section className="property-section"><div className="section-heading"><span>Component instance</span><Component size={13} /></div><Field label="Master"><input value={component.name} readOnly /></Field><SelectField label="Variant" value={element.componentVariantId ?? component.variants[0]?.id ?? ''} options={component.variants.map((variant) => ({ value: variant.id, label: variant.name }))} onChange={(variantId) => state.applyComponentVariant(element.id, variantId)} /><button className="button button-secondary wide-button" onClick={() => state.detachComponentInstance(element.id)}>Detach instance</button></section>}

      <section className="property-section"><div className="section-heading"><span>Responsive</span><Rows3 size={13} /></div><SelectField label="Width" value={(element.layout ?? defaultLayout).widthMode} options={[{ value: 'fixed', label: 'Fixed' }, { value: 'fill', label: 'Fill container' }, { value: 'hug', label: 'Hug content' }]} onChange={(widthMode) => update({ layout: { ...(element.layout ?? defaultLayout), widthMode: widthMode as NonNullable<CanvasElement['layout']>['widthMode'] } })} /><SelectField label="Height" value={(element.layout ?? defaultLayout).heightMode} options={[{ value: 'fixed', label: 'Fixed' }, { value: 'fill', label: 'Fill container' }, { value: 'hug', label: 'Hug content' }]} onChange={(heightMode) => update({ layout: { ...(element.layout ?? defaultLayout), heightMode: heightMode as NonNullable<CanvasElement['layout']>['heightMode'] } })} /><SelectField label="Semantic tag" value={element.semanticTag ?? 'div'} options={['div', 'section', 'header', 'nav', 'main', 'article', 'aside', 'footer', 'h1', 'h2', 'h3', 'p'].map((value) => ({ value, label: value }))} onChange={(semanticTag) => update({ semanticTag: semanticTag as CanvasElement['semanticTag'] })} /><Field label="ARIA label"><input value={element.ariaLabel ?? ''} placeholder={element.name} onChange={(event) => update({ ariaLabel: event.target.value })} /></Field></section>

      <section className="property-section">
        <div className="section-heading"><span>Position</span><small>px</small></div>
        <div className="property-grid"><NumberField label="X" value={element.x} onChange={(x) => update({ x })} /><NumberField label="Y" value={element.y} onChange={(y) => update({ y })} /><NumberField label="W" value={element.width} onChange={(width) => update({ width })} /><NumberField label="H" value={element.height} onChange={(height) => update({ height })} /></div>
      </section>

      <section className="property-section">
        <div className="section-heading"><span>Appearance</span><Blend size={13} /></div>
        <div className="color-row"><Field label="Fill"><input type="color" value={element.style.background === 'transparent' ? '#ffffff' : element.style.background} onChange={(event) => updateStyle({ background: event.target.value })} /></Field><input className="color-value" value={element.style.background} onChange={(event) => updateStyle({ background: event.target.value })} /></div>
        <div className="color-row"><Field label="Text"><input type="color" value={element.style.color} onChange={(event) => updateStyle({ color: event.target.value })} /></Field><input className="color-value" value={element.style.color} onChange={(event) => updateStyle({ color: event.target.value })} /></div>
        <div className="property-grid"><NumberField label="Radius" value={element.style.borderRadius} onChange={(borderRadius) => updateStyle({ borderRadius })} /><NumberField label="Opacity" value={Math.round(element.style.opacity * 100)} suffix="%" onChange={(opacity) => updateStyle({ opacity: opacity / 100 })} /></div>
        <div className="property-grid"><NumberField label="Border" value={element.style.borderWidth} onChange={(borderWidth) => updateStyle({ borderWidth })} /><NumberField label="Padding" value={element.style.padding} onChange={(padding) => updateStyle({ padding })} /></div>
      </section>

      <section className="property-section">
        <div className="section-heading"><span>Typography</span><ChevronDown size={13} /></div>
        <div className="property-grid"><NumberField label="Size" value={element.style.fontSize} onChange={(fontSize) => updateStyle({ fontSize })} /><NumberField label="Weight" value={element.style.fontWeight} onChange={(fontWeight) => updateStyle({ fontWeight })} /></div>
        <div className="alignment-control"><button className={clsx(element.style.textAlign === 'left' && 'is-active')} title="Align left" onClick={() => updateStyle({ textAlign: 'left' })}><AlignLeft size={15} /></button><button className={clsx(element.style.textAlign === 'center' && 'is-active')} title="Align center" onClick={() => updateStyle({ textAlign: 'center' })}><AlignCenter size={15} /></button><button className={clsx(element.style.textAlign === 'right' && 'is-active')} title="Align right" onClick={() => updateStyle({ textAlign: 'right' })}><AlignRight size={15} /></button></div>
      </section>
      <button className="danger-button" onClick={() => state.removeElements([element.id])}><Trash2 size={14} /> Delete layer</button>
    </div>
  )
}

function FrameDesignPanel() {
  const state = useEditorStore()
  const frame = state.project.frames.find((item) => item.id === state.activeFrameId)
  if (!frame) return null
  return <div className="sidebar-scroll inspector-scroll"><section className="property-section"><div className="section-heading"><span>Frame</span><Box size={13} /></div><Field label="Name"><input value={frame.name} onChange={(event) => state.updateFrame(frame.id, { name: event.target.value })} /></Field><div className="property-grid"><NumberField label="Width" value={frame.width} onChange={(width) => state.updateFrame(frame.id, { width })} /><NumberField label="Height" value={frame.height} onChange={(height) => state.updateFrame(frame.id, { height })} /></div><div className="color-row"><Field label="Background"><input type="color" value={frame.background} onChange={(event) => state.updateFrame(frame.id, { background: event.target.value })} /></Field><input className="color-value" value={frame.background} onChange={(event) => state.updateFrame(frame.id, { background: event.target.value })} /></div></section><section className="property-section"><div className="section-heading"><span>Project tokens</span><Sparkles size={13} /></div><p className="property-copy">AI and new components use these project-wide defaults.</p>{Object.entries(state.project.tokens).slice(0, 5).map(([key, value]) => <Field key={key} label={key[0].toUpperCase() + key.slice(1)}><input value={String(value)} readOnly /></Field>)}</section></div>
}

function PrototypePanel({ element }: { element?: CanvasElement }) {
  const state = useEditorStore()
  const outgoing = element ? state.project.connections.filter((connection) => connection.sourceId === element.id) : []
  const defaultTarget = state.project.frames.find((frame) => frame.pageId !== state.activePageId)?.id ?? state.project.elements.find((item) => item.id !== element?.id)?.id
  return <div className="sidebar-scroll inspector-scroll"><section className="property-section prototype-intro"><div className="prototype-orb"><Workflow size={18} /></div><strong>{element ? element.name : 'Select a layer'}</strong><p>{element ? 'Drag the blue node to connect layers, or add an interaction below.' : 'Choose a button, layer, or component on the canvas to create an interaction.'}</p></section>{outgoing.map((connection) => <ConnectionEditor key={connection.id} connection={connection} />)}{element && defaultTarget && <button className="button button-secondary wide-button" onClick={() => state.addConnection(element.id, defaultTarget)}><Plus size={14} /> Add interaction</button>}{element && !outgoing.length && <div className="empty-interactions"><Link2 size={20} /><span>No interactions yet</span><small>Connect this layer to a page or another layer.</small></div>}</div>
}

export function Inspector() {
  const state = useEditorStore()
  const selected = state.project.elements.find((element) => state.selectedIds[0] === element.id)
  return (
    <aside className="sidebar sidebar-right">
      <div className="segment-tabs">
        <button className={clsx(state.rightTab === 'design' && 'is-active')} onClick={() => state.setRightTab('design')}><Sparkles size={14} /> Design</button>
        <button className={clsx(state.rightTab === 'prototype' && 'is-active')} onClick={() => state.setRightTab('prototype')}><MousePointerClick size={14} /> Prototype</button>
      </div>
      {state.rightTab === 'design' ? selected ? <DesignPanel element={selected} /> : <FrameDesignPanel /> : <PrototypePanel element={selected} />}
    </aside>
  )
}
