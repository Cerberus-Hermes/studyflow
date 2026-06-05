import { requireAuth } from '~/server/utils/auth'
import { listUniversitiesByAdmin } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const universities = await listUniversitiesByAdmin(session.userId)
  return { universities }
})
