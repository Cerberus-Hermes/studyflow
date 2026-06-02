import { findUserById } from '../../utils/db'
import { getAuthSession, hasAdminAccess, toPublicUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = getAuthSession(event)
  if (!session) {
    return { user: null, adminUnlocked: false }
  }

  const user = await findUserById(session.userId)
  if (!user) {
    return { user: null, adminUnlocked: false }
  }

  return {
    user: toPublicUser(user),
    adminUnlocked: hasAdminAccess(event, user.role),
  }
})
