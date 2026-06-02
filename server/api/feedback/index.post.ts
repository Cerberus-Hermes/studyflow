import { addFeedback, type FeedbackUserType } from '../../utils/db'
import { getAuthSession } from '../../utils/auth'

const VALID_USER_TYPES: FeedbackUserType[] = ['student', 'worker', 'other']

export default defineEventHandler(async (event) => {
  const session = getAuthSession(event)
  const body = await readBody(event)
  const { text, userType, problemHelped } = body

  if (!text?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Feedback-Text erforderlich' })
  }

  if (!userType || !VALID_USER_TYPES.includes(userType)) {
    throw createError({ statusCode: 400, statusMessage: 'Bitte wähle: Student/Schüler, Arbeiter oder Sonstiges' })
  }

  if (text.length > 5000) {
    throw createError({ statusCode: 400, statusMessage: 'Feedback maximal 5000 Zeichen' })
  }

  const problem = problemHelped?.trim() || ''
  if (problem.length > 2000) {
    throw createError({ statusCode: 400, statusMessage: 'Problem-Feld maximal 2000 Zeichen' })
  }

  const entry = await addFeedback({
    userId: session?.userId ?? 'guest',
    username: session?.username ?? 'Gast',
    text: text.trim(),
    userType,
    problemHelped: problem,
  })

  return { success: true, feedback: entry }
})
