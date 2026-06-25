
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const requests = await listMyPendingUniversityRequests(session.userId)
  return { requests }
})
