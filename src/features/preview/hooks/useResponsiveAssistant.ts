import { useCallback, useState } from 'react'
import { logger } from '../../../lib/logger'
import { useEditorStore } from '../../../store/editorStore'
import type { ResponsiveLayout } from '../../../types'

export function useResponsiveAssistant() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const generate = useCallback(async (pageId: string, device: 'tablet' | 'mobile') => {
    const state = useEditorStore.getState()
    const sourceFrame = state.project.frames.find((frame) => frame.pageId === pageId && frame.device === 'desktop') ?? state.project.frames.find((frame) => frame.pageId === pageId)
    if (!sourceFrame) { setError('Create a desktop frame before generating a responsive layout.'); return }
    const elements = state.project.elements.filter((element) => element.frameId === sourceFrame.id && element.visible)
    if (!elements.length) { setError('Add at least one visible layer before generating a responsive layout.'); return }
    const targetWidth = device === 'mobile' ? 390 : 768
    setLoading(true); setError(null); setMessage(null)
    try {
      const response = await fetch('/api/groq-responsive', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device, targetWidth, sourceFrame, elements }),
      })
      const result = await response.json() as { error?: string; message?: string; layout?: ResponsiveLayout }
      if (!response.ok) throw new Error(result.error || 'The responsive layout request failed.')
      if (!result.layout || !Array.isArray(result.layout.elements)) throw new Error('The AI returned an invalid responsive layout.')
      const sourceIds = new Set(elements.map((element) => element.id))
      const layout: ResponsiveLayout = {
        frameHeight: Math.max(device === 'mobile' ? 844 : 900, Number(result.layout.frameHeight) || 0),
        elements: result.layout.elements.filter((item) => sourceIds.has(item.sourceId)).map((item) => {
          const width = Math.max(1, Math.min(targetWidth, Number(item.width) || 1))
          return {
            ...item,
            x: Math.max(0, Math.min(targetWidth - width, Number(item.x) || 0)),
            y: Math.max(0, Number(item.y) || 0), width,
            height: Math.max(1, Number(item.height) || 1),
          }
        }),
      }
      state.applyResponsiveLayout(pageId, device, layout)
      setMessage(result.message || `${device} layout generated.`)
      logger.info('responsive', 'AI responsive layout applied', { device, elements: layout.elements.length })
    } catch (caught) {
      const detail = caught instanceof Error ? caught.message : 'The responsive layout could not be generated.'
      setError(detail)
      logger.error('responsive', 'Responsive generation failed', caught, { device })
    } finally {
      setLoading(false)
    }
  }, [])

  return { generate, loading, error, message, clearError: () => setError(null) }
}
