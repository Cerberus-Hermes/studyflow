import { requireAuth } from '~/server/utils/auth'
import { findUniversityById, listUniversityMembers } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const universityId = getRouterParam(event, 'id')
  if (!universityId) throw createError({ statusCode: 400, statusMessage: 'ID fehlt' })

  const university = await findUniversityById(universityId)
  if (!university) throw createError({ statusCode: 404, statusMessage: 'Hochschule nicht gefunden' })

  if (session.role !== 'admin' && university.createdBy !== session.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Keine Berechtigung' })
  }

  const members = await listUniversityMembers(universityId)
  return { members }
})
