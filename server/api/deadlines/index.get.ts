import { listDeadlines } from '../../utils/db'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const items = await listDeadlines(session.userId)
  return { deadlines: items }
})
