
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const universityId = getRouterParam(event, 'id')
  if (!universityId) throw createError({ statusCode: 400, statusMessage: 'ID fehlt' })

  const university = await findUniversityById(universityId)
  if (!university) throw createError({ statusCode: 404, statusMessage: 'Hochschule nicht gefunden' })

  // Only admin, creator, or teacher of this university can invite
  const isTeacherMember = await isUniversityTeacher(universityId, session.userId)
  if (session.role !== 'admin' && university.createdBy !== session.userId && !isTeacherMember) {
    throw createError({ statusCode: 403, statusMessage: 'Keine Berechtigung' })
  }

  const body = await readBody(event)
  const identifier = String(body.identifier || '').trim() // username or email
  const role = body.role === 'teacher' ? 'teacher' : 'student'

  if (!identifier) {
    throw createError({ statusCode: 400, statusMessage: 'Username oder E-Mail erforderlich' })
  }

  // Try to find user by username or email
  let user = await findUserByUsername(identifier)
  if (!user) user = await findUserByEmail(identifier)

  const member = await inviteToUniversity(
    universityId,
    user?.id || null,
    user ? null : identifier, // if no user found, store as pending email
    role,
    session.userId
  )

  return { success: true, member }
})
