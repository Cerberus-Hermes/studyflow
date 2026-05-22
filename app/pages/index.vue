<template>
  <div>
    <!-- ========================= -->
    <!-- ORGANISATION TAB -->
    <!-- ========================= -->
    <div v-if="activeTab === 'orga'" class="animate-fade-in space-y-6">
      <!-- Dashboard -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button @click="openCompletedModal" class="card group text-left hover:border-primary-300 dark:hover:border-primary-700">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl">📋</div>
            <div>
              <p class="text-3xl font-bold text-primary-600 dark:text-primary-400">{{ store.activeTasks.length }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Aufgaben offen</p>
            </div>
          </div>
        </button>
        <button @click="openCompletedModal" class="card group text-left hover:border-primary-300 dark:hover:border-primary-700">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl">🎯</div>
            <div>
              <p class="text-3xl font-bold text-green-600 dark:text-green-400">{{ store.activeGoals.length }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Ziele offen</p>
            </div>
          </div>
        </button>
        <button @click="openCompletedModal" class="card group text-left hover:border-primary-300 dark:hover:border-primary-700">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-2xl">⏰</div>
            <div>
              <p class="text-3xl font-bold text-red-600 dark:text-red-400">{{ store.activeDeadlines.length }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Deadlines</p>
            </div>
          </div>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- To-Do -->
        <div class="card animate-slide-up">
          <h2 class="text-xl font-bold text-primary-700 dark:text-primary-400 mb-4 flex items-center gap-2">📝 Aufgaben</h2>
          <div class="space-y-3">
            <input v-model="taskInput" @keyup.enter="handleAddTask" placeholder="Neue Aufgabe..." class="input-field" />
            <select v-model="taskPriority" class="input-field">
              <option value="1">🔴 Hohe Prioritaet</option>
              <option value="2">🟠 Mittlere Prioritaet</option>
              <option value="3">🟢 Niedrige Prioritaet</option>
            </select>
            <button @click="handleAddTask" class="btn-primary w-full">Hinzufuegen</button>
          </div>
          <ul class="mt-4 space-y-2 max-h-80 overflow-y-auto">
            <li v-for="task in store.activeTasks" :key="task.id"
                class="flex items-center justify-between gap-3 p-3 rounded-xl border-l-4 bg-gray-50 dark:bg-gray-800/50"
                :class="priorityBorder(task.priority)">
              <div class="flex items-center gap-2 min-w-0">
                <span :class="priorityBadge(task.priority)" class="badge text-white shrink-0">{{ priorityLabel(task.priority) }}</span>
                <span class="truncate text-sm">{{ task.text }}</span>
              </div>
              <button @click="store.completeTask(task.id)" class="shrink-0 px-3 py-1.5 text-xs font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all">✓</button>
            </li>
            <li v-if="store.activeTasks.length === 0" class="text-center text-gray-400 py-4 text-sm">Keine offenen Aufgaben 🎉</li>
          </ul>
        </div>

        <!-- Ziele -->
        <div class="card animate-slide-up" style="animation-delay: 0.1s">
          <h2 class="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">🎯 Ziele</h2>
          <div class="space-y-3">
            <input v-model="goalInput" @keyup.enter="handleAddGoal" placeholder="Neues Ziel..." class="input-field" />
            <input v-model="goalDate" type="date" class="input-field" />
            <button @click="handleAddGoal" class="btn-primary w-full bg-green-600 hover:bg-green-700">Hinzufuegen</button>
          </div>
          <ul class="mt-4 space-y-2 max-h-80 overflow-y-auto">
            <li v-for="goal in store.activeGoals" :key="goal.id" class="flex items-center justify-between gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div class="min-w-0">
                <p class="font-medium text-sm truncate">{{ goal.text }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(goal.date) }}</p>
              </div>
              <button @click="store.completeGoal(goal.id)" class="shrink-0 px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all">✓</button>
            </li>
            <li v-if="store.activeGoals.length === 0" class="text-center text-gray-400 py-4 text-sm">Keine offenen Ziele</li>
          </ul>
        </div>

        <!-- Lernplan -->
        <div class="card animate-slide-up" style="animation-delay: 0.15s">
          <h2 class="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">🧠 Lernplan</h2>
          <div class="space-y-3">
            <input v-model="studySubject" @keyup.enter="handleAddStudy" placeholder="Fach..." class="input-field" />
            <input v-model="studyDate" type="date" class="input-field" />
            <button @click="handleAddStudy" class="btn-primary w-full bg-purple-600 hover:bg-purple-700">Hinzufuegen</button>
          </div>
          <ul class="mt-4 space-y-2 max-h-80 overflow-y-auto">
            <li v-for="plan in store.upcomingStudyPlans" :key="plan.id" class="flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <span class="text-lg">📚</span>
              <div>
                <p class="font-medium text-sm">{{ plan.subject }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(plan.date) }}</p>
              </div>
            </li>
            <li v-if="store.upcomingStudyPlans.length === 0" class="text-center text-gray-400 py-4 text-sm">Keine Lernplaene</li>
          </ul>
        </div>

        <!-- Deadlines -->
        <div class="card animate-slide-up" style="animation-delay: 0.2s">
          <h2 class="text-xl font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">⏰ Deadlines</h2>
          <div class="space-y-3">
            <input v-model="deadlineInput" @keyup.enter="handleAddDeadline" placeholder="Deadline..." class="input-field" />
            <input v-model="deadlineDate" type="date" class="input-field" />
            <button @click="handleAddDeadline" class="btn-primary w-full bg-red-600 hover:bg-red-700">Hinzufuegen</button>
          </div>
          <ul class="mt-4 space-y-2 max-h-80 overflow-y-auto">
            <li v-for="dl in store.activeDeadlines" :key="dl.id" class="flex items-center justify-between gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div class="min-w-0">
                <p class="font-medium text-sm truncate">{{ dl.text }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(dl.date) }}</p>
              </div>
              <button @click="store.completeDeadline(dl.id)" class="shrink-0 px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all">✓</button>
            </li>
            <li v-if="store.activeDeadlines.length === 0" class="text-center text-gray-400 py-4 text-sm">Keine Deadlines 🎉</li>
          </ul>
        </div>
      </div>

      <!-- Kalender -->
      <div class="card animate-slide-up" style="animation-delay: 0.25s">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-primary-700 dark:text-primary-400 flex items-center gap-2">📅 Wochenuebersicht</h2>
          <div class="flex items-center gap-2">
            <button @click="store.changeWeek(-1)" class="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">⬅</button>
            <span class="text-sm font-medium px-2">{{ weekRange }}</span>
            <button @click="store.changeWeek(1)" class="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">➡</button>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          <div v-for="(day, idx) in store.weekDays" :key="idx" class="min-h-[180px] p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <h4 class="text-sm font-semibold text-primary-700 dark:text-primary-400 mb-2">
              {{ dayNames[idx] }}<br>
              <span class="text-xs font-normal text-gray-500">{{ day.getDate() }}.{{ day.getMonth()+1 }}.</span>
            </h4>
            <div class="space-y-1.5">
              <div v-for="entry in store.entriesForDay(day)" :key="entry.id"
                   class="text-xs p-2 rounded-lg text-white"
                   :class="entry.type === 'deadline' ? 'bg-red-500' : 'bg-primary-500'">
                <div class="flex items-center justify-between gap-1">
                  <span class="truncate">{{ entry.text }}</span>
                  <button @click="store.completeCalendarEntry(entry.id)" class="shrink-0 text-[10px] bg-white/20 hover:bg-white/30 px-1 rounded">✓</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================= -->
    <!-- KI TAB -->
    <!-- ========================= -->
    <div v-else class="animate-fade-in space-y-6">
      <div class="card text-center py-12">
        <div class="text-5xl mb-4">🤖</div>
        <h2 class="text-2xl font-bold text-primary-700 dark:text-primary-400 mb-2">KI Lernoptimierung</h2>
        <p class="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Nutze moderne KI-Funktionen zur Verbesserung deines Lernprozesses. Lade Material hoch und lasse dir Zusammenfassungen, Karteikarten, Aufgaben und Quizze generieren.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="tool in aiTools" :key="tool.id" class="card border-t-4 border-primary-500 hover:-translate-y-1 transition-transform">
          <div class="text-4xl mb-3">{{ tool.icon }}</div>
          <h3 class="text-lg font-bold text-primary-700 dark:text-primary-400 mb-2">{{ tool.title }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">{{ tool.desc }}</p>

          <div class="border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-xl p-6 text-center bg-primary-50/50 dark:bg-primary-900/10 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all cursor-pointer">
            <div class="text-3xl mb-2">📁</div>
            <p class="text-sm font-medium text-primary-700 dark:text-primary-400">{{ tool.uploadLabel }}</p>
          </div>

          <button class="btn-primary w-full mt-4">{{ tool.button }}</button>

          <div class="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
            <strong class="text-gray-900 dark:text-gray-100">Beispiel:</strong><br>
            <span v-html="tool.demo"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="showModal = false">
        <div class="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto animate-slide-up">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">✅ Erledigte Objekte</h3>
          <ul class="space-y-2">
            <li v-for="(item, idx) in store.completedItems.slice().reverse()" :key="idx" class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300">
              {{ item }}
            </li>
            <li v-if="store.completedItems.length === 0" class="text-center text-gray-400 py-4 text-sm">Noch nichts erledigt.</li>
          </ul>
          <button @click="showModal = false" class="mt-4 w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all">Schliessen</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
const store = useStudyFlowStore()
const activeTab = inject('activeTab')

// Form state
const taskInput = ref('')
const taskPriority = ref('1')
const goalInput = ref('')
const goalDate = ref('')
const studySubject = ref('')
const studyDate = ref('')
const deadlineInput = ref('')
const deadlineDate = ref('')
const showModal = ref(false)

const dayNames = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']

const aiTools = [
  { id: 1, icon: '📄', title: 'KI Zusammenfassung', desc: 'Lade Vorlesungsfolien oder Skripte hoch und lasse dir automatisch Zusammenfassungen erstellen.', uploadLabel: 'Vorlesungsfolien oder Skripte hochladen', button: 'Zusammenfassung generieren', demo: '• Wichtigste Definitionen<br>• Zusammenfassung der Kernaussagen<br>• Pruefungsrelevante Themen' },
  { id: 2, icon: '🃏', title: 'KI Karteikarten', desc: 'Die KI erstellt automatisch Karteikarten aus deinem Lernmaterial.', uploadLabel: 'Lernmaterial fuer Karteikarten hochladen', button: 'Karteikarten erstellen', demo: '<strong>Frage:</strong> Was ist Polymorphie?<br><br><strong>Antwort:</strong> Objekte koennen unterschiedliche Formen annehmen.' },
  { id: 3, icon: '📝', title: 'KI Aufgabenerstellung', desc: 'Generiere automatisch Uebungsaufgaben passend zu deinem Lernstoff.', uploadLabel: 'Dokumente zur Aufgabenerstellung hochladen', button: 'Aufgaben generieren', demo: 'Erstelle eine Klasse "Student" mit Konstruktor, Getter und Setter Methoden.' },
  { id: 4, icon: '❓', title: 'KI Quizerstellung', desc: 'Erstelle automatisch Multiple-Choice-Quizze aus deinen Vorlesungsfolien.', uploadLabel: 'Vorlesungsunterlagen fuer Quiz hochladen', button: 'Quiz generieren', demo: 'Welche Aussage beschreibt Vererbung in Java?<br><br>⭕ Eine Klasse kann Eigenschaften anderer Klassen uebernehmen' },
]

// Actions
const handleAddTask = () => {
  if (!taskInput.value.trim()) return
  store.addTask(taskInput.value.trim(), Number(taskPriority.value))
  taskInput.value = ''
}

const handleAddGoal = () => {
  if (!goalInput.value.trim() || !goalDate.value) return
  store.addGoal(goalInput.value.trim(), goalDate.value)
  goalInput.value = ''
  goalDate.value = ''
}

const handleAddStudy = () => {
  if (!studySubject.value.trim() || !studyDate.value) return
  store.addStudyPlan(studySubject.value.trim(), studyDate.value)
  studySubject.value = ''
  studyDate.value = ''
}

const handleAddDeadline = () => {
  if (!deadlineInput.value.trim() || !deadlineDate.value) return
  store.addDeadline(deadlineInput.value.trim(), deadlineDate.value)
  deadlineInput.value = ''
  deadlineDate.value = ''
}

const openCompletedModal = () => showModal.value = true

// Helpers
const priorityLabel = (p) => p === 1 ? 'Hoch' : p === 2 ? 'Mittel' : 'Niedrig'
const priorityBadge = (p) => p === 1 ? 'bg-red-500' : p === 2 ? 'bg-orange-500' : 'bg-green-500'
const priorityBorder = (p) => p === 1 ? 'border-red-400' : p === 2 ? 'border-orange-400' : 'border-green-400'
const formatDate = (d) => new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

const weekRange = computed(() => {
  const start = store.weekDays[0]
  const end = store.weekDays[6]
  return `${start.getDate()}.${start.getMonth()+1}. – ${end.getDate()}.${end.getMonth()+1}.`
})
</script>
