export type ElementType =
  | 'text'
  | 'button'
  | 'image'
  | 'rectangle'
  | 'input'
  | 'card'
  | 'nav'
  | 'hero'
  | 'form'
  | 'divider'

export type EditorMode = 'select' | 'hand' | 'text' | 'rectangle' | 'prototype'

export type TriggerType =
  | 'click'
  | 'doubleClick'
  | 'hover'
  | 'longPress'
  | 'hold'
  | 'submit'
  | 'keyPress'
  | 'inView'
  | 'mouseMove'
  | 'scrollProgress'

export type ActionType =
  | 'navigate'
  | 'openUrl'
  | 'scrollTo'
  | 'show'
  | 'hide'
  | 'toggle'
  | 'setText'
  | 'animate'
  | 'setVariable'
  | 'setVariant'
  | 'openOverlay'
  | 'closeOverlay'
  | 'submitForm'
  | 'scrollAnimate'

export type StudioSection =
  | 'components' | 'responsive' | 'code' | 'history' | 'interactions'
  | 'assets' | 'design-system' | 'accessibility' | 'seo' | 'data'
  | 'collaboration' | 'plugins' | 'testing' | 'deploy' | 'templates'

export interface LayoutSettings {
  mode: 'absolute' | 'flex' | 'grid'
  direction: 'row' | 'column'
  wrap: boolean
  gap: number
  align: 'start' | 'center' | 'end' | 'stretch'
  justify: 'start' | 'center' | 'end' | 'between'
  widthMode: 'fixed' | 'fill' | 'hug'
  heightMode: 'fixed' | 'fill' | 'hug'
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  columns: number
  constraintX: 'left' | 'right' | 'left-right' | 'center' | 'scale'
  constraintY: 'top' | 'bottom' | 'top-bottom' | 'center' | 'scale'
}

export interface ElementStyle {
  background: string
  color: string
  borderColor: string
  borderWidth: number
  borderRadius: number
  fontSize: number
  fontWeight: number
  textAlign: 'left' | 'center' | 'right'
  opacity: number
  padding: number
  shadow: string
}

export interface CanvasElement {
  id: string
  sourceId?: string
  frameId: string
  type: ElementType
  name: string
  x: number
  y: number
  width: number
  height: number
  content: string
  src?: string
  alt?: string
  href?: string
  visible: boolean
  locked: boolean
  style: ElementStyle
  semanticTag?: 'div' | 'section' | 'header' | 'nav' | 'main' | 'article' | 'aside' | 'footer' | 'h1' | 'h2' | 'h3' | 'p'
  ariaLabel?: string
  componentDefinitionId?: string
  componentVariantId?: string
  componentProps?: Record<string, string>
  layout?: LayoutSettings
  breakpointOverrides?: Partial<Record<'tablet' | 'mobile', Partial<Pick<CanvasElement, 'x' | 'y' | 'width' | 'height' | 'visible'> & { style: Partial<ElementStyle> }>>>
  assetId?: string
  formId?: string
}

export interface Frame {
  id: string
  pageId: string
  name: string
  x: number
  y: number
  width: number
  height: number
  background: string
  device: 'desktop' | 'tablet' | 'mobile' | 'custom'
}

export interface Page {
  id: string
  name: string
  slug: string
  seo?: PageSeoSettings
  customHead?: string
  dynamicCollectionId?: string
}

export interface PrototypeConnection {
  id: string
  sourceConnectionId?: string
  sourceId: string
  targetId: string
  trigger: TriggerType
  action: ActionType
  delay: number
  key?: string
  value?: string
  transition: 'instant' | 'dissolve' | 'slide-left' | 'slide-right' | 'scale'
  duration: number
  condition?: InteractionCondition
  variableId?: string
  variantId?: string
}

export interface DesignTokens {
  primary: string
  canvas: string
  surface: string
  text: string
  muted: string
  radius: number
  fontFamily: string
}

export interface ProjectDocument {
  id: string
  name: string
  version: number
  pages: Page[]
  frames: Frame[]
  elements: CanvasElement[]
  connections: PrototypeConnection[]
  tokens: DesignTokens
  workspace?: ProjectWorkspace
  updatedAt: string
}

export interface ComponentVariant {
  id: string
  name: string
  propertyValues: Record<string, string>
  overrides: Partial<CanvasElement>
}

