export default defineEventHandler(async () => {
  const apiKey = process.env.KIMI_API_KEY
  const baseUrl = process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1'

  // Don't expose the full key, just check if it exists and looks valid
  const keyStatus = apiKey
    ? apiKey.startsWith('sk-')
      ? 'configured (looks valid)'
      : 'configured but may be invalid (should start with sk-)'
    : 'NOT configured'

  return {
    status: 'ok',
    kimi: {
      keyStatus,
      baseUrl,
      hint: apiKey ? null : 'Set KIMI_API_KEY environment variable',
    },
  }
})
