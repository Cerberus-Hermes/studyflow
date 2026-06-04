import { findUserById } from '../../utils/db'
import { getAuthSession, toPublicUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = getAuthSession(event)
  if (!session) {
    return { user: null }
  }

  const user = await findUserById(session.userId)
  if (!user) {
    return { user: null }
  }

  return {
    user: toPublicUser(user),
  }
})
