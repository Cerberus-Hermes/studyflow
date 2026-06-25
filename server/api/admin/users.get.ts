
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const users = await listAllUsers()
  return { users }
})
