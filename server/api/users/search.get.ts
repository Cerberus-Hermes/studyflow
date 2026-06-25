import { searchUsers } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const query = getQuery(event)
  const q = String(query.q || '').trim()

  if (!q || q.length < 2) {
    return { users: [] }
  }

  const users = await searchUsers(q, 10)
  return { users }
})
