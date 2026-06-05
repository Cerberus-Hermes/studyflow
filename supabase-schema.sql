-- Supabase Schema for StudyFlow
-- Run this in Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'teacher', 'admin')),
  -- Subscription / AI Credits
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  ai_credits_used INTEGER NOT NULL DEFAULT 0,
  ai_credits_limit INTEGER NOT NULL DEFAULT 10,
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 1,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  date DATE NOT NULL,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Study plans table
CREATE TABLE IF NOT EXISTS study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deadlines table
CREATE TABLE IF NOT EXISTS deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  date DATE NOT NULL,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Calendar entries table
CREATE TABLE IF NOT EXISTS calendar_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deadline', 'goal')),
  done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Completed items table
CREATE TABLE IF NOT EXISTS completed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  text TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'worker', 'other')),
  problem_helped TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Usage tracking (for subscription/credit system)
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL CHECK (tool_type IN ('summary', 'flashcards', 'tasks', 'quiz')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- Policies (drop first to avoid "already exists" errors)
DROP POLICY IF EXISTS "users_allow_all" ON users;
DROP POLICY IF EXISTS "tasks_allow_all" ON tasks;
DROP POLICY IF EXISTS "goals_allow_all" ON goals;
DROP POLICY IF EXISTS "study_plans_allow_all" ON study_plans;
DROP POLICY IF EXISTS "deadlines_allow_all" ON deadlines;
DROP POLICY IF EXISTS "calendar_entries_allow_all" ON calendar_entries;
DROP POLICY IF EXISTS "completed_items_allow_all" ON completed_items;
DROP POLICY IF EXISTS "feedback_allow_all" ON feedback;
DROP POLICY IF EXISTS "ai_usage_allow_all" ON ai_usage;

CREATE POLICY "users_allow_all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "tasks_allow_all" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "goals_allow_all" ON goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "study_plans_allow_all" ON study_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "deadlines_allow_all" ON deadlines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "calendar_entries_allow_all" ON calendar_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "completed_items_allow_all" ON completed_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "feedback_allow_all" ON feedback FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "ai_usage_allow_all" ON ai_usage FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_user_id ON deadlines(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_entries_user_id ON calendar_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_completed_items_user_id ON completed_items(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON ai_usage(created_at DESC);

-- ============================================================
-- UNIVERSITY SYSTEM
-- ============================================================

-- Universities
CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- University Members (invitations)
CREATE TABLE IF NOT EXISTS university_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')) DEFAULT 'student',
  invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted')) DEFAULT 'pending',
  invite_email TEXT,
  UNIQUE(university_id, user_id)
);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Course Enrollments
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enrolled_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

-- Course Files
CREATE TABLE IF NOT EXISTS course_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL DEFAULT 0,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Course Materials (AI-generated)
CREATE TABLE IF NOT EXISTS course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  file_id UUID REFERENCES course_files(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('quiz', 'flashcards', 'summary', 'practice_exam', 'study_guide')),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  generated_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "universities_allow_all" ON universities;
DROP POLICY IF EXISTS "university_members_allow_all" ON university_members;
DROP POLICY IF EXISTS "courses_allow_all" ON courses;
DROP POLICY IF EXISTS "course_enrollments_allow_all" ON course_enrollments;
DROP POLICY IF EXISTS "course_files_allow_all" ON course_files;
DROP POLICY IF EXISTS "course_materials_allow_all" ON course_materials;

CREATE POLICY "universities_allow_all" ON universities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "university_members_allow_all" ON university_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "courses_allow_all" ON courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "course_enrollments_allow_all" ON course_enrollments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "course_files_allow_all" ON course_files FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "course_materials_allow_all" ON course_materials FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_universities_slug ON universities(slug);
CREATE INDEX IF NOT EXISTS idx_universities_created_by ON universities(created_by);
CREATE INDEX IF NOT EXISTS idx_university_members_university_id ON university_members(university_id);
CREATE INDEX IF NOT EXISTS idx_university_members_user_id ON university_members(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_university_id ON courses(university_id);
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_files_course_id ON course_files(course_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_course_id ON course_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_type ON course_materials(type);
