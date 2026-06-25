
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  // 1. Get my accepted universities
  const { data: memberData, error: memberError } = await supabase!
    .from('university_members')
    .select('university_id')
    .eq('user_id', session.userId)
    .eq('status', 'accepted')

  if (memberError) throw new Error(memberError.message)
  const uniIds = (memberData || []).map((m: any) => m.university_id)

  if (uniIds.length === 0) return { courses: [] }

  // 2. Get all courses from those universities
  const { data: coursesData, error: coursesError } = await supabase!
    .from('courses')
    .select('*, universities:university_id (name)')
    .in('university_id', uniIds)

  if (coursesError) throw new Error(coursesError.message)

  // 3. Get my enrollments
  const { data: enrollData, error: enrollError } = await supabase!
    .from('course_enrollments')
    .select('course_id')
    .eq('user_id', session.userId)

  if (enrollError) throw new Error(enrollError.message)
  const enrolledCourseIds = new Set((enrollData || []).map((e: any) => e.course_id))

  // 4. Get my pending requests
  const { data: reqData, error: reqError } = await supabase!
    .from('course_requests')
    .select('course_id')
    .eq('user_id', session.userId)
    .eq('status', 'pending')

  if (reqError) throw new Error(reqError.message)
  const requestedCourseIds = new Set((reqData || []).map((r: any) => r.course_id))

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
