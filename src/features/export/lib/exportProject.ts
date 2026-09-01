import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { CanvasElement, FormDefinition, ProjectDocument } from '../../../types'
import { logger } from '../../../lib/logger'
import { withWorkspace } from '../../studio/lib/workspaceDefaults'

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!)
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'framewire-site'

const elementHtml = (element: CanvasElement, interactions: unknown[], form?: FormDefinition) => {
  const attributes = `id="${element.id}" class="fw-element fw-${element.type}" data-framewire-id="${element.id}" data-interactions="${escapeHtml(JSON.stringify(interactions))}"${element.ariaLabel ? ` aria-label="${escapeHtml(element.ariaLabel)}"` : ''}`
  const content = escapeHtml(element.content).replace(/\n/g, '<br>')
  if (element.type === 'image') return `<img ${attributes} src="${escapeHtml(element.src || '')}" alt="${escapeHtml(element.alt || '')}">`
  if (element.type === 'input') return `<input ${attributes} placeholder="${escapeHtml(element.content)}">`
  if (element.type === 'button') return `<button ${attributes}>${content}</button>`
  if (element.type === 'form' && form) return `<form ${attributes}>${form.fields.map((field) => `<label>${escapeHtml(field.label)}${field.type === 'textarea' ? `<textarea name="${field.id}"${field.required ? ' required' : ''}></textarea>` : `<input name="${field.id}" type="${field.type}"${field.required ? ' required' : ''}>`}</label>`).join('')}<button type="submit">Submit</button><p role="status" hidden>${escapeHtml(form.successMessage)}</p></form>`
  if (element.type === 'form') return `<form ${attributes}>${content}</form>`
  const tag = element.semanticTag ?? (element.type === 'nav' ? 'nav' : element.type === 'hero' ? 'section' : 'div')
  return `<${tag} ${attributes}>${content}</${tag}>`
}

const cssForElement = (element: CanvasElement) => {
  const style = element.style
  const layout = element.layout
  return `#${element.id}{left:${element.x}px;top:${element.y}px;width:${layout?.widthMode === 'fill' ? 'calc(100% - 64px)' : layout?.widthMode === 'hug' ? 'max-content' : `${element.width}px`};height:${layout?.heightMode === 'hug' ? 'auto' : `${element.height}px`};min-width:${layout?.minWidth ?? 0}px;max-width:${layout?.maxWidth ? `${layout.maxWidth}px` : 'none'};min-height:${layout?.minHeight ?? 0}px;max-height:${layout?.maxHeight ? `${layout.maxHeight}px` : 'none'};background:${style.background};color:${style.color};border:${style.borderWidth}px solid ${style.borderColor};border-radius:${style.borderRadius}px;font-size:${style.fontSize}px;font-weight:${style.fontWeight};text-align:${style.textAlign};opacity:${style.opacity};padding:${style.padding}px;box-shadow:${style.shadow};${element.visible ? '' : 'display:none;'}}`
}

