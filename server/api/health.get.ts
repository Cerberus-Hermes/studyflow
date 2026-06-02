export default defineEventHandler(async () => {
  const apiKey = process.env.KIMI_API_KEY
  const baseUrl = process.env.KIMI_BASE_URL

  // Don't expose the full key, just check if it exists and looks valid
  const keyStatus = apiKey
    ? apiKey.startsWith('sk-')
      ? 'configured (looks valid)'
      : 'configured but invalid format (should start with sk-)'
    : 'NOT configured'

  // Quick test of the API key
  let apiTest = { success: false, provider: '', error: '' }

  if (apiKey && apiKey.startsWith('sk-')) {
    const configs = []
    if (baseUrl) {
      configs.push({ baseUrl, model: 'kimi-k2-6', name: 'Custom' })
    } else {
      configs.push({ baseUrl: 'https://api.moonshot.cn/v1', model: 'kimi-k2-6', name: 'Moonshot' })
      configs.push({ baseUrl: 'https://openrouter.ai/api/v1', model: 'moonshot/kimi-k2-6', name: 'OpenRouter' })
    }

    for (const config of configs) {
      try {
        const response = await fetch(`${config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            ...(config.name === 'OpenRouter' ? { 'HTTP-Referer': 'https://studyflow.app' } : {}),
          },
          body: JSON.stringify({
            model: config.model,
            messages: [{ role: 'user', content: 'Hi' }],
            max_tokens: 5,
          }),
        })

        if (response.ok) {
          apiTest = { success: true, provider: config.name, error: '' }
          break
        } else {
          const errText = await response.text()
          apiTest.error = `${config.name}: ${response.status} - ${errText.substring(0, 100)}`
        }
      } catch (err: any) {
        apiTest.error = `${config.name}: ${err.message}`
      }
    }
  }

  return {
    status: 'ok',
    kimi: {
      keyStatus,
      baseUrl: baseUrl || 'default (Moonshot + OpenRouter fallback)',
      apiTest,
    },
  }
})
