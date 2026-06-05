import { supabase } from './supabase'

export type SubscriptionTier = 'free' | 'pro' | 'premium'
export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  username: string
  email: string
  passwordHash: string
  passwordSalt: string
  role: UserRole
  subscriptionTier: SubscriptionTier
  aiCreditsUsed: number
  aiCreditsLimit: number
  subscriptionExpiresAt: string | null
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
    subscriptionTier: row.subscription_tier || 'free',
    aiCreditsUsed: row.ai_credits_used || 0,
    aiCreditsLimit: row.ai_credits_limit || 10,
    subscriptionExpiresAt: row.subscription_expires_at || null,
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
    subscription_tier: u.subscriptionTier,
    ai_credits_used: u.aiCreditsUsed,
    ai_credits_limit: u.aiCreditsLimit,
    subscription_expires_at: u.subscriptionExpiresAt,
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
    subscriptionTier: user.subscriptionTier || 'free',
    aiCreditsUsed: user.aiCreditsUsed || 0,
    aiCreditsLimit: user.aiCreditsLimit || 10,
    subscriptionExpiresAt: user.subscriptionExpiresAt || null,
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

// ========== AI USAGE / SUBSCRIPTION FUNCTIONS ==========

export interface AIUsageEntry {
  id: string
  userId: string
  toolType: string
  createdAt: string
}

function toDbAIUsage(row: any): AIUsageEntry {
  return {
    id: row.id,
    userId: row.user_id,
    toolType: row.tool_type,
    createdAt: row.created_at,
  }
}

export async function trackAIUsage(userId: string, toolType: string): Promise<AIUsageEntry> {
  const entry: AIUsageEntry = {
    id: crypto.randomUUID(),
    userId,
    toolType,
    createdAt: new Date().toISOString(),
  }
  const { error } = await supabase!.from('ai_usage').insert({
    id: entry.id,
    user_id: entry.userId,
    tool_type: entry.toolType,
    created_at: entry.createdAt,
  })
  if (error) throw new Error(error.message)

  // Increment user's credit count
  await supabase!
    .from('users')
    .update({ ai_credits_used: supabase!.rpc('increment', { x: 1 }) })
    .eq('id', userId)

  return entry
}

export async function getAIUsageCount(userId: string, since?: string): Promise<number> {
  const query = supabase!
    .from('ai_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (since) {
    query.gte('created_at', since)
  }

  const { count, error } = await query
  if (error) throw new Error(error.message)
  return count || 0
}

export async function incrementAICredits(userId: string): Promise<void> {
  const { data, error: fetchErr } = await supabase!
    .from('users')
    .select('ai_credits_used')
    .eq('id', userId)
    .single()

  if (fetchErr) throw new Error(fetchErr.message)

  const current = (data?.ai_credits_used || 0) + 1
  const { error } = await supabase!
    .from('users')
    .update({ ai_credits_used: current })
    .eq('id', userId)

  if (error) throw new Error(error.message)
}

export function hasAICredits(user: User): boolean {
  // Premium = unlimited
  if (user.subscriptionTier === 'premium') return true

  // Check if subscription expired
  if (user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date()) {
    return false
  }

  return user.aiCreditsUsed < user.aiCreditsLimit
}

export function getAICreditsRemaining(user: User): number {
  if (user.subscriptionTier === 'premium') return -1 // unlimited
  return Math.max(0, user.aiCreditsLimit - user.aiCreditsUsed)
}

// ========== UNIVERSITY SYSTEM ==========

export interface University {
  id: string
  name: string
  slug: string
  description: string
  createdBy: string
  createdAt: string
}

export interface UniversityMember {
  id: string
  universityId: string
  userId: string | null
  role: 'teacher' | 'student'
  invitedBy: string
  invitedAt: string
  status: 'pending' | 'accepted'
  inviteEmail: string | null
}

export interface Course {
  id: string
  universityId: string
  name: string
  description: string
  createdBy: string
  createdAt: string
}

export interface CourseEnrollment {
  id: string
  courseId: string
  userId: string
  enrolledBy: string
  enrolledAt: string
}

export interface CourseFile {
  id: string
  courseId: string
  name: string
  storagePath: string
  mimeType: string
  sizeBytes: number
  uploadedBy: string
  uploadedAt: string
}

