import { useEffect, useMemo, useState } from 'react'
import { Braces, Check, RefreshCw, ShieldCheck } from 'lucide-react'
import { useEditorStore } from '../../../../store/editorStore'
import { CustomSelect } from '../../../../components/ui/CustomSelect'
import { ErrorState } from '../../../../components/ui/ErrorState'
import { extractContentUpdates, generatePageCode, validateCode } from '../../lib/codeGenerator'
import { withWorkspace } from '../../lib/workspaceDefaults'
import { PanelHeader, SectionCard, StatusBadge } from '../PanelPrimitives'

export function CodePanel() {
  const state = useEditorStore()
  const [language, setLanguage] = useState<'react' | 'html' | 'css'>('react')
  const page = state.project.pages.find((item) => item.id === state.activePageId) ?? state.project.pages[0]
  const generated = useMemo(() => page ? generatePageCode(state.project, page, language) : '', [state.project, page, language])
  const saved = withWorkspace(state.project.workspace).codeOverrides.find((item) => item.pageId === page?.id && item.language === language)?.content
  const [draft, setDraft] = useState(saved ?? generated)
  const [message, setMessage] = useState<string | null>(null)
  useEffect(() => { setDraft(saved ?? generated); setMessage(null) }, [generated, saved])
  const error = validateCode(draft, language)
  const sync = () => {
    if (!page || error) return
    if (language !== 'css') extractContentUpdates(draft).forEach((update) => state.updateElement(update.id, { content: update.content }))
    state.updateWorkspace((workspace) => ({ ...workspace, codeOverrides: [...workspace.codeOverrides.filter((item) => item.pageId !== page.id || item.language !== language), { pageId: page.id, language, content: draft, updatedAt: new Date().toISOString() }] }), `Updated ${language.toUpperCase()} code override`)
    setMessage('Code saved. Recognized content changes were synchronized to the canvas.')
  }
  return <div className="studio-panel studio-code-panel">
    <PanelHeader title="Code mode" description="Inspect generated React, HTML, and CSS, edit inside protected Framewire markers, validate, and synchronize recognized content changes back to the canvas." actions={<CustomSelect label="Code language" value={language} options={[{ value: 'react', label: 'React' }, { value: 'html', label: 'HTML' }, { value: 'css', label: 'CSS' }]} onChange={(value) => setLanguage(value as typeof language)} />} />
    {!page ? <ErrorState title="No page available" message="Create a page before opening code mode." /> : <SectionCard title={`${page.name}.${language === 'react' ? 'tsx' : language}`} description="Canvas IDs protect bidirectional synchronization. Removing all markers will block applying the draft." actions={<StatusBadge tone={error ? 'danger' : 'success'}>{error ? 'Needs attention' : 'Valid'}</StatusBadge>}>
      <div className="code-editor-wrap"><div className="code-gutter"><Braces size={16} /></div><textarea className="code-editor" spellCheck={false} value={draft} onChange={(event) => { setDraft(event.target.value); setMessage(null) }} aria-label={`${language} code editor`} /></div>
      {error && <ErrorState compact title="Code validation failed" message={error} />}
      {message && <div className="studio-notice success"><ShieldCheck size={15} /><span>{message}</span></div>}
      <div className="studio-card-actions"><button className="button button-secondary" onClick={() => { setDraft(generated); setMessage('Draft regenerated from the current canvas.') }}><RefreshCw size={14} /> Regenerate</button><button className="button button-primary" disabled={Boolean(error)} onClick={sync}><Check size={14} /> Apply safely</button></div>
    </SectionCard>}
  </div>
}
