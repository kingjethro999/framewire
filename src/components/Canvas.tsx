import { useEffect, useMemo, useRef, useState } from 'react'
import { Rnd } from 'react-rnd'
import { Check, Grid3X3, LocateFixed, Minus, Plus } from 'lucide-react'
import clsx from 'clsx'
import { useEditorStore } from '../store/editorStore'
import type { CanvasElement, ElementType, Frame } from '../types'
import { IconButton } from './ui/IconButton'
import { ElementRenderer } from '../features/canvas/components/ElementRenderer'
import { getElementStyle } from '../features/canvas/lib/elementStyle'

function ConnectionLines({ frames, elements }: { frames: Frame[]; elements: CanvasElement[] }) {
  const connections = useEditorStore((state) => state.project.connections)
  const mode = useEditorStore((state) => state.mode)
  if (mode !== 'prototype') return null

  const point = (id: string, source: boolean) => {
    const element = elements.find((item) => item.id === id)
    if (element) {
      const frame = frames.find((item) => item.id === element.frameId)
      if (!frame) return null
      return { x: frame.x + element.x + (source ? element.width : 0), y: frame.y + element.y + element.height / 2 }
    }
    const frame = frames.find((item) => item.id === id)
    return frame ? { x: frame.x, y: frame.y + frame.height / 2 } : null
  }

  return (
    <svg className="connection-layer">
      <defs><marker id="prototype-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#4f5ff7" /></marker></defs>
      {connections.map((connection) => {
        const from = point(connection.sourceId, true)
        const to = point(connection.targetId, false)
        if (!from || !to) return null
        const distance = Math.max(80, Math.abs(to.x - from.x) * .5)
        const path = `M ${from.x} ${from.y} C ${from.x + distance} ${from.y}, ${to.x - distance} ${to.y}, ${to.x} ${to.y}`
        return <g key={connection.id}><path d={path} className="prototype-path-hit" /><path d={path} className="prototype-path" markerEnd="url(#prototype-arrow)" /></g>
      })}
    </svg>
  )
}