export interface CourseMaterial {
  id: string
  courseId: string
  fileId: string | null
  type: 'quiz' | 'flashcards' | 'summary' | 'practice_exam' | 'study_guide'
  title: string
  content: string
  generatedBy: string
  createdAt: string
}

function toDbUniversity(row: any): University {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    createdBy: row.created_by,
    createdAt: row.created_at,
  }
}

function fromDbUniversity(u: University): any {
  return {
    id: u.id,
    name: u.name,
    slug: u.slug,
    description: u.description,
    created_by: u.createdBy,
    created_at: u.createdAt,
  }
}

function toDbUniversityMember(row: any): UniversityMember {
  return {
    id: row.id,
    universityId: row.university_id,
    userId: row.user_id,
    role: row.role,
    invitedBy: row.invited_by,
    invitedAt: row.invited_at,
    status: row.status,
    inviteEmail: row.invite_email,
  }
}

function fromDbUniversityMember(m: UniversityMember): any {
  return {
    id: m.id,
    university_id: m.universityId,
    user_id: m.userId,
    role: m.role,
    invited_by: m.invitedBy,
    invited_at: m.invitedAt,
    status: m.status,
    invite_email: m.inviteEmail,
  }
}

function toDbCourse(row: any): Course {
  return {
    id: row.id,
    universityId: row.university_id,
    name: row.name,
    description: row.description || '',
    createdBy: row.created_by,
    createdAt: row.created_at,
  }
}

function fromDbCourse(c: Course): any {
  return {
    id: c.id,
    university_id: c.universityId,
    name: c.name,
    description: c.description,
    created_by: c.createdBy,
    created_at: c.createdAt,
  }
}

function toDbCourseEnrollment(row: any): CourseEnrollment {
  return {
    id: row.id,
    courseId: row.course_id,
    userId: row.user_id,
    enrolledBy: row.enrolled_by,
    enrolledAt: row.enrolled_at,
  }
}

function fromDbCourseEnrollment(e: CourseEnrollment): any {
  return {
    id: e.id,
    course_id: e.courseId,
    user_id: e.userId,
    enrolled_by: e.enrolledBy,
    enrolled_at: e.enrolledAt,
  }
}

function toDbCourseFile(row: any): CourseFile {
  return {
    id: row.id,
    courseId: row.course_id,
    name: row.name,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    uploadedBy: row.uploaded_by,
    uploadedAt: row.uploaded_at,
  }
}

function fromDbCourseFile(f: CourseFile): any {
  return {
    id: f.id,
    course_id: f.courseId,
    name: f.name,
    storage_path: f.storagePath,
    mime_type: f.mimeType,
    size_bytes: f.sizeBytes,
    uploaded_by: f.uploadedBy,
    uploaded_at: f.uploadedAt,
  }
}

function toDbCourseMaterial(row: any): CourseMaterial {
  return {
    id: row.id,
    courseId: row.course_id,
    fileId: row.file_id,
    type: row.type,
    title: row.title,
    content: row.content,
    generatedBy: row.generated_by,
    createdAt: row.created_at,
  }
}

function fromDbCourseMaterial(m: CourseMaterial): any {
  return {
    id: m.id,
    course_id: m.courseId,
    file_id: m.fileId,
    type: m.type,
    title: m.title,
    content: m.content,
    generated_by: m.generatedBy,
    created_at: m.createdAt,
  }
}

// --- University CRUD ---

export async function createUniversity(name: string, slug: string, description: string, createdBy: string): Promise<University> {
  const entry: University = {
    id: crypto.randomUUID(),
    name,
    slug,
    description,
    createdBy,
    createdAt: new Date().toISOString(),
  }
  const { error } = await supabase!.from('universities').insert(fromDbUniversity(entry))
  if (error) throw new Error(error.message)

  // Auto-add creator as accepted teacher member
  const memberEntry: UniversityMember = {
    id: crypto.randomUUID(),
    universityId: entry.id,
    userId: createdBy,
    role: 'teacher',
    invitedBy: createdBy,
    invitedAt: new Date().toISOString(),
    status: 'accepted',
    inviteEmail: null,
  }
  await supabase!.from('university_members').insert(fromDbUniversityMember(memberEntry))

  return entry
}

