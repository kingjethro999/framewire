import { ExternalLink, Monitor, RotateCcw, Smartphone, Tablet, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { useEditorStore } from '../../../store/editorStore'
import { ElementRenderer } from '../../canvas/components/ElementRenderer'
import { getElementStyle } from '../../canvas/lib/elementStyle'
import { IconButton } from '../../../components/ui/IconButton'
import { usePrototypeRuntime } from '../hooks/usePrototypeRuntime'

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
  const page = project.pages.find((item) => item.id === runtime.pageId) ?? project.pages[0]
  const frame = useMemo(() => {
    const candidates = project.frames.filter((item) => item.pageId === page.id)
    return candidates.find((item) => item.device === device) ?? candidates[0]
  }, [device, page.id, project.frames])
  const elements = project.elements.filter((element) => element.frameId === frame?.id)
  const ratio = frame ? devices[device].width / frame.width : 1

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Website preview">
      <div className="preview-shell">
        <div className="preview-toolbar">
          <div className="preview-brand"><img src="/framewire-icon.png" alt="" /><strong>Preview</strong><span>{page.name}</span></div>
          <div className="device-picker">{Object.entries(devices).map(([key, item]) => { const Icon = item.icon; return <button key={key} className={clsx(device === key && 'is-active')} title={item.label} aria-label={item.label} onClick={() => setDevice(key as keyof typeof devices)}><Icon size={15} /></button> })}</div>
          <div className="preview-actions"><select value={page.id} onChange={(event) => runtime.setPageId(event.target.value)}>{project.pages.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><IconButton label="Reset page" onClick={() => runtime.setPageId(activePageId)}><RotateCcw size={15} /></IconButton><IconButton label="Open exported site" disabled><ExternalLink size={15} /></IconButton><IconButton label="Close preview" onClick={() => setPreviewOpen(false)}><X size={17} /></IconButton></div>
        </div>
        <div className="preview-stage">
          <div className={clsx('preview-device', `is-${device}`, runtime.transition && `transition-${runtime.transition}`)} style={{ width: devices[device].width, minHeight: frame ? frame.height * ratio : 720, '--project-font': project.tokens.fontFamily } as React.CSSProperties}>
            {frame && <div className="preview-page" style={{ width: frame.width, height: frame.height, background: frame.background, transform: `scale(${ratio})`, transformOrigin: 'top left' }}>
              {elements.map((element) => !runtime.hiddenIds.has(element.id) && element.visible && (
                <div
                  key={element.id}
                  data-preview-id={element.id}
                  className={clsx('preview-element', project.connections.some((item) => item.sourceId === element.id) && 'is-interactive')}
                  style={{ ...getElementStyle(element), position: 'absolute', left: element.x, top: element.y, width: element.width, height: element.height }}
                  tabIndex={project.connections.some((item) => item.sourceId === element.id) ? 0 : undefined}
                  {...runtime.handlersFor(element.id)}
                >
                  <ElementRenderer element={element} content={runtime.textOverrides[element.id]} />
                </div>
              ))}
            </div>}
          </div>
        </div>
      </div>
    </div>
  )
}
