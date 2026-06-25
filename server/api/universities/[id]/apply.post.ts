
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const universityId = getRouterParam(event, 'id')
  if (!universityId) throw createError({ statusCode: 400, statusMessage: 'ID fehlt' })

  const university = await findUniversityById(universityId)
  if (!university) throw createError({ statusCode: 404, statusMessage: 'Hochschule nicht gefunden' })

  const body = await readBody(event)
  const role = body.role === 'teacher' ? 'teacher' : 'student'

  // Check if already member or has pending request
  const existing = await findUniversityMember(universityId, session.userId)
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Du hast bereits eine Anfrage oder bist bereits Mitglied' })
  }

  const member = await applyToUniversity(universityId, session.userId, role)
  return { success: true, member }
})
