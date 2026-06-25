
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const courseId = getRouterParam(event, 'id')
  if (!courseId) throw createError({ statusCode: 400, statusMessage: 'ID fehlt' })

  const course = await findCourseById(courseId)
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Kurs nicht gefunden' })

  // Only admin or teacher of the university can see enrollments
  const isTeacherMember = await isUniversityTeacher(course.universityId, session.userId)
  if (session.role !== 'admin' && course.createdBy !== session.userId && !isTeacherMember) {
    throw createError({ statusCode: 403, statusMessage: 'Keine Berechtigung' })
  }

  const enrollments = await listCourseEnrollmentsWithUsers(courseId)
  return { enrollments }
})
