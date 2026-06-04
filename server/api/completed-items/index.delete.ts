import { clearCompletedItems } from '../../utils/db'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  await clearCompletedItems(session.userId)
  return { success: true }
})
