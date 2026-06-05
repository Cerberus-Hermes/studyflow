import { mkdir, writeFile } from 'node:fs/promises'
import { supabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const courseId = getRouterParam(event, 'id')
  if (!courseId) throw createError({ statusCode: 400, statusMessage: 'ID fehlt' })

  const course = await findCourseById(courseId)
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Kurs nicht gefunden' })

  if (session.role !== 'admin' && session.role !== 'teacher') {
    throw createError({ statusCode: 403, statusMessage: 'Nur Lehrpersonal kann Dateien hochladen' })
  }

  const parts = await readMultipartFormData(event)
  const filePart = parts?.find(p => p.name === 'file')

  if (!filePart || !filePart.data) {
    throw createError({ statusCode: 400, statusMessage: 'Datei erforderlich' })
  }

  const fileName = filePart.filename || 'upload'
  const fileSize = filePart.data.length
  const mimeType = filePart.type || 'application/octet-stream'

  // Size limit: 10 MB
  if (fileSize > 10 * 1024 * 1024) {
    throw createError({ statusCode: 413, statusMessage: 'Datei zu groß (max 10 MB)' })
  }

  const bucketName = 'course-files'
  const storagePath = `${courseId}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`

  // Try Supabase Storage
  try {
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, filePart.data, {
        contentType: mimeType,
        upsert: false,
      })

    if (uploadError) {
      if (uploadError.message?.includes('bucket') || uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Storage-Bucket "course-files" existiert nicht in Supabase. Bitte im Storage-Dashboard anlegen.',
        })
      }
      throw uploadError
    }

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storagePath)

    const courseFile = await createCourseFile(
      courseId,
      fileName,
      urlData.publicUrl,
      mimeType,
      fileSize,
      session.userId
    )

    return { success: true, file: courseFile }
  } catch (err: any) {
    // Fallback for local dev without Supabase Storage bucket
    if (process.env.NODE_ENV !== 'production') {
      const storageDir = `/tmp/studyflow-files/${courseId}`
      await mkdir(storageDir, { recursive: true })
      const localPath = `${storageDir}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      await writeFile(localPath, filePart.data)

      const courseFile = await createCourseFile(
        courseId,
        fileName,
        localPath,
        mimeType,
        fileSize,
        session.userId
      )
      return { success: true, file: courseFile }
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Upload fehlgeschlagen: ${err.message || err}`,
    })
  }
})
