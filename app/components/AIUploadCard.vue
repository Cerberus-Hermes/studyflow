<template>
  <div class="sf-card p-6 group relative overflow-hidden" :style="`animation: slideInUp 0.5s ease forwards; animation-delay: ${delay}s; opacity: 0;`">
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
        <p class="text-xs" style="color: var(--text-muted);">PDF, TXT, Bilder — oder klicken zum Auswählen</p>
        <input ref="fileInput" type="file" accept=".pdf,.txt,.md,.docx,image/*" class="hidden" @change="handleFileSelect" />
      </div>

      <!-- Text Input Fallback -->
      <div v-if="showTextInput && !hasResult" class="rounded-2xl p-4 space-y-3" style="background: var(--bg-tertiary);">
        <p class="text-sm" style="color: var(--text-muted);">Füge deinen Lernstoff als Text ein (oder lade eine .txt Datei hoch):</p>
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

        <div class="p-3 rounded-xl text-sm leading-relaxed max-h-80 overflow-y-auto" style="background: var(--bg-primary); color: var(--text-secondary);">
          <div v-html="resultContent"></div>
        </div>

        <div class="flex gap-2">
          <button @click="copyResult" class="sf-btn sf-btn-secondary flex-1 text-xs py-2.5">
            📋 Kopieren
          </button>
          <button @click="downloadResult" class="sf-btn sf-btn-primary flex-1 text-xs py-2.5">
            💾 Speichern
          </button>
        </div>
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
  apiKey: { type: String, default: '' },
})

const isDragging = ref(false)
const isUploading = ref(false)
const hasResult = ref(false)
const uploadStep = ref('upload')
const progress = ref(0)
const resultContent = ref('')
const fileName = ref('')
const manualText = ref('')
const showTextInput = ref(false)

let progressInterval = null

const systemPrompts = {
  summary: 'Du bist ein Lernassistent. Fasse den folgenden Lernstoff zusammen. Strukturiere die Ausgabe mit: 1) Kernaussagen (3-5 Bullet Points), 2) Wichtige Definitionen, 3) Prüfungsrelevante Themen. Antworte auf Deutsch.',
  flashcards: 'Du bist ein Lernassistent. Erstelle aus dem folgenden Lernstoff 5 Lernkarten im Format Frage/Antwort. Gib sie als nummerierte Liste aus. Antworte auf Deutsch.',
  tasks: 'Du bist ein Lernassistent. Erstelle aus dem folgenden Lernstoff 3 Übungsaufgaben (eine leicht, eine mittel, eine schwer). Gib für jede Aufgabe eine mögliche Lösung. Antworte auf Deutsch.',
  quiz: 'Du bist ein Lernassistent. Erstelle aus dem folgenden Lernstoff ein Multiple-Choice-Quiz mit 5 Fragen. Jede Frage hat 4 Antwortmöglichkeiten, markiere die richtige. Antworte auf Deutsch.',
}

const handleDrop = (e) => {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) processFile(files[0])
}

const handleFileSelect = (e) => {
  const files = e.target.files
  if (files.length > 0) processFile(files[0])
}

const processFile = async (file) => {
  fileName.value = file.name
  const cleanName = file.name.replace(/\.[^/.]+$/, '')

  // Try to read text files
  if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
    const text = await file.text()
    startProcessing(text, cleanName)
  } else {
    // For other files, show text input fallback
    showTextInput.value = true
  }
}

const processManualText = () => {
  if (!manualText.value.trim()) return
  startProcessing(manualText.value, 'Manuelle Eingabe')
}

