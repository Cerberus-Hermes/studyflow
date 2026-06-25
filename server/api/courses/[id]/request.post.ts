
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const courseId = getRouterParam(event, 'id')
  if (!courseId) throw createError({ statusCode: 400, statusMessage: 'ID fehlt' })

  const course = await findCourseById(courseId)
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Kurs nicht gefunden' })

  // Must be accepted member of the university
  const isMember = await isUniversityMember(course.universityId, session.userId)
  if (!isMember) {
    throw createError({ statusCode: 403, statusMessage: 'Du musst erst Mitglied der Hochschule sein' })
  }

  // Check if already enrolled
  const existingEnrollment = await findCourseEnrollment(courseId, session.userId)
  if (existingEnrollment) {
    throw createError({ statusCode: 409, statusMessage: 'Du bist bereits in diesem Kurs eingeschrieben' })
  }

  // Check if already requested (gracefully handle missing table)
  let existingRequest = null
  try {
    existingRequest = await findCourseRequest(courseId, session.userId)
  } catch {
    // course_requests table may not exist yet
  }
  if (existingRequest) {
    throw createError({ statusCode: 409, statusMessage: 'Du hast bereits eine Anfrage f\u00fcr diesen Kurs' })
  }

  // Create request (gracefully handle missing table)
  try {
    const request = await createCourseRequest(courseId, session.userId)
    return { success: true, request }
  } catch (e: any) {
    if (e.message?.includes('course_requests') || e.message?.includes('does not exist') || e.message?.includes('relation')) {
      // Table doesn't exist yet — auto-enroll instead
      await enrollStudent(courseId, session.userId, session.userId)
      return { success: true, autoEnrolled: true, message: 'Automatisch eingeschrieben (Anfrage-System noch nicht bereit)' }
    }
    throw createError({ statusCode: 500, statusMessage: e.message || 'Fehler beim Erstellen der Anfrage' })
  }
})
