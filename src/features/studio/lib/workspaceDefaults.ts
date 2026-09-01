import type { LayoutSettings, ProjectWorkspace } from '../../../types'

export const defaultLayout: LayoutSettings = {
  mode: 'absolute', direction: 'column', wrap: false, gap: 16,
  align: 'start', justify: 'start', widthMode: 'fixed', heightMode: 'fixed',
  columns: 2, constraintX: 'left', constraintY: 'top',
}

export const createWorkspace = (): ProjectWorkspace => ({
  components: [], assets: [], tokenAliases: [
    { id: 'token_primary', category: 'color', name: 'color.primary', value: '#4f5ff7' },
    { id: 'token_space_md', category: 'spacing', name: 'space.md', value: '16px' },
    { id: 'token_radius_md', category: 'radius', name: 'radius.md', value: '10px' },
    { id: 'token_shadow_sm', category: 'shadow', name: 'shadow.sm', value: '0 4px 16px rgba(20,20,20,.08)' },
    { id: 'token_tablet', category: 'breakpoint', name: 'breakpoint.tablet', value: '1024px' },
    { id: 'token_mobile', category: 'breakpoint', name: 'breakpoint.mobile', value: '600px' },
  ],
  variables: [], collections: [], forms: [], comments: [],
  collaborators: [{ id: 'owner', name: 'Project owner', email: '', role: 'owner', status: 'active' }],
  activity: [],
  plugins: [
    { id: 'builtin-a11y', name: 'Accessibility assistant', description: 'Checks contrast, semantics, labels, and touch targets.', version: '1.0.0', enabled: true, permissions: ['read-project', 'write-project'], slot: 'inspector' },
    { id: 'builtin-static', name: 'Static website exporter', description: 'Exports accessible HTML, CSS, JavaScript, and project data.', version: '1.0.0', enabled: true, permissions: ['read-project', 'export'], slot: 'exporter' },
  ],
  testRuns: [], deployments: [],
  deploymentSettings: { projectName: '', teamId: '', productionBranch: 'main', customDomain: '' },
  codeOverrides: [], redirects: [],
  robots: 'User-agent: *\nAllow: /\nSitemap: /sitemap.xml', favicon: '/framewire-icon.png',
})

export const withWorkspace = (workspace?: ProjectWorkspace): ProjectWorkspace => ({
  ...createWorkspace(),
  ...workspace,
  deploymentSettings: { ...createWorkspace().deploymentSettings, ...workspace?.deploymentSettings },
})
