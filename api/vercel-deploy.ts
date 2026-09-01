import type { IncomingMessage, ServerResponse } from 'node:http'

const safe = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!)
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '') || 'framewire-site'

const readBody = async (request: IncomingMessage) => {
  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

const buildFiles = (project: any) => {
  const files: Array<{ file: string; data: string }> = []
  for (const page of project.pages ?? []) {
    const frame = (project.frames ?? []).find((item: any) => item.pageId === page.id && item.device === 'desktop') ?? (project.frames ?? []).find((item: any) => item.pageId === page.id)
    if (!frame) continue
    const elements = (project.elements ?? []).filter((item: any) => item.frameId === frame.id)
    const body = elements.map((element: any) => element.type === 'image' ? `<img id="${element.id}" src="${safe(element.src || '')}" alt="${safe(element.alt || '')}">` : `<div id="${element.id}" class="fw-${element.type}">${safe(element.content || '')}</div>`).join('')
    const css = elements.map((element: any) => `#${element.id}{position:absolute;left:${element.x}px;top:${element.y}px;width:${element.width}px;height:${element.height}px;background:${element.style.background};color:${element.style.color};border-radius:${element.style.borderRadius}px;padding:${element.style.padding}px;overflow:hidden;white-space:pre-line}`).join('')
    const seo = page.seo ?? {}
    const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${safe(seo.title || page.name)}</title><meta name="description" content="${safe(seo.description || '')}">${seo.noIndex ? '<meta name="robots" content="noindex,nofollow">' : ''}${seo.canonicalUrl ? `<link rel="canonical" href="${safe(seo.canonicalUrl)}">` : ''}${seo.structuredData ? `<script type="application/ld+json">${seo.structuredData}</script>` : ''}${page.customHead || ''}<style>*{box-sizing:border-box}body{margin:0;font-family:${project.tokens?.fontFamily || 'sans-serif'}}main{position:relative;width:min(100%,${frame.width}px);min-height:${frame.height}px;margin:auto;background:${frame.background}}${css}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;animation:none!important}}</style></head><body><main>${body}</main></body></html>`
    files.push({ file: page.slug === 'index' ? 'index.html' : `${page.slug}.html`, data: html })
  }
  const workspace = project.workspace ?? {}
  files.push({ file: 'robots.txt', data: workspace.robots || 'User-agent: *\nAllow: /' })
  files.push({ file: 'sitemap.xml', data: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${(project.pages ?? []).map((page: any) => `<url><loc>/${page.slug === 'index' ? '' : `${page.slug}.html`}</loc></url>`).join('')}</urlset>` })
  files.push({ file: 'vercel.json', data: JSON.stringify({ redirects: workspace.redirects?.map((item: any) => ({ source: item.from, destination: item.to, permanent: item.permanent })) ?? [] }) })
  files.push({ file: 'framewire-project.json', data: JSON.stringify(project) })
  return files.map((file) => ({ ...file, data: Buffer.from(file.data).toString('base64'), encoding: 'base64' }))
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  response.setHeader('Content-Type', 'application/json')
  const token = process.env.VERCEL_TOKEN
  if (!token) { response.statusCode = 503; return response.end(JSON.stringify({ error: 'VERCEL_TOKEN is not configured on the server.' })) }
  try {
    if (request.method === 'GET') {
      const url = new URL(request.url || '', 'http://localhost')
      const id = url.searchParams.get('id'); const teamId = url.searchParams.get('teamId')
      if (!id) { response.statusCode = 400; return response.end(JSON.stringify({ error: 'Deployment ID is required.' })) }
      const upstream = await fetch(`https://api.vercel.com/v13/deployments/${encodeURIComponent(id)}${teamId ? `?teamId=${encodeURIComponent(teamId)}` : ''}`, { headers: { Authorization: `Bearer ${token}` } })
      const body: any = await upstream.json()
      response.statusCode = upstream.status
      return response.end(JSON.stringify(upstream.ok ? { status: body.readyState, url: body.url } : { error: body.error?.message || 'Vercel status request failed.' }))
    }
    if (request.method !== 'POST') { response.statusCode = 405; return response.end(JSON.stringify({ error: 'Method not allowed.' })) }
    const { project, settings, environment, restoreDeploymentId } = await readBody(request)
    if (!project?.pages || !settings?.projectName) { response.statusCode = 400; return response.end(JSON.stringify({ error: 'Project and Vercel project name are required.' })) }
    const query = settings.teamId ? `?teamId=${encodeURIComponent(settings.teamId)}&skipAutoDetectionConfirmation=1` : '?skipAutoDetectionConfirmation=1'
    const payload = restoreDeploymentId ? { name: slug(settings.projectName), project: slug(settings.projectName), deploymentId: restoreDeploymentId, target: environment === 'production' ? 'production' : undefined } : { name: slug(settings.projectName), project: slug(settings.projectName), files: buildFiles(project), target: environment === 'production' ? 'production' : undefined, projectSettings: { framework: null } }
    const upstream = await fetch(`https://api.vercel.com/v13/deployments${query}`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const body: any = await upstream.json()
    response.statusCode = upstream.status
    return response.end(JSON.stringify(upstream.ok ? { id: body.id, url: body.url, status: body.readyState } : { error: body.error?.message || body.errorMessage || 'Vercel deployment failed.' }))
  } catch (error) {
    console.error({ scope: 'framewire:deploy', message: 'Deployment adapter failed', error: error instanceof Error ? error.message : String(error) })
    response.statusCode = 500
    return response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Deployment adapter failed.' }))
  }
}
