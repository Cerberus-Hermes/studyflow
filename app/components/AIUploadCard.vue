<template>
  <div class="sf-card p-6 group relative overflow-hidden" style="animation: slideInUp 0.5s ease forwards; animation-delay: {{ delay }}s; opacity: 0;">
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
        v-if="!isUploading && !hasResult"
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
        <p class="text-xs" style="color: var(--text-muted);">oder klicken zum Auswählen</p>
        <input ref="fileInput" type="file" accept=".pdf,.txt,.md,.docx,image/*" class="hidden" @change="handleFileSelect" />
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
            Neue Datei
          </button>
        </div>

        <div class="p-3 rounded-xl text-sm leading-relaxed" style="background: var(--bg-primary); color: var(--text-secondary);">
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
})

const isDragging = ref(false)
const isUploading = ref(false)
const hasResult = ref(false)
const uploadStep = ref('upload')
const progress = ref(0)
const resultContent = ref('')
const fileName = ref('')

let progressInterval = null

const handleDrop = (e) => {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) processFile(files[0])
}

const handleFileSelect = (e) => {
  const files = e.target.files
  if (files.length > 0) processFile(files[0])
}

const processFile = (file) => {
  fileName.value = file.name
  isUploading.value = true
  progress.value = 0
  uploadStep.value = 'upload'

  progressInterval = setInterval(() => {
    progress.value += Math.random() * 15 + 5
    if (progress.value >= 35) {
      uploadStep.value = 'process'
    }
    if (progress.value >= 70) {
      uploadStep.value = 'generate'
    }
    if (progress.value >= 100) {
      progress.value = 100
      clearInterval(progressInterval)
      setTimeout(() => {
        isUploading.value = false
        hasResult.value = true
        generateResult(file.name)
      }, 400)
    }
  }, 250)
}

const generateResult = (name) => {
  const cleanName = name.replace(/\.[^/.]+$/, '')
  const templates = {
    summary: `
        <strong>📄 Zusammenfassung von "${cleanName}"</strong><br><br>
        <strong>Kernaussagen:</strong><br>
        • ${cleanName} behandelt die wichtigsten Grundlagen des Themas<br>
        • Definitionen und Konzepte werden systematisch erklärt<br>
        • Prüfungsrelevante Inhalte sind markiert<br><br>
        <strong>Top 3 Themen:</strong><br>
        1. Einführung und Grundbegriffe<br>
        2. Methodik und Anwendung<br>
        3. Zusammenfassung und Ausblick
      `,
    flashcards: `
        <strong>🃏 Karteikarten aus "${cleanName}"</strong><br><br>
        <div class="space-y-2">
          <div class="p-2 rounded-lg" style="background: var(--bg-secondary); border: 1px solid var(--border-subtle);">
            <strong class="text-xs" style="color: var(--accent-warm);">Frage:</strong><br>
            Was ist die zentrale Definition in ${cleanName}?<br>
            <strong class="text-xs mt-1 block" style="color: var(--accent-cool);">Antwort:</strong>
            Der Kernbegriff beschreibt die fundamentale Theorie des Themas.
          </div>
          <div class="p-2 rounded-lg" style="background: var(--bg-secondary); border: 1px solid var(--border-subtle);">
            <strong class="text-xs" style="color: var(--accent-warm);">Frage:</strong><br>
            Welche Methoden werden vorgestellt?<br>
            <strong class="text-xs mt-1 block" style="color: var(--accent-cool);">Antwort:</strong>
            Klassische und moderne Ansätze werden verglichen.
          </div>
        </div>
      `,
    tasks: `
        <strong>📝 Übungsaufgaben zu "${cleanName}"</strong><br><br>
        <strong>Aufgabe 1 (Leicht):</strong><br>
        Erkläre die zentralen Begriffe aus ${cleanName} in eigenen Worten.<br><br>
        <strong>Aufgabe 2 (Mittel):</strong><br>
        Wende die vorgestellte Methodik auf ein konkretes Beispiel an.<br><br>
        <strong>Aufgabe 3 (Schwer):</strong><br>
        Vergleiche die Ansätze aus ${cleanName} mit alternativen Methoden.
      `,
    quiz: `
        <strong>❓ Quiz aus "${cleanName}"</strong><br><br>
        <div class="space-y-2">
          <div class="p-2 rounded-lg" style="background: var(--bg-secondary); border: 1px solid var(--border-subtle);">
            <strong class="text-xs">Frage 1:</strong><br>
            Welche Aussage trifft auf ${cleanName} zu?<br><br>
            <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="q1" class="accent-primary-600" /> ⭕ Es beschreibt die Theorie korrekt</label><br>
            <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="q1" class="accent-primary-600" /> ⭕ Es ist irrelevant für die Praxis</label><br>
            <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="q1" class="accent-primary-600" /> ⭕ Es widerspricht bekannten Fakten</label>
          </div>
        </div>
      `
  }
  resultContent.value = templates[props.resultTemplate] || templates.summary
}

const reset = () => {
  hasResult.value = false
  isUploading.value = false
  progress.value = 0
  fileName.value = ''
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
