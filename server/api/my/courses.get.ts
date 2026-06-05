
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const courses = await listMyCourses(session.userId)
  return { courses }
})
