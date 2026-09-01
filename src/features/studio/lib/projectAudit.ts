import type { CanvasElement, ProjectDocument, TestRun } from '../../../types'
import { uid } from '../../../lib/defaults'

const luminance = (hex: string) => {
  const rgb = hex.replace('#', '').match(/.{2}/g)?.map((part) => parseInt(part, 16) / 255) ?? [0, 0, 0]
  return rgb.map((value) => value <= .03928 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0)
}

export const contrastRatio = (foreground: string, background: string) => {
  if (!/^#[0-9a-f]{6}$/i.test(foreground) || !/^#[0-9a-f]{6}$/i.test(background)) return 21
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  return (lighter + .05) / (darker + .05)
}

export const auditProject = (project: ProjectDocument): TestRun['issues'] => {
  const issues: TestRun['issues'] = []
  const add = (issue: Omit<TestRun['issues'][number], 'id'>) => issues.push({ id: uid('issue'), ...issue })
  project.pages.forEach((page) => {
    const frames = project.frames.filter((frame) => frame.pageId === page.id)
    if (!frames.length) add({ severity: 'error', category: 'Structure', message: `${page.name} has no frame.`, pageId: page.id })
    if (!page.seo?.title || !page.seo?.description) add({ severity: 'warning', category: 'SEO', message: `${page.name} is missing a custom title or description.`, pageId: page.id })
    if (!frames.some((frame) => frame.device === 'mobile')) add({ severity: 'info', category: 'Responsive', message: `${page.name} has no dedicated mobile frame.`, pageId: page.id })
  })
  project.elements.forEach((element) => {
    const frame = project.frames.find((item) => item.id === element.frameId)
    if (!frame) return add({ severity: 'error', category: 'Structure', message: `${element.name} references a missing frame.`, elementId: element.id })
    if (element.x < 0 || element.y < 0 || element.x + element.width > frame.width || element.y + element.height > frame.height) add({ severity: 'warning', category: 'Overflow', message: `${element.name} extends outside ${frame.name}.`, elementId: element.id })
    if (element.type === 'image' && !element.alt?.trim()) add({ severity: 'error', category: 'Accessibility', message: `${element.name} needs alternative text.`, elementId: element.id })
    if ((element.type === 'button' || element.type === 'input') && (element.width < 44 || element.height < 44)) add({ severity: 'warning', category: 'Accessibility', message: `${element.name} has a touch target smaller than 44 px.`, elementId: element.id })
    if (contrastRatio(element.style.color, element.style.background) < 4.5 && element.style.background !== 'transparent') add({ severity: 'warning', category: 'Accessibility', message: `${element.name} has low text contrast.`, elementId: element.id })
  })
  project.frames.forEach((frame) => {
    const elements = project.elements.filter((element) => element.frameId === frame.id && element.visible)
    for (let index = 0; index < elements.length; index += 1) {
      for (let next = index + 1; next < elements.length; next += 1) {
        const a = elements[index]; const b = elements[next]
        const overlap = a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
        if (overlap && a.type !== 'rectangle' && b.type !== 'rectangle') add({ severity: 'info', category: 'Overlap', message: `${a.name} overlaps ${b.name} in ${frame.name}.`, elementId: a.id })
      }
    }
  })
  project.connections.forEach((connection) => {
    const targetExists = project.elements.some((item) => item.id === connection.targetId) || project.frames.some((item) => item.id === connection.targetId)
    if (!targetExists) add({ severity: 'error', category: 'Interaction', message: 'An interaction points to a missing destination.', elementId: connection.sourceId })
  })
  return issues.slice(0, 100)
}

export const suggestedFix = (element: CanvasElement): Partial<CanvasElement> => {
  if (element.type === 'image' && !element.alt) return { alt: element.name }
  if (element.type === 'button' || element.type === 'input') return { width: Math.max(44, element.width), height: Math.max(44, element.height), ariaLabel: element.ariaLabel || element.content || element.name }
  return { ariaLabel: element.ariaLabel || element.name }
}
