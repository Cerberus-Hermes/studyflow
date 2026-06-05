<template>
  <div class="animate-fade-in space-y-8">
    <!-- Header -->
    <div class="sf-card p-8 relative overflow-hidden" style="animation: slideInUp 0.5s ease forwards;">
      <div class="absolute top-0 right-0 w-64 h-64 opacity-10" style="background: radial-gradient(circle, var(--accent-cool), transparent);"></div>
      <div class="relative z-10">
        <h2 class="text-2xl font-bold mb-2" style="color: var(--text-primary);">📚 Meine Kurse</h2>
        <p class="text-sm" style="color: var(--text-muted);">Hier findest du alle deine zugeordneten Kurse und Lernmaterialien.</p>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8" style="color: var(--text-muted);">Lädt...</div>
    <div v-else-if="courses.length === 0" class="sf-card p-8 text-center">
      <div class="text-4xl mb-3">📚</div>
      <p class="text-sm" style="color: var(--text-muted);">Du bist noch keinem Kurs zugeordnet. Warte auf eine Einladung von deinem Lehrpersonal.</p>
    </div>
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div v-for="course in courses" :key="course.id" class="sf-card sf-dashboard-card p-5 group transition-all hover:scale-[1.01]">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <h4 class="text-lg font-bold truncate" style="color: var(--text-primary);">{{ course.name }}</h4>
            <p class="text-xs mt-1" style="color: var(--text-muted);">{{ course.description || 'Keine Beschreibung' }}</p>
            <p class="text-[10px] mt-1 font-medium" style="color: var(--accent-purple);">🏛️ {{ course.university_name }}</p>
          </div>
          <button @click="openCourse(course)" class="text-xs px-3 py-1.5 rounded-lg transition-all hover:scale-105 shrink-0" style="background: var(--accent-cool); color: white;">
            Öffnen
          </button>
        </div>
      </div>
    </div>

    <!-- Course Detail Modal -->
    <Teleport to="body">
      <div v-if="selectedCourse" class="fixed inset-0 z-[999] flex items-center justify-center p-4" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);" @click.self="selectedCourse = null">
        <div class="sf-card w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6" style="animation: slideInUp 0.3s ease;">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-xl font-bold" style="color: var(--text-primary);">{{ selectedCourse.name }}</h3>
              <p class="text-xs mt-1" style="color: var(--text-muted);">{{ selectedCourse.description }}</p>
            </div>
            <button @click="selectedCourse = null" class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: var(--bg-tertiary); color: var(--text-muted);">✕</button>
          </div>

          <!-- Tabs -->
          <div class="flex gap-1 p-1 rounded-xl mb-4" style="background: var(--bg-tertiary);">
            <button v-for="t in studentTabs" :key="t.id" @click="studentTab = t.id" class="px-4 py-2 rounded-lg text-xs font-semibold transition-all" :style="studentTab === t.id ? { background: 'var(--accent-cool)', color: '#fff' } : { color: 'var(--text-muted)' }">{{ t.label }}</button>
          </div>

          <!-- Files Tab -->
          <div v-if="studentTab === 'files'" class="space-y-3">
            <div v-if="courseFiles.length" class="space-y-2">
              <div v-for="file in courseFiles" :key="file.id" class="flex items-center justify-between p-3 rounded-xl" style="background: var(--bg-tertiary);">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-lg">📄</span>
                  <p class="text-sm font-medium truncate" style="color: var(--text-primary);">{{ file.name }}</p>
                </div>
                <span class="text-[10px] shrink-0" style="color: var(--text-muted);">{{ formatFileSize(file.size_bytes) }}</span>
              </div>
            </div>
            <p v-else class="text-xs text-center py-6" style="color: var(--text-muted);">Noch keine Dateien verfügbar</p>
          </div>

          <!-- Materials Tab -->
          <div v-if="studentTab === 'materials'" class="space-y-3">
            <div v-if="courseMaterials.length" class="space-y-2">
              <div v-for="m in courseMaterials" :key="m.id" class="p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.01]" style="background: var(--bg-tertiary);" @click="openMaterial(m)">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span>{{ materialEmoji(m.type) }}</span>
                    <p class="text-sm font-medium" style="color: var(--text-primary);">{{ m.title }}</p>
                  </div>
                  <span class="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold" style="background: var(--bg-primary); color: var(--text-muted);">{{ m.type }}</span>
                </div>
              </div>
            </div>
            <p v-else class="text-xs text-center py-6" style="color: var(--text-muted);">Noch keine Materialien verfügbar</p>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Material Player Modal -->
    <Teleport to="body">
      <div v-if="activeMaterial" class="fixed inset-0 z-[1000] flex items-center justify-center p-4" style="background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);" @click.self="activeMaterial = null">
        <div class="sf-card w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6" style="animation: slideInUp 0.3s ease;">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="text-xl">{{ materialEmoji(activeMaterial.type) }}</span>
              <h3 class="text-lg font-bold" style="color: var(--text-primary);">{{ activeMaterial.title }}</h3>
            </div>
            <button @click="activeMaterial = null" class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: var(--bg-tertiary); color: var(--text-muted);">✕</button>
          </div>

          <!-- Quiz -->
          <QuizGame v-if="activeMaterial.type === 'quiz'" :questions="parseQuiz(activeMaterial.content)" @reset="activeMaterial = null" />
          <!-- Flashcards -->
          <FlashcardGame v-else-if="activeMaterial.type === 'flashcards'" :cards="parseFlashcards(activeMaterial.content)" @reset="activeMaterial = null" />
          <!-- Summary / Study Guide / Practice Exam -->
          <div v-else class="p-4 rounded-xl text-sm leading-relaxed max-h-96 overflow-y-auto" style="background: var(--bg-primary); color: var(--text-secondary);" v-html="formatContent(activeMaterial.content)"></div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
