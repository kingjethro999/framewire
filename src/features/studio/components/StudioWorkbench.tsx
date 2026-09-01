import { useEffect, useMemo, useRef } from 'react'
import { Command, X } from 'lucide-react'
import clsx from 'clsx'
import { useStudioStore } from '../store/studioStore'
import { studioSections } from '../lib/studioSections'
import { ComponentsPanel } from './panels/ComponentsPanel'
import { ResponsivePanel } from './panels/ResponsivePanel'
import { CodePanel } from './panels/CodePanel'
import { HistoryPanel } from './panels/HistoryPanel'
import { InteractionsPanel } from './panels/InteractionsPanel'
import { AssetsPanel } from './panels/AssetsPanel'
import { DesignSystemPanel } from './panels/DesignSystemPanel'
import { AccessibilityPanel } from './panels/AccessibilityPanel'
import { SeoPanel } from './panels/SeoPanel'
import { DataPanel } from './panels/DataPanel'
import { CollaborationPanel } from './panels/CollaborationPanel'
import { PluginsPanel } from './panels/PluginsPanel'
import { TestingPanel } from './panels/TestingPanel'
import { DeployPanel } from './panels/DeployPanel'
import { TemplatesPanel } from './panels/TemplatesPanel'

const panels = {
  components: ComponentsPanel, responsive: ResponsivePanel, code: CodePanel,
  history: HistoryPanel, interactions: InteractionsPanel, assets: AssetsPanel,
  'design-system': DesignSystemPanel, accessibility: AccessibilityPanel, seo: SeoPanel,
  data: DataPanel, collaboration: CollaborationPanel, plugins: PluginsPanel,
  testing: TestingPanel, deploy: DeployPanel, templates: TemplatesPanel,
}

export function StudioWorkbench() {
  const studio = useStudioStore()
  const setStudioOpen = studio.setOpen
  const closeRef = useRef<HTMLButtonElement>(null)
  const ActivePanel = panels[studio.activeSection]
  const groups = useMemo(() => [...new Set(studioSections.map((section) => section.group))], [])

  useEffect(() => {
    requestAnimationFrame(() => closeRef.current?.focus())
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setStudioOpen(false) }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setStudioOpen])

  return <div className="studio-backdrop" role="dialog" aria-modal="true" aria-label="Framewire Studio">
    <div className="studio-workbench">
      <aside className="studio-nav">
        <div className="studio-nav-brand"><span><Command size={17} /></span><div><strong>Studio</strong><small>Project systems</small></div><button ref={closeRef} className="bare-icon" onClick={() => studio.setOpen(false)} aria-label="Close Studio"><X size={17} /></button></div>
        <nav aria-label="Studio sections">
          {groups.map((group) => <div className="studio-nav-group" key={group}><small>{group}</small>{studioSections.filter((section) => section.group === group).map((section) => {
            const Icon = section.icon
            return <button key={section.id} className={clsx(studio.activeSection === section.id && 'is-active')} onClick={() => studio.setActiveSection(section.id)}><Icon size={15} /><span><strong>{section.label}</strong><small>{section.description}</small></span></button>
          })}</div>)}
        </nav>
      </aside>
      <main className="studio-content"><ActivePanel /></main>
    </div>
  </div>
}
