# StudyFlow University-System — Implementierungsplan

## Ziel
Admin kann Hochschulen erstellen. Lehrpersonal legt Kurse an, lädt Dateien hoch. KI generiert daraus Kurse, Quizzes, Lernzettel, Probe-Prüfungen. User muss eingeladen werden. Student muss Kurs zugeordnet werden.

## Neue Rollen
- `admin` — Hochschulen erstellen/verwalten (bestehend)
- `teacher` — Kurse anlegen, Dateien hochladen, KI-Materialien generieren
- `student` — Sieht nur zugeordnete Kurse und Materialien

## DB Schema (Neue Tabellen)

### 1. `universities`
| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | UUID PK | |
| name | TEXT | Hochschulname |
| slug | TEXT UNIQUE | URL-freundlich |
| description | TEXT | |
| created_by | UUID → users | Admin |
| created_at | TIMESTAMPTZ | |

### 2. `university_members`
| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | UUID PK | |
| university_id | UUID → universities | |
| user_id | UUID → users | |
| role | TEXT CHECK | `teacher` / `student` |
| invited_by | UUID → users | |
| invited_at | TIMESTAMPTZ | |
| status | TEXT | `pending` / `accepted` |

### 3. `courses`
| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | UUID PK | |
| university_id | UUID → universities | |
| name | TEXT | Kursname |
| description | TEXT | |
| created_by | UUID → users | Teacher |
| created_at | TIMESTAMPTZ | |

### 4. `course_enrollments`
| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | UUID PK | |
| course_id | UUID → courses | |
| user_id | UUID → users | |
| enrolled_by | UUID → users | Teacher/Admin |
| enrolled_at | TIMESTAMPTZ | |

### 5. `course_files`
| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | UUID PK | |
| course_id | UUID → courses | |
| name | TEXT | Dateiname |
| storage_path | TEXT | MinIO/Supabase Storage Path |
| mime_type | TEXT | |
| size_bytes | INTEGER | |
| uploaded_by | UUID → users | |
| uploaded_at | TIMESTAMPTZ | |

### 6. `course_materials`
| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | UUID PK | |
| course_id | UUID → courses | |
| file_id | UUID → course_files (nullable) | Quelle |
| type | TEXT CHECK | `quiz` / `flashcards` / `summary` / `practice_exam` / `study_guide` |
| title | TEXT | |
| content | TEXT | JSON oder Text |
| generated_by | UUID → users | |
| created_at | TIMESTAMPTZ | |

## API Endpoints

### Admin
- `POST /api/universities` — Hochschule erstellen (admin)
- `GET /api/universities` — Liste eigener Hochschulen (admin)
- `POST /api/universities/:id/invite` — User einladen (admin/teacher)
- `GET /api/universities/:id/members` — Mitglieder liste (admin/teacher)

### Teacher
- `POST /api/universities/:id/courses` — Kurs erstellen
- `GET /api/universities/:id/courses` — Kurse der Hochschule
- `POST /api/courses/:id/enroll` — Student zuordnen
- `POST /api/courses/:id/files` — Datei hochladen
- `GET /api/courses/:id/files` — Dateien liste
- `POST /api/courses/:id/generate` — KI-Material generieren

### Student
- `GET /api/my/universities` — Meine Hochschulen
- `GET /api/my/courses` — Meine Kurse
- `GET /api/courses/:id/materials` — Materialien des Kurses
- `GET /api/courses/:id` — Kurs-Details

## Frontend Pages

### Neue Tabs
- `universities` — Hochschulen-Verwaltung (Admin/Teacher)
- `my-courses` — Meine Kurse (Student)

### Neue Komponenten
- `UniversityManager.vue` — Admin: Hochschule erstellen, Mitglieder einladen
- `CourseManager.vue` — Teacher: Kurse verwalten, Dateien hochladen
- `CourseStudentView.vue` — Student: Kurse durchstöbern, Materialien lernen
- `CourseFileUpload.vue` — Datei-Upload für Kurse
- `CourseMaterialCard.vue` — Anzeige generierter Materialien
- `InviteUserModal.vue` — User per Email/Username einladen

## Implementierungsschritte

### Phase 1: DB Schema & Migration
1. `supabase-schema.sql` erweitern
2. Migration für bestehende DB erstellen
3. `server/utils/db.ts` erweitern (Interfaces + CRUD)

### Phase 2: Backend API
1. Admin-API für Universities
2. Teacher-API für Courses, Files, Enrollments
3. Student-API für My-Courses, Materials
4. Auth-Middleware für role-based access

### Phase 3: Frontend
1. Neue Tabs im Layout
2. Admin-Panel (UniversityManager)
3. Teacher-Panel (CourseManager)
4. Student-View (CourseStudentView)
5. KI-Integration für Course-Materialien

### Phase 4: Testing & Build
1. Lokaler Build testen
2. Commit & Push

## Dateien
- `supabase-schema.sql`
- `server/utils/db.ts`
- `server/utils/auth.ts` (role checks)
- `server/api/universities/*.ts`
- `server/api/courses/*.ts`
- `server/api/materials/*.ts`
- `app/stores/auth.ts` (role erweitern)
- `app/layouts/default.vue` (neue Tabs)
- `app/components/UniversityManager.vue`
- `app/components/CourseManager.vue`
- `app/components/CourseStudentView.vue`
- `app/pages/index.vue` (Tab-Inhalte erweitern)
