import { supabase } from './supabase'

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

export interface Task {
  id: string
  userId: string
  text: string
  priority: number
  done: boolean
  createdAt: string
}

export interface Goal {
  id: string
  userId: string
  text: string
  date: string
  done: boolean
  createdAt: string
}

export interface StudyPlan {
  id: string
  userId: string
  subject: string
  date: string
  createdAt: string
}

export interface Deadline {
  id: string
  userId: string
  text: string
  date: string
  done: boolean
  createdAt: string
}

export interface CalendarEntry {
  id: string
  userId: string
  date: string
  text: string
  type: 'deadline' | 'goal'
  done: boolean
  createdAt: string
}

export interface CompletedItem {
  id: string
  userId: string
  text: string
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

// ========== MAPPERS ==========

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

function toDbTask(row: any): Task {
  return {
    id: row.id,
    userId: row.user_id,
    text: row.text,
    priority: row.priority,
    done: row.done,
    createdAt: row.created_at,
  }
}

function fromDbTask(t: Task): any {
  return {
    id: t.id,
    user_id: t.userId,
    text: t.text,
    priority: t.priority,
    done: t.done,
    created_at: t.createdAt,
  }
}

function toDbGoal(row: any): Goal {
  return {
    id: row.id,
    userId: row.user_id,
    text: row.text,
    date: row.date,
    done: row.done,
    createdAt: row.created_at,
  }
}

function fromDbGoal(g: Goal): any {
  return {
    id: g.id,
    user_id: g.userId,
    text: g.text,
    date: g.date,
    done: g.done,
    created_at: g.createdAt,
  }
}

function toDbStudyPlan(row: any): StudyPlan {
  return {
    id: row.id,
    userId: row.user_id,
    subject: row.subject,
    date: row.date,
    createdAt: row.created_at,
  }
}

function fromDbStudyPlan(s: StudyPlan): any {
  return {
    id: s.id,
    user_id: s.userId,
    subject: s.subject,
    date: s.date,
    created_at: s.createdAt,
  }
}

function toDbDeadline(row: any): Deadline {
  return {
    id: row.id,
    userId: row.user_id,
    text: row.text,
    date: row.date,
    done: row.done,
    createdAt: row.created_at,
  }
}

function fromDbDeadline(d: Deadline): any {
  return {
    id: d.id,
    user_id: d.userId,
    text: d.text,
    date: d.date,
    done: d.done,
    created_at: d.createdAt,
  }
}

function toDbCalendarEntry(row: any): CalendarEntry {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    text: row.text,
    type: row.type,
    done: row.done,
    createdAt: row.created_at,
  }
}

function fromDbCalendarEntry(e: CalendarEntry): any {
  return {
    id: e.id,
    user_id: e.userId,
    date: e.date,
    text: e.text,
    type: e.type,
    done: e.done,
    created_at: e.createdAt,
  }
}

function toDbCompletedItem(row: any): CompletedItem {
  return {
    id: row.id,
    userId: row.user_id,
    text: row.text,
    createdAt: row.created_at,
  }
}

function fromDbCompletedItem(c: CompletedItem): any {
  return {
    id: c.id,
    user_id: c.userId,
    text: c.text,
    created_at: c.createdAt,
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
  const { data, error } = await supabase!
    .from('users')
    .select('*')
    .ilike('username', username)
    .single()
  if (error || !data) return undefined
  return toDbUser(data)
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const { data, error } = await supabase!
    .from('users')
    .select('*')
    .ilike('email', email)
    .single()
  if (error || !data) return undefined
  return toDbUser(data)
}

export async function findUserById(id: string): Promise<User | undefined> {
  const { data, error } = await supabase!
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return undefined
  return toDbUser(data)
}

export async function createUser(user: Omit<User, 'id' | 'createdAt'> & { role?: UserRole }): Promise<User> {
  const entry: User = {
    ...user,
    id: crypto.randomUUID(),
    role: user.role || 'user',
    createdAt: new Date().toISOString(),
  }
  const { error } = await supabase!.from('users').insert(fromDbUser(entry))
  if (error) throw new Error(error.message)
  return entry
}

// ========== TASK FUNCTIONS ==========

export async function listTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase!
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data || []).map(toDbTask)
}

export async function createTask(userId: string, text: string, priority: number): Promise<Task> {
  const entry: Task = {
    id: crypto.randomUUID(),
    userId,
    text,
    priority,
    done: false,
    createdAt: new Date().toISOString(),
  }
  const { error } = await supabase!.from('tasks').insert(fromDbTask(entry))
  if (error) throw new Error(error.message)
  return entry
}

export async function updateTask(userId: string, id: string, updates: Partial<Pick<Task, 'text' | 'priority' | 'done'>>): Promise<Task> {
  const { error } = await supabase!
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  const updated = await listTasks(userId)
  const task = updated.find(t => t.id === id)
  if (!task) throw new Error('Task not found')
  return task
}

export async function deleteTask(userId: string, id: string): Promise<void> {
  const { error } = await supabase!
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}

// ========== GOAL FUNCTIONS ==========

export async function listGoals(userId: string): Promise<Goal[]> {
  const { data, error } = await supabase!
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })
  if (error) throw new Error(error.message)
  return (data || []).map(toDbGoal)
}

export async function createGoal(userId: string, text: string, date: string): Promise<Goal> {
  const entry: Goal = {
    id: crypto.randomUUID(),
    userId,
    text,
    date,
    done: false,
    createdAt: new Date().toISOString(),
  }
  const { error } = await supabase!.from('goals').insert(fromDbGoal(entry))
  if (error) throw new Error(error.message)
  return entry
}

