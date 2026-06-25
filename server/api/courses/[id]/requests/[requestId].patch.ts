
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const courseId = getRouterParam(event, 'id')
  const requestId = getRouterParam(event, 'requestId')
  if (!courseId || !requestId) throw createError({ statusCode: 400, statusMessage: 'ID fehlt' })

  const course = await findCourseById(courseId)
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Kurs nicht gefunden' })

  const isTeacherMember = await isUniversityTeacher(course.universityId, session.userId)
  if (session.role !== 'admin' && course.createdBy !== session.userId && !isTeacherMember) {
    throw createError({ statusCode: 403, statusMessage: 'Keine Berechtigung' })
  }

  const body = await readBody(event)
  const status = body.status

  if (status !== 'accepted' && status !== 'rejected') {
    throw createError({ statusCode: 400, statusMessage: 'Ung\u00fcltiger Status' })
  }

  await updateCourseRequestStatus(requestId, status)

  // If accepted, also enroll the student
  if (status === 'accepted') {
    // Need to find user_id from request - fetch it
    const { data } = await supabase!.from('course_requests').select('user_id').eq('id', requestId).single()
    if (data?.user_id) {
      const existing = await findCourseEnrollment(courseId, data.user_id)
      if (!existing) {
        await enrollStudent(courseId, data.user_id, session.userId)
      }
    }
  }

  return { success: true }
})
