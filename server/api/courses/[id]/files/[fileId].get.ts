import { readFile } from 'node:fs/promises'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const courseId = getRouterParam(event, 'id')
  const fileId = getRouterParam(event, 'fileId')
  if (!courseId || !fileId) throw createError({ statusCode: 400, statusMessage: 'ID fehlt' })

  const file = await findCourseFileById(fileId)
  if (!file || file.courseId !== courseId) {
    throw createError({ statusCode: 404, statusMessage: 'Datei nicht gefunden' })
  }

  // Students must be enrolled
  const session = getAuthSession(event)
  if (session && (session.role === 'student' || session.role === 'user')) {
    const enrollment = await findCourseEnrollment(courseId, session.userId)
    if (!enrollment) {
      throw createError({ statusCode: 403, statusMessage: 'Du bist nicht für diesen Kurs eingeschrieben' })
    }
  }

  // If storagePath is a public URL (Supabase), redirect
  if (file.storagePath.startsWith('http')) {
    return sendRedirect(event, file.storagePath)
  }

  // Otherwise serve from filesystem (local dev fallback)
  try {
    const buffer = await readFile(file.storagePath)
    setResponseHeader(event, 'Content-Type', file.mimeType)
    setResponseHeader(event, 'Content-Disposition', `inline; filename="${file.name}"`)
    return buffer
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Datei nicht mehr verfügbar' })
  }
})
