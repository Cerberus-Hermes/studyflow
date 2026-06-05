<template>
  <div class="sf-card sf-dashboard-card p-6 group relative overflow-hidden" style="animation-delay: ${delay}s;">
    <div class="absolute top-0 left-0 right-0 h-1 sf-animated-gradient opacity-80"></div>

    <div class="relative z-10">
      <div class="flex items-center gap-4 mb-5">
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style="background: var(--bg-tertiary);">
          {{ icon }}
        </div>
        <div>
          <h3 class="text-lg font-bold" style="color: var(--text-primary);">{{ title }}</h3>
          <p class="text-xs" style="color: var(--text-muted);">{{ desc }}</p>
        </div>
      </div>

      <!-- Upload Zone -->
      <div
        v-if="!isUploading && !hasResult && !showTextInput"
        class="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:scale-[1.01]"
        style="border-color: isDragging ? 'var(--accent-warm)' : 'var(--border-medium)'; background: var(--bg-tertiary);"
        @dragenter.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @dragover.prevent
        @drop.prevent="handleDrop"
        @click="$refs.fileInput.click()"
      >
        <div class="text-4xl mb-3 animate-float">📂</div>
        <p class="text-sm font-semibold mb-1" style="color: var(--text-secondary);">
          {{ isDragging ? 'Loslassen zum Hochladen!' : 'Datei hierhin ziehen' }}
        </p>
        <p class="text-xs" style="color: var(--text-muted);">PDF, Bilder (PNG, JPG, WEBP) oder Text (.txt, .md) — max. 20 MB</p>
        <input
          ref="fileInput"
          type="file"
          accept=".txt,.md,.pdf,.png,.jpg,.jpeg,.webp,.gif,application/pdf,image/*,text/plain,text/markdown"
          class="hidden"
          @change="handleFileSelect"
        />
      </div>

      <!-- Unsupported File Warning -->
      <div v-if="showUnsupportedWarning" class="rounded-2xl p-6 text-center" style="background: rgba(224, 122, 95, 0.1); border: 1px solid rgba(224, 122, 95, 0.3);">
        <div class="text-3xl mb-2">⚠️</div>
        <p class="text-sm font-semibold mb-1" style="color: var(--accent-warm);">{{ unsupportedFileName }} wird nicht unterstützt</p>
        <p class="text-xs mb-3" style="color: var(--text-muted);">Erlaubt: PDF, PNG, JPG, WEBP, GIF, TXT, MD</p>
        <div class="flex gap-2 justify-center">
          <button @click="showUnsupportedWarning = false" class="sf-btn sf-btn-secondary text-xs">Zurück</button>
          <button @click="showTextInput = true; showUnsupportedWarning = false" class="sf-btn sf-btn-primary text-xs">💬 Text manuell eingeben</button>
        </div>
      </div>

      <!-- Text Input -->
      <div v-if="showTextInput && !hasResult" class="rounded-2xl p-4 space-y-3" style="background: var(--bg-tertiary);">
        <p class="text-sm" style="color: var(--text-muted);">Füge deinen Lernstoff als Text ein:</p>
        <textarea v-model="manualText" rows="6" class="sf-input w-full text-sm font-mono" placeholder="Hier Text einfügen..."></textarea>
        <div class="flex gap-2">
          <button @click="showTextInput = false" class="sf-btn sf-btn-secondary flex-1 text-xs">Zurück</button>
          <button @click="processManualText" class="sf-btn sf-btn-primary flex-1 text-xs">💬 An Kimi senden</button>
        </div>
      </div>

      <!-- Uploading -->
      <div v-if="isUploading" class="rounded-2xl p-8 text-center" style="background: var(--bg-tertiary);">
        <div class="text-4xl mb-3">🧠</div>
        <p class="text-sm font-semibold mb-3" style="color: var(--text-secondary);">
          {{ uploadStep === 'upload' ? 'Wird hochgeladen...' : uploadStep === 'process' ? 'KI analysiert...' : 'Ergebnis wird erstellt...' }}
        </p>
        <div class="w-full h-2 rounded-full overflow-hidden" style="background: var(--border-subtle);">
          <div class="h-full rounded-full transition-all duration-300 sf-animated-gradient" :style="{ width: progress + '%' }"></div>
        </div>
        <p class="text-xs mt-2" style="color: var(--text-muted);">{{ progress }}%</p>
      </div>

      <!-- Result -->
      <div v-if="hasResult" class="rounded-2xl p-5 space-y-3" style="background: var(--bg-tertiary); border: 1px solid var(--border-medium);">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">✅</span>
            <span class="text-sm font-semibold" style="color: var(--accent-cool);">Fertig!</span>
          </div>
          <button @click="reset" class="text-xs px-3 py-1.5 rounded-lg transition-all hover:scale-105" style="background: var(--border-subtle); color: var(--text-muted);">
            Neue Anfrage
          </button>
        </div>

        <!-- Interactive Quiz Game -->
        <QuizGame v-if="quizData && quizData.length > 0" :questions="quizData" @reset="reset" />

        <!-- Fallback: raw AI output for non-quiz or failed parse -->
        <template v-else>
          <div class="p-3 rounded-xl text-sm leading-relaxed max-h-80 overflow-y-auto" style="background: var(--bg-primary); color: var(--text-secondary);">
            <div v-html="resultContent"></div>
          </div>

          <div class="flex gap-2">
            <button @click="copyResult" class="sf-btn sf-btn-secondary flex-1 text-xs py-2.5">
              📋 Kopieren
            </button>
            <button @click="exportPDF" class="sf-btn sf-btn-secondary flex-1 text-xs py-2.5">
              📄 PDF
            </button>
            <button @click="exportWord" class="sf-btn sf-btn-primary flex-1 text-xs py-2.5">
              📝 Word
            </button>
          </div>
        </template>
      </div>

      <!-- Demo Box -->
      <div class="mt-4 p-4 rounded-xl text-xs leading-relaxed" style="background: var(--bg-tertiary); color: var(--text-muted);">
        <span class="font-semibold" style="color: var(--text-secondary);">Beispiel:</span><br>
        <span v-html="demo"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  icon: String,
  title: String,
  desc: String,
  demo: String,
  resultTemplate: String,
  delay: { type: Number, default: 0 },
})

