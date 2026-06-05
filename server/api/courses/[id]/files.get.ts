import { requireAuth } from '~/server/utils/auth'
import { findCourseById, listCourseFiles, findCourseEnrollment } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const courseId = getRouterParam(event, 'id')
  if (!courseId) throw createError({ statusCode: 400, statusMessage: 'ID fehlt' })

  const course = await findCourseById(courseId)
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Kurs nicht gefunden' })

  // Students must be enrolled
  if (session.role === 'student' || session.role === 'user') {
    const enrollment = await findCourseEnrollment(courseId, session.userId)
    if (!enrollment) {
      throw createError({ statusCode: 403, statusMessage: 'Du bist nicht für diesen Kurs eingeschrieben' })
    }
  }

  const files = await listCourseFiles(courseId)
  return { files }
})
