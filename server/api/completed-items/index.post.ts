import { createCompletedItem } from '../../utils/db'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody(event)
  const { text } = body
  if (!text?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Text erforderlich' })
  }
  const item = await createCompletedItem(session.userId, text.trim())
  return { completedItem: item }
})