const startProcessing = async (content, name) => {
  showTextInput.value = false
  isUploading.value = true
  progress.value = 0
  uploadStep.value = 'upload'

  // Simulate progress for UX
  progressInterval = setInterval(() => {
    progress.value += Math.random() * 12 + 3
    if (progress.value >= 30) uploadStep.value = 'process'
    if (progress.value >= 70) uploadStep.value = 'generate'
    if (progress.value >= 95) {
      progress.value = 95
      clearInterval(progressInterval)
    }
  }, 200)

  if (props.apiKey) {
    // Real API call
    try {
      const baseUrl = localStorage.getItem('sf_kimi_base') || 'https://api.moonshot.cn/v1'
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${props.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'kimi-k2-6',
          messages: [
            { role: 'system', content: systemPrompts[props.resultTemplate] || systemPrompts.summary },
            { role: 'user', content: `Lernstoff aus "${name}":\n\n${content.substring(0, 8000)}` },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      const aiText = data.choices?.[0]?.message?.content || 'Keine Antwort erhalten.'

      clearInterval(progressInterval)
      progress.value = 100

      setTimeout(() => {
        isUploading.value = false
        hasResult.value = true
        resultContent.value = formatAIResponse(aiText)
      }, 500)

    } catch (err) {
      clearInterval(progressInterval)
      progress.value = 100
      setTimeout(() => {
        isUploading.value = false
        hasResult.value = true
        resultContent.value = `<strong style="color: var(--accent-rose);">⚠️ Fehler bei der API-Anfrage:</strong><br>${err.message}<br><br><em>Bitte prüfe deinen API Key in den Einstellungen.</em>`
      }, 500)
    }
  } else {
    // Simulated fallback
    setTimeout(() => {
      clearInterval(progressInterval)
      progress.value = 100
      setTimeout(() => {
        isUploading.value = false
        hasResult.value = true
        generateSimulatedResult(name)
      }, 400)
    }, 2500)
  }
}

const formatAIResponse = (text) => {
  // Convert markdown-like formatting to HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/^\d+\.\s+(.*)$/gm, '<div class="mb-2"><span style="color: var(--accent-warm);">●</span> $1</div>')
}

const generateSimulatedResult = (name) => {
  const templates = {
    summary: `<strong>📄 Zusammenfassung von "${name}"</strong><br><br><strong>Kernaussagen:</strong><br>• Die wichtigsten Konzepte aus ${name} werden systematisch erklärt<br>• Definitionen und Grundlagen stehen im Vordergrund<br>• Prüfungsrelevante Inhalte sind herausgearbeitet<br><br><strong>Definitionen:</strong><br>• Kernbegriffe werden präzise definiert<br>• Unterscheidungen zu verwandten Konzepten werden klar gemacht<br><br><em>Hinweis: Für echte KI-Antworten trage deinen Kimi API Key in den Einstellungen ein.</em>`,
    flashcards: `<strong>🃏 Karteikarten aus "${name}"</strong><br><br><div class="space-y-2"><div class="p-2 rounded-lg" style="background: var(--bg-secondary); border: 1px solid var(--border-subtle);"><strong style="color: var(--accent-warm);">Frage 1:</strong><br>Was beschreibt der Hauptbegriff aus ${name}?<br><strong style="color: var(--accent-cool);" class="block mt-1">Antwort:</strong> Die zentrale Theorie und ihre Anwendung.</div><div class="p-2 rounded-lg" style="background: var(--bg-secondary); border: 1px solid var(--border-subtle);"><strong style="color: var(--accent-warm);">Frage 2:</strong><br>Welche Methoden werden vorgestellt?<br><strong style="color: var(--accent-cool);" class="block mt-1">Antwort:</strong> Klassische und moderne Ansätze im Vergleich.</div></div><br><em>Hinweis: Für echte KI-Antworten trage deinen Kimi API Key in den Einstellungen ein.</em>`,
    tasks: `<strong>📝 Übungsaufgaben zu "${name}"</strong><br><br><strong>Aufgabe 1 (Leicht):</strong><br>Erkläre die zentralen Begriffe aus ${name} in eigenen Worten.<br><br><strong>Aufgabe 2 (Mittel):</strong><br>Wende die vorgestellte Methodik auf ein konkretes Beispiel an.<br><br><strong>Aufgabe 3 (Schwer):</strong><br>Vergleiche die Ansätze aus ${name} mit alternativen Methoden.<br><br><em>Hinweis: Für echte KI-Antworten trage deinen Kimi API Key in den Einstellungen ein.</em>`,
    quiz: `<strong>❓ Quiz aus "${name}"</strong><br><br><div class="p-2 rounded-lg" style="background: var(--bg-secondary); border: 1px solid var(--border-subtle);"><strong>Frage 1:</strong><br>Welche Aussage trifft auf ${name} zu?<br><br>⭕ Es beschreibt die Theorie korrekt<br>⚫ Es ist irrelevant für die Praxis<br>⚫ Es widerspricht bekannten Fakten<br>⚫ Es ist nur für Experten relevant</div><br><em>Hinweis: Für echte KI-Antworten trage deinen Kimi API Key in den Einstellungen ein.</em>`,
  }
  resultContent.value = templates[props.resultTemplate] || templates.summary
}

const reset = () => {
  hasResult.value = false
  isUploading.value = false
  progress.value = 0
  fileName.value = ''
  manualText.value = ''
  showTextInput.value = false
}

const copyResult = () => {
  const text = resultContent.value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  navigator.clipboard?.writeText(text)
  alert('In die Zwischenablage kopiert! ✅')
}

const downloadResult = () => {
  const text = resultContent.value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.title.replace(/\s+/g, '_')}_Ergebnis.txt`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
