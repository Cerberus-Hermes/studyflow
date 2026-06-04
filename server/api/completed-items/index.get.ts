import { listCompletedItems } from '../../utils/db'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const items = await listCompletedItems(session.userId)
  return { completedItems: items }
})
