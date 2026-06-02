export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { content, type } = body

  if (!content) {
    throw createError({ statusCode: 400, statusMessage: 'Content required' })
  }

  const apiKey = process.env.KIMI_API_KEY
  let baseUrl = process.env.KIMI_BASE_URL

  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'KIMI_API_KEY not configured on server' })
  }

  const systemPrompts: Record<string, string> = {
    summary: 'Du bist ein Lernassistent. Fasse den folgenden Lernstoff zusammen. Strukturiere die Ausgabe mit: 1) Kernaussagen (3-5 Bullet Points), 2) Wichtige Definitionen, 3) Prüfungsrelevante Themen. Antworte auf Deutsch.',
    flashcards: 'Du bist ein Lernassistent. Erstelle aus dem folgenden Lernstoff 5 Lernkarten im Format Frage/Antwort. Gib sie als nummerierte Liste aus. Antworte auf Deutsch.',
    tasks: 'Du bist ein Lernassistent. Erstelle aus dem folgenden Lernstoff 3 Übungsaufgaben (eine leicht, eine mittel, eine schwer). Gib für jede Aufgabe eine mögliche Lösung. Antworte auf Deutsch.',
    quiz: 'Du bist ein Lernassistent. Erstelle aus dem folgenden Lernstoff ein Multiple-Choice-Quiz mit 5 Fragen. Jede Frage hat 4 Antwortmöglichkeiten, markiere die richtige. Antworte auf Deutsch.',
  }

  // Configs to try: Moonshot direct first, then OpenRouter fallback
  const configs = []
  
  if (baseUrl) {
    // Custom base URL set by user
    configs.push({
      baseUrl,
      model: process.env.KIMI_MODEL || 'kimi-k2.6',
      name: 'Custom',
    })
  } else {
    // Try international endpoint first, then China
    configs.push({
      baseUrl: 'https://api.moonshot.ai/v1',
      model: 'kimi-k2.6',
      name: 'Moonshot AI',
    })
    configs.push({
      baseUrl: 'https://api.moonshot.cn/v1',
      model: 'kimi-k2.6',
      name: 'Moonshot CN',
    })
  }

  const requestBody = {
    model: '',
    messages: [
      { role: 'system', content: systemPrompts[type] || systemPrompts.summary },
      { role: 'user', content: `Lernstoff:\n\n${content.substring(0, 8000)}` },
    ],
    max_completion_tokens: 2000,
    thinking: { type: 'disabled' },
  }

  let lastError = ''

  for (const config of configs) {
    try {
      console.log(`[AI API] Trying ${config.name} at ${config.baseUrl} with model ${config.model}...`)

      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...(config.name === 'OpenRouter' ? { 'HTTP-Referer': 'https://studyflow.app', 'X-Title': 'StudyFlow' } : {}),
        },
        body: JSON.stringify({ ...requestBody, model: config.model }),
      })

      console.log(`[AI API] ${config.name} response status:`, response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[AI API] ${config.name} error:`, errorText)
        lastError = `${config.name}: ${errorText}`
        continue // Try next config
      }

      const data = await response.json()
      const aiText = data.choices?.[0]?.message?.content || 'Keine Antwort erhalten.'

      console.log(`[AI API] Success via ${config.name}! Response length:`, aiText.length)

      return { success: true, result: aiText, provider: config.name }

    } catch (err: any) {
      console.error(`[AI API] ${config.name} exception:`, err.message)
      lastError = `${config.name}: ${err.message}`
      continue
    }
  }

  // All configs failed
  console.error('[AI API] All providers failed. Last error:', lastError)
  throw createError({
    statusCode: 502,
    statusMessage: `Kimi API Error: ${lastError}. Prüfe: 1) Ist der Key gültig? 2) Passt KIMI_BASE_URL zur Plattform (moonshot.cn vs moonshot.ai)? 3) KIMI_MODEL=kimi-k2.6`,
  })
})
