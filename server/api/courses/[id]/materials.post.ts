
const TYPE_PROMPTS: Record<string, string> = {
  quiz: 'Erstelle ein Multiple-Choice-Quiz mit 5 Fragen aus dem folgenden Lernstoff. Jede Frage hat 4 Antwortm\u00f6glichkeiten. Antworte AUSSCHLIESSLICH als JSON-Array: [{"question":"...","options":["...","...","...","..."],"correct":0}]',
  flashcards: 'Erstelle 5 Lernkarten aus dem folgenden Lernstoff. Antworte AUSSCHLIESSLICH als JSON-Array: [{"question":"...","answer":"..."}]',
  summary: 'Fasse den folgenden Lernstoff zusammen. Strukturiere mit Kernaussagen, Definitionen und Pr\u00fcfungsrelevanten Themen.',
  practice_exam: 'Erstelle eine Probe-Pr\u00fcfung mit 5 Fragen (Multiple Choice und Freitext) aus dem folgenden Lernstoff. Antworte AUSSCHLIESSLICH als JSON-Array: [{"question":"...","type":"mc|open","options":["..."],"correct":0,"answer":"..."}]',
  study_guide: 'Erstelle einen strukturierten Lernzettel aus dem folgenden Lernstoff. Gliedere in Themen, Stichpunkte und Merks\u00e4tze.',
}

function isPdf(name: string, mime?: string): boolean {
  const lower = name.toLowerCase()
  return mime === 'application/pdf' || lower.endsWith('.pdf')
}

function isImage(name: string, mime?: string): boolean {
  const imageMimes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
  const imageExts = /\.(jpe?g|png|webp|gif)$/i
  return imageMimes.has(mime || '') || imageExts.test(name)
}

async function fetchFileBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function readLocalFile(path: string): Promise<Buffer> {
  const { readFile } = await import('node:fs/promises')
  return readFile(path)
}

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const courseId = getRouterParam(event, 'id')
  if (!courseId) throw createError({ statusCode: 400, statusMessage: 'ID fehlt' })

  const course = await findCourseById(courseId)
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Kurs nicht gefunden' })

  // Only admin or teacher can generate materials
  if (session.role !== 'admin' && session.role !== 'teacher') {
    throw createError({ statusCode: 403, statusMessage: 'Nur Lehrpersonal kann Materialien generieren' })
  }

  const body = await readBody(event)
  const type = String(body.type || '').trim() as CourseMaterial['type']
  const fileId = body.fileId || null
  const title = String(body.title || '').trim()

  if (!TYPE_PROMPTS[type]) {
    throw createError({ statusCode: 400, statusMessage: 'Ung\u00fcltiger Material-Typ' })
  }
  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'Titel erforderlich' })
  }

  const apiKey = process.env.KIMI_API_KEY
  if (!apiKey) throw createError({ statusCode: 500, statusMessage: 'KIMI_API_KEY fehlt' })

  const configs = getKimiConfigs()
  let messages: Array<{ role: string, content: any }>

  // If fileId provided, read the file
  if (fileId) {
    const courseFile = await findCourseFileById(fileId)
    if (!courseFile || courseFile.courseId !== courseId) {
      throw createError({ statusCode: 404, statusMessage: 'Datei nicht gefunden' })
    }

    const storagePath = courseFile.storagePath
    const isUrlPath = typeof storagePath === 'string' && (storagePath.startsWith('http://') || storagePath.startsWith('https://'))

    let fileBuf: Buffer
    try {
      fileBuf = isUrlPath ? await fetchFileBuffer(storagePath) : await readLocalFile(storagePath)
    } catch {
      throw createError({ statusCode: 500, statusMessage: 'Datei konnte nicht gelesen werden' })
    }

    if (isPdf(courseFile.name, courseFile.mimeType)) {
      // Inline PDF extraction (same logic as server/utils/kimi.ts)
      let lastError = ''
      let pdfText = ''
      for (const config of configs) {
        try {
          const formData = new FormData()
          formData.append('file', new Blob([new Uint8Array(fileBuf)], { type: 'application/pdf' }), courseFile.name)
          formData.append('purpose', 'file-extract')

          const uploadRes = await fetch(`${config.baseUrl}/files`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}` },
            body: formData,
          })

          if (!uploadRes.ok) { lastError = `${config.name}: ${await uploadRes.text()}`; continue }

          const uploadData = await uploadRes.json()
          const fid = uploadData.id
          if (!fid) { lastError = `${config.name}: no file id`; continue }

          const contentRes = await fetch(`${config.baseUrl}/files/${fid}/content`, {
            headers: { Authorization: `Bearer ${apiKey}` },
          })

          if (!contentRes.ok) { lastError = `${config.name}: ${await contentRes.text()}`; continue }

          const text = await contentRes.text()
          if (!text?.trim()) { lastError = `${config.name}: PDF enth\u00e4lt keinen extrahierbaren Text`; continue }

          pdfText = text
          break
        } catch (err: any) {
          lastError = `${config.name}: ${err.message}`
        }
      }

      if (!pdfText) {
        throw createError({ statusCode: 502, statusMessage: `PDF konnte nicht gelesen werden: ${lastError}` })
      }

      messages = [
        { role: 'system', content: TYPE_PROMPTS[type] },
        { role: 'system', content: `Dokumentinhalt (${courseFile.name}):\n\n${pdfText.substring(0, 120000)}` },
        { role: 'user', content: 'Erstelle die gew\u00fcnschte Lernhilfe basierend auf dem Dokument oben.' },
      ]
    } else if (isImage(courseFile.name, courseFile.mimeType)) {
      const mime = courseFile.mimeType || 'image/jpeg'
      const b64 = fileBuf.toString('base64')
      const dataUrl = `data:${mime};base64,${b64}`
      messages = [
        { role: 'system', content: TYPE_PROMPTS[type] },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: dataUrl } },
            { type: 'text', text: `Analysiere dieses Lernmaterial und erstelle die gew\u00fcnschte Lernhilfe. Datei: ${courseFile.name}` },
          ],
        },
      ]
    } else {
      // Plain text file
      const text = fileBuf.toString('utf-8')
      messages = [
        { role: 'system', content: TYPE_PROMPTS[type] },
        { role: 'user', content: `Datei: ${courseFile.name}\n\n${text.substring(0, 12000)}` },
      ]
    }
  } else if (body.content) {
    messages = [
      { role: 'system', content: TYPE_PROMPTS[type] },
      { role: 'user', content: `Lernstoff:\n\n${String(body.content).substring(0, 12000)}` },
    ]
  } else {
    throw createError({ statusCode: 400, statusMessage: 'Inhalt oder Datei erforderlich' })
  }

  const aiResult = await callKimiChat(configs, messages as any, apiKey)

  const material = await createCourseMaterial(
    courseId,
    fileId,
    type,
    title,
    aiResult.result,
    session.userId
  )

  return { success: true, material }
})