const auth = useAuthStore()

const courses = ref([])
const loading = ref(true)
const selectedCourse = ref(null)
const studentTab = ref('materials')
const studentTabs = [
  { id: 'materials', label: '📚 Materialien' },
  { id: 'files', label: '📂 Dateien' },
]

const courseFiles = ref([])
const courseMaterials = ref([])
const activeMaterial = ref(null)

onMounted(async () => {
  await fetchCourses()
})

watch(selectedCourse, async (course) => {
  if (course) {
    await fetchCourseFiles(course.id)
    await fetchCourseMaterials(course.id)
  }
})

async function fetchCourses() {
  loading.value = true
  try {
    const data = await $fetch('/api/my/courses')
    courses.value = data.courses || []
  } catch {
    courses.value = []
  } finally {
    loading.value = false
  }
}

async function fetchCourseFiles(courseId) {
  try {
    const data = await $fetch(`/api/courses/${courseId}/files`)
    courseFiles.value = data.files || []
  } catch {
    courseFiles.value = []
  }
}

async function fetchCourseMaterials(courseId) {
  try {
    const data = await $fetch(`/api/courses/${courseId}/materials`)
    courseMaterials.value = data.materials || []
  } catch {
    courseMaterials.value = []
  }
}

function openCourse(course) {
  selectedCourse.value = course
  studentTab.value = 'materials'
}

function openMaterial(material) {
  activeMaterial.value = material
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function materialEmoji(type) {
  const map = { quiz: '❓', flashcards: '🃏', summary: '📄', practice_exam: '📝', study_guide: '📖' }
  return map[type] || '📄'
}

function formatContent(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
}

function parseQuiz(text) {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim())
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].question) return parsed
    } catch {}
  }
  const jsonMatch = text.match(/\[\s*\{[\s\S]*?\}\s*\]/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].question) return parsed
    } catch {}
  }
  return null
}

function parseFlashcards(text) {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim())
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].question && parsed[0].answer) return parsed
    } catch {}
  }
  const jsonMatch = text.match(/\[\s*\{[\s\S]*?\}\s*\]/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].question && parsed[0].answer) return parsed
    } catch {}
  }
  return null
}
</script>