export async function findUniversityBySlug(slug: string): Promise<University | undefined> {
  const { data, error } = await supabase!
    .from('universities')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error || !data) return undefined
  return toDbUniversity(data)
}

export async function findUniversityById(id: string): Promise<University | undefined> {
  const { data, error } = await supabase!
    .from('universities')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return undefined
  return toDbUniversity(data)
}

export async function listUniversitiesByAdmin(userId: string): Promise<University[]> {
  const { data, error } = await supabase!
    .from('universities')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data || []).map(toDbUniversity)
}

export async function listMyUniversities(userId: string): Promise<(University & { memberRole: string; memberStatus: string })[]> {
  // 1. Universities where user is an accepted member
  const { data: memberData, error: memberError } = await supabase!
    .from('university_members')
    .select('university_id, role, status, universities(*)')
    .eq('user_id', userId)
    .eq('status', 'accepted')

  if (memberError) throw new Error(memberError.message)

  const fromMembers = (memberData || []).map((row: any) => ({
    ...toDbUniversity(row.universities),
    memberRole: row.role,
    memberStatus: row.status,
  }))

  // 2. Also include universities where user is the creator (for backwards compat)
  const { data: createdData, error: createdError } = await supabase!
    .from('universities')
    .select('*')
    .eq('created_by', userId)

  if (createdError) throw new Error(createdError.message)

  const fromCreated = (createdData || []).map((row: any) => ({
    ...toDbUniversity(row),
    memberRole: 'teacher',
    memberStatus: 'accepted',
  }))

  // Merge and deduplicate by id
  const map = new Map<string, University & { memberRole: string; memberStatus: string }>()
  for (const u of fromMembers) map.set(u.id, u)
  for (const u of fromCreated) if (!map.has(u.id)) map.set(u.id, u)

  return Array.from(map.values())
}

