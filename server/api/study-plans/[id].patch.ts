import { updateStudyPlan } from '../../utils/db'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID erforderlich' })
  }
  const body = await readBody(event)
  const plan = await updateStudyPlan(session.userId, id, body)
  return { studyPlan: plan }
})
