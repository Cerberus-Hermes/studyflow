
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const courseId = getRouterParam(event, 'id')
  const fileId = getRouterParam(event, 'fileId')
  if (!courseId || !fileId) throw createError({ statusCode: 400, statusMessage: 'ID fehlt' })

  const course = await findCourseById(courseId)
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Kurs nicht gefunden' })

  const isTeacherMember = await isUniversityTeacher(course.universityId, session.userId)
  if (session.role !== 'admin' && course.createdBy !== session.userId && !isTeacherMember) {
    throw createError({ statusCode: 403, statusMessage: 'Keine Berechtigung' })
  }

  const courseFile = await findCourseFileById(fileId)
  if (!courseFile || courseFile.courseId !== courseId) {
    throw createError({ statusCode: 404, statusMessage: 'Datei nicht gefunden' })
  }

  // Try to delete from Supabase Storage if URL
  const storagePath = courseFile.storagePath
  if (typeof storagePath === 'string' && (storagePath.startsWith('http://') || storagePath.startsWith('https://'))) {
    try {
      const urlParts = storagePath.split('/course-files/')
      if (urlParts.length === 2) {
        await getSupabase().storage.from('course-files').remove([urlParts[1]])
      }
    } catch {
      // Ignore storage deletion errors, still delete DB record
    }
  }

  await deleteCourseFile(fileId)
  return { success: true }
})
