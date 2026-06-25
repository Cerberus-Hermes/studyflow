
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const universityId = getRouterParam(event, 'id')
  if (!universityId) throw createError({ statusCode: 400, statusMessage: 'ID fehlt' })

  const university = await findUniversityById(universityId)
  if (!university) throw createError({ statusCode: 404, statusMessage: 'Hochschule nicht gefunden' })

  // Only admin or teacher member of this university can create courses
  const isTeacherMember = await isUniversityTeacher(universityId, session.userId)
  if (session.role !== 'admin' && university.createdBy !== session.userId && !isTeacherMember) {
    throw createError({ statusCode: 403, statusMessage: 'Nur Lehrpersonal kann Kurse anlegen' })
  }

  const body = await readBody(event)
  const name = String(body.name || '').trim()
  const description = String(body.description || '').trim()

  if (!name || name.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Kursname erforderlich' })
  }

  const course = await createCourse(universityId, name, description, session.userId)
  return { success: true, course }
})