export async function deleteUniversity(id: string): Promise<void> {
  const { error } = await supabase!.from('universities').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// --- University Member CRUD ---

export async function inviteToUniversity(universityId: string, userId: string | null, inviteEmail: string | null, role: 'teacher' | 'student', invitedBy: string): Promise<UniversityMember> {
  const entry: UniversityMember = {
    id: crypto.randomUUID(),
    universityId,
    userId,
    role,
    invitedBy,
    invitedAt: new Date().toISOString(),
    status: 'pending',
    inviteEmail,
  }
  const { error } = await supabase!.from('university_members').insert(fromDbUniversityMember(entry))
  if (error) throw new Error(error.message)
  return entry
}

export async function acceptUniversityInvite(memberId: string): Promise<void> {
  const { error } = await supabase!
    .from('university_members')
    .update({ status: 'accepted' })
    .eq('id', memberId)
  if (error) throw new Error(error.message)
}

export async function listUniversityMembers(universityId: string): Promise<UniversityMember[]> {
  const { data, error } = await supabase!
    .from('university_members')
    .select('*')
    .eq('university_id', universityId)
    .order('invited_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data || []).map(toDbUniversityMember)
}

export async function findUniversityMember(universityId: string, userId: string): Promise<UniversityMember | undefined> {
  const { data, error } = await supabase!
    .from('university_members')
    .select('*')
    .eq('university_id', universityId)
    .eq('user_id', userId)
    .single()
  if (error || !data) return undefined
  return toDbUniversityMember(data)
}

export async function removeUniversityMember(memberId: string): Promise<void> {
  const { error } = await supabase!.from('university_members').delete().eq('id', memberId)
  if (error) throw new Error(error.message)
}

// --- Course CRUD ---

export async function createCourse(universityId: string, name: string, description: string, createdBy: string): Promise<Course> {
  const entry: Course = {
    id: crypto.randomUUID(),
    universityId,
    name,
    description,
    createdBy,
    createdAt: new Date().toISOString(),
  }
  const { error } = await supabase!.from('courses').insert(fromDbCourse(entry))
  if (error) throw new Error(error.message)
  return entry
}

export async function findCourseById(id: string): Promise<Course | undefined> {
  const { data, error } = await supabase!
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return undefined
  return toDbCourse(data)
}

export async function listCoursesByUniversity(universityId: string): Promise<Course[]> {
  const { data, error } = await supabase!
    .from('courses')
    .select('*')
    .eq('university_id', universityId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data || []).map(toDbCourse)
}

export async function listMyCourses(userId: string): Promise<(Course & { university_name: string })[]> {
  const { data, error } = await supabase!
    .from('course_enrollments')
    .select('courses(*, universities(name))')
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  return (data || []).map((row: any) => ({
    ...toDbCourse(row.courses),
    university_name: row.courses?.universities?.name || '',
  }))
}

export async function deleteCourse(id: string): Promise<void> {
  const { error } = await supabase!.from('courses').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// --- Course Enrollment CRUD ---

export async function enrollStudent(courseId: string, userId: string, enrolledBy: string): Promise<CourseEnrollment> {
  const entry: CourseEnrollment = {
    id: crypto.randomUUID(),
    courseId,
    userId,
    enrolledBy,
    enrolledAt: new Date().toISOString(),
  }
  const { error } = await supabase!.from('course_enrollments').insert(fromDbCourseEnrollment(entry))
  if (error) throw new Error(error.message)
  return entry
}

export async function listCourseEnrollments(courseId: string): Promise<CourseEnrollment[]> {
  const { data, error } = await supabase!
    .from('course_enrollments')
    .select('*')
    .eq('course_id', courseId)
    .order('enrolled_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data || []).map(toDbCourseEnrollment)
}

export async function findCourseEnrollment(courseId: string, userId: string): Promise<CourseEnrollment | undefined> {
  const { data, error } = await supabase!
    .from('course_enrollments')
    .select('*')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .single()
  if (error || !data) return undefined
  return toDbCourseEnrollment(data)
}

export async function unenrollStudent(enrollmentId: string): Promise<void> {
  const { error } = await supabase!.from('course_enrollments').delete().eq('id', enrollmentId)
  if (error) throw new Error(error.message)
}

// --- Course File CRUD ---

export async function createCourseFile(courseId: string, name: string, storagePath: string, mimeType: string, sizeBytes: number, uploadedBy: string): Promise<CourseFile> {
  const entry: CourseFile = {
    id: crypto.randomUUID(),
    courseId,
    name,
    storagePath,
    mimeType,
    sizeBytes,
    uploadedBy,
    uploadedAt: new Date().toISOString(),
  }
  const { error } = await supabase!.from('course_files').insert(fromDbCourseFile(entry))
  if (error) throw new Error(error.message)
  return entry
}

export async function listCourseFiles(courseId: string): Promise<CourseFile[]> {
  const { data, error } = await supabase!
    .from('course_files')
    .select('*')
    .eq('course_id', courseId)
    .order('uploaded_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data || []).map(toDbCourseFile)
}

export async function findCourseFileById(id: string): Promise<CourseFile | undefined> {
  const { data, error } = await supabase!
    .from('course_files')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return undefined
  return toDbCourseFile(data)
}

export async function deleteCourseFile(id: string): Promise<void> {
  const { error } = await supabase!.from('course_files').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// --- Course Material CRUD ---

export async function createCourseMaterial(courseId: string, fileId: string | null, type: CourseMaterial['type'], title: string, content: string, generatedBy: string): Promise<CourseMaterial> {
  const entry: CourseMaterial = {
    id: crypto.randomUUID(),
    courseId,
    fileId,
    type,
    title,
    content,
    generatedBy,
    createdAt: new Date().toISOString(),
  }
  const { error } = await supabase!.from('course_materials').insert(fromDbCourseMaterial(entry))
  if (error) throw new Error(error.message)
  return entry
}

export async function listCourseMaterials(courseId: string): Promise<CourseMaterial[]> {
  const { data, error } = await supabase!
    .from('course_materials')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data || []).map(toDbCourseMaterial)
}

export async function findCourseMaterialById(id: string): Promise<CourseMaterial | undefined> {
  const { data, error } = await supabase!
    .from('course_materials')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return undefined
  return toDbCourseMaterial(data)
}

export async function deleteCourseMaterial(id: string): Promise<void> {
  const { error } = await supabase!.from('course_materials').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
