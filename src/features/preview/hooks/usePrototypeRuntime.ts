import { useCallback, useRef, useState } from 'react'
import { useEditorStore } from '../../../store/editorStore'
import { logger } from '../../../lib/logger'
import type { PrototypeConnection } from '../../../types'

export function usePrototypeRuntime(initialPageId: string) {
  const project = useEditorStore((state) => state.project)
  const [pageId, setPageId] = useState(initialPageId)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set())
  const [textOverrides, setTextOverrides] = useState<Record<string, string>>({})
  const [transition, setTransition] = useState<string>('')
  const holdTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const execute = useCallback((connection: PrototypeConnection) => {
    const run = () => {
      const targetElement = project.elements.find((item) => item.id === connection.targetId)
      const targetFrame = project.frames.find((item) => item.id === connection.targetId || item.id === targetElement?.frameId)
      if (connection.action === 'navigate' && targetFrame) {
        setTransition(connection.transition)
        setPageId(targetFrame.pageId)
        window.setTimeout(() => setTransition(''), connection.duration)
      } else if (connection.action === 'openUrl' && connection.value) {
        window.open(connection.value, '_blank', 'noopener,noreferrer')
      } else if (connection.action === 'scrollTo') {
        document.querySelector(`[data-preview-id="${connection.targetId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else if (connection.action === 'show') {
        setHiddenIds((current) => { const next = new Set(current); next.delete(connection.targetId); return next })
      } else if (connection.action === 'hide') {
        setHiddenIds((current) => new Set(current).add(connection.targetId))
      } else if (connection.action === 'toggle') {
        setHiddenIds((current) => { const next = new Set(current); if (next.has(connection.targetId)) next.delete(connection.targetId); else next.add(connection.targetId); return next })
      } else if (connection.action === 'setText' && connection.value) {
        setTextOverrides((current) => ({ ...current, [connection.targetId]: connection.value! }))
      } else if (connection.action === 'animate') {
        const node = document.querySelector(`[data-preview-id="${connection.targetId}"]`)
        node?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }], { duration: connection.duration || 300 })
      }
      logger.info('preview', 'Interaction executed', { trigger: connection.trigger, action: connection.action })
    }
    window.setTimeout(run, Math.max(0, connection.delay))
  }, [project])

  const handlersFor = useCallback((elementId: string) => {
    const connections = project.connections.filter((item) => item.sourceId === elementId)
    const byTrigger = (trigger: PrototypeConnection['trigger']) => connections.filter((item) => item.trigger === trigger).forEach(execute)
    return {
      onClick: () => byTrigger('click'),
      onDoubleClick: () => byTrigger('doubleClick'),
      onMouseEnter: () => byTrigger('hover'),
      onKeyDown: (event: React.KeyboardEvent) => connections.filter((item) => item.trigger === 'keyPress' && (!item.key || item.key === event.key)).forEach(execute),
      onSubmit: (event: React.FormEvent) => { event.preventDefault(); byTrigger('submit') },
      onPointerDown: () => {
        const timed = connections.filter((item) => item.trigger === 'longPress' || item.trigger === 'hold')
        timed.forEach((item) => { holdTimers.current[item.id] = setTimeout(() => execute(item), item.trigger === 'longPress' ? 650 : 350) })
      },
      onPointerUp: () => Object.values(holdTimers.current).forEach(clearTimeout),
      onPointerLeave: () => Object.values(holdTimers.current).forEach(clearTimeout),
    }
  }, [execute, project.connections])

  return { pageId, setPageId, hiddenIds, textOverrides, transition, handlersFor }
}
