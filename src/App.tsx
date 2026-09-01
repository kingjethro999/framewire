import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Canvas } from './components/Canvas'
import { Inspector } from './components/Inspector'
import { LeftSidebar } from './components/LeftSidebar'
import { Topbar } from './components/Topbar'
import { ErrorState } from './components/ui/ErrorState'
import { logger } from './lib/logger'
import { useEditorStore } from './store/editorStore'
import type { ProjectDocument } from './types'
import { ShortcutModal } from './features/shortcuts/components/ShortcutModal'
import { useEditorShortcuts } from './features/shortcuts/hooks/useEditorShortcuts'
import { useStudioStore } from './features/studio/store/studioStore'

const AiSidebar = lazy(() => import('./features/ai/components/AiSidebar').then((module) => ({ default: module.AiSidebar })))
const PreviewModal = lazy(() => import('./features/preview/components/PreviewModal').then((module) => ({ default: module.PreviewModal })))
const StudioWorkbench = lazy(() => import('./features/studio/components/StudioWorkbench').then((module) => ({ default: module.StudioWorkbench })))

export function App() {
  const theme = useEditorStore((state) => state.theme)
  const aiOpen = useEditorStore((state) => state.aiOpen)
  const previewOpen = useEditorStore((state) => state.previewOpen)
  const [error, setError] = useState<string | null>(null)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const studioOpen = useStudioStore((state) => state.open)
  const projectUpdatedAt = useEditorStore((state) => state.project.updatedAt)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }, [theme])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const project = useEditorStore.getState().project
      if (!project.pages.length) return
      const studio = useStudioStore.getState()
      if (studio.versions[0]?.document.updatedAt === project.updatedAt) return
      studio.createVersion(project, `Autosave · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 'autosave', 'Created after 90 seconds without edits.')
    }, 90_000)
    return () => window.clearTimeout(timer)
  }, [projectUpdatedAt])

  const runExport = useCallback(async () => {
    setError(null)
    try {
      const { exportProjectZip } = await import('./features/export/lib/exportProject')
      await exportProjectZip(useEditorStore.getState().project)
    }
    catch (caught) {
      const message = caught instanceof Error ? caught.message : 'The source package could not be generated.'
      setError(message)
      logger.error('export', 'ZIP export failed', caught)
    }
  }, [])

  const showShortcuts = useCallback(() => setShortcutsOpen(true), [])
  const hideShortcuts = useCallback(() => setShortcutsOpen(false), [])
  const toggleStudio = useCallback(() => useStudioStore.getState().setOpen(!useStudioStore.getState().open), [])
  useEditorShortcuts({ onExport: runExport, onShowShortcuts: showShortcuts, onHideShortcuts: hideShortcuts, onToggleStudio: toggleStudio })

  const runJsonExport = async () => {
    const { exportProjectJson } = await import('./features/export/lib/exportProject')
    exportProjectJson(useEditorStore.getState().project)
  }

  const importProject = async (file: File) => {
    setError(null)
    try {
      if (file.size > 5_000_000) throw new Error('Project files must be smaller than 5 MB.')
      const parsed = JSON.parse(await file.text()) as Partial<ProjectDocument>
      if (!parsed.id || !parsed.name || !Array.isArray(parsed.pages) || !Array.isArray(parsed.frames) || !Array.isArray(parsed.elements) || !Array.isArray(parsed.connections) || !parsed.tokens) throw new Error('This is not a valid Framewire project file.')
      useEditorStore.getState().replaceProject(parsed as ProjectDocument)
      logger.info('project', 'Project imported', { pages: parsed.pages.length, elements: parsed.elements.length })
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'The project file could not be imported.'
      setError(message)
      logger.error('project', 'Import failed', caught)
    }
  }

  return (
    <div className="app-shell">
      <Topbar onExport={() => void runExport()} onExportJson={() => void runJsonExport()} onImport={(file) => void importProject(file)} onShowShortcuts={showShortcuts} />
      <div className="editor-layout">
        <LeftSidebar />
        <Canvas />
        <Inspector />
        {aiOpen && <Suspense fallback={<aside className="ai-sidebar panel-loading" aria-label="Loading AI panel" />}><AiSidebar /></Suspense>}
      </div>
      {error && <div className="floating-error"><ErrorState compact title="Export failed" message={error} onRetry={() => void runExport()} /></div>}
      {previewOpen && <Suspense fallback={<div className="modal-backdrop panel-loading" aria-label="Loading preview" />}><PreviewModal /></Suspense>}
      {studioOpen && <Suspense fallback={<div className="studio-backdrop panel-loading" aria-label="Loading Studio" />}><StudioWorkbench /></Suspense>}
      <ShortcutModal open={shortcutsOpen} onClose={hideShortcuts} />
    </div>
  )
}
