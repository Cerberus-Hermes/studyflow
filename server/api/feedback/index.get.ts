import { listFeedback, listFeedbackByUser } from '../../utils/db'
import { getAuthSession, requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const session = getAuthSession(event)

  if (query.all === '1' || query.all === 'true') {
    await requireAdmin(event)
    const items = await listFeedback()
    return { feedback: items }
  }

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Nicht eingeloggt' })
  }

  const items = await listFeedbackByUser(session.userId)
  return { feedback: items }
})