export function Canvas() {
  const state = useEditorStore()
  const viewportRef = useRef<HTMLDivElement>(null)
  const [prototypeSource, setPrototypeSource] = useState<string | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0, originX: 0, originY: 0 })
  const frames = state.project.frames.filter((frame) => frame.pageId === state.activePageId)
  const frameIds = frames.map((frame) => frame.id)
  const elements = state.project.elements.filter((element) => frameIds.includes(element.frameId))

  useEffect(() => {
    if (state.mode !== 'prototype') setPrototypeSource(null)
  }, [state.mode])

  const snap = (value: number) => state.snapToGrid ? Math.round(value / state.gridSize) * state.gridSize : value

  const onDrop = (event: React.DragEvent, frame: Frame) => {
    event.preventDefault()
    const type = event.dataTransfer.getData('framewire/component') as ElementType
    if (!type) return
    const rect = event.currentTarget.getBoundingClientRect()
    state.addElement(type, { x: snap((event.clientX - rect.left) / state.zoom), y: snap((event.clientY - rect.top) / state.zoom) }, frame.id)
  }

  const handleElementClick = (event: React.MouseEvent, elementId: string) => {
    event.stopPropagation()
    if (state.mode === 'prototype' && prototypeSource && prototypeSource !== elementId) {
      state.addConnection(prototypeSource, elementId)
      setPrototypeSource(null)
      state.select([prototypeSource])
      return
    }
    state.select(event.shiftKey ? [...new Set([...state.selectedIds, elementId])] : [elementId])
  }

  const handleCanvasPointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0 || (state.mode !== 'hand' && !event.altKey)) return
    setIsPanning(true)
    panStart.current = { x: event.clientX, y: event.clientY, originX: state.pan.x, originY: state.pan.y }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const handleCanvasPointerMove = (event: React.PointerEvent) => {
    if (!isPanning) return
    state.setPan({ x: panStart.current.originX + event.clientX - panStart.current.x, y: panStart.current.originY + event.clientY - panStart.current.y })
  }

  const viewportStyle = useMemo(() => ({
    '--canvas-pan-x': `${state.pan.x}px`, '--canvas-pan-y': `${state.pan.y}px`, '--canvas-zoom': state.zoom,
    '--project-font': state.project.tokens.fontFamily,
  }) as React.CSSProperties, [state.pan, state.zoom, state.project.tokens.fontFamily])

  return (
    <main
      ref={viewportRef}
      className={clsx('canvas-viewport', isPanning && 'is-panning', state.mode === 'hand' && 'cursor-hand')}
      style={viewportStyle}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={() => setIsPanning(false)}
      onPointerCancel={() => setIsPanning(false)}
      onClick={() => { state.select([]); setPrototypeSource(null) }}
      onWheel={(event) => {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          state.setZoom(state.zoom * (event.deltaY > 0 ? .92 : 1.08))
        }
      }}
    >
      <div className="canvas-world" style={{ transform: `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.zoom})` }}>
        <ConnectionLines frames={frames} elements={elements} />
        {frames.map((frame) => {
          const frameElements = elements.filter((element) => element.frameId === frame.id)
          return (
            <section key={frame.id} className={clsx('canvas-frame-wrap', state.activeFrameId === frame.id && 'is-active')} style={{ left: frame.x, top: frame.y, width: frame.width }}>
              <div className="frame-label"><span>{frame.name}</span><small>{frame.width} × {frame.height}</small></div>
              <div
                className="canvas-frame"
                style={{ width: frame.width, height: frame.height, background: frame.background }}
                onClick={(event) => {
                  if (event.currentTarget === event.target) {
                    event.stopPropagation()
                    useEditorStore.setState({ activeFrameId: frame.id, selectedIds: [] })
                    if (state.mode === 'text' || state.mode === 'rectangle') {
                      const rect = event.currentTarget.getBoundingClientRect()
                      state.addElement(state.mode, { x: snap((event.clientX - rect.left) / state.zoom), y: snap((event.clientY - rect.top) / state.zoom) }, frame.id)
                    }
                  }
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => onDrop(event, frame)}
              >
                {frameElements.map((element) => element.visible && (
                  <Rnd
                    key={element.id}
                    bounds="parent"
                    position={{ x: element.x, y: element.y }}
                    size={{ width: element.width, height: element.height }}
                    scale={state.zoom}
                    disableDragging={element.locked || state.mode === 'hand' || state.mode === 'prototype'}
                    enableResizing={!element.locked && state.mode === 'select' && state.selectedIds.includes(element.id)}
                    dragGrid={state.snapToGrid ? [state.gridSize, state.gridSize] : undefined}
                    resizeGrid={state.snapToGrid ? [state.gridSize, state.gridSize] : undefined}
                    onDragStop={(_, data) => state.updateElement(element.id, { x: snap(data.x), y: snap(data.y) })}
                    onResizeStop={(_, __, ref, ___, position) => state.updateElement(element.id, { width: snap(ref.offsetWidth), height: snap(ref.offsetHeight), x: snap(position.x), y: snap(position.y) })}
                    className={clsx('canvas-element', state.selectedIds.includes(element.id) && 'is-selected', state.mode === 'prototype' && 'prototype-element')}
                    style={getElementStyle(element)}
                    onClick={(event: React.MouseEvent) => handleElementClick(event, element.id)}
                  >
                    <ElementRenderer element={element} />
                    {state.mode === 'prototype' && state.selectedIds.includes(element.id) && (
                      <button
                        className={clsx('prototype-node', prototypeSource === element.id && 'is-connecting')}
                        title="Create interaction"
                        aria-label="Create interaction"
                        onClick={(event) => { event.stopPropagation(); setPrototypeSource(element.id) }}
                      ><span /></button>
                    )}
                  </Rnd>
                ))}
                {prototypeSource && <div className="prototype-hint"><Check size={13} /> Select a destination</div>}
              </div>
            </section>
          )
        })}
      </div>

      <div className="canvas-controls" onPointerDown={(event) => event.stopPropagation()}>
        <IconButton label="Zoom out" onClick={() => state.setZoom(state.zoom - .1)}><Minus size={14} /></IconButton>
        <button className="zoom-value" onClick={() => state.setZoom(1)}>{Math.round(state.zoom * 100)}%</button>
        <IconButton label="Zoom in" onClick={() => state.setZoom(state.zoom + .1)}><Plus size={14} /></IconButton>
        <span className="tool-divider" />
        <IconButton label="Center canvas" onClick={() => state.setPan({ x: 0, y: 0 })}><LocateFixed size={14} /></IconButton>
        <IconButton label="Snap to grid" active={state.snapToGrid} onClick={() => state.setSnapToGrid(!state.snapToGrid)}><Grid3X3 size={14} /></IconButton>
      </div>
    </main>
  )
}
