import { useCallback, useRef, useState } from 'react'
import { useEditorStore } from '../../../store/editorStore'
import { logger } from '../../../lib/logger'
import type { PrototypeConnection } from '../../../types'
import { withWorkspace } from '../../studio/lib/workspaceDefaults'

export function usePrototypeRuntime(initialPageId: string) {
  const project = useEditorStore((state) => state.project)
  const [pageId, setPageId] = useState(initialPageId)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set())
  const [textOverrides, setTextOverrides] = useState<Record<string, string>>({})
  const [transition, setTransition] = useState<string>('')
  const [variableValues, setVariableValues] = useState<Record<string, string>>(() => Object.fromEntries(withWorkspace(project.workspace).variables.map((variable) => [variable.id, variable.value])))
  const [variantOverrides, setVariantOverrides] = useState<Record<string, string>>({})
  const holdTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const execute = useCallback((connection: PrototypeConnection) => {
    const run = () => {
      if (connection.condition) {
        const actual = variableValues[connection.condition.variableId] ?? ''
        const expected = connection.condition.value
        const allowed = connection.condition.operator === 'equals' ? actual === expected
          : connection.condition.operator === 'notEquals' ? actual !== expected
            : connection.condition.operator === 'contains' ? actual.includes(expected)
              : connection.condition.operator === 'greaterThan' ? Number(actual) > Number(expected)
                : Number(actual) < Number(expected)
        if (!allowed) return
      }
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
      } else if (connection.action === 'animate' || connection.action === 'scrollAnimate') {
        const node = document.querySelector(`[data-preview-id="${connection.targetId}"]`)
        node?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }], { duration: connection.duration || 300 })
      } else if (connection.action === 'setVariable' && connection.variableId) {
        setVariableValues((current) => ({ ...current, [connection.variableId!]: connection.value ?? '' }))
      } else if (connection.action === 'setVariant' && (connection.variantId || connection.value)) {
        setVariantOverrides((current) => ({ ...current, [connection.targetId]: connection.variantId ?? connection.value! }))
      } else if (connection.action === 'openOverlay') {
        setHiddenIds((current) => { const next = new Set(current); next.delete(connection.targetId); return next })
      } else if (connection.action === 'closeOverlay') {
        setHiddenIds((current) => new Set(current).add(connection.targetId))
      } else if (connection.action === 'submitForm') {
        const node = document.querySelector(`[data-preview-id="${connection.targetId}"] form`) as HTMLFormElement | null
        node?.requestSubmit()
      }
      logger.info('preview', 'Interaction executed', { trigger: connection.trigger, action: connection.action })
    }
    window.setTimeout(run, Math.max(0, connection.delay))
  }, [project, variableValues])

  const handlersFor = useCallback((elementId: string) => {
    const connections = project.connections.filter((item) => item.sourceId === elementId)
    const byTrigger = (trigger: PrototypeConnection['trigger']) => connections.filter((item) => item.trigger === trigger).forEach(execute)
    return {
      onClick: () => byTrigger('click'),
      onDoubleClick: () => byTrigger('doubleClick'),
      onMouseEnter: () => byTrigger('hover'),
      onMouseMove: () => byTrigger('mouseMove'),
      onWheel: () => byTrigger('scrollProgress'),
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

  return { pageId, setPageId, hiddenIds, textOverrides, transition, handlersFor, variantOverrides, variableValues }
}
