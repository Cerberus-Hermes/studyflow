import { requireAuth } from '~/server/utils/auth'
import { findUniversityById } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID fehlt' })

  const university = await findUniversityById(id)
  if (!university) throw createError({ statusCode: 404, statusMessage: 'Hochschule nicht gefunden' })

  return { university }
})
