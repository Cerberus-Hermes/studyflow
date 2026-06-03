import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { supabase, isSupabaseEnabled } from './supabase'

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

async function ensureLocalDb(): Promise<Database> {
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

async function saveLocalDb(db: Database) {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')
}

async function readLocalDb(): Promise<Database> {
  return ensureLocalDb()
}

// ========== SUPABASE HELPERS ==========

function toDbUser(row: any): User {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    passwordHash: row.password_hash,
    passwordSalt: row.password_salt,
    role: row.role,
    createdAt: row.created_at,
  }
}

function fromDbUser(u: User): any {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    password_hash: u.passwordHash,
    password_salt: u.passwordSalt,
    role: u.role,
    created_at: u.createdAt,
  }
}

function toDbFeedback(row: any): FeedbackEntry {
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username,
    text: row.text,
    userType: row.user_type,
    problemHelped: row.problem_helped || '',
    createdAt: row.created_at,
  }
}

// ========== USER FUNCTIONS ==========

export async function findUserByUsername(username: string): Promise<User | undefined> {
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('username', username)
      .single()
    if (error || !data) return undefined
    return toDbUser(data)
  }
  const db = await readLocalDb()
  return db.users.find(u => u.username.toLowerCase() === username.toLowerCase())
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email)
      .single()
    if (error || !data) return undefined
    return toDbUser(data)
  }
  const db = await readLocalDb()
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase())
}

export async function findUserById(id: string): Promise<User | undefined> {
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    if (error || !data) return undefined
    return toDbUser(data)
  }
  const db = await readLocalDb()
  return db.users.find(u => u.id === id)
}

export async function createUser(user: Omit<User, 'id' | 'createdAt'> & { role?: UserRole }): Promise<User> {
  const entry: User = {
    ...user,
    id: crypto.randomUUID(),
    role: user.role || 'user',
    createdAt: new Date().toISOString(),
  }

  if (isSupabaseEnabled() && supabase) {
    const { error } = await supabase.from('users').insert(fromDbUser(entry))
    if (error) throw new Error(error.message)
    return entry
  }

  const db = await readLocalDb()
  db.users.push(entry)
  await saveLocalDb(db)
  return entry
}

// ========== FEEDBACK FUNCTIONS ==========

export async function addFeedback(entry: Omit<FeedbackEntry, 'id' | 'createdAt'>): Promise<FeedbackEntry> {
  const item: FeedbackEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }

  if (isSupabaseEnabled() && supabase) {
    const { error } = await supabase.from('feedback').insert({
      id: item.id,
      user_id: item.userId,
      username: item.username,
      text: item.text,
      user_type: item.userType,
      problem_helped: item.problemHelped,
      created_at: item.createdAt,
    })
    if (error) throw new Error(error.message)
    return item
  }

  const db = await readLocalDb()
  db.feedback.unshift(item)
  await saveLocalDb(db)
  return item
}

export async function listFeedback(): Promise<FeedbackEntry[]> {
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data || []).map(toDbFeedback)
  }
  const db = await readLocalDb()
  return db.feedback
}

export async function listFeedbackByUser(userId: string): Promise<FeedbackEntry[]> {
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data || []).map(toDbFeedback)
  }
  const db = await readLocalDb()
  return db.feedback.filter(f => f.userId === userId)
}

// ========== ADMIN ==========

export async function ensureAdminUser() {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return

  if (isSupabaseEnabled() && supabase) {
    const { data } = await supabase.from('users').select('id').eq('role', 'admin').limit(1)
    if (data && data.length > 0) return

    const { hashPassword } = await import('./auth')
    const { hash, salt } = hashPassword(adminPassword)

    await supabase.from('users').insert({
      id: crypto.randomUUID(),
      username: 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@studyflow.local',
      password_hash: hash,
      password_salt: salt,
      role: 'admin',
      created_at: new Date().toISOString(),
    })
    return
  }

  const db = await readLocalDb()
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
  await saveLocalDb(db)
}