const MAX_FILE_BYTES = 20 * 1024 * 1024

const isDragging = ref(false)
const isUploading = ref(false)
const hasResult = ref(false)
const uploadStep = ref('upload')
const progress = ref(0)
const resultContent = ref('')
const quizData = ref(null)
const manualText = ref('')
const showTextInput = ref(false)
const showUnsupportedWarning = ref(false)
const unsupportedFileName = ref('')

let progressInterval = null

const TEXT_EXT = /\.(txt|md)$/i
const MEDIA_EXT = /\.(pdf|png|jpe?g|webp|gif)$/i

function getFileKind(file) {
  const name = file.name.toLowerCase()
  if (file.type === 'text/plain' || file.type === 'text/markdown' || TEXT_EXT.test(name)) return 'text'
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) return 'binary'
  if (file.type.startsWith('image/') || MEDIA_EXT.test(name)) return 'binary'
  return 'unsupported'
}

const handleDrop = (e) => {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) processFile(files[0])
}

const handleFileSelect = (e) => {
  const files = e.target.files
  if (files.length > 0) processFile(files[0])
  e.target.value = ''
}

const processFile = async (file) => {
  const kind = getFileKind(file)

  if (kind === 'unsupported') {
    unsupportedFileName.value = file.name
    showUnsupportedWarning.value = true
    return
  }

  if (file.size > MAX_FILE_BYTES) {
    unsupportedFileName.value = `${file.name} (zu groß, max. 20 MB)`
    showUnsupportedWarning.value = true
    return
  }

  if (kind === 'text') {
    const text = await file.text()
    startProcessing({ mode: 'text', content: text, label: file.name.replace(/\.[^/.]+$/, '') })
  } else {
    startProcessing({ mode: 'file', file, label: file.name })
  }
}

const processManualText = () => {
  if (!manualText.value.trim()) return
  startProcessing({ mode: 'text', content: manualText.value, label: 'Manuelle Eingabe' })
}

