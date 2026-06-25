
const TYPE_PROMPTS: Record<string, string> = {
  quiz: 'Erstelle ein Multiple-Choice-Quiz mit 5 Fragen aus dem folgenden Lernstoff. Jede Frage hat 4 Antwortm\u00f6glichkeiten. Antworte AUSSCHLIESSLICH als JSON-Array: [{"question":"...","options":["...","...","...","..."],"correct":0}]',
  flashcards: 'Erstelle 5 Lernkarten aus dem folgenden Lernstoff. Antworte AUSSCHLIESSLICH als JSON-Array: [{"question":"...","answer":"..."}]',
  summary: 'Fasse den folgenden Lernstoff zusammen. Strukturiere mit Kernaussagen, Definitionen und Pr\u00fcfungsrelevanten Themen.',
  practice_exam: 'Erstelle eine Probe-Pr\u00fcfung mit 5 Fragen (Multiple Choice und Freitext) aus dem folgenden Lernstoff. Antworte AUSSCHLIESSLICH als JSON-Array: [{"question":"...","type":"mc|open","options":["..."],"correct":0,"answer":"..."}]',
  study_guide: 'Erstelle einen strukturierten Lernzettel aus dem folgenden Lernstoff. Gliedere in Themen, Stichpunkte und Merks\u00e4tze.',
}

function looksLikeReadableText(buf: Buffer): boolean {
  const sample = buf.subarray(0, 2048).toString('utf-8')
  // Check for PDF header
  if (sample.startsWith('%PDF')) return false
  // Check for common binary signatures
  if (sample.includes('\u0000\u0000') || sample.includes('\uFFFD\uFFFD')) return false
  // Must contain reasonable amount of letters
  const letters = (sample.match(/[a-zA-Z\u00C0-\u00FF]/g) || []).length
  return letters > sample.length * 0.3
}

async function readFileContent(courseFile: any): Promise<string> {
  const storagePath = courseFile.storagePath
  let buf: Buffer

  // If it's a URL, fetch it
  if (typeof storagePath === 'string' && (storagePath.startsWith('http://') || storagePath.startsWith('https://'))) {
    try {
      const res = await fetch(storagePath, { redirect: 'follow' })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const arrayBuffer = await res.arrayBuffer()
      buf = Buffer.from(arrayBuffer)
    } catch {
      return `Datei: ${courseFile.name} (URL konnte nicht geladen werden: ${storagePath})`
    }
  } else {
    // Local filesystem path
    try {
      const { readFile } = await import('node:fs/promises')
      buf = await readFile(storagePath)
    } catch {
      return `Datei: ${courseFile.name} (Pfad konnte nicht gelesen werden)`
    }
  }

  if (!looksLikeReadableText(buf)) {
    // Binary file (PDF, image, etc.) — can't extract text automatically
    return `Datei: ${courseFile.name}\n\n[Die Datei ist eine Bin\u00e4rdatei (z.B. PDF) und kann nicht automatisch ausgelesen werden. Bitte kopiere den relevanten Text hierher oder gib mir eine kurze Beschreibung des Inhalts, damit ich das Material erstellen kann.]`
  }

  const text = buf.toString('utf-8')
  return `Datei: ${courseFile.name}\n\n${text.substring(0, 12000)}`
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

  let contentToProcess = ''

  // If fileId provided, read the file
  if (fileId) {
    const courseFile = await findCourseFileById(fileId)
    if (!courseFile || courseFile.courseId !== courseId) {
      throw createError({ statusCode: 404, statusMessage: 'Datei nicht gefunden' })
    }
    contentToProcess = await readFileContent(courseFile)
  } else if (body.content) {
    contentToProcess = String(body.content).substring(0, 12000)
  } else {
    throw createError({ statusCode: 400, statusMessage: 'Inhalt oder Datei erforderlich' })
  }

  // Call Kimi
  const apiKey = process.env.KIMI_API_KEY
  if (!apiKey) throw createError({ statusCode: 500, statusMessage: 'KIMI_API_KEY fehlt' })

  const configs = getKimiConfigs()
  const messages = [
    { role: 'system', content: TYPE_PROMPTS[type] },
    { role: 'user', content: `Lernstoff:\n\n${contentToProcess}` },
  ]

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
