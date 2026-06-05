import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import type { User, UserRole } from './db'
import { findUserById } from './db'

const SESSION_COOKIE = 'sf_session'
const SESSION_DAYS = 14

export interface SessionPayload {
  userId: string
  role: UserRole
  username: string
  exp: number
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 16) {
    throw createError({
      statusCode: 500,
      statusMessage: 'AUTH_SECRET fehlt oder ist zu kurz (min. 16 Zeichen)',
    })
  }
  return secret
}

function sign(value: string): string {
  return createHmac('sha256', getAuthSecret()).update(value).digest('base64url')
}

function encodeToken(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${data}.${sign(data)}`
}

function decodeToken(token: string): SessionPayload | null {
  const [data, sig] = token.split('.')
  if (!data || !sig) return null
  const expected = sign(data)
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  } catch {
    return null
  }
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8')) as SessionPayload
    if (!payload.exp || payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function hashPassword(password: string, salt?: string) {
  const s = salt || randomBytes(16).toString('hex')
  const hash = scryptSync(password, s, 64).toString('hex')
  return { hash, salt: s }
}

export function verifyPassword(password: string, hash: string, salt: string) {
  const { hash: attempt } = hashPassword(password, salt)
  try {
    return timingSafeEqual(Buffer.from(attempt, 'hex'), Buffer.from(hash, 'hex'))
  } catch {
    return false
  }
}

export function createSessionToken(user: User): string {
  const payload: SessionPayload = {
    userId: user.id,
    role: user.role,
    username: user.username,
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  }
  return encodeToken(payload)
}

export function setSessionCookie(event: H3Event, token: string) {
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  })
}

export function clearSessionCookie(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}

export function getAuthSession(event: H3Event): SessionPayload | null {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return null
  return decodeToken(token)
}

export async function requireAuth(event: H3Event): Promise<SessionPayload> {
  const session = getAuthSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Nicht eingeloggt' })
  }
  const user = await findUserById(session.userId)
  if (!user) {
    clearSessionCookie(event)
    throw createError({ statusCode: 401, statusMessage: 'Session ungültig' })
  }
  return session
}

export async function requireAdmin(event: H3Event): Promise<SessionPayload> {
  const session = await requireAuth(event)
  if (session.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin-Zugriff erforderlich' })
  }
  return session
}

export function toPublicUser(user: User) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    subscriptionTier: user.subscriptionTier,
    aiCreditsUsed: user.aiCreditsUsed,
    aiCreditsLimit: user.aiCreditsLimit,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
    createdAt: user.createdAt,
  }
}
