export interface ShortcutDefinition {
  category: 'Tools' | 'Editing' | 'View' | 'Workspace'
  label: string
  keys: string[]
}

export const shortcutDefinitions: ShortcutDefinition[] = [
  { category: 'Tools', label: 'Select or move tool', keys: ['V'] },
  { category: 'Tools', label: 'Hand tool', keys: ['H'] },
  { category: 'Tools', label: 'Text tool', keys: ['T'] },
  { category: 'Tools', label: 'Rectangle tool', keys: ['R'] },
  { category: 'Tools', label: 'Create custom frame', keys: ['F'] },
  { category: 'Tools', label: 'Prototype tool', keys: ['P'] },
  { category: 'Tools', label: 'Insert button', keys: ['B'] },
  { category: 'Tools', label: 'Insert image', keys: ['I'] },
  { category: 'Editing', label: 'Undo', keys: ['Mod', 'Z'] },
  { category: 'Editing', label: 'Redo', keys: ['Mod', 'Shift', 'Z'] },
  { category: 'Editing', label: 'Copy selection', keys: ['Mod', 'C'] },
  { category: 'Editing', label: 'Paste selection', keys: ['Mod', 'V'] },
  { category: 'Editing', label: 'Duplicate selection', keys: ['Mod', 'D'] },
  { category: 'Editing', label: 'Select all layers in frame', keys: ['Mod', 'A'] },
  { category: 'Editing', label: 'Delete selection', keys: ['Delete'] },
  { category: 'Editing', label: 'Clear selection', keys: ['Esc'] },
  { category: 'View', label: 'Temporary hand tool', keys: ['Space'] },
  { category: 'View', label: 'Zoom in', keys: ['+'] },
  { category: 'View', label: 'Zoom out', keys: ['−'] },
  { category: 'View', label: 'Zoom to 100%', keys: ['0'] },
  { category: 'View', label: 'Fit canvas', keys: ['Shift', '1'] },
  { category: 'View', label: 'Zoom to selection', keys: ['Shift', '2'] },
  { category: 'Workspace', label: 'Preview website', keys: ['Mod', 'Enter'] },
  { category: 'Workspace', label: 'Export source ZIP', keys: ['Mod', 'E'] },
  { category: 'Workspace', label: 'Toggle Framewire AI', keys: ['Shift', 'A'] },
  { category: 'Workspace', label: 'Show all shortcuts', keys: ['?'] },
]
