import { useEffect, useRef } from 'react'
import { useEditorStore } from '../../../store/editorStore'
import type { EditorMode } from '../../../types'

interface ShortcutOptions {
  onExport: () => void
  onShowShortcuts: () => void
  onHideShortcuts: () => void
  onToggleStudio: () => void
}

export function useEditorShortcuts({ onExport, onShowShortcuts, onHideShortcuts, onToggleStudio }: ShortcutOptions) {
  const copiedIds = useRef<string[]>([])
  const modeBeforeHand = useRef<EditorMode | null>(null)

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const editing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable
      if (editing) { if (event.key === 'Escape') onHideShortcuts(); return }
      const state = useEditorStore.getState()
      const key = event.key.toLowerCase()
      const mod = event.metaKey || event.ctrlKey
      const selected = state.selectedIds

      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault()
        modeBeforeHand.current = state.mode
        state.setMode('hand')
      } else if (mod && key === 'z') {
        event.preventDefault(); if (event.shiftKey) state.redo(); else state.undo()
      } else if (mod && key === 'c') {
        event.preventDefault(); copiedIds.current = [...selected]
      } else if (mod && key === 'v') {
        event.preventDefault(); if (copiedIds.current.length) state.duplicateElements(copiedIds.current)
      } else if (mod && key === 'd') {
        event.preventDefault(); if (selected.length) state.duplicateElements(selected)
      } else if (mod && key === 'a') {
        event.preventDefault(); state.select(state.project.elements.filter((element) => element.frameId === state.activeFrameId).map((element) => element.id))
      } else if (mod && key === 'enter') {
        event.preventDefault(); if (state.project.pages.length) state.setPreviewOpen(true)
      } else if (mod && key === 'e') {
        event.preventDefault(); onExport()
      } else if (event.shiftKey && key === 'a') {
        event.preventDefault(); state.setAiOpen(!state.aiOpen)
      } else if (event.shiftKey && key === 's') {
        event.preventDefault(); onToggleStudio()
      } else if (event.key === '?' || (event.shiftKey && event.code === 'Slash')) {
        event.preventDefault(); onShowShortcuts()
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selected.length) { event.preventDefault(); state.removeElements(selected) }
      } else if (event.shiftKey && event.key === '1') {
        event.preventDefault(); state.setZoom(.65); state.setPan({ x: 0, y: 0 })
      } else if (event.shiftKey && event.key === '2') {
        event.preventDefault(); state.setZoom(1)
      } else if (event.key === '+' || event.key === '=') {
        event.preventDefault(); state.setZoom(state.zoom + .1)
      } else if (event.key === '-') {
        event.preventDefault(); state.setZoom(state.zoom - .1)
      } else if (event.key === '0') {
        event.preventDefault(); state.setZoom(1)
      } else if (key === 'v') state.setMode('select')
      else if (key === 'h') state.setMode('hand')
      else if (key === 't') state.setMode('text')
      else if (key === 'r') state.setMode('rectangle')
      else if (key === 'p') state.setMode('prototype')
      else if (key === 'f') state.addFrame('custom')
      else if (key === 'b' && state.activeFrameId) state.addElement('button')
      else if (key === 'i' && state.activeFrameId) state.addElement('image')
      else if (event.key === 'Escape') {
        onHideShortcuts(); state.select([]); state.setMode('select'); state.setPreviewOpen(false)
      }
    }
    const keyUp = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || !modeBeforeHand.current) return
      useEditorStore.getState().setMode(modeBeforeHand.current)
      modeBeforeHand.current = null
    }
    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)
    return () => { window.removeEventListener('keydown', keyDown); window.removeEventListener('keyup', keyUp) }
  }, [onExport, onHideShortcuts, onShowShortcuts, onToggleStudio])
}
