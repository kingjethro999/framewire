import type { CanvasElement, Page, ProjectDocument } from '../../../types'

const safe = (value: string) => value.replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character]!)

const elementMarkup = (element: CanvasElement) => {
  const tag = element.semanticTag ?? (element.type === 'button' ? 'button' : element.type === 'nav' ? 'nav' : element.type === 'hero' ? 'section' : 'div')
  if (element.type === 'image') return `<img data-framewire-id="${element.id}" src="${element.src ?? ''}" alt="${element.alt ?? ''}" />`
  if (element.type === 'input') return `<input data-framewire-id="${element.id}" aria-label="${element.ariaLabel ?? element.content}" placeholder="${element.content}" />`
  return `<${tag} data-framewire-id="${element.id}">${safe(element.content)}</${tag}>`
}

const elementCss = (element: CanvasElement) => `[data-framewire-id="${element.id}"] {\n  position: absolute;\n  left: ${element.x}px;\n  top: ${element.y}px;\n  width: ${element.width}px;\n  height: ${element.height}px;\n  color: ${element.style.color};\n  background: ${element.style.background};\n  border-radius: ${element.style.borderRadius}px;\n  padding: ${element.style.padding}px;\n}`

export const generatePageCode = (project: ProjectDocument, page: Page, language: 'html' | 'css' | 'react') => {
  const frames = project.frames.filter((frame) => frame.pageId === page.id)
  const frame = frames.find((item) => item.device === 'desktop') ?? frames[0]
  const elements = frame ? project.elements.filter((element) => element.frameId === frame.id) : []
  if (language === 'css') return elements.map(elementCss).join('\n\n')
  if (language === 'react') return `export function ${page.name.replace(/[^a-z0-9]/gi, '') || 'Page'}() {\n  return (\n    <main className="framewire-page">\n${elements.map((element) => `      ${elementMarkup(element).replace(/ class=/g, ' className=')}`).join('\n')}\n    </main>\n  )\n}`
  return `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n  <title>${page.seo?.title || page.name}</title>\n</head>\n<body>\n  <main class="framewire-page">\n${elements.map((element) => `    ${elementMarkup(element)}`).join('\n')}\n  </main>\n</body>\n</html>`
}

export const validateCode = (content: string, language: 'html' | 'css' | 'react') => {
  if (!content.trim()) return 'Code cannot be empty.'
  const pairs = language === 'css' ? [['{', '}']] : [['<', '>'], ['{', '}'], ['(', ')']]
  for (const [open, close] of pairs) if (content.split(open).length !== content.split(close).length) return `Unbalanced ${open}${close} characters.`
  if ((language === 'html' || language === 'react') && !content.includes('data-framewire-id')) return 'Keep at least one data-framewire-id attribute so canvas syncing remains safe.'
  return null
}

export const extractContentUpdates = (content: string) => {
  const updates: Array<{ id: string; content: string }> = []
  const pattern = /data-framewire-id=["']([^"']+)["'][^>]*>([^<]*)</g
  for (const match of content.matchAll(pattern)) updates.push({ id: match[1], content: match[2].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') })
  return updates
}
