
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const universityId = getRouterParam(event, 'id')
  const memberId = getRouterParam(event, 'memberId')
  if (!universityId || !memberId) throw createError({ statusCode: 400, statusMessage: 'ID fehlt' })

  const university = await findUniversityById(universityId)
  if (!university) throw createError({ statusCode: 404, statusMessage: 'Hochschule nicht gefunden' })

  const isTeacherMember = await isUniversityTeacher(universityId, session.userId)
  if (session.role !== 'admin' && university.createdBy !== session.userId && !isTeacherMember) {
    throw createError({ statusCode: 403, statusMessage: 'Keine Berechtigung' })
  }

  await removeUniversityMember(memberId)
  return { success: true }
})
