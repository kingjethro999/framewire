import { useCallback, useRef, useState } from 'react'
import { useEditorStore } from '../../../store/editorStore'
import { logger } from '../../../lib/logger'
import type { AiResponse } from '../../../types'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  operationCount?: number
}

const suggestions = [
  'Turn this into a crisp SaaS landing page',
  'Add a pricing page with three plans',
  'Improve the typography and spacing',
  'Create a mobile-friendly contact section',
]

export function useGroqAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const send = useCallback(async (prompt: string) => {
    const cleanPrompt = prompt.trim()
    if (!cleanPrompt || loading) return
    const state = useEditorStore.getState()
    const activeFrames = state.project.frames.filter((frame) => frame.pageId === state.activePageId)
    const frameIds = new Set(activeFrames.map((frame) => frame.id))
    const context = {
      project: { name: state.project.name, tokens: state.project.tokens, pages: state.project.pages },
      activePageId: state.activePageId,
      frames: activeFrames,
      elements: state.project.elements.filter((element) => frameIds.has(element.frameId)).slice(0, 80),
      selectedIds: state.selectedIds,
    }
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: cleanPrompt }
    setMessages((current) => [...current.slice(-28), userMessage])
    setLoading(true)
    setError(null)
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: cleanPrompt, context }),
        signal: abortRef.current.signal,
      })
      const result = await response.json() as AiResponse & { error?: string }
      if (!response.ok) throw new Error(result.error || 'The AI request could not be completed.')
      if (!Array.isArray(result.operations) || typeof result.message !== 'string') throw new Error('The AI returned an invalid canvas response.')
      state.applyOperations(result.operations)
      setMessages((current) => [...current.slice(-28), { id: crypto.randomUUID(), role: 'assistant', content: result.message, operationCount: result.operations.length }])
      logger.info('ai', 'Canvas operations applied', { count: result.operations.length })
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') return
      const message = caught instanceof Error ? caught.message : 'The AI request failed.'
      setError(message)
      logger.error('ai', 'Groq request failed', caught)
    } finally {
      setLoading(false)
    }
  }, [loading])

  const clear = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setError(null)
    setLoading(false)
  }, [])

  return { messages, loading, error, send, clear, suggestions }
}
