import type { CanvasElement, ElementStyle, ElementType, ProjectDocument } from '../types'

export const uid = (prefix: string) => `${prefix}_${crypto.randomUUID().slice(0, 8)}`

export const baseStyle: ElementStyle = {
  background: 'transparent',
  color: '#171717',
  borderColor: '#deded8',
  borderWidth: 0,
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 400,
  textAlign: 'left',
  opacity: 1,
  padding: 0,
  shadow: 'none',
}

type Preset = Pick<CanvasElement, 'name' | 'width' | 'height' | 'content' | 'style'> & Partial<CanvasElement>

export const elementPresets: Record<ElementType, Preset> = {
  text: {
    name: 'Text', width: 240, height: 48, content: 'Write something clear and useful',
    style: { ...baseStyle, fontSize: 24, fontWeight: 600 },
  },
  button: {
    name: 'Button', width: 148, height: 44, content: 'Get started',
    style: { ...baseStyle, background: '#171717', color: '#ffffff', borderRadius: 10, fontWeight: 600, textAlign: 'center', padding: 12 },
  },
  image: {
    name: 'Image', width: 320, height: 220, content: '', alt: 'Decorative placeholder',
    src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
    style: { ...baseStyle, background: '#eeeeea', borderRadius: 14 },
  },
  rectangle: {
    name: 'Rectangle', width: 220, height: 140, content: '',
    style: { ...baseStyle, background: '#e8ecff', borderRadius: 14 },
  },
  input: {
    name: 'Email input', width: 280, height: 46, content: 'Email address',
    style: { ...baseStyle, background: '#ffffff', borderWidth: 1, borderRadius: 10, padding: 12, color: '#6b6b66' },
  },
  card: {
    name: 'Feature card', width: 300, height: 190, content: 'Built for focused teams\nCreate, connect, and ship without handoff friction.',
    style: { ...baseStyle, background: '#ffffff', borderWidth: 1, borderRadius: 16, padding: 24, fontSize: 18, fontWeight: 600, shadow: '0 12px 30px rgba(20,20,20,.08)' },
  },
  nav: {
    name: 'Navigation', width: 760, height: 64, content: 'Framewire     Product     Templates     Pricing     Sign in',
    style: { ...baseStyle, background: '#ffffff', borderColor: '#eeeeea', borderWidth: 1, borderRadius: 14, padding: 20, fontSize: 14, fontWeight: 600 },
  },
  hero: {
    name: 'Hero section', width: 760, height: 330, content: 'The canvas that ships.\nDesign, connect, preview, and export real websites from one workspace.',
    style: { ...baseStyle, background: '#f2f3ff', borderRadius: 22, padding: 42, fontSize: 42, fontWeight: 650, textAlign: 'center' },
  },
  form: {
    name: 'Contact form', width: 380, height: 300, content: 'Let’s talk\nName\nEmail\nTell us about your project\nSend message',
    style: { ...baseStyle, background: '#ffffff', borderWidth: 1, borderRadius: 16, padding: 24, fontSize: 16, fontWeight: 500, shadow: '0 10px 30px rgba(20,20,20,.06)' },
  },
  divider: {
    name: 'Divider', width: 420, height: 1, content: '',
    style: { ...baseStyle, background: '#deded8' },
  },
}

export const createElement = (type: ElementType, frameId: string, x = 80, y = 80): CanvasElement => ({
  id: uid('el'),
  frameId,
  type,
  x,
  y,
  visible: true,
  locked: false,
  ...elementPresets[type],
}) as CanvasElement

const pageId = 'page_home'
const frameId = 'frame_home'

export const initialProject: ProjectDocument = {
  id: uid('project'),
  name: 'Untitled website',
  version: 1,
  updatedAt: new Date().toISOString(),
  pages: [{ id: pageId, name: 'Home', slug: 'index' }],
  frames: [{ id: frameId, pageId, name: 'Home / Desktop', x: 180, y: 90, width: 1200, height: 780, background: '#ffffff', device: 'desktop' }],
  elements: [
    { ...createElement('nav', frameId, 220, 38), width: 760 },
    { ...createElement('hero', frameId, 220, 135), width: 760 },
    { ...createElement('button', frameId, 526, 400), content: 'Start building' },
    { ...createElement('card', frameId, 220, 510), content: 'Visual by default\nCompose polished interfaces directly on the canvas.' },
    { ...createElement('card', frameId, 560, 510), content: 'Real interactions\nConnect elements and configure production-ready behavior.' },
  ],
  connections: [],
  tokens: {
    primary: '#4f5ff7', canvas: '#e9e9e4', surface: '#ffffff', text: '#171717', muted: '#6f6f69', radius: 10,
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
}
