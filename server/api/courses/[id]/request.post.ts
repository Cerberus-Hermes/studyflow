
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

  // Check if already requested
  const existingRequest = await findCourseRequest(courseId, session.userId)
  if (existingRequest) {
    throw createError({ statusCode: 409, statusMessage: 'Du hast bereits eine Anfrage f\u00fcr diesen Kurs' })
  }

  const request = await createCourseRequest(courseId, session.userId)
  return { success: true, request }
})
