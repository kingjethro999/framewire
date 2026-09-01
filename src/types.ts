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

export type ActionType =
  | 'navigate'
  | 'openUrl'
  | 'scrollTo'
  | 'show'
  | 'hide'
  | 'toggle'
  | 'setText'
  | 'animate'

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
  updatedAt: string
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
