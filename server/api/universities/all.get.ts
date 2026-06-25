
export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const universities = await listAllUniversities()
  return { universities }
})