export interface ComponentDefinition {
  id: string
  name: string
  description: string
  sourceElementId: string
  properties: Array<{ id: string; name: string; type: 'text' | 'boolean' | 'variant'; defaultValue: string }>
  variants: ComponentVariant[]
  createdAt: string
}

export interface AssetRecord {
  id: string
  name: string
  type: 'image' | 'svg' | 'font' | 'video' | 'file'
  folder: string
  src: string
  size: number
  width?: number
  height?: number
  alt?: string
  createdAt: string
}

export interface TokenAlias {
  id: string
  category: 'color' | 'spacing' | 'radius' | 'shadow' | 'type' | 'breakpoint'
  name: string
  value: string
  aliasOf?: string
}

export interface PageSeoSettings {
  title: string
  description: string
  socialImage: string
  canonicalUrl: string
  noIndex: boolean
  structuredData: string
}

export interface ProjectVariable {
  id: string
  name: string
  type: 'string' | 'number' | 'boolean'
  value: string
}

export interface InteractionCondition {
  variableId: string
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan'
  value: string
}

export interface DataField {
  id: string
  name: string
  type: 'text' | 'number' | 'boolean' | 'image' | 'date' | 'url'
  required: boolean
}

export interface DataCollection {
  id: string
  name: string
  slug: string
  fields: DataField[]
  records: Array<{ id: string; values: Record<string, string> }>
}

export interface FormDefinition {
  id: string
  name: string
  elementId?: string
  fields: Array<{ id: string; label: string; type: 'text' | 'email' | 'textarea' | 'checkbox'; required: boolean }>
  successMessage: string
  webhookUrl: string
  submissions: Array<{ id: string; createdAt: string; values: Record<string, string> }>
}

export interface ReviewComment {
  id: string
  author: string
  body: string
  elementId?: string
  pageId?: string
  resolved: boolean
  createdAt: string
}

export interface Collaborator {
  id: string
  name: string
  email: string
  role: 'owner' | 'editor' | 'reviewer' | 'viewer'
  status: 'active' | 'invited'
}

export interface ActivityEntry {
  id: string
  actor: string
  action: string
  createdAt: string
}

export interface PluginManifest {
  id: string
  name: string
  description: string
  version: string
  enabled: boolean
  permissions: Array<'read-project' | 'write-project' | 'export' | 'network'>
  slot: 'component' | 'exporter' | 'data-source' | 'inspector' | 'ai-tool'
}

export interface TestRun {
  id: string
  createdAt: string
  status: 'passed' | 'failed'
  issues: Array<{ id: string; severity: 'error' | 'warning' | 'info'; category: string; message: string; elementId?: string; pageId?: string }>
}

export interface DeploymentRecord {
  id: string
  providerId?: string
  environment: 'preview' | 'production'
  status: 'queued' | 'building' | 'ready' | 'failed' | 'rolled-back'
  url?: string
  createdAt: string
  error?: string
}

export interface DeploymentSettings {
  projectName: string
  teamId: string
  productionBranch: string
  customDomain: string
}

export interface CodeOverride {
  pageId: string
  language: 'html' | 'css' | 'react'
  content: string
  updatedAt: string
}

export interface ProjectWorkspace {
  components: ComponentDefinition[]
  assets: AssetRecord[]
  tokenAliases: TokenAlias[]
  variables: ProjectVariable[]
  collections: DataCollection[]
  forms: FormDefinition[]
  comments: ReviewComment[]
  collaborators: Collaborator[]
  activity: ActivityEntry[]
  plugins: PluginManifest[]
  testRuns: TestRun[]
  deployments: DeploymentRecord[]
  deploymentSettings: DeploymentSettings
  codeOverrides: CodeOverride[]
  redirects: Array<{ id: string; from: string; to: string; permanent: boolean }>
  robots: string
  favicon: string
}

export type AiOperation =
  | { type: 'addElement'; elementType: ElementType; frameId?: string; x?: number; y?: number; content?: string; name?: string }
  | { type: 'updateElement'; elementId: string; changes: Partial<CanvasElement> }
  | { type: 'deleteElement'; elementId: string }
  | { type: 'addPage'; name: string }
  | { type: 'setTokens'; changes: Partial<DesignTokens> }

export interface AiResponse {
  message: string
  operations: AiOperation[]
}

export interface ResponsiveElementLayout {
  sourceId: string
  x: number
  y: number
  width: number
  height: number
  content?: string
  style?: Partial<ElementStyle>
}

export interface ResponsiveLayout {
  frameHeight: number
  elements: ResponsiveElementLayout[]
}
