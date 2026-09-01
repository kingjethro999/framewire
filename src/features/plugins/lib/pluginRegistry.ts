import type { AiOperation, CanvasElement, PluginManifest, ProjectDocument } from '../../../types'
import { useEditorStore } from '../../../store/editorStore'

export interface FramewirePluginContribution {
  manifest: PluginManifest
  components?: Array<{ id: string; name: string; create: (frameId: string) => CanvasElement }>
  exporters?: Array<{ id: string; name: string; export: (project: ProjectDocument) => Promise<Blob> }>
  aiTools?: Array<{ id: string; name: string; run: (project: ProjectDocument, input: string) => Promise<AiOperation[]> }>
  dataSources?: Array<{ id: string; name: string; load: () => Promise<Array<Record<string, string>>> }>
}

const registry = new Map<string, FramewirePluginContribution>()
const listeners = new Set<() => void>()

const notify = () => listeners.forEach((listener) => listener())

export const framewirePluginRegistry = {
  register(contribution: FramewirePluginContribution) {
    const configured = useEditorStore.getState().project.workspace?.plugins.find((plugin) => plugin.id === contribution.manifest.id)
    if (!configured?.enabled) throw new Error(`Enable ${contribution.manifest.name} in Studio before registering runtime contributions.`)
    registry.set(contribution.manifest.id, contribution); notify()
    return () => { registry.delete(contribution.manifest.id); notify() }
  },
  list() { return [...registry.values()] },
  subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener) },
  readProject() { return structuredClone(useEditorStore.getState().project) },
  applyOperations(operations: AiOperation[]) { useEditorStore.getState().applyOperations(operations) },
}
