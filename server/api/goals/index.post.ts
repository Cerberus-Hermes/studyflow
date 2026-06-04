import { createGoal } from '../../utils/db'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody(event)
  const { text, date } = body
  if (!text?.trim() || !date) {
    throw createError({ statusCode: 400, statusMessage: 'Text und Datum erforderlich' })
  }
  const goal = await createGoal(session.userId, text.trim(), date)
  return { goal }
})
