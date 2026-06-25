
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  // 1. Get my accepted universities
  const { data: memberData, error: memberError } = await supabase!
    .from('university_members')
    .select('university_id')
    .eq('user_id', session.userId)
    .eq('status', 'accepted')

  if (memberError) {
    console.error('[available-courses] member error:', memberError.message)
    throw createError({ statusCode: 500, statusMessage: 'DB-Fehler (members)' })
  }

  const uniIds = (memberData || []).map((m: any) => m.university_id)

  if (uniIds.length === 0) {
    return { courses: [] }
  }

  // 2. Get all courses from those universities
  const { data: coursesData, error: coursesError } = await supabase!
    .from('courses')
    .select('*, universities:university_id (name)')
    .in('university_id', uniIds)

  if (coursesError) {
    console.error('[available-courses] courses error:', coursesError.message)
    throw createError({ statusCode: 500, statusMessage: 'DB-Fehler (courses)' })
  }

  // 3. Get my enrollments
  const { data: enrollData, error: enrollError } = await supabase!
    .from('course_enrollments')
    .select('course_id')
    .eq('user_id', session.userId)

  if (enrollError) {
    console.error('[available-courses] enrollments error:', enrollError.message)
    throw createError({ statusCode: 500, statusMessage: 'DB-Fehler (enrollments)' })
  }

  const enrolledCourseIds = new Set((enrollData || []).map((e: any) => e.course_id))

  // 4. Get my pending requests (gracefully handle missing table)
  let requestedCourseIds = new Set<string>()
  try {
    const { data: reqData, error: reqError } = await supabase!
      .from('course_requests')
      .select('course_id')
      .eq('user_id', session.userId)
      .eq('status', 'pending')

    if (!reqError && reqData) {
      requestedCourseIds = new Set((reqData as any[]).map((r: any) => r.course_id))
    }
  } catch {
    // course_requests table may not exist yet — ignore
  }

  // 5. Filter
  const courses = (coursesData || [])
    .filter((c: any) => !enrolledCourseIds.has(c.id) && !requestedCourseIds.has(c.id))
    .map((c: any) => ({
      id: c.id,
      name: c.name,
      description: c.description || '',
      university_id: c.university_id,
      university_name: c.universities?.name || '',
      created_by: c.created_by,
      created_at: c.created_at,
    }))

  return { courses }
})
