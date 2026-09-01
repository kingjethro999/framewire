import {
  Box, ChevronDown, ChevronRight, Columns3, CopyPlus, Eye, EyeOff, Frame,
  FileX2, Heading, Image, Layers3, LayoutDashboard, Lock, Menu, Minus, MousePointerClick,
  PanelTop, Plus, RectangleHorizontal, Rows3, Search, Smartphone, Tablet, TextCursorInput, Trash2, Type,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { useEditorStore } from '../store/editorStore'
import type { ElementType } from '../types'
import { ConfirmDialog } from './ui/ConfirmDialog'

const library: { type: ElementType; label: string; description: string; icon: typeof Type }[] = [
  { type: 'text', label: 'Text', description: 'Heading or paragraph', icon: Type },
  { type: 'button', label: 'Button', description: 'Interactive action', icon: MousePointerClick },
  { type: 'image', label: 'Image', description: 'Responsive media', icon: Image },
  { type: 'rectangle', label: 'Shape', description: 'Container or accent', icon: RectangleHorizontal },
  { type: 'input', label: 'Input', description: 'Text field', icon: TextCursorInput },
  { type: 'card', label: 'Card', description: 'Content group', icon: Box },
  { type: 'nav', label: 'Navigation', description: 'Header navigation', icon: Menu },
  { type: 'hero', label: 'Hero', description: 'Landing section', icon: PanelTop },
  { type: 'form', label: 'Form', description: 'Contact form', icon: Rows3 },
  { type: 'divider', label: 'Divider', description: 'Section separator', icon: Minus },
]

export function LeftSidebar() {
  const state = useEditorStore()
  const [query, setQuery] = useState('')
  const [pagesOpen, setPagesOpen] = useState(true)
  const [blankDialogOpen, setBlankDialogOpen] = useState(false)
  const elements = state.project.elements.filter((element) => element.frameId === state.activeFrameId)
  const selectedFrame = state.project.frames.find((frame) => frame.id === state.activeFrameId)
  const filtered = useMemo(() => library.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())), [query])

  const add = (type: ElementType) => state.addElement(type, undefined, state.activeFrameId)

  return <>
    <aside className="sidebar sidebar-left">
      <div className="segment-tabs">
        <button className={clsx(state.leftTab === 'layers' && 'is-active')} onClick={() => state.setLeftTab('layers')}><Layers3 size={14} /> Layers</button>
        <button className={clsx(state.leftTab === 'insert' && 'is-active')} onClick={() => state.setLeftTab('insert')}><Plus size={14} /> Insert</button>
      </div>

      {state.leftTab === 'insert' ? (
        <div className="sidebar-scroll">
          <div className="search-field"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search components" /></div>
          <div className="section-heading"><span>Components</span><small>{filtered.length}</small></div>
          <div className="component-grid">
            {filtered.map(({ type, label, description, icon: Icon }) => (
              <button
                key={type}
                className="component-card"
                draggable
                onDragStart={(event) => event.dataTransfer.setData('framewire/component', type)}
                onClick={() => add(type)}
              >
                <span className="component-icon"><Icon size={18} /></span>
                <strong>{label}</strong>
                <small>{description}</small>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="sidebar-scroll layer-panel">
          <div className="layer-section">
            <div className="section-heading page-heading">
              <button onClick={() => setPagesOpen(!pagesOpen)}>{pagesOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />} Pages</button>
              <div className="inline-actions"><button className="bare-icon" title="Start a blank project" aria-label="Start a blank project" onClick={() => setBlankDialogOpen(true)}><FileX2 size={14} /></button><button className="bare-icon" title="Add page" aria-label="Add page" onClick={() => state.addPage()}><Plus size={14} /></button></div>
            </div>
            {pagesOpen && state.project.pages.map((page) => (
              <div key={page.id} className={clsx('page-row', page.id === state.activePageId && 'is-active')}>
                <button className="page-select" title={`Open ${page.name}`} aria-label={`Open ${page.name}`} onClick={() => state.setActivePage(page.id)}><LayoutDashboard size={14} /></button>
                <input value={page.name} onFocus={() => state.setActivePage(page.id)} onChange={(event) => state.renamePage(page.id, event.target.value)} aria-label={`${page.name} page name`} />
                <small>/{page.slug}</small>
                <button className="bare-icon row-delete" title={`Delete ${page.name}`} aria-label={`Delete ${page.name}`} onClick={() => state.removePage(page.id)}><Trash2 size={12} /></button>
              </div>
            ))}
          </div>

          <div className="layer-section">
            <div className="section-heading"><span>Frames</span><button className="bare-icon" title="Add desktop frame" aria-label="Add desktop frame" onClick={() => state.addFrame('desktop')}><Plus size={14} /></button></div>
            {state.project.frames.filter((frame) => frame.pageId === state.activePageId).map((frame) => (
              <div key={frame.id} className={clsx('layer-row frame-row', frame.id === state.activeFrameId && 'is-active')}>
                <button className="layer-select" onClick={() => { state.select([]); useEditorStore.setState({ activeFrameId: frame.id }) }}><Frame size={14} /><span>{frame.name}</span><small>{frame.width}</small></button>
                <button className="bare-icon row-delete" title={`Delete ${frame.name}`} aria-label={`Delete ${frame.name}`} onClick={() => state.removeFrame(frame.id)}><Trash2 size={12} /></button>
              </div>
            ))}
            <div className="frame-presets">
              <button title="Desktop frame" onClick={() => state.addFrame('desktop')}><Columns3 size={14} /></button>
              <button title="Tablet frame" onClick={() => state.addFrame('tablet')}><Tablet size={14} /></button>
              <button title="Mobile frame" onClick={() => state.addFrame('mobile')}><Smartphone size={14} /></button>
            </div>
          </div>

          <div className="layer-section">
            <div className="section-heading"><span>{selectedFrame?.name ?? 'Layers'}</span><small>{elements.length}</small></div>
            {[...elements].reverse().map((element) => (
              <div key={element.id} className={clsx('layer-row', state.selectedIds.includes(element.id) && 'is-active')}>
                <button className="layer-select" onClick={() => state.select([element.id])}>
                  {element.type === 'text' ? <Heading size={14} /> : element.type === 'image' ? <Image size={14} /> : <Box size={14} />}
                  <span>{element.name}</span>
                  {element.locked && <Lock size={12} />}
                </button>
                <button className="bare-icon" title={element.visible ? 'Hide layer' : 'Show layer'} aria-label={element.visible ? 'Hide layer' : 'Show layer'} onClick={(event) => { event.stopPropagation(); state.updateElement(element.id, { visible: !element.visible }) }}>
                  {element.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
                <button className="bare-icon row-delete" title={`Delete ${element.name}`} aria-label={`Delete ${element.name}`} onClick={() => state.removeElements([element.id])}><Trash2 size={12} /></button>
              </div>
            ))}
            {!elements.length && <div className="empty-small"><CopyPlus size={20} /><span>Drop components onto this frame</span></div>}
          </div>
        </div>
      )}
    </aside>
    <ConfirmDialog open={blankDialogOpen} title="Start a blank project?" message="This removes every page, frame, layer, and prototype interaction from the current project. You can undo the change afterward." confirmLabel="Start blank" onClose={() => setBlankDialogOpen(false)} onConfirm={state.resetBlankProject} />
  </>
}
