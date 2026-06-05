export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024

export const SYSTEM_PROMPTS: Record<string, string> = {
  summary: 'Du bist ein Lernassistent. Fasse den folgenden Lernstoff zusammen. Strukturiere die Ausgabe mit: 1) Kernaussagen (3-5 Bullet Points), 2) Wichtige Definitionen, 3) Prüfungsrelevante Themen. Antworte auf Deutsch.',
  flashcards: 'Du bist ein Lernassistent. Erstelle aus dem folgenden Lernstoff 5 Lernkarten im Format Frage/Antwort. Gib sie als nummerierte Liste aus. Antworte auf Deutsch.',
  tasks: 'Du bist ein Lernassistent. Erstelle aus dem folgenden Lernstoff 3 Übungsaufgaben (eine leicht, eine mittel, eine schwer). Gib für jede Aufgabe eine mögliche Lösung. Antworte auf Deutsch.',
  quiz: 'Du bist ein Lernassistent. Erstelle aus dem folgenden Lernstoff ein Multiple-Choice-Quiz mit 5 Fragen. Jede Frage hat genau 4 Antwortmöglichkeiten. Antworte AUSSCHLIESSLICH als gültiges JSON-Array im folgenden Format (keine Markdown-Codeblöcke, keine Erklärungen davor oder danach): [{"question":"...","options":["...","...","...","..."],"correct":0}] wobei "correct" der Index (0-3) der richtigen Antwort ist. Antworte auf Deutsch.',
}

export type KimiConfig = {
  baseUrl: string
  model: string
  name: string
}

export function getKimiConfigs(): KimiConfig[] {
  const baseUrl = process.env.KIMI_BASE_URL
  const model = process.env.KIMI_MODEL || 'kimi-k2.6'

  if (baseUrl) {
    return [{ baseUrl, model, name: 'Custom' }]
  }

  return [
    { baseUrl: 'https://api.moonshot.ai/v1', model, name: 'Moonshot AI' },
    { baseUrl: 'https://api.moonshot.cn/v1', model, name: 'Moonshot CN' },
  ]
}

export async function extractPdfText(
  configs: KimiConfig[],
  apiKey: string,
  buffer: Buffer,
  filename: string,
): Promise<string> {
  let lastError = ''

  for (const config of configs) {
    try {
      const formData = new FormData()
      formData.append('file', new Blob([new Uint8Array(buffer)], { type: 'application/pdf' }), filename)
      formData.append('purpose', 'file-extract')

      const uploadRes = await fetch(`${config.baseUrl}/files`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
      })

      if (!uploadRes.ok) {
        lastError = `${config.name}: ${await uploadRes.text()}`
        continue
      }

      const uploadData = await uploadRes.json()
      const fileId = uploadData.id
      if (!fileId) {
        lastError = `${config.name}: no file id`
        continue
      }

      const contentRes = await fetch(`${config.baseUrl}/files/${fileId}/content`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      })

      if (!contentRes.ok) {
        lastError = `${config.name}: ${await contentRes.text()}`
        continue
      }

      const text = await contentRes.text()
      if (!text?.trim()) {
        lastError = `${config.name}: PDF enthält keinen extrahierbaren Text`
        continue
      }

      return text
    } catch (err: any) {
      lastError = `${config.name}: ${err.message}`
    }
  }

  throw createError({
    statusCode: 502,
    statusMessage: `PDF konnte nicht gelesen werden: ${lastError}`,
  })
}

type MessageContent = string | Array<{ type: string, text?: string, image_url?: { url: string } }>

export function buildMessages(
  taskType: string,
  opts: {
    textContent?: string
    pdfContent?: string
    fileName?: string
    imageBase64?: string
    imageMime?: string
  },
): Array<{ role: string, content: MessageContent }> {
  const systemPrompt = SYSTEM_PROMPTS[taskType] || SYSTEM_PROMPTS.summary
  const messages: Array<{ role: string, content: MessageContent }> = [
    { role: 'system', content: systemPrompt },
  ]

  if (opts.pdfContent) {
    const truncated = opts.pdfContent.substring(0, 120000)
    messages.push({
      role: 'system',
      content: `Dokumentinhalt (${opts.fileName || 'PDF'}):\n\n${truncated}`,
    })
    messages.push({
      role: 'user',
      content: 'Erstelle die gewünschte Lernhilfe basierend auf dem Dokument oben.',
    })
    return messages
  }

  if (opts.imageBase64 && opts.imageMime) {
    const dataUrl = `data:${opts.imageMime};base64,${opts.imageBase64}`
    messages.push({
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: dataUrl } },
        {
          type: 'text',
          text: opts.textContent?.trim()
            ? `Zusätzlicher Kontext:\n${opts.textContent.substring(0, 4000)}\n\nAnalysiere das Bild und erstelle die gewünschte Lernhilfe.`
            : 'Analysiere dieses Lernmaterial (Foto/Folie/Screenshot) und erstelle die gewünschte Lernhilfe.',
        },
      ],
    })
    return messages
  }

  const text = opts.textContent?.trim() || ''
  messages.push({
    role: 'user',
    content: `Lernstoff:\n\n${text.substring(0, 8000)}`,
  })
  return messages
}

export async function callKimiChat(
  configs: KimiConfig[],
  messages: Array<{ role: string, content: MessageContent }>,
  apiKey: string,
): Promise<{ result: string, provider: string }> {
  let lastError = ''

  for (const config of configs) {
    try {
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          max_completion_tokens: 2000,
          thinking: { type: 'disabled' },
        }),
      })

      if (!response.ok) {
        lastError = `${config.name}: ${await response.text()}`
        continue
      }

      const data = await response.json()
      const aiText = data.choices?.[0]?.message?.content || 'Keine Antwort erhalten.'
      return { result: aiText, provider: config.name }
    } catch (err: any) {
      lastError = `${config.name}: ${err.message}`
    }
  }

  throw createError({
    statusCode: 502,
    statusMessage: `Kimi API Error: ${lastError}`,
  })
}
