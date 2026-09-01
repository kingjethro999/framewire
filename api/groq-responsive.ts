const SYSTEM_PROMPT = `You are Framewire's responsive design engine. Convert a desktop visual-editor frame into a production-quality responsive layout for the requested device. Return valid JSON only, no markdown.

Schema:
{"message":"short explanation","layout":{"frameHeight":number,"elements":[{"sourceId":"existing element id","x":number,"y":number,"width":number,"height":number,"content":"optional revised copy","style":{"fontSize":number,"padding":number,"borderRadius":number,"textAlign":"left|center|right"}}]}}

Rules:
- Include every visible source element exactly once using its existing id as sourceId.
- Keep every element within targetWidth. Use vertical flow and comfortable spacing on mobile.
- Navigation may become a compact single-line header. Shorten copy only when needed.
- Preserve the brand, hierarchy, colors, and meaning.
- Avoid overlap, tiny type, horizontal overflow, and arbitrary visual changes.
- Minimum touch target height is 44px for buttons and inputs.
- frameHeight must contain all elements plus bottom spacing.
- Use integers for geometry and only include style keys that need responsive overrides.`

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' })
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return response.status(503).json({ error: 'Groq is not configured. Add GROQ_API_KEY to the Vercel environment.' })
  const { device, targetWidth, sourceFrame, elements } = request.body ?? {}
  if (!['tablet', 'mobile'].includes(device) || !Number.isFinite(targetWidth) || !sourceFrame || !Array.isArray(elements)) return response.status(400).json({ error: 'A valid responsive layout request is required.' })
  try {
    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify({ device, targetWidth, sourceFrame, elements: elements.slice(0, 100) }) },
        ],
      }),
    })
    if (!upstream.ok) {
      const detail = await upstream.text()
      console.error({ scope: 'framewire:responsive', message: 'Groq upstream error', status: upstream.status, detail: detail.slice(0, 300) })
      return response.status(502).json({ error: upstream.status === 401 ? 'The Groq API key was rejected.' : 'Groq could not generate the responsive layout.' })
    }
    const data = await upstream.json() as any
    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? '{}')
    if (!parsed.layout || !Array.isArray(parsed.layout.elements)) throw new Error('Groq returned an invalid layout.')
    return response.status(200).json({ message: String(parsed.message || `${device} layout generated.`), layout: parsed.layout })
  } catch (error) {
    console.error({ scope: 'framewire:responsive', message: 'Responsive handler failed', error: error instanceof Error ? error.message : String(error) })
    return response.status(500).json({ error: 'The responsive layout could not be processed.' })
  }
}
