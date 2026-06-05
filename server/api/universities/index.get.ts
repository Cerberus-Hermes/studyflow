
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const universities = await listUniversitiesByAdmin(session.userId)
  return { universities }
})
