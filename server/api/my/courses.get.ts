import { requireAuth } from '~/server/utils/auth'
import { listMyCourses } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const courses = await listMyCourses(session.userId)
  return { courses }
})
