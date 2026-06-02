import { findUserByUsername } from '../../utils/db'
import { createSessionToken, setSessionCookie, toPublicUser, verifyPassword } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  if (!username?.trim() || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Benutzername und Passwort erforderlich' })
  }

  const user = await findUserByUsername(username.trim())
  if (!user || !verifyPassword(password, user.passwordHash, user.passwordSalt)) {
    throw createError({ statusCode: 401, statusMessage: 'Ungültige Anmeldedaten' })
  }

  const token = createSessionToken(user)
  setSessionCookie(event, token)

  return { user: toPublicUser(user) }
})
