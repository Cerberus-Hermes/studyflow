
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const courseId = getRouterParam(event, 'id')
  if (!courseId) throw createError({ statusCode: 400, statusMessage: 'ID fehlt' })

  const course = await findCourseById(courseId)
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Kurs nicht gefunden' })

  // Only admin or teacher can enroll students
  if (session.role !== 'admin' && session.role !== 'teacher') {
    throw createError({ statusCode: 403, statusMessage: 'Nur Lehrpersonal kann Studenten zuordnen' })
  }

  const body = await readBody(event)
  const username = String(body.username || '').trim()

  if (!username) {
    throw createError({ statusCode: 400, statusMessage: 'Username erforderlich' })
  }

  let user = await findUserByUsername(username)
  if (!user) {
    console.log(`[enroll] Username "${username}" nicht gefunden, versuche E-Mail...`)
    user = await findUserByEmail(username)
  }
  if (!user) {
    console.error(`[enroll] User weder als Username noch als E-Mail gefunden: "${username}"`)
    throw createError({ statusCode: 404, statusMessage: 'User nicht gefunden' })
  }

  const existing = await findCourseEnrollment(courseId, user.id)
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'User ist bereits eingeschrieben' })
  }

  const enrollment = await enrollStudent(courseId, user.id, session.userId)
  return { success: true, enrollment }
})
