
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const universities = await listMyUniversities(session.userId)
  return { universities }
})
