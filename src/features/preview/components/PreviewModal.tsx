import { CheckCircle2, ExternalLink, LoaderCircle, Monitor, RotateCcw, Smartphone, Sparkles, Tablet, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { useEditorStore } from '../../../store/editorStore'
import { ElementRenderer } from '../../canvas/components/ElementRenderer'
import { getElementStyle } from '../../canvas/lib/elementStyle'
import { IconButton } from '../../../components/ui/IconButton'
import { usePrototypeRuntime } from '../hooks/usePrototypeRuntime'
import { CustomSelect } from '../../../components/ui/CustomSelect'
import { ErrorState } from '../../../components/ui/ErrorState'
import { useResponsiveAssistant } from '../hooks/useResponsiveAssistant'
import { withWorkspace } from '../../studio/lib/workspaceDefaults'

const devices = {
  desktop: { width: 1200, icon: Monitor, label: 'Desktop' },
  tablet: { width: 768, icon: Tablet, label: 'Tablet' },
  mobile: { width: 390, icon: Smartphone, label: 'Mobile' },
}

export function PreviewModal() {
  const project = useEditorStore((state) => state.project)
  const activePageId = useEditorStore((state) => state.activePageId)
  const setPreviewOpen = useEditorStore((state) => state.setPreviewOpen)
  const [device, setDevice] = useState<keyof typeof devices>('desktop')
  const runtime = usePrototypeRuntime(activePageId)
  const responsive = useResponsiveAssistant()
  const page = project.pages.find((item) => item.id === runtime.pageId) ?? project.pages[0]
  const frame = useMemo(() => {
    const candidates = project.frames.filter((item) => item.pageId === page.id)
    return candidates.find((item) => item.device === device) ?? candidates[0]
  }, [device, page.id, project.frames])
  const elements = project.elements.filter((element) => element.frameId === frame?.id)
  const ratio = frame ? devices[device].width / frame.width : 1
  const hasDedicatedFrame = project.frames.some((item) => item.pageId === page.id && item.device === device)

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Website preview">
      <div className="preview-shell">
        <div className="preview-toolbar">
          <div className="preview-brand"><img src="/framewire-icon.png" alt="" /><strong>Preview</strong><span>{page.name}</span></div>
          <div className="device-picker">{Object.entries(devices).map(([key, item]) => { const Icon = item.icon; return <button key={key} className={clsx(device === key && 'is-active')} title={item.label} aria-label={item.label} onClick={() => setDevice(key as keyof typeof devices)}><Icon size={15} /></button> })}</div>
          <div className="preview-actions">
            {device !== 'desktop' && <button className="button button-responsive" disabled={responsive.loading} onClick={() => void responsive.generate(page.id, device)}>{responsive.loading ? <LoaderCircle size={14} className="spin" /> : <Sparkles size={14} />}{hasDedicatedFrame ? 'Rewrite responsive' : 'Auto responsive'}</button>}
            <CustomSelect label="Preview page" value={page.id} options={project.pages.map((item) => ({ value: item.id, label: item.name }))} onChange={runtime.setPageId} align="right" />
            <IconButton label="Reset page" onClick={() => runtime.setPageId(activePageId)}><RotateCcw size={15} /></IconButton><IconButton label="Open exported site" disabled><ExternalLink size={15} /></IconButton><IconButton label="Close preview" onClick={() => setPreviewOpen(false)}><X size={17} /></IconButton>
          </div>
        </div>
        <div className="preview-stage">
          {responsive.error && <div className="preview-notice"><ErrorState compact title="Responsive generation failed" message={responsive.error} onRetry={() => void responsive.generate(page.id, device === 'desktop' ? 'mobile' : device)} /></div>}
          {responsive.message && !responsive.error && <div className="preview-success"><CheckCircle2 size={14} />{responsive.message}</div>}
          <div className={clsx('preview-device', `is-${device}`, runtime.transition && `transition-${runtime.transition}`)} style={{ width: devices[device].width, minHeight: frame ? frame.height * ratio : 720, '--project-font': project.tokens.fontFamily } as React.CSSProperties}>
            {frame && <div className="preview-page" style={{ width: frame.width, height: frame.height, background: frame.background, transform: `scale(${ratio})`, transformOrigin: 'top left' }}>
              {elements.map((element) => {
                const definition = withWorkspace(project.workspace).components.find((item) => item.id === element.componentDefinitionId)
                const variant = definition?.variants.find((item) => item.id === (runtime.variantOverrides[element.id] ?? element.componentVariantId))
                const renderedElement = variant ? { ...element, ...variant.overrides, style: variant.overrides.style ? { ...element.style, ...variant.overrides.style } : element.style } : element
                return !runtime.hiddenIds.has(element.id) && element.visible && (
                <div
                  key={element.id}
                  data-preview-id={element.id}
                  className={clsx('preview-element', project.connections.some((item) => item.sourceId === element.id) && 'is-interactive')}
                  style={{ ...getElementStyle(renderedElement), position: 'absolute', left: renderedElement.x, top: renderedElement.y, width: renderedElement.width, height: renderedElement.height }}
                  tabIndex={project.connections.some((item) => item.sourceId === element.id) ? 0 : undefined}
                  {...runtime.handlersFor(element.id)}
                >
                  <ElementRenderer element={renderedElement} content={runtime.textOverrides[element.id]} />
                </div>
                )
              })}
            </div>}
          </div>
        </div>
      </div>
    </div>
  )
}
