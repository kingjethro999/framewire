import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Bot, CheckCircle2, LoaderCircle, PanelRightClose, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useEditorStore } from '../../../store/editorStore'
import { ErrorState } from '../../../components/ui/ErrorState'
import { IconButton } from '../../../components/ui/IconButton'
import { useGroqAssistant } from '../hooks/useGroqAssistant'

export function AiSidebar() {
  const setAiOpen = useEditorStore((state) => state.setAiOpen)
  const [prompt, setPrompt] = useState('')
  const { messages, loading, error, send, clear, suggestions } = useGroqAssistant()
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, error])

  const submit = () => {
    if (!prompt.trim()) return
    void send(prompt)
    setPrompt('')
  }

  return (
    <aside className="ai-sidebar">
      <div className="ai-header">
        <div className="ai-title"><span><Bot size={16} /></span><div><strong>Framewire AI</strong><small>Powered by Groq</small></div></div>
        <div className="inline-actions"><IconButton label="Clear conversation" onClick={clear}><Trash2 size={15} /></IconButton><IconButton label="Close AI panel" onClick={() => setAiOpen(false)}><PanelRightClose size={16} /></IconButton></div>
      </div>
      <div className="ai-conversation">
        {!messages.length && (
          <div className="ai-welcome">
            <div className="ai-welcome-mark"><Sparkles size={21} /></div>
            <h2>Build with a conversation</h2>
            <p>Describe the page, section, or visual change. Framewire turns the response into structured canvas operations you can undo.</p>
            <div className="suggestion-list">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => void send(suggestion)}><Plus size={13} />{suggestion}</button>)}</div>
          </div>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`chat-message is-${message.role}`}>
            {message.role === 'assistant' && <span className="chat-avatar"><Bot size={14} /></span>}
            <div><p>{message.content}</p>{message.operationCount !== undefined && <small><CheckCircle2 size={12} /> {message.operationCount ? `${message.operationCount} canvas change${message.operationCount === 1 ? '' : 's'} applied` : 'No canvas changes needed'}</small>}</div>
          </div>
        ))}
        {loading && <div className="chat-message is-assistant"><span className="chat-avatar"><Bot size={14} /></span><div className="thinking-row"><LoaderCircle size={14} className="spin" /> Thinking and mapping changes</div></div>}
        {error && <ErrorState compact title="AI request failed" message={error} />}
        <div ref={bottomRef} />
      </div>
      <div className="ai-composer">
        <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit() } }} placeholder="Ask Framewire to change the canvas" rows={3} />
        <div className="composer-footer"><small>Changes are applied to the active page</small><button aria-label="Send message" title="Send message" disabled={!prompt.trim() || loading} onClick={submit}><ArrowUp size={16} /></button></div>
      </div>
    </aside>
  )
}
