const SYSTEM_PROMPT = `You are Framewire's visual website design agent. You receive a compact JSON summary of the current visual-editor document and a user request. Respond with valid JSON only, no markdown.

Schema:
{"message":"short explanation","operations":[operation]}

Allowed operations:
1. {"type":"addElement","elementType":"text|button|image|rectangle|input|card|nav|hero|form|divider","frameId":"optional existing frame id","x":number,"y":number,"content":"optional","name":"optional"}
2. {"type":"updateElement","elementId":"existing id","changes":{"content":"text","x":number,"y":number,"width":number,"height":number,"name":"text","style":{"background":"hex or css","color":"hex or css","borderRadius":number,"fontSize":number,"fontWeight":number,"padding":number,"textAlign":"left|center|right"}}}
3. {"type":"deleteElement","elementId":"existing id"}
4. {"type":"addPage","name":"Page name"}
5. {"type":"setTokens","changes":{"primary":"color","canvas":"color","surface":"color","text":"color","muted":"color","radius":number,"fontFamily":"CSS font stack"}}

Rules: Use only existing IDs from context. Keep elements within their frame dimensions. Prefer a small number of high-impact operations. For full-page requests, create an intentional hierarchy and consistent spacing. Never add scripts, HTML, event handlers, or unsafe URLs. If the request is conversational or needs no change, return an empty operations array. Keep message under 45 words.`

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' })
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return response.status(503).json({ error: 'Groq is not configured. Add GROQ_API_KEY to the Vercel environment.' })
  const prompt = typeof request.body?.prompt === 'string' ? request.body.prompt.trim().slice(0, 4000) : ''
  if (!prompt) return response.status(400).json({ error: 'A prompt is required.' })
  try {
    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        temperature: 0.25,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: JSON.stringify({ request: prompt, document: request.body.context }) }],
      }),
    })
    if (!upstream.ok) {
      const detail = await upstream.text()
      console.error({ scope: 'framewire:groq', message: 'Groq upstream error', status: upstream.status, detail: detail.slice(0, 300) })
      return response.status(502).json({ error: upstream.status === 401 ? 'The Groq API key was rejected.' : 'Groq could not complete the request.' })
    }
    const data = await upstream.json() as any
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('Groq returned an empty response.')
    const parsed = JSON.parse(content)
    return response.status(200).json({ message: String(parsed.message || 'Changes ready.'), operations: Array.isArray(parsed.operations) ? parsed.operations.slice(0, 40) : [] })
  } catch (error) {
    console.error({ scope: 'framewire:groq', message: 'Groq handler failed', error: error instanceof Error ? error.message : String(error) })
    return response.status(500).json({ error: 'The AI response could not be processed.' })
  }
}
