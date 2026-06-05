-- Migration: University System
-- Run this in Supabase SQL Editor for existing databases

-- Universities
CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- University Members
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

-- Course Materials
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

-- RLS
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
