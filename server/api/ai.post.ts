import {
  MAX_UPLOAD_BYTES,
  buildMessages,
  callKimiChat,
  extractPdfText,
  getKimiConfigs,
} from '../utils/kimi'
import { requireAuth } from '../utils/auth'
import { findUserById, hasAICredits, incrementAICredits } from '../utils/db'

const IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i
const PDF_MIME = 'application/pdf'

function mimeFromFilename(name: string): string {
  const lower = name.toLowerCase()
  if (lower.endsWith('.pdf')) return PDF_MIME
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.gif')) return 'image/gif'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  return 'application/octet-stream'
}

function isImage(mime: string, filename: string) {
  return IMAGE_MIMES.has(mime) || IMAGE_EXT.test(filename)
}

function isPdf(mime: string, filename: string) {
  return mime === PDF_MIME || filename.toLowerCase().endsWith('.pdf')
}

export default defineEventHandler(async (event) => {
  // 1. Auth required
  const session = await requireAuth(event)

  // 2. Load user & check credits
  const user = await findUserById(session.userId)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Benutzer nicht gefunden' })
  }
  if (!hasAICredits(user)) {
    throw createError({ statusCode: 403, statusMessage: 'KI-Credits aufgebraucht. Bitte Abo upgraden.' })
  }

  const apiKey = process.env.KIMI_API_KEY
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'KIMI_API_KEY not configured on server' })
  }

  const contentType = getHeader(event, 'content-type') || ''
  let taskType = 'summary'

  if (contentType.includes('multipart/form-data')) {
    const parts = await readMultipartFormData(event)
    if (!parts?.length) {
      throw createError({ statusCode: 400, statusMessage: 'Keine Datei empfangen' })
    }

    const filePart = parts.find(p => p.name === 'file')
    const typePart = parts.find(p => p.name === 'type')
    taskType = typePart?.data?.toString() || 'summary'

    if (!filePart?.data?.length) {
      throw createError({ statusCode: 400, statusMessage: 'Keine Datei empfangen' })
    }

    if (filePart.data.length > MAX_UPLOAD_BYTES) {
      throw createError({ statusCode: 400, statusMessage: 'Datei zu groß (max. 20 MB)' })
    }

    const filename = filePart.filename || 'upload'
    const mime = filePart.type || mimeFromFilename(filename)
    const configs = getKimiConfigs()

    let messages

    if (isPdf(mime, filename)) {
      const pdfText = await extractPdfText(configs, apiKey, filePart.data, filename)
      messages = buildMessages(taskType, { pdfContent: pdfText, fileName: filename })
    } else if (isImage(mime, filename)) {
      const imageMime = IMAGE_MIMES.has(mime) ? mime : mimeFromFilename(filename)
      if (!IMAGE_MIMES.has(imageMime)) {
        throw createError({ statusCode: 400, statusMessage: 'Unbekanntes Bildformat' })
      }
      messages = buildMessages(taskType, {
        imageBase64: filePart.data.toString('base64'),
        imageMime,
        fileName: filename,
      })
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: 'Format nicht unterstützt. Erlaubt: PDF, PNG, JPG, WEBP, GIF',
      })
    }

    // Consume credit before calling AI
    await incrementAICredits(session.userId)

    const { result, provider } = await callKimiChat(configs, messages, apiKey)
    return { success: true, result, provider }
  }

  const body = await readBody(event)
  const { content, type } = body
  taskType = type || 'summary'

  if (!content?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Content required' })
  }

  // Consume credit before calling AI
  await incrementAICredits(session.userId)

  const messages = buildMessages(taskType, { textContent: content })
  const { result, provider } = await callKimiChat(getKimiConfigs(), messages, apiKey)
  return { success: true, result, provider }
})