const runtimeScript = (project: ProjectDocument) => `(() => {
  const variables = ${JSON.stringify(Object.fromEntries(withWorkspace(project.workspace).variables.map((variable) => [variable.id, variable.value])))};
  const pause = (ms, fn) => window.setTimeout(fn, Math.max(0, Number(ms) || 0));
  const run = (interaction) => pause(interaction.delay, () => {
    if (interaction.condition) {
      const actual = variables[interaction.condition.variableId]; const expected = interaction.condition.value; const operator = interaction.condition.operator;
      const allowed = operator === 'equals' ? String(actual) === expected : operator === 'notEquals' ? String(actual) !== expected : operator === 'contains' ? String(actual).includes(expected) : operator === 'greaterThan' ? Number(actual) > Number(expected) : Number(actual) < Number(expected);
      if (!allowed) return;
    }
    const target = document.getElementById(interaction.targetId);
    if (interaction.action === 'navigate' && interaction.targetPage) location.href = interaction.targetPage;
    if (interaction.action === 'openUrl' && interaction.value) window.open(interaction.value, '_blank', 'noopener,noreferrer');
    if (interaction.action === 'scrollTo') target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (interaction.action === 'show' && target) target.style.display = '';
    if (interaction.action === 'hide' && target) target.style.display = 'none';
    if (interaction.action === 'toggle' && target) target.style.display = target.style.display === 'none' ? '' : 'none';
    if (interaction.action === 'setText' && target) target.textContent = interaction.value || '';
    if ((interaction.action === 'animate' || interaction.action === 'scrollAnimate') && target) target.animate([{transform:'scale(1)'},{transform:'scale(1.04)'},{transform:'scale(1)'}], {duration: interaction.duration || 300});
    if (interaction.action === 'setVariable' && interaction.variableId) variables[interaction.variableId] = interaction.value || '';
    if (interaction.action === 'setVariant' && target) target.dataset.variant = interaction.variantId || interaction.value || 'default';
    if (interaction.action === 'openOverlay' && target) { target.style.display = ''; target.setAttribute('role', 'dialog'); target.setAttribute('aria-modal', 'true'); }
    if (interaction.action === 'closeOverlay' && target) target.style.display = 'none';
    if (interaction.action === 'submitForm' && target instanceof HTMLFormElement) target.requestSubmit();
  });
  document.querySelectorAll('[data-interactions]').forEach((node) => {
    let interactions = []; try { interactions = JSON.parse(node.dataset.interactions || '[]'); } catch {}
    const fire = (trigger, event) => interactions.filter((item) => item.trigger === trigger && (!item.key || item.key === event?.key)).forEach(run);
    node.addEventListener('click', (e) => fire('click', e));
    node.addEventListener('dblclick', (e) => fire('doubleClick', e));
    node.addEventListener('mouseenter', (e) => fire('hover', e));
    node.addEventListener('mousemove', (e) => fire('mouseMove', e));
    node.addEventListener('wheel', (e) => fire('scrollProgress', e), {passive:true});
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
  const workspace = withWorkspace(project.workspace)
  const tabletBreakpoint = Number.parseInt(workspace.tokenAliases.find((token) => token.name === 'breakpoint.tablet')?.value ?? '1024', 10) || 1024
  const mobileBreakpoint = Number.parseInt(workspace.tokenAliases.find((token) => token.name === 'breakpoint.mobile')?.value ?? '600', 10) || 600
  const routeByTarget = new Map<string, string>()
  project.pages.forEach((page) => {
    const filename = page.slug === 'index' ? 'index.html' : `${page.slug}.html`
    project.frames.filter((frame) => frame.pageId === page.id).forEach((frame) => {
      routeByTarget.set(frame.id, filename)
      project.elements.filter((element) => element.frameId === frame.id).forEach((element) => routeByTarget.set(element.id, filename))
    })
  })
  const cssParts = [
    `:root{--fw-primary:${project.tokens.primary};--fw-text:${project.tokens.text};--fw-muted:${project.tokens.muted};--fw-radius:${project.tokens.radius}px;font-family:${project.tokens.fontFamily};color:${project.tokens.text};background:${project.tokens.surface};}`,
    '*{box-sizing:border-box}', 'html,body{margin:0;min-height:100%;}', 'body{overflow-x:hidden}',
    '.fw-page{position:relative;min-height:100vh}', '.fw-device-frame{position:relative;margin:0 auto;overflow:hidden;max-width:100%}',
    '.fw-tablet,.fw-mobile{display:none}', '.fw-element{position:absolute;white-space:pre-line;overflow:hidden;font:inherit}',
    '.fw-image{object-fit:cover}', 'button,input,form{font:inherit}', 'button,[data-interactions]:not([data-interactions="[]"]){cursor:pointer}',
    ':focus-visible{outline:2px solid var(--fw-primary);outline-offset:2px}', '@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}',
    `@media(max-width:${tabletBreakpoint}px){.fw-page.has-tablet .fw-desktop{display:none}.fw-page.has-tablet .fw-tablet{display:block}}`,
    `@media(max-width:${mobileBreakpoint}px){.fw-page.has-mobile .fw-desktop,.fw-page.has-mobile .fw-tablet{display:none}.fw-page.has-mobile .fw-mobile{display:block}}`,
  ]

  project.pages.forEach((page) => {
    const frames = project.frames.filter((item) => item.pageId === page.id)
    const primaryFrame = frames.find((frame) => frame.device === 'desktop') ?? frames[0]
    if (!primaryFrame) return
    const responsiveFrames = ['desktop', 'tablet', 'mobile'].flatMap((device) => {
      const frame = frames.find((candidate) => candidate.device === device)
      if (!frame) return []
      const elements = project.elements.filter((element) => element.frameId === frame.id)
      const body = elements.map((element) => {
        const interactions = project.connections.filter((connection) => connection.sourceId === element.id).map((connection) => ({ ...connection, targetPage: routeByTarget.get(connection.targetId) }))
        cssParts.push(cssForElement(element))
        return elementHtml(element, interactions, workspace.forms.find((form) => form.id === element.formId))
      }).join('\n')
      return [`<section class="fw-device-frame fw-${device}" style="width:${frame.width}px;min-height:${frame.height}px;background:${frame.background}">${body}</section>`]
    }).join('\n')
    const pageClasses = ['fw-page', frames.some((frame) => frame.device === 'tablet') && 'has-tablet', frames.some((frame) => frame.device === 'mobile') && 'has-mobile'].filter(Boolean).join(' ')
    const filename = page.slug === 'index' ? 'index.html' : `${page.slug}.html`
    const seo = page.seo
    const title = seo?.title || `${page.name} · ${project.name}`
    zip.file(filename, `<!doctype html>\n<html lang="en">\n<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="${primaryFrame.background}"><link rel="icon" href="${escapeHtml(workspace.favicon || 'framewire-icon.png')}"><link rel="stylesheet" href="styles.css"><title>${escapeHtml(title)}</title>${seo?.description ? `<meta name="description" content="${escapeHtml(seo.description)}">` : ''}${seo?.noIndex ? '<meta name="robots" content="noindex,nofollow">' : ''}${seo?.canonicalUrl ? `<link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}">` : ''}${seo?.socialImage ? `<meta property="og:image" content="${escapeHtml(seo.socialImage)}">` : ''}${seo?.structuredData ? `<script type="application/ld+json">${seo.structuredData}</script>` : ''}${page.customHead ?? ''}</head>\n<body><main class="${pageClasses}">${responsiveFrames}</main><script src="runtime.js"></script></body>\n</html>`)
  })
  zip.file('styles.css', cssParts.join('\n'))
  zip.file('runtime.js', runtimeScript(project))
  zip.file('robots.txt', workspace.robots)
  zip.file('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${project.pages.filter((page) => !page.seo?.noIndex).map((page) => `<url><loc>/${page.slug === 'index' ? '' : `${page.slug}.html`}</loc></url>`).join('')}</urlset>`)
  zip.file('vercel.json', JSON.stringify({ redirects: workspace.redirects.map((item) => ({ source: item.from, destination: item.to, permanent: item.permanent })) }, null, 2))
  zip.file('data/collections.json', JSON.stringify(workspace.collections, null, 2))
  zip.file('data/forms.json', JSON.stringify(workspace.forms.map((form) => ({ ...form, submissions: [] })), null, 2))
  zip.file('framewire-plugins.json', JSON.stringify(workspace.plugins, null, 2))
  workspace.codeOverrides.forEach((override) => zip.file(`code-overrides/${override.pageId}.${override.language === 'react' ? 'tsx' : override.language}`, override.content))
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
