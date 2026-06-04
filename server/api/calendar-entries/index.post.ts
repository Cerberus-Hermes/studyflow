import { createCalendarEntry } from '../../utils/db'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody(event)
  const { date, text, type } = body
  if (!text?.trim() || !date || !type) {
    throw createError({ statusCode: 400, statusMessage: 'Text, Datum und Typ erforderlich' })
  }
  const entry = await createCalendarEntry(session.userId, date, text.trim(), type)
  return { calendarEntry: entry }
})
