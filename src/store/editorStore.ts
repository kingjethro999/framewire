import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createElement, initialProject, uid } from '../lib/defaults'
import type { AiOperation, CanvasElement, EditorMode, ElementType, Frame, ProjectDocument, PrototypeConnection } from '../types'

interface EditorState {
  project: ProjectDocument
  past: ProjectDocument[]
  future: ProjectDocument[]
  selectedIds: string[]
  activePageId: string
  activeFrameId: string
  mode: EditorMode
  zoom: number
  pan: { x: number; y: number }
  snapToGrid: boolean
  gridSize: number
  theme: 'light' | 'dark'
  leftTab: 'layers' | 'insert'
  rightTab: 'design' | 'prototype'
  aiOpen: boolean
  previewOpen: boolean
  setMode: (mode: EditorMode) => void
  setZoom: (zoom: number) => void
  setPan: (pan: { x: number; y: number }) => void
  setTheme: (theme: 'light' | 'dark') => void
  setLeftTab: (tab: 'layers' | 'insert') => void
  setRightTab: (tab: 'design' | 'prototype') => void
  setAiOpen: (open: boolean) => void
  setPreviewOpen: (open: boolean) => void
  setSnapToGrid: (value: boolean) => void
  select: (ids: string[]) => void
  setActivePage: (pageId: string) => void
  renameProject: (name: string) => void
  addElement: (type: ElementType, position?: { x: number; y: number }, frameId?: string) => string
  updateElement: (id: string, changes: Partial<CanvasElement>, transient?: boolean) => void
  removeElements: (ids: string[]) => void
  duplicateElements: (ids: string[]) => void
  addPage: (name?: string) => void
  renamePage: (id: string, name: string) => void
  removePage: (id: string) => void
  addFrame: (device: Frame['device']) => void
  updateFrame: (id: string, changes: Partial<Frame>) => void
  addConnection: (sourceId: string, targetId: string) => string
  updateConnection: (id: string, changes: Partial<PrototypeConnection>) => void
  removeConnection: (id: string) => void
  applyOperations: (operations: AiOperation[]) => void
  replaceProject: (project: ProjectDocument) => void
  undo: () => void
  redo: () => void
}

const clone = (project: ProjectDocument): ProjectDocument => structuredClone(project)
const touch = (project: ProjectDocument) => ({ ...project, updatedAt: new Date().toISOString() })
const MAX_HISTORY = 30

const commit = (state: EditorState, project: ProjectDocument) => ({
  project: touch(project),
  past: [...state.past.slice(-(MAX_HISTORY - 1)), clone(state.project)],
  future: [],
})

