import { mkdir, writeFile } from 'node:fs/promises'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const courseId = getRouterParam(event, 'id')
  if (!courseId) throw createError({ statusCode: 400, statusMessage: 'ID fehlt' })

  const course = await findCourseById(courseId)
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Kurs nicht gefunden' })

  // Only admin or teacher can upload files
  if (session.role !== 'admin' && session.role !== 'teacher') {
    throw createError({ statusCode: 403, statusMessage: 'Nur Lehrpersonal kann Dateien hochladen' })
  }

  const formData = await readFormData(event)
  const file = formData.get('file') as File | null

  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'Datei erforderlich' })
  }

  // Store file in local storage (can be migrated to MinIO later)
  const storageDir = `/opt/data/studyflow/.storage/courses/${courseId}`
  await mkdir(storageDir, { recursive: true })
  const storagePath = `${storageDir}/${Date.now()}_${file.name}`
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(storagePath, buffer)

  const courseFile = await createCourseFile(
    courseId,
    file.name,
    storagePath,
    file.type || 'application/octet-stream',
    file.size,
    session.userId
  )

  return { success: true, file: courseFile }
})
