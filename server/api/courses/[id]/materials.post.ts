import { requireAuth } from '~/server/utils/auth'
import { findCourseById, createCourseMaterial, findCourseFileById } from '~/server/utils/db'
import { callKimiChat, buildMessages, getKimiConfigs } from '~/server/utils/kimi'

const TYPE_PROMPTS: Record<string, string> = {
  quiz: 'Erstelle ein Multiple-Choice-Quiz mit 5 Fragen aus dem folgenden Lernstoff. Jede Frage hat 4 Antwortmöglichkeiten. Antworte AUSSCHLIESSLICH als JSON-Array: [{"question":"...","options":["...","...","...","..."],"correct":0}]',
  flashcards: 'Erstelle 5 Lernkarten aus dem folgenden Lernstoff. Antworte AUSSCHLIESSLICH als JSON-Array: [{"question":"...","answer":"..."}]',
  summary: 'Fasse den folgenden Lernstoff zusammen. Strukturiere mit Kernaussagen, Definitionen und Prüfungsrelevanten Themen.',
  practice_exam: 'Erstelle eine Probe-Prüfung mit 5 Fragen (Multiple Choice und Freitext) aus dem folgenden Lernstoff. Antworte AUSSCHLIESSLICH als JSON-Array: [{"question":"...","type":"mc|open","options":["..."],"correct":0,"answer":"..."}]',
  study_guide: 'Erstelle einen strukturierten Lernzettel aus dem folgenden Lernstoff. Gliedere in Themen, Stichpunkte und Merksätze.',
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
    throw createError({ statusCode: 400, statusMessage: 'Ungültiger Material-Typ' })
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
    try {
      const { readFile } = await import('node:fs/promises')
      const buf = await readFile(courseFile.storagePath)
      // For now, just use the filename as context (real PDF extraction would need more)
      contentToProcess = `Datei: ${courseFile.name}\n\n${buf.toString('utf-8').substring(0, 8000)}`
    } catch {
      contentToProcess = `Datei: ${courseFile.name}`
    }
  } else if (body.content) {
    contentToProcess = String(body.content).substring(0, 8000)
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
