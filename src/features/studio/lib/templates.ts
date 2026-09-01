import type { ElementType } from '../../../types'

export interface StudioTemplate {
  id: string
  name: string
  category: 'Site' | 'Section' | 'System' | 'Interaction'
  description: string
  elements: Array<{ type: ElementType; x: number; y: number; content: string }>
}

export const studioTemplates: StudioTemplate[] = [
  { id: 'saas-home', name: 'SaaS launch', category: 'Site', description: 'Navigation, focused hero, CTA, and benefit cards.', elements: [
    { type: 'nav', x: 120, y: 32, content: 'Northstar     Product     Pricing     Customers     Sign in' },
    { type: 'hero', x: 120, y: 126, content: 'Build the next useful thing.\nA concise launch page designed around a single conversion goal.' },
    { type: 'button', x: 420, y: 390, content: 'Start free' },
    { type: 'card', x: 120, y: 500, content: 'Fast setup\nGet a complete workspace running in minutes.' },
    { type: 'card', x: 460, y: 500, content: 'Clear analytics\nUnderstand what is moving the business.' },
  ] },
  { id: 'portfolio', name: 'Portfolio intro', category: 'Site', description: 'Personal navigation, editorial introduction, and featured work.', elements: [
    { type: 'nav', x: 100, y: 32, content: 'Your Name     Work     About     Contact' },
    { type: 'text', x: 100, y: 150, content: 'Independent designer and developer making clear digital products.' },
    { type: 'image', x: 100, y: 300, content: '' },
    { type: 'card', x: 460, y: 300, content: 'Selected work\nA focused case study with measurable outcomes.' },
  ] },
  { id: 'contact-section', name: 'Contact conversion', category: 'Section', description: 'A complete contact form section.', elements: [
    { type: 'text', x: 120, y: 120, content: 'Tell us what you are building' },
    { type: 'form', x: 120, y: 210, content: 'Start a conversation\nName\nEmail\nProject details\nSend message' },
  ] },
  { id: 'pricing-flow', name: 'Pricing interaction', category: 'Interaction', description: 'Pricing cards and conversion buttons ready to connect.', elements: [
    { type: 'card', x: 120, y: 160, content: 'Starter\nFor personal projects and prototypes.' },
    { type: 'button', x: 196, y: 370, content: 'Choose Starter' },
    { type: 'card', x: 470, y: 160, content: 'Team\nFor shipping products with collaborators.' },
    { type: 'button', x: 546, y: 370, content: 'Choose Team' },
  ] },
]
