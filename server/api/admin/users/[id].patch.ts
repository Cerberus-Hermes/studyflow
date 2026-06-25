
export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event)
  const userId = getRouterParam(event, 'id')
  if (!userId) throw createError({ statusCode: 400, statusMessage: 'ID fehlt' })

  // Prevent self-demotion
  if (userId === session.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Du kannst deine eigene Rolle nicht ändern' })
  }

  const body = await readBody(event)
  const role = body.role as UserRole

  if (!role || !['user', 'teacher', 'admin'].includes(role)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige Rolle' })
  }

  await updateUserRole(userId, role)
  return { success: true }
})
