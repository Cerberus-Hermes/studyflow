import { createTask } from '../../utils/db'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody(event)
  const { text, priority } = body
  if (!text?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Text erforderlich' })
  }
  const task = await createTask(session.userId, text.trim(), priority || 1)
  return { task }
})
