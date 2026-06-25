
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  try {
    const requests = await listMyCourseRequests(session.userId)
    return { requests }
  } catch {
    // course_requests table may not exist yet
    return { requests: [] }
  }
})