const startProcessing = async ({ mode, content, file, label }) => {
  showTextInput.value = false
  showUnsupportedWarning.value = false
  isUploading.value = true
  progress.value = 0
  uploadStep.value = 'upload'

  progressInterval = setInterval(() => {
    progress.value += Math.random() * 12 + 3
    if (progress.value >= 30) uploadStep.value = 'process'
    if (progress.value >= 70) uploadStep.value = 'generate'
    if (progress.value >= 95) {
      progress.value = 95
      clearInterval(progressInterval)
    }
  }, 200)

  try {
    let response

    if (mode === 'file') {
      const formData = new FormData()
      formData.append('file', file, file.name)
      formData.append('type', props.resultTemplate)
      response = await fetch('/api/ai', { method: 'POST', body: formData })
    } else {
      response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.substring(0, 8000),
          type: props.resultTemplate,
        }),
      })
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.statusMessage || `Server Error ${response.status}`)
    }

    const data = await response.json()
    clearInterval(progressInterval)
    progress.value = 100

    setTimeout(() => {
      isUploading.value = false
      hasResult.value = true
      if (props.resultTemplate === 'quiz') {
        quizData.value = parseQuiz(data.result)
      }
      resultContent.value = formatAIResponse(data.result)
    }, 500)
  } catch (err) {
    clearInterval(progressInterval)
    progress.value = 100
    setTimeout(() => {
      isUploading.value = false
      hasResult.value = true
      quizData.value = null
      resultContent.value = `<strong style="color: var(--accent-rose);">⚠️ Fehler:</strong><br>${err.message}`
    }, 500)
  }
}

const formatAIResponse = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
}

const parseQuiz = (text) => {
  // Try to extract JSON from response (handles markdown code blocks too)
  const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].question && Array.isArray(parsed[0].options) && typeof parsed[0].correct === 'number') {
        return parsed.map(q => ({
          question: q.question,
          options: q.options.slice(0, 4),
          correct: Math.max(0, Math.min(3, q.correct)),
        }))
      }
    } catch {
      // fallback to text parsing
    }
  }

  // Fallback text parser for non-JSON responses
  const questions = []
  const blocks = text.split(/(?:Frage\s*\d+[:.)]?|\n\d+[:.)]\s)/i).filter(Boolean)
  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length < 2) continue
    const qLine = lines[0].replace(/^\d+[:.)]?\s*/, '')
    const opts = []
    let correctIdx = -1
    for (const line of lines.slice(1)) {
      const optMatch = line.match(/^([A-Da-d])[).:]\s*(.+)/)
      if (optMatch) {
        opts.push(optMatch[2])
        if (line.includes('***') || line.includes('**') || line.toLowerCase().includes('(richtig)')) {
          correctIdx = opts.length - 1
        }
      }
    }
    if (opts.length >= 2 && correctIdx >= 0) {
      questions.push({ question: qLine, options: opts.slice(0, 4), correct: correctIdx })
    }
  }

  return questions.length > 0 ? questions : null
}

const reset = () => {
  hasResult.value = false
  isUploading.value = false
  progress.value = 0
  manualText.value = ''
  showTextInput.value = false
  showUnsupportedWarning.value = false
  unsupportedFileName.value = ''
  quizData.value = null
}

const copyResult = () => {
  const text = resultContent.value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  navigator.clipboard?.writeText(text)
  alert('In die Zwischenablage kopiert! ✅')
}

const exportPDF = () => {
  const win = window.open('', '_blank')
  if (!win) return
  const plainText = resultContent.value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${props.title} – Ergebnis</title>
      <style>
        @page { size: A4; margin: 2cm; }
        body { font-family: 'Inter', system-ui, sans-serif; color: #1a1a2e; line-height: 1.7; max-width: 700px; margin: 0 auto; padding: 40px; }
        h1 { font-size: 24px; margin-bottom: 8px; color: #e07a5f; }
        .meta { color: #8a8aa3; font-size: 12px; margin-bottom: 24px; }
        .content { white-space: pre-wrap; font-size: 14px; }
        strong { color: #1a1a2e; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <button class="no-print" onclick="window.print()" style="position:fixed;top:20px;right:20px;padding:10px 20px;background:#e07a5f;color:#fff;border:none;border-radius:10px;cursor:pointer;font-weight:600;box-shadow:0 4px 16px rgba(224,122,95,0.3);">🖨 Als PDF speichern</button>
      <h1>${props.title}</h1>
      <div class="meta">Erstellt am ${new Date().toLocaleDateString('de-DE')} mit StudyFlow KI</div>
      <div class="content">${resultContent.value}</div>
    </body>
    </html>
  `
  win.document.write(html)
  win.document.close()
}

const exportWord = () => {
  const plainText = resultContent.value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"><title>${props.title}</title></head>
    <body>
      <h1 style="color:#e07a5f;font-family:Arial,sans-serif;">${props.title}</h1>
      <p style="color:#8a8aa3;font-size:12px;font-family:Arial,sans-serif;">Erstellt am ${new Date().toLocaleDateString('de-DE')} mit StudyFlow KI</p>
      <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
      <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#1a1a2e;">${resultContent.value}</div>
    </body>
    </html>
  `
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.title.replace(/\s+/g, '_')}_Ergebnis.doc`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
