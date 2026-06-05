import { requireAdmin } from '~/server/utils/auth'
import { createUniversity, findUniversityBySlug } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event)
  const body = await readBody(event)

  const name = String(body.name || '').trim()
  const description = String(body.description || '').trim()

  if (!name || name.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Name ist erforderlich (min. 2 Zeichen)' })
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültiger Name für Slug' })
  }

  const existing = await findUniversityBySlug(slug)
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Eine Hochschule mit diesem Namen existiert bereits' })
  }

  const university = await createUniversity(name, slug, description, session.userId)
  return { success: true, university }
})
