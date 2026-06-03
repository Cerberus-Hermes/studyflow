import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  username: string
  email: string
  passwordHash: string
  passwordSalt: string
  role: UserRole
  createdAt: string
}

export type FeedbackUserType = 'student' | 'worker' | 'other'

export interface FeedbackEntry {
  id: string
  userId: string
  username: string
  text: string
  userType: FeedbackUserType
  problemHelped: string
  createdAt: string
}

interface Database {
  users: User[]
  feedback: FeedbackEntry[]
}

const DATA_DIR = join(process.env.VERCEL ? '/tmp' : process.cwd(), '.data')
const DB_PATH = join(DATA_DIR, 'db.json')

const emptyDb = (): Database => ({ users: [], feedback: [] })

async function ensureDb(): Promise<Database> {
  await mkdir(DATA_DIR, { recursive: true })
  try {
    const raw = await readFile(DB_PATH, 'utf-8')
    return JSON.parse(raw) as Database
  } catch {
    const db = emptyDb()
    await writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')
    return db
  }
}

async function saveDb(db: Database) {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')
}

export async function readDb(): Promise<Database> {
  return ensureDb()
}

export async function writeDatabase(db: Database) {
  await saveDb(db)
}

export async function findUserByUsername(username: string): Promise<User | undefined> {
  const db = await readDb()
  return db.users.find(u => u.username.toLowerCase() === username.toLowerCase())
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const db = await readDb()
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase())
}

export async function findUserById(id: string): Promise<User | undefined> {
  const db = await readDb()
  return db.users.find(u => u.id === id)
}

export async function createUser(user: Omit<User, 'id' | 'createdAt'> & { role?: UserRole }): Promise<User> {
  const db = await readDb()
  const entry: User = {
    ...user,
    id: crypto.randomUUID(),
    role: user.role || 'user',
    createdAt: new Date().toISOString(),
  }
  db.users.push(entry)
  await saveDb(db)
  return entry
}

export async function addFeedback(entry: Omit<FeedbackEntry, 'id' | 'createdAt'>): Promise<FeedbackEntry> {
  const db = await readDb()
  const item: FeedbackEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  db.feedback.unshift(item)
  await saveDb(db)
  return item
}

export async function listFeedback(): Promise<FeedbackEntry[]> {
  const db = await readDb()
  return db.feedback
}

export async function listFeedbackByUser(userId: string): Promise<FeedbackEntry[]> {
  const db = await readDb()
  return db.feedback.filter(f => f.userId === userId)
}

export async function ensureAdminUser() {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return

  const db = await readDb()
  const hasAdmin = db.users.some(u => u.role === 'admin')
  if (hasAdmin) return

  const { hashPassword } = await import('./auth')
  const { hash, salt } = hashPassword(adminPassword)

  db.users.push({
    id: crypto.randomUUID(),
    username: 'admin',
    email: process.env.ADMIN_EMAIL || 'admin@studyflow.local',
    passwordHash: hash,
    passwordSalt: salt,
    role: 'admin',
    createdAt: new Date().toISOString(),
  })
  await saveDb(db)
}
