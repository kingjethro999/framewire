import {
  Accessibility, AppWindow, Blocks, Boxes, Braces, CloudUpload, Component, Database,
  FileClock, FlaskConical, Image, MessageSquare, MousePointerClick, Palette, SearchCheck,
} from 'lucide-react'
import type { StudioSection } from '../../../types'

export const studioSections: Array<{ id: StudioSection; label: string; group: string; icon: typeof Component; description: string }> = [
  { id: 'components', label: 'Components', group: 'Build', icon: Component, description: 'Masters, instances, properties, and variants' },
  { id: 'responsive', label: 'Responsive', group: 'Build', icon: AppWindow, description: 'Constraints, auto layout, grid, and breakpoints' },
  { id: 'code', label: 'Code mode', group: 'Build', icon: Braces, description: 'Generated code with protected canvas sync' },
  { id: 'interactions', label: 'Interactions', group: 'Build', icon: MousePointerClick, description: 'Variables, conditions, states, and overlays' },
  { id: 'assets', label: 'Assets', group: 'Content', icon: Image, description: 'Media, fonts, folders, and usage' },
  { id: 'design-system', label: 'Design system', group: 'Content', icon: Palette, description: 'Tokens, aliases, and bulk replacement' },
  { id: 'seo', label: 'SEO & pages', group: 'Content', icon: SearchCheck, description: 'Metadata, redirects, sitemap, and robots' },
  { id: 'data', label: 'Forms & data', group: 'Content', icon: Database, description: 'Collections, forms, validation, and webhooks' },
  { id: 'templates', label: 'Templates', group: 'Content', icon: Blocks, description: 'Removable sites, sections, and recipes' },
  { id: 'history', label: 'Version history', group: 'Quality', icon: FileClock, description: 'Snapshots, branches, comparisons, and restore' },
  { id: 'accessibility', label: 'Accessibility', group: 'Quality', icon: Accessibility, description: 'Contrast, semantics, labels, and fixes' },
  { id: 'testing', label: 'Site testing', group: 'Quality', icon: FlaskConical, description: 'Overflow, links, overlap, and interaction checks' },
  { id: 'collaboration', label: 'Collaboration', group: 'Ship', icon: MessageSquare, description: 'Roles, comments, review, and activity' },
  { id: 'plugins', label: 'Plugins', group: 'Ship', icon: Boxes, description: 'Extension permissions, slots, and manifests' },
  { id: 'deploy', label: 'Deployment', group: 'Ship', icon: CloudUpload, description: 'Vercel environments, domains, history, and rollback' },
]
