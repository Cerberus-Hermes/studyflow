
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  if (session.role === 'admin') {
    const all = await listAllUniversities()
    // Admins see all universities with virtual admin role
    return { universities: all.map(u => ({ ...u, memberRole: 'admin' })) }
  }
  const universities = await listMyUniversities(session.userId)
  return { universities }
})
