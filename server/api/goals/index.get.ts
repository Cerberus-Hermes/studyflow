import { listGoals } from '../../utils/db'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const items = await listGoals(session.userId)
  return { goals: items }
})
