import { createStudyPlan } from '../../utils/db'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody(event)
  const { subject, date } = body
  if (!subject?.trim() || !date) {
    throw createError({ statusCode: 400, statusMessage: 'Fach und Datum erforderlich' })
  }
  const plan = await createStudyPlan(session.userId, subject.trim(), date)
  return { studyPlan: plan }
})
