import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { CanvasElement, ProjectDocument } from '../../../types'
import { logger } from '../../../lib/logger'

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!)
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'framewire-site'

const elementHtml = (element: CanvasElement, interactions: unknown[]) => {
  const attributes = `id="${element.id}" class="fw-element fw-${element.type}" data-interactions="${escapeHtml(JSON.stringify(interactions))}"`
  const content = escapeHtml(element.content).replace(/\n/g, '<br>')
  if (element.type === 'image') return `<img ${attributes} src="${escapeHtml(element.src || '')}" alt="${escapeHtml(element.alt || '')}">`
  if (element.type === 'input') return `<input ${attributes} placeholder="${escapeHtml(element.content)}">`
  if (element.type === 'button') return `<button ${attributes}>${content}</button>`
  if (element.type === 'form') return `<form ${attributes}>${content}</form>`
  return `<div ${attributes}>${content}</div>`
}

const cssForElement = (element: CanvasElement) => {
  const style = element.style
  return `#${element.id}{left:${element.x}px;top:${element.y}px;width:${element.width}px;height:${element.height}px;background:${style.background};color:${style.color};border:${style.borderWidth}px solid ${style.borderColor};border-radius:${style.borderRadius}px;font-size:${style.fontSize}px;font-weight:${style.fontWeight};text-align:${style.textAlign};opacity:${style.opacity};padding:${style.padding}px;box-shadow:${style.shadow};${element.visible ? '' : 'display:none;'}}`
}

const runtimeScript = `(() => {
  const pause = (ms, fn) => window.setTimeout(fn, Math.max(0, Number(ms) || 0));
  const run = (interaction) => pause(interaction.delay, () => {
    const target = document.getElementById(interaction.targetId);
    if (interaction.action === 'navigate' && interaction.targetPage) location.href = interaction.targetPage;
    if (interaction.action === 'openUrl' && interaction.value) window.open(interaction.value, '_blank', 'noopener,noreferrer');
    if (interaction.action === 'scrollTo') target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (interaction.action === 'show' && target) target.style.display = '';
    if (interaction.action === 'hide' && target) target.style.display = 'none';
    if (interaction.action === 'toggle' && target) target.style.display = target.style.display === 'none' ? '' : 'none';
    if (interaction.action === 'setText' && target) target.textContent = interaction.value || '';
    if (interaction.action === 'animate' && target) target.animate([{transform:'scale(1)'},{transform:'scale(1.04)'},{transform:'scale(1)'}], {duration: interaction.duration || 300});
  });
  document.querySelectorAll('[data-interactions]').forEach((node) => {
    let interactions = []; try { interactions = JSON.parse(node.dataset.interactions || '[]'); } catch {}
    const fire = (trigger, event) => interactions.filter((item) => item.trigger === trigger && (!item.key || item.key === event?.key)).forEach(run);
    node.addEventListener('click', (e) => fire('click', e));
    node.addEventListener('dblclick', (e) => fire('doubleClick', e));
    node.addEventListener('mouseenter', (e) => fire('hover', e));
    node.addEventListener('keydown', (e) => fire('keyPress', e));
    node.addEventListener('submit', (e) => { e.preventDefault(); fire('submit', e); });
    let timer; node.addEventListener('pointerdown', () => { const timed = interactions.filter((item) => item.trigger === 'longPress' || item.trigger === 'hold'); timer = setTimeout(() => timed.forEach(run), timed.some((item) => item.trigger === 'longPress') ? 650 : 350); });
    ['pointerup','pointerleave'].forEach((name) => node.addEventListener(name, () => clearTimeout(timer)));
  });
  const observer = new IntersectionObserver((entries) => entries.filter((entry) => entry.isIntersecting).forEach((entry) => { const list = JSON.parse(entry.target.dataset.interactions || '[]'); list.filter((item) => item.trigger === 'inView').forEach(run); observer.unobserve(entry.target); }), { threshold: .4 });
  document.querySelectorAll('[data-interactions]').forEach((node) => observer.observe(node));
})();`

export async function exportProjectZip(project: ProjectDocument) {
  const zip = new JSZip()
  const routeByTarget = new Map<string, string>()
  project.pages.forEach((page) => {
    const filename = page.slug === 'index' ? 'index.html' : `${page.slug}.html`
    project.frames.filter((frame) => frame.pageId === page.id).forEach((frame) => {
      routeByTarget.set(frame.id, filename)
      project.elements.filter((element) => element.frameId === frame.id).forEach((element) => routeByTarget.set(element.id, filename))
    })
  })
  const cssParts = [`:root{--fw-primary:${project.tokens.primary};--fw-text:${project.tokens.text};--fw-muted:${project.tokens.muted};--fw-radius:${project.tokens.radius}px;font-family:${project.tokens.fontFamily};color:${project.tokens.text};background:${project.tokens.surface};}`, '*{box-sizing:border-box}', 'html,body{margin:0;min-height:100%;}', 'body{overflow-x:hidden}', '.fw-page{position:relative;margin:0 auto;overflow:hidden}', '.fw-element{position:absolute;white-space:pre-line;overflow:hidden;font:inherit}', '.fw-image{object-fit:cover}', 'button,input,form{font:inherit}', 'button,[data-interactions]:not([data-interactions="[]"]){cursor:pointer}', ':focus-visible{outline:2px solid var(--fw-primary);outline-offset:2px}', '@media(max-width:800px){.fw-page{transform-origin:top left;max-width:100%;}}']

  project.pages.forEach((page) => {
    const frame = project.frames.find((item) => item.pageId === page.id)
    if (!frame) return
    const elements = project.elements.filter((element) => element.frameId === frame.id)
    const body = elements.map((element) => {
      const interactions = project.connections.filter((connection) => connection.sourceId === element.id).map((connection) => ({ ...connection, targetPage: routeByTarget.get(connection.targetId) }))
      cssParts.push(cssForElement(element))
      return elementHtml(element, interactions)
    }).join('\n')
    const filename = page.slug === 'index' ? 'index.html' : `${page.slug}.html`
    zip.file(filename, `<!doctype html>\n<html lang="en">\n<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="${frame.background}"><link rel="icon" href="framewire-icon.png"><link rel="stylesheet" href="styles.css"><title>${escapeHtml(page.name)} · ${escapeHtml(project.name)}</title></head>\n<body><main class="fw-page" style="width:${frame.width}px;min-height:${frame.height}px;background:${frame.background}">${body}</main><script src="runtime.js"></script></body>\n</html>`)
  })
  zip.file('styles.css', cssParts.join('\n'))
  zip.file('runtime.js', runtimeScript)
  zip.file('framewire-project.json', JSON.stringify(project, null, 2))
  zip.file('README.md', `# ${project.name}\n\nExported from Framewire. Open index.html directly or serve this folder with any static host.\n\nGenerated pages: ${project.pages.map((page) => page.name).join(', ')}.\n`)
  try {
    const icon = await fetch('/framewire-icon.png').then((response) => response.blob())
    zip.file('framewire-icon.png', icon)
  } catch (error) {
    logger.warn('export', 'App icon could not be added to ZIP', { error: String(error) })
  }
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
  saveAs(blob, `${slugify(project.name)}-source.zip`)
  logger.info('export', 'Project ZIP generated', { pages: project.pages.length, elements: project.elements.length })
}

export function exportProjectJson(project: ProjectDocument) {
  saveAs(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }), `${slugify(project.name)}.framewire.json`)
}
