import {
  Bot, ChevronDown, Cloud, Download, Hand, Moon, MousePointer2, Play,
  Redo2, RectangleHorizontal, Sun, Type, Undo2, Upload, Workflow,
} from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { IconButton } from './ui/IconButton'

interface TopbarProps {
  onExport: () => void
  onExportJson: () => void
  onImport: (file: File) => void
}

export function Topbar({ onExport, onExportJson, onImport }: TopbarProps) {
  const state = useEditorStore()
  const modes = [
    { id: 'select' as const, icon: MousePointer2, label: 'Select' },
    { id: 'hand' as const, icon: Hand, label: 'Pan canvas' },
    { id: 'text' as const, icon: Type, label: 'Add text' },
    { id: 'rectangle' as const, icon: RectangleHorizontal, label: 'Add rectangle' },
    { id: 'prototype' as const, icon: Workflow, label: 'Prototype' },
  ]

  return (
    <header className="topbar">
      <div className="topbar-section topbar-brand">
        <img src="/framewire-icon.png" alt="" className="brand-mark" />
        <div className="project-title-wrap">
          <input
            className="project-title"
            value={state.project.name}
            onChange={(event) => state.renameProject(event.target.value)}
            aria-label="Project name"
          />
          <span className="save-state"><Cloud size={11} /> Saved locally</span>
        </div>
      </div>

      <div className="tool-pill" role="toolbar" aria-label="Canvas tools">
        {modes.map(({ id, icon: Icon, label }) => (
          <IconButton key={id} label={label} active={state.mode === id} onClick={() => state.setMode(id)}>
            <Icon size={16} strokeWidth={1.8} />
          </IconButton>
        ))}
        <span className="tool-divider" />
        <IconButton label="Undo" disabled={!state.past.length} onClick={state.undo}><Undo2 size={16} /></IconButton>
        <IconButton label="Redo" disabled={!state.future.length} onClick={state.redo}><Redo2 size={16} /></IconButton>
      </div>

      <div className="topbar-section topbar-actions">
        <label className="icon-button" title="Import Framewire project" aria-label="Import Framewire project"><Upload size={17} /><input hidden type="file" accept=".json,.framewire.json,application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) onImport(file); event.target.value = '' }} /></label>
        <IconButton label="Ask Framewire AI" active={state.aiOpen} onClick={() => state.setAiOpen(!state.aiOpen)}><Bot size={17} /></IconButton>
        <IconButton label={state.theme === 'light' ? 'Use dark mode' : 'Use light mode'} onClick={() => state.setTheme(state.theme === 'light' ? 'dark' : 'light')}>
          {state.theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </IconButton>
        <button className="button button-secondary" onClick={() => state.setPreviewOpen(true)}><Play size={15} fill="currentColor" /> Preview</button>
        <div className="export-group">
          <button className="button button-primary" onClick={onExport}><Download size={15} /> Export ZIP</button>
          <button className="button button-primary export-menu" title="Export editable project JSON" aria-label="Export editable project JSON" onClick={onExportJson}><ChevronDown size={15} /></button>
        </div>
      </div>
    </header>
  )
}
