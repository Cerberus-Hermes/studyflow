export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { content, type } = body

  if (!content) {
    throw createError({ statusCode: 400, statusMessage: 'Content required' })
  }

  // API Key from environment variable (server-side only!)
  const apiKey = process.env.KIMI_API_KEY
  const baseUrl = process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1'

  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'KIMI_API_KEY not configured' })
  }

  const systemPrompts: Record<string, string> = {
    summary: 'Du bist ein Lernassistent. Fasse den folgenden Lernstoff zusammen. Strukturiere die Ausgabe mit: 1) Kernaussagen (3-5 Bullet Points), 2) Wichtige Definitionen, 3) Prüfungsrelevante Themen. Antworte auf Deutsch.',
    flashcards: 'Du bist ein Lernassistent. Erstelle aus dem folgenden Lernstoff 5 Lernkarten im Format Frage/Antwort. Gib sie als nummerierte Liste aus. Antworte auf Deutsch.',
    tasks: 'Du bist ein Lernassistent. Erstelle aus dem folgenden Lernstoff 3 Übungsaufgaben (eine leicht, eine mittel, eine schwer). Gib für jede Aufgabe eine mögliche Lösung. Antworte auf Deutsch.',
    quiz: 'Du bist ein Lernassistent. Erstelle aus dem folgenden Lernstoff ein Multiple-Choice-Quiz mit 5 Fragen. Jede Frage hat 4 Antwortmöglichkeiten, markiere die richtige. Antworte auf Deutsch.',
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'kimi-k2-6',
        messages: [
          { role: 'system', content: systemPrompts[type] || systemPrompts.summary },
          { role: 'user', content: `Lernstoff:\n\n${content.substring(0, 8000)}` },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Kimi API Error ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    const aiText = data.choices?.[0]?.message?.content || 'Keine Antwort erhalten.'

    return { success: true, result: aiText }

  } catch (err: any) {
    throw createError({ statusCode: 502, statusMessage: err.message || 'API request failed' })
  }
})
