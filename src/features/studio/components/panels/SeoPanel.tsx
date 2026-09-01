import { useState } from 'react'
import { FileCode2, Globe2, Plus, SearchCheck, Trash2 } from 'lucide-react'
import { useEditorStore } from '../../../../store/editorStore'
import { uid } from '../../../../lib/defaults'
import { withWorkspace } from '../../lib/workspaceDefaults'
import { CustomSelect } from '../../../../components/ui/CustomSelect'
import { EmptyPanel, PanelHeader, SectionCard, StatusBadge } from '../PanelPrimitives'
import type { PageSeoSettings } from '../../../../types'

const defaults = (name: string): PageSeoSettings => ({ title: name, description: '', socialImage: '', canonicalUrl: '', noIndex: false, structuredData: '' })

export function SeoPanel() {
  const state = useEditorStore()
  const workspace = withWorkspace(state.project.workspace)
  const page = state.project.pages.find((item) => item.id === state.activePageId) ?? state.project.pages[0]
  const [redirectFrom, setRedirectFrom] = useState('')
  const [redirectTo, setRedirectTo] = useState('')
  const seo = page ? { ...defaults(page.name), ...page.seo } : null
  const updateSeo = (changes: Partial<PageSeoSettings>) => page && state.updatePage(page.id, { seo: { ...defaults(page.name), ...page.seo, ...changes } })
  const addRedirect = () => { if (!redirectFrom || !redirectTo) return; state.updateWorkspace((current) => ({ ...current, redirects: [...current.redirects, { id: uid('redirect'), from: redirectFrom, to: redirectTo, permanent: true }] }), 'Added a redirect'); setRedirectFrom(''); setRedirectTo('') }
  return <div className="studio-panel">
    <PanelHeader title="SEO and page settings" description="Control search metadata, social previews, canonical URLs, indexing, structured data, redirects, favicon, sitemap inputs, robots rules, and custom head code." actions={page && <CustomSelect label="SEO page" value={page.id} options={state.project.pages.map((item) => ({ value: item.id, label: item.name }))} onChange={state.setActivePage} searchable={state.project.pages.length > 8} />} />
    {!page || !seo ? <EmptyPanel icon={<Globe2 size={24} />} title="No page to configure" description="Create a page to add search and sharing metadata." /> : <div className="studio-two-column">
      <SectionCard title="Search appearance" description="Aim for a specific title and a useful description for each page."><div className="studio-form-stack"><label><span>Title <small>{seo.title.length}/60</small></span><input value={seo.title} maxLength={80} onChange={(event) => updateSeo({ title: event.target.value })} /></label><label><span>Description <small>{seo.description.length}/160</small></span><textarea rows={4} value={seo.description} maxLength={200} onChange={(event) => updateSeo({ description: event.target.value })} /></label><label><span>Canonical URL</span><input value={seo.canonicalUrl} placeholder="https://example.com/page" onChange={(event) => updateSeo({ canonicalUrl: event.target.value })} /></label><label className="check-row"><input type="checkbox" checked={seo.noIndex} onChange={(event) => updateSeo({ noIndex: event.target.checked })} /><span>Exclude from search indexing</span></label></div><div className="search-preview"><small>example.com/{page.slug}</small><strong>{seo.title || page.name}</strong><p>{seo.description || 'Add a concise description of this page.'}</p></div></SectionCard>
      <SectionCard title="Social and structured data" description="Configure rich sharing previews and schema markup."><div className="studio-form-stack"><label><span>Social image URL</span><input value={seo.socialImage} onChange={(event) => updateSeo({ socialImage: event.target.value })} /></label><label><span>JSON-LD structured data</span><textarea rows={7} value={seo.structuredData} placeholder={'{"@context":"https://schema.org"}'} onChange={(event) => updateSeo({ structuredData: event.target.value })} /></label><label><span>Custom head code</span><textarea rows={4} value={page.customHead ?? ''} placeholder="Meta or verification tags" onChange={(event) => state.updatePage(page.id, { customHead: event.target.value })} /></label></div></SectionCard>
    </div>}
    <div className="studio-two-column"><SectionCard title="Redirects" description="Exported projects include these rules in vercel.json."><div className="studio-inline-form"><input value={redirectFrom} onChange={(event) => setRedirectFrom(event.target.value)} placeholder="/old-path" /><input value={redirectTo} onChange={(event) => setRedirectTo(event.target.value)} placeholder="/new-path" /><button className="button button-secondary" onClick={addRedirect}><Plus size={14} /></button></div><div className="redirect-list">{workspace.redirects.map((redirect) => <div key={redirect.id}><span>{redirect.from}</span><strong>{redirect.to}</strong><StatusBadge>{redirect.permanent ? '308' : '307'}</StatusBadge><button className="bare-icon" onClick={() => state.updateWorkspace((current) => ({ ...current, redirects: current.redirects.filter((item) => item.id !== redirect.id) }))}><Trash2 size={13} /></button></div>)}</div></SectionCard><SectionCard title="Crawler and site files" description="These settings are emitted during export."><div className="studio-form-stack"><label><span>Favicon path</span><input value={workspace.favicon} onChange={(event) => state.updateWorkspace((current) => ({ ...current, favicon: event.target.value }))} /></label><label><span>robots.txt</span><textarea rows={5} value={workspace.robots} onChange={(event) => state.updateWorkspace((current) => ({ ...current, robots: event.target.value }))} /></label></div><div className="studio-inline-meta"><StatusBadge tone="success"><SearchCheck size={12} /> Sitemap generated</StatusBadge><StatusBadge tone="success"><FileCode2 size={12} /> Vercel redirects</StatusBadge></div></SectionCard></div>
  </div>
}
