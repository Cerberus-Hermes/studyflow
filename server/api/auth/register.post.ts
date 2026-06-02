import { createUser, findUserByEmail, findUserByUsername } from '../../utils/db'
import { createSessionToken, hashPassword, setSessionCookie, toPublicUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, email, password } = body

  if (!username?.trim() || !email?.trim() || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Benutzername, E-Mail und Passwort erforderlich' })
  }

  if (password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Passwort mindestens 6 Zeichen' })
  }

  if (await findUserByUsername(username.trim())) {
    throw createError({ statusCode: 409, statusMessage: 'Benutzername bereits vergeben' })
  }

  if (await findUserByEmail(email.trim())) {
    throw createError({ statusCode: 409, statusMessage: 'E-Mail bereits registriert' })
  }

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  const role = adminEmail && email.trim().toLowerCase() === adminEmail ? 'admin' : 'user'

  const { hash, salt } = hashPassword(password)
  const user = await createUser({
    username: username.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hash,
    passwordSalt: salt,
    role,
  })

  const token = createSessionToken(user)
  setSessionCookie(event, token)

  return { user: toPublicUser(user) }
})
