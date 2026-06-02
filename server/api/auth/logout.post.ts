import { clearAdminUnlockCookie, clearSessionCookie } from '../../utils/auth'

export default defineEventHandler((event) => {
  clearSessionCookie(event)
  clearAdminUnlockCookie(event)
  return { success: true }
})