export const useEditorStore = create<EditorState>()(persist((set, get) => ({
  project: initialProject,
  past: [],
  future: [],
  selectedIds: [],
  activePageId: initialProject.pages[0].id,
  activeFrameId: initialProject.frames[0].id,
  mode: 'select',
  zoom: 0.72,
  pan: { x: 0, y: 0 },
  snapToGrid: true,
  gridSize: 8,
  theme: 'light',
  leftTab: 'layers',
  rightTab: 'design',
  aiOpen: false,
  previewOpen: false,
  setMode: (mode) => set({ mode, rightTab: mode === 'prototype' ? 'prototype' : get().rightTab }),
  setZoom: (zoom) => set({ zoom: Math.max(.25, Math.min(2, zoom)) }),
  setPan: (pan) => set({ pan }),
  setTheme: (theme) => set({ theme }),
  setLeftTab: (leftTab) => set({ leftTab }),
  setRightTab: (rightTab) => set({ rightTab, mode: rightTab === 'prototype' ? 'prototype' : get().mode }),
  setAiOpen: (aiOpen) => set({ aiOpen }),
  setPreviewOpen: (previewOpen) => set({ previewOpen }),
  setSnapToGrid: (snapToGrid) => set({ snapToGrid }),
  select: (selectedIds) => set({ selectedIds }),
  setActivePage: (activePageId) => {
    const frame = get().project.frames.find((item) => item.pageId === activePageId)
    set({ activePageId, activeFrameId: frame?.id ?? '', selectedIds: [] })
  },
  renameProject: (name) => set((state) => commit(state, { ...state.project, name })),
  addElement: (type, position, targetFrameId) => {
    const state = get()
    const frameId = targetFrameId ?? state.activeFrameId
    const id = uid('el')
    const element = { ...createElement(type, frameId, position?.x ?? 80, position?.y ?? 80), id }
    set({ ...commit(state, { ...state.project, elements: [...state.project.elements, element] }), selectedIds: [id], mode: 'select' })
    return id
  },
  updateElement: (id, changes, transient = false) => set((state) => {
    const project = { ...state.project, elements: state.project.elements.map((item) => item.id === id ? { ...item, ...changes, style: changes.style ? { ...item.style, ...changes.style } : item.style } : item) }
    return transient ? { project: touch(project) } : commit(state, project)
  }),
  removeElements: (ids) => set((state) => ({
    ...commit(state, {
      ...state.project,
      elements: state.project.elements.filter((item) => !ids.includes(item.id)),
      connections: state.project.connections.filter((item) => !ids.includes(item.sourceId) && !ids.includes(item.targetId)),
    }),
    selectedIds: [],
  })),
  duplicateElements: (ids) => set((state) => {
    const copies = state.project.elements.filter((item) => ids.includes(item.id)).map((item) => ({ ...cloneElement(item), id: uid('el'), name: `${item.name} copy`, x: item.x + 24, y: item.y + 24 }))
    return { ...commit(state, { ...state.project, elements: [...state.project.elements, ...copies] }), selectedIds: copies.map((item) => item.id) }
  }),
  addPage: (name) => set((state) => {
    const count = state.project.pages.length + 1
    const pageName = name ?? `Page ${count}`
    const page = { id: uid('page'), name: pageName, slug: pageName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `page-${count}` }
    const frame: Frame = { id: uid('frame'), pageId: page.id, name: `${pageName} / Desktop`, x: 180, y: 90, width: 1200, height: 780, background: '#ffffff', device: 'desktop' }
    return { ...commit(state, { ...state.project, pages: [...state.project.pages, page], frames: [...state.project.frames, frame] }), activePageId: page.id, activeFrameId: frame.id, selectedIds: [] }
  }),
  renamePage: (id, name) => set((state) => commit(state, { ...state.project, pages: state.project.pages.map((page) => page.id === id ? { ...page, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') } : page) })),
  removePage: (id) => set((state) => {
    if (state.project.pages.length === 1) return state
    const frameIds = state.project.frames.filter((frame) => frame.pageId === id).map((frame) => frame.id)
    const nextPages = state.project.pages.filter((page) => page.id !== id)
    const nextFrames = state.project.frames.filter((frame) => frame.pageId !== id)
    const elementIds = state.project.elements.filter((element) => frameIds.includes(element.frameId)).map((element) => element.id)
    const nextProject = { ...state.project, pages: nextPages, frames: nextFrames, elements: state.project.elements.filter((element) => !frameIds.includes(element.frameId)), connections: state.project.connections.filter((connection) => !elementIds.includes(connection.sourceId) && !elementIds.includes(connection.targetId)) }
    const nextPage = nextPages[0]
    return { ...commit(state, nextProject), activePageId: nextPage.id, activeFrameId: nextFrames.find((frame) => frame.pageId === nextPage.id)?.id ?? '', selectedIds: [] }
  }),
  addFrame: (device) => set((state) => {
    const sizes = { desktop: [1200, 780], tablet: [768, 900], mobile: [390, 844], custom: [960, 720] } as const
    const [width, height] = sizes[device]
    const page = state.project.pages.find((item) => item.id === state.activePageId)!
    const existing = state.project.frames.filter((item) => item.pageId === page.id)
    const frame: Frame = { id: uid('frame'), pageId: page.id, name: `${page.name} / ${device[0].toUpperCase()}${device.slice(1)}`, x: 180 + existing.length * 80, y: 90 + existing.length * 80, width, height, background: '#ffffff', device }
    return { ...commit(state, { ...state.project, frames: [...state.project.frames, frame] }), activeFrameId: frame.id, selectedIds: [] }
  }),
  updateFrame: (id, changes) => set((state) => commit(state, { ...state.project, frames: state.project.frames.map((frame) => frame.id === id ? { ...frame, ...changes } : frame) })),
  addConnection: (sourceId, targetId) => {
    const state = get()
    const id = uid('connection')
    const connection: PrototypeConnection = { id, sourceId, targetId, trigger: 'click', action: 'navigate', delay: 0, transition: 'dissolve', duration: 250 }
    set({ ...commit(state, { ...state.project, connections: [...state.project.connections, connection] }), rightTab: 'prototype' })
    return id
  },
  updateConnection: (id, changes) => set((state) => commit(state, { ...state.project, connections: state.project.connections.map((connection) => connection.id === id ? { ...connection, ...changes } : connection) })),
  removeConnection: (id) => set((state) => commit(state, { ...state.project, connections: state.project.connections.filter((connection) => connection.id !== id) })),
  applyOperations: (operations) => set((state) => {
    const project = clone(state.project)
    for (const operation of operations) {
      if (operation.type === 'addElement') {
        const frameId = operation.frameId && project.frames.some((frame) => frame.id === operation.frameId) ? operation.frameId : state.activeFrameId
        const element = createElement(operation.elementType, frameId, operation.x ?? 80, operation.y ?? 80)
        if (operation.content) element.content = operation.content
        if (operation.name) element.name = operation.name
        project.elements.push(element)
      } else if (operation.type === 'updateElement') {
        project.elements = project.elements.map((item) => item.id === operation.elementId ? { ...item, ...operation.changes, style: operation.changes.style ? { ...item.style, ...operation.changes.style } : item.style } : item)
      } else if (operation.type === 'deleteElement') {
        project.elements = project.elements.filter((item) => item.id !== operation.elementId)
      } else if (operation.type === 'addPage') {
        const page = { id: uid('page'), name: operation.name, slug: operation.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
        project.pages.push(page)
        project.frames.push({ id: uid('frame'), pageId: page.id, name: `${page.name} / Desktop`, x: 180, y: 90, width: 1200, height: 780, background: '#ffffff', device: 'desktop' })
      } else if (operation.type === 'setTokens') {
        project.tokens = { ...project.tokens, ...operation.changes }
      }
    }
    return commit(state, project)
  }),
  replaceProject: (project) => set((state) => {
    const firstPage = project.pages[0]
    const firstFrame = project.frames.find((frame) => frame.pageId === firstPage?.id)
    return { ...commit(state, project), activePageId: firstPage?.id ?? '', activeFrameId: firstFrame?.id ?? '', selectedIds: [] }
  }),
  undo: () => set((state) => {
    if (!state.past.length) return state
    const previous = state.past[state.past.length - 1]
    return { project: clone(previous), past: state.past.slice(0, -1), future: [clone(state.project), ...state.future].slice(0, MAX_HISTORY), selectedIds: [] }
  }),
  redo: () => set((state) => {
    if (!state.future.length) return state
    const next = state.future[0]
    return { project: clone(next), past: [...state.past, clone(state.project)].slice(-MAX_HISTORY), future: state.future.slice(1), selectedIds: [] }
  }),
}), {
  name: 'framewire-editor-v1',
  partialize: (state) => ({ project: state.project, activePageId: state.activePageId, activeFrameId: state.activeFrameId, zoom: state.zoom, pan: state.pan, snapToGrid: state.snapToGrid, theme: state.theme }),
}))

function cloneElement(element: CanvasElement): CanvasElement {
  return structuredClone(element)
}
