
export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const universityId = getRouterParam(event, 'id')
  if (!universityId) throw createError({ statusCode: 400, statusMessage: 'ID fehlt' })

  const university = await findUniversityById(universityId)
  if (!university) throw createError({ statusCode: 404, statusMessage: 'Hochschule nicht gefunden' })

  const courses = await listCoursesByUniversity(universityId)
  return { courses }
})
