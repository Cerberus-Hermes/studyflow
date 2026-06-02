import { requireAuth, setAdminUnlockCookie, verifyAdminPassword } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const body = await readBody(event)
  const { password } = body

  if (!password || !verifyAdminPassword(password)) {
    throw createError({ statusCode: 403, statusMessage: 'Falsches Admin-Passwort' })
  }

  setAdminUnlockCookie(event)
  return { success: true, adminUnlocked: true }
})
