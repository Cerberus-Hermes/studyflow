
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const requests = await listMyCourseRequests(session.userId)
  return { requests }
})
