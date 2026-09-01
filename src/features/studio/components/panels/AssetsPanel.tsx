import { useMemo, useRef, useState } from 'react'
import { File as FileIcon, Folder, Image, Replace, Trash2, Upload } from 'lucide-react'
import { useEditorStore } from '../../../../store/editorStore'
import { uid } from '../../../../lib/defaults'
import { withWorkspace } from '../../lib/workspaceDefaults'
import { EmptyPanel, PanelHeader, PanelSearch, SectionCard, StatusBadge } from '../PanelPrimitives'
import { ErrorState } from '../../../../components/ui/ErrorState'
import type { AssetRecord } from '../../../../types'

const readAsset = (file: File) => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('The asset could not be read.')); reader.readAsDataURL(file) })

const optimizeImage = async (file: File) => {
  if (!file.type.startsWith('image/') || file.type.includes('svg')) return { src: await readAsset(file), width: undefined, height: undefined, size: file.size }
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale)); const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height); bitmap.close()
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Image optimization failed.')), 'image/webp', .84))
  const optimized = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' })
  return { src: await readAsset(optimized), width, height, size: blob.size }
}

export function AssetsPanel() {
  const state = useEditorStore()
  const workspace = withWorkspace(state.project.workspace)
  const [query, setQuery] = useState('')
  const [folder, setFolder] = useState('All assets')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const selected = state.project.elements.find((element) => element.id === state.selectedIds[0])
  const folders = ['All assets', ...new Set(workspace.assets.map((asset) => asset.folder))]
  const assets = useMemo(() => workspace.assets.filter((asset) => (folder === 'All assets' || asset.folder === folder) && asset.name.toLowerCase().includes(query.toLowerCase())), [workspace.assets, folder, query])
  const upload = async (files: FileList | null) => {
    if (!files) return
    setError(null)
    try {
      const incoming: AssetRecord[] = []
      for (const file of Array.from(files)) {
        if (file.size > 4_000_000) throw new Error(`${file.name} is larger than the 4 MB local asset limit.`)
        const optimized = await optimizeImage(file)
        incoming.push({ id: uid('asset'), name: file.name, type: file.type.includes('svg') ? 'svg' : file.type.startsWith('image/') ? 'image' : file.type.startsWith('font/') ? 'font' : 'file', folder: folder === 'All assets' ? 'Uploads' : folder, ...optimized, createdAt: new Date().toISOString() })
      }
      state.updateWorkspace((current) => ({ ...current, assets: [...current.assets, ...incoming] }), `Uploaded ${incoming.length} asset${incoming.length === 1 ? '' : 's'}`)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Assets could not be uploaded.') }
  }
  const applyAsset = (asset: AssetRecord) => {
    if (selected && (asset.type === 'image' || asset.type === 'svg')) state.updateElement(selected.id, { type: 'image', assetId: asset.id, src: asset.src, alt: asset.alt || asset.name })
  }
  return <div className="studio-panel">
    <PanelHeader title="Asset manager" description="Organize images, SVGs, fonts, and files; track usage; replace media globally; and keep embedded uploads within a memory-safe local limit." actions={<><input ref={inputRef} hidden type="file" multiple accept="image/*,.svg,.woff,.woff2,.ttf" onChange={(event) => void upload(event.target.files)} /><button className="button button-primary" onClick={() => inputRef.current?.click()}><Upload size={14} /> Upload assets</button></>} />
    {error && <ErrorState compact title="Upload failed" message={error} onRetry={() => inputRef.current?.click()} />}
    <div className="studio-toolbar"><PanelSearch value={query} onChange={setQuery} placeholder="Search assets" /><div className="folder-tabs">{folders.map((item) => <button className={folder === item ? 'is-active' : ''} key={item} onClick={() => setFolder(item)}><Folder size={13} /> {item}</button>)}</div></div>
    {!assets.length ? <EmptyPanel icon={<Image size={24} />} title="No matching assets" description="Upload media or switch folders. Embedded files are capped at 4 MB each to protect local project memory." /> : <div className="asset-grid">{assets.map((asset) => {
      const uses = state.project.elements.filter((element) => element.assetId === asset.id).length
      return <SectionCard key={asset.id} title={asset.name} description={`${Math.max(1, Math.round(asset.size / 1024))} KB · ${asset.folder}`} actions={<button className="bare-icon" aria-label={`Delete ${asset.name}`} onClick={() => state.updateWorkspace((current) => ({ ...current, assets: current.assets.filter((item) => item.id !== asset.id) }), `Deleted asset ${asset.name}`)}><Trash2 size={13} /></button>}>
        <button className="asset-preview" onClick={() => applyAsset(asset)} aria-label={`Use ${asset.name}`}>{asset.type === 'image' || asset.type === 'svg' ? <img src={asset.src} alt={asset.alt || ''} loading="lazy" /> : <FileIcon size={28} />}</button>
        <div className="studio-inline-meta"><StatusBadge tone={uses ? 'success' : 'warning'}>{uses ? `${uses} uses` : 'Unused'}</StatusBadge>{selected && <button className="button button-ghost" onClick={() => applyAsset(asset)}><Replace size={13} /> Apply to selection</button>}{selected?.assetId && selected.assetId !== asset.id && <button className="button button-ghost" onClick={() => state.replaceAssetUsage(selected.assetId!, asset.id)}><Replace size={13} /> Replace all uses</button>}</div>
      </SectionCard>
    })}</div>}
  </div>
}