export async function updateGoal(userId: string, id: string, updates: Partial<Pick<Goal, 'text' | 'date' | 'done'>>): Promise<Goal> {
  const { error } = await supabase!
    .from('goals')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  const updated = await listGoals(userId)
  const goal = updated.find(g => g.id === id)
  if (!goal) throw new Error('Goal not found')
  return goal
}

export async function deleteGoal(userId: string, id: string): Promise<void> {
  const { error } = await supabase!
    .from('goals')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}

// ========== STUDY PLAN FUNCTIONS ==========

export async function listStudyPlans(userId: string): Promise<StudyPlan[]> {
  const { data, error } = await supabase!
    .from('study_plans')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })
  if (error) throw new Error(error.message)
  return (data || []).map(toDbStudyPlan)
}

export async function createStudyPlan(userId: string, subject: string, date: string): Promise<StudyPlan> {
  const entry: StudyPlan = {
    id: crypto.randomUUID(),
    userId,
    subject,
    date,
    createdAt: new Date().toISOString(),
  }
  const { error } = await supabase!.from('study_plans').insert(fromDbStudyPlan(entry))
  if (error) throw new Error(error.message)
  return entry
}

export async function updateStudyPlan(userId: string, id: string, updates: Partial<Pick<StudyPlan, 'subject' | 'date'>>): Promise<StudyPlan> {
  const { error } = await supabase!
    .from('study_plans')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  const updated = await listStudyPlans(userId)
  const plan = updated.find(s => s.id === id)
  if (!plan) throw new Error('Study plan not found')
  return plan
}

export async function deleteStudyPlan(userId: string, id: string): Promise<void> {
  const { error } = await supabase!
    .from('study_plans')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}

// ========== DEADLINE FUNCTIONS ==========

export async function listDeadlines(userId: string): Promise<Deadline[]> {
  const { data, error } = await supabase!
    .from('deadlines')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })
  if (error) throw new Error(error.message)
  return (data || []).map(toDbDeadline)
}

export async function createDeadline(userId: string, text: string, date: string): Promise<Deadline> {
  const entry: Deadline = {
    id: crypto.randomUUID(),
    userId,
    text,
    date,
    done: false,
    createdAt: new Date().toISOString(),
  }
  const { error } = await supabase!.from('deadlines').insert(fromDbDeadline(entry))
  if (error) throw new Error(error.message)
  return entry
}

export async function updateDeadline(userId: string, id: string, updates: Partial<Pick<Deadline, 'text' | 'date' | 'done'>>): Promise<Deadline> {
  const { error } = await supabase!
    .from('deadlines')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  const updated = await listDeadlines(userId)
  const deadline = updated.find(d => d.id === id)
  if (!deadline) throw new Error('Deadline not found')
  return deadline
}

export async function deleteDeadline(userId: string, id: string): Promise<void> {
  const { error } = await supabase!
    .from('deadlines')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}

// ========== CALENDAR ENTRY FUNCTIONS ==========

export async function listCalendarEntries(userId: string): Promise<CalendarEntry[]> {
  const { data, error } = await supabase!
    .from('calendar_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })
  if (error) throw new Error(error.message)
  return (data || []).map(toDbCalendarEntry)
}

export async function createCalendarEntry(userId: string, date: string, text: string, type: 'deadline' | 'goal'): Promise<CalendarEntry> {
  const entry: CalendarEntry = {
    id: crypto.randomUUID(),
    userId,
    date,
    text,
    type,
    done: false,
    createdAt: new Date().toISOString(),
  }
  const { error } = await supabase!.from('calendar_entries').insert(fromDbCalendarEntry(entry))
  if (error) throw new Error(error.message)
  return entry
}

export async function updateCalendarEntry(userId: string, id: string, updates: Partial<Pick<CalendarEntry, 'text' | 'date' | 'done'>>): Promise<CalendarEntry> {
  const { error } = await supabase!
    .from('calendar_entries')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  const updated = await listCalendarEntries(userId)
  const entry = updated.find(e => e.id === id)
  if (!entry) throw new Error('Calendar entry not found')
  return entry
}

export async function deleteCalendarEntry(userId: string, id: string): Promise<void> {
  const { error } = await supabase!
    .from('calendar_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}

// ========== COMPLETED ITEM FUNCTIONS ==========

export async function listCompletedItems(userId: string): Promise<CompletedItem[]> {
  const { data, error } = await supabase!
    .from('completed_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data || []).map(toDbCompletedItem)
}

export async function createCompletedItem(userId: string, text: string): Promise<CompletedItem> {
  const entry: CompletedItem = {
    id: crypto.randomUUID(),
    userId,
    text,
    createdAt: new Date().toISOString(),
  }
  const { error } = await supabase!.from('completed_items').insert(fromDbCompletedItem(entry))
  if (error) throw new Error(error.message)
  return entry
}

export async function deleteCompletedItem(userId: string, id: string): Promise<void> {
  const { error } = await supabase!
    .from('completed_items')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}

export async function clearCompletedItems(userId: string): Promise<void> {
  const { error } = await supabase!
    .from('completed_items')
    .delete()
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}

// ========== FEEDBACK FUNCTIONS ==========

export async function addFeedback(entry: Omit<FeedbackEntry, 'id' | 'createdAt'>): Promise<FeedbackEntry> {
  const item: FeedbackEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  const { error } = await supabase!.from('feedback').insert({
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

export async function listFeedback(): Promise<FeedbackEntry[]> {
  const { data, error } = await supabase!
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data || []).map(toDbFeedback)
}

export async function listFeedbackByUser(userId: string): Promise<FeedbackEntry[]> {
  const { data, error } = await supabase!
    .from('feedback')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data || []).map(toDbFeedback)
}
