import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProjectDocument, StudioSection } from '../../../types'
import { uid } from '../../../lib/defaults'

export interface ProjectVersion {
  id: string
  name: string
  branch: string
  note: string
  createdAt: string
  document: ProjectDocument
  assetsIncluded: boolean
}

interface StudioState {
  open: boolean
  activeSection: StudioSection
  query: string
  versions: ProjectVersion[]
  setOpen: (open: boolean) => void
  setActiveSection: (section: StudioSection) => void
  setQuery: (query: string) => void
  createVersion: (project: ProjectDocument, name: string, branch?: string, note?: string) => string
  removeVersion: (id: string) => void
}

const snapshot = (project: ProjectDocument) => {
  const document = structuredClone(project)
  const assets = document.workspace?.assets ?? []
  const serializedSize = JSON.stringify(document).length
  if (serializedSize <= 1_500_000) return { document, assetsIncluded: true }
  if (document.workspace) document.workspace.assets = assets.map((asset) => ({ ...asset, src: asset.src.startsWith('data:') ? '' : asset.src }))
  return { document, assetsIncluded: false }
}

export const useStudioStore = create<StudioState>()(persist((set, get) => ({
  open: false,
  activeSection: 'components',
  query: '',
  versions: [],
  setOpen: (open) => set({ open }),
  setActiveSection: (activeSection) => set({ activeSection, query: '' }),
  setQuery: (query) => set({ query }),
  createVersion: (project, name, branch = 'main', note = '') => {
    const id = uid('version')
    const copy = snapshot(project)
    set({ versions: [{ id, name, branch, note, createdAt: new Date().toISOString(), ...copy }, ...get().versions].slice(0, 12) })
    return id
  },
  removeVersion: (id) => set({ versions: get().versions.filter((version) => version.id !== id) }),
}), {
  name: 'framewire-studio-v1',
  partialize: (state) => ({ versions: state.versions }),
}))
