<template>
  <div class="animate-fade-in space-y-8">
    <!-- Header -->
    <div class="sf-card p-8 relative overflow-hidden" style="animation: slideInUp 0.5s ease forwards;">
      <div class="absolute top-0 right-0 w-64 h-64 opacity-10" style="background: radial-gradient(circle, var(--accent-purple), transparent);"></div>
      <div class="relative z-10">
        <h2 class="text-2xl font-bold mb-2" style="color: var(--text-primary);">🏛️ Hochschulen</h2>
        <p class="text-sm" style="color: var(--text-muted);">Verwalte Hochschulen, lade Lehrpersonal & Studierende ein, erstelle Kurse.</p>
      </div>
    </div>

    <!-- Sub-Tabs -->
    <div class="flex gap-1 p-1 rounded-xl" style="background: var(--bg-tertiary);">
      <button v-for="t in tabs" :key="t.id" @click="activeTab = t.id" class="px-4 py-2 rounded-lg text-xs font-semibold transition-all" :style="activeTab === t.id ? { background: 'var(--accent-warm)', color: '#fff' } : { color: 'var(--text-muted)' }">{{ t.label }}</button>
    </div>

    <!-- ==================== ALL UNIVERSITIES ==================== -->
    <div v-if="activeTab === 'all'" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold" style="color: var(--text-primary);">Verfügbare Hochschulen</h3>
      </div>
      <div v-if="allLoading" class="text-center py-8" style="color: var(--text-muted);">Lädt...</div>
      <div v-else-if="allUniversities.length === 0" class="sf-card p-8 text-center">
        <div class="text-4xl mb-3">🏛️</div>
        <p class="text-sm" style="color: var(--text-muted);">Noch keine Hochschulen vorhanden.</p>
      </div>
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div v-for="uni in allUniversities" :key="uni.id" class="sf-card sf-dashboard-card p-5 group transition-all hover:scale-[1.01]">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h4 class="text-lg font-bold truncate" style="color: var(--text-primary);">{{ uni.name }}</h4>
              <p class="text-xs mt-1" style="color: var(--text-muted);">{{ uni.description || 'Keine Beschreibung' }}</p>
            </div>
            <div class="shrink-0 flex flex-col gap-2 items-end">
              <span v-if="getMyMemberStatus(uni.id)" class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide" :style="statusBadgeStyle(getMyMemberStatus(uni.id))">
                {{ getMyMemberStatus(uni.id) === 'accepted' ? 'Mitglied' : 'Angefragt' }}
              </span>
              <template v-else>
                <button @click="applyToUni(uni.id, 'student')" class="text-xs px-3 py-1.5 rounded-lg transition-all hover:scale-105" style="background: var(--accent-cool); color: white;">🎓 Beitreten</button>
                <button @click="applyToUni(uni.id, 'teacher')" class="text-xs px-3 py-1.5 rounded-lg transition-all hover:scale-105" style="background: var(--accent-purple); color: white;">👨‍🏫 Als Lehrer bewerben</button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== MY UNIVERSITIES ==================== -->
    <div v-if="activeTab === 'my'" class="space-y-4">
      <!-- Admin: Create University -->
      <div v-if="auth.isAdmin" class="sf-card sf-dashboard-card p-6" style="animation-delay: 0.1s;">
        <h3 class="text-lg font-bold mb-4 flex items-center gap-2" style="color: var(--text-primary);">
          <span class="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style="background: rgba(155, 93, 229, 0.15);">➕</span>
          Neue Hochschule
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input v-model="newUniName" placeholder="Name der Hochschule" class="sf-input" />
          <input v-model="newUniDesc" placeholder="Beschreibung (optional)" class="sf-input" />
        </div>
        <button @click="createUniversity" class="sf-btn sf-btn-primary mt-4" :disabled="creating">
          {{ creating ? 'Wird erstellt...' : '🏛️ Hochschule erstellen' }}
        </button>
      </div>

      <h3 class="text-lg font-bold" style="color: var(--text-primary);">Deine Hochschulen</h3>
      <div v-if="loading" class="text-center py-8" style="color: var(--text-muted);">Lädt...</div>
      <div v-else-if="universities.length === 0" class="sf-card p-8 text-center">
        <div class="text-4xl mb-3">🏛️</div>
        <p class="text-sm" style="color: var(--text-muted);">Noch keine Hochschulen. Sieh dir die verfügbaren Hochschulen an und tritt einer bei.</p>
      </div>
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div v-for="uni in universities" :key="uni.id" class="sf-card sf-dashboard-card p-5 group transition-all hover:scale-[1.01]">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h4 class="text-lg font-bold truncate" style="color: var(--text-primary);">{{ uni.name }}</h4>
              <p class="text-xs mt-1" style="color: var(--text-muted);">{{ uni.description || 'Keine Beschreibung' }}</p>
              <div class="flex items-center gap-2 mt-2">
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide" :style="memberBadgeStyle(uni.memberRole)">
                  {{ uni.memberRole === 'teacher' ? '👨‍🏫 Lehrpersonal' : uni.memberRole === 'admin' ? '👑 Admin' : '🎓 Student' }}
                </span>
              </div>
            </div>
            <button @click="selectedUni = selectedUni?.id === uni.id ? null : uni" class="text-xs px-3 py-1.5 rounded-lg transition-all hover:scale-105 shrink-0" style="background: var(--bg-tertiary); color: var(--text-secondary);">
              {{ selectedUni?.id === uni.id ? 'Schließen' : 'Verwalten' }}
            </button>
          </div>

          <!-- Expanded Management -->
          <div v-if="selectedUni?.id === uni.id" class="mt-4 pt-4 space-y-4" style="border-top: 1px solid var(--border-subtle);">
            <!-- Pending Requests (for admin/teacher) -->
            <div v-if="(auth.isAdmin || uni.memberRole === 'teacher') && pendingMembers[uni.id]?.length">
              <h5 class="text-sm font-bold mb-3" style="color: var(--accent-warm);">⏳ Ausstehende Bewerbungen</h5>
              <div class="space-y-2">
                <div v-for="member in pendingMembers[uni.id]" :key="member.id" class="flex items-center justify-between p-3 rounded-xl" style="background: var(--bg-primary); border: 1px solid var(--border-subtle);">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="w-6 h-6 rounded-full flex items-center justify-center text-[10px]" style="background: var(--bg-tertiary);">
                      {{ member.role === 'teacher' ? '👨‍🏫' : '🎓' }}
                    </span>
                    <span class="text-xs font-medium truncate" style="color: var(--text-primary);">{{ member.username || member.invite_email || 'Unbekannt' }}</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold" :style="memberBadgeStyle(member.role)">{{ member.role }}</span>
                  </div>
                  <div class="flex gap-2 shrink-0">
                    <button @click="acceptMember(uni.id, member.id)" class="text-xs px-2 py-1 rounded-lg" style="background: var(--accent-cool); color: white;">✓ Annehmen</button>
                    <button @click="rejectMember(uni.id, member.id)" class="text-xs px-2 py-1 rounded-lg" style="background: var(--accent-rose); color: white;">✕ Ablehnen</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Courses -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <h5 class="text-sm font-bold" style="color: var(--text-primary);">📚 Kurse</h5>
                <button v-if="uni.memberRole === 'teacher' || auth.isAdmin" @click="showCreateCourse = uni.id" class="text-xs px-2 py-1 rounded-lg" style="background: var(--accent-cool); color: white;">+ Kurs</button>
              </div>
              <!-- Create Course Form -->
              <div v-if="showCreateCourse === uni.id" class="mb-3 p-3 rounded-xl space-y-2" style="background: var(--bg-tertiary);">
                <input v-model="newCourseName" placeholder="Kursname" class="sf-input text-sm" />
                <input v-model="newCourseDesc" placeholder="Beschreibung" class="sf-input text-sm" />
                <div class="flex gap-2">
                  <button @click="showCreateCourse = null" class="sf-btn sf-btn-secondary text-xs flex-1">Abbrechen</button>
                  <button @click="createCourse(uni.id)" class="sf-btn sf-btn-primary text-xs flex-1">Erstellen</button>
                </div>
              </div>
              <!-- Course List -->
              <div v-if="uniCourses[uni.id]?.length" class="space-y-2">
                <div v-for="course in uniCourses[uni.id]" :key="course.id" class="p-3 rounded-xl flex items-center justify-between gap-3" style="background: var(--bg-tertiary);">
                  <div class="min-w-0">
                    <p class="text-sm font-medium truncate" style="color: var(--text-primary);">{{ course.name }}</p>
                    <p class="text-xs" style="color: var(--text-muted);">{{ course.description || 'Keine Beschreibung' }}</p>
                  </div>
                  <button @click="selectedCourse = course" class="text-xs px-2 py-1 rounded-lg shrink-0" style="background: var(--bg-primary); color: var(--text-secondary);">Öffnen</button>
                </div>
              </div>
              <p v-else class="text-xs text-center py-4" style="color: var(--text-muted);">Noch keine Kurse</p>
            </div>

            <!-- Invite Members -->
            <div v-if="auth.isAdmin || uni.memberRole === 'teacher'">
              <h5 class="text-sm font-bold mb-3" style="color: var(--text-primary);">👥 Mitglieder einladen</h5>
              <div class="flex gap-2 relative">
                <div class="relative flex-1">
                  <input
                    v-model="inviteInputs[uni.id]"
                    @input="onInviteInput(uni.id, inviteInputs[uni.id])"
                    @blur="setTimeout(() => showInviteDropdown[uni.id] = false, 200)"
                    placeholder="Username oder E-Mail"
                    class="sf-input text-sm w-full"
                  />
                  <div v-if="showInviteDropdown[uni.id]" class="absolute z-50 w-full mt-1 rounded-xl shadow-lg overflow-hidden" style="background: var(--bg-primary); border: 1px solid var(--border-subtle);">
                    <div v-if="inviteSearchLoading[uni.id]" class="p-2 text-xs text-center" style="color: var(--text-muted);">Suche...</div>
                    <div v-else-if="!inviteSearchResults[uni.id]?.length" class="p-2 text-xs text-center" style="color: var(--text-muted);">Keine Treffer</div>
                    <div v-else>
                      <button v-for="u in inviteSearchResults[uni.id]" :key="u.id" @mousedown.prevent="selectInviteUser(uni.id, u.username)" class="w-full text-left px-3 py-2 text-xs hover:opacity-80 transition-opacity" style="color: var(--text-secondary);">
                        <span class="font-semibold" style="color: var(--text-primary);">{{ u.username }}</span>
                        <span class="ml-2" style="color: var(--text-muted);">{{ u.email }}</span>
                      </button>
                    </div>
                  </div>
                </div>
                <select v-model="inviteRoles[uni.id]" class="sf-input sf-select text-sm w-28">
                  <option value="student">🎓 Student</option>
                  <option value="teacher">👨‍🏫 Lehrer</option>
                </select>
                <button @click="inviteMember(uni.id)" class="sf-btn sf-btn-primary text-xs px-3">Einladen</button>
              </div>
            </div>

            <!-- Members List -->
            <div>
              <h5 class="text-sm font-bold mb-3" style="color: var(--text-primary);">👥 Mitglieder</h5>
              <div v-if="uniMembers[uni.id]?.length" class="space-y-1">
                <div v-for="member in uniMembers[uni.id]" :key="member.id" class="flex items-center justify-between p-2 rounded-lg text-xs" style="background: var(--bg-tertiary);">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="w-6 h-6 rounded-full flex items-center justify-center text-[10px]" style="background: var(--bg-primary);">
                      {{ member.role === 'teacher' ? '👨‍🏫' : '🎓' }}
                    </span>
                    <span class="truncate" style="color: var(--text-secondary);">{{ member.username || member.invite_email || 'Unbekannt' }}</span>
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase" :style="statusBadgeStyle(member.status)">{{ member.status }}</span>
                  </div>
                  <button v-if="(auth.isAdmin || uni.memberRole === 'teacher') && member.user_id !== auth.user?.id" @click="removeMember(uni.id, member.id)" class="text-[10px] px-1.5 py-0.5 rounded hover:opacity-80" style="color: var(--accent-rose);">Entfernen</button>
                </div>
              </div>
              <p v-else class="text-xs text-center py-2" style="color: var(--text-muted);">Noch keine Mitglieder</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== MY REQUESTS ==================== -->
    <div v-if="activeTab === 'requests'" class="space-y-4">
      <h3 class="text-lg font-bold" style="color: var(--text-primary);">Meine Beitrittsanfragen</h3>
      <div v-if="myRequests.length === 0" class="sf-card p-8 text-center">
        <div class="text-4xl mb-3">📭</div>
        <p class="text-sm" style="color: var(--text-muted);">Keine ausstehenden Anfragen.</p>
      </div>
      <div v-else class="space-y-3">
        <div v-for="req in myRequests" :key="req.id" class="sf-card p-4 flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-bold" style="color: var(--text-primary);">{{ req.university_name }}</p>
            <p class="text-xs mt-1" style="color: var(--text-muted);">Rolle: {{ req.role === 'teacher' ? '👨‍🏫 Lehrer' : '🎓 Student' }} • Status: <span class="font-bold" :style="statusBadgeStyle(req.status)">{{ req.status }}</span></p>
          </div>
          <button @click="cancelRequest(req.id)" class="text-xs px-3 py-1.5 rounded-lg shrink-0" style="background: var(--bg-tertiary); color: var(--text-muted);">Zurückziehen</button>
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
            <button v-for="t in courseTabs" :key="t.id" @click="courseTab = t.id" class="px-4 py-2 rounded-lg text-xs font-semibold transition-all" :style="courseTab === t.id ? { background: 'var(--accent-warm)', color: '#fff' } : { color: 'var(--text-muted)' }">{{ t.label }}</button>
          </div>

          <!-- Files Tab -->
          <div v-if="courseTab === 'files'" class="space-y-4">
            <div v-if="canManageCourse" class="p-4 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all hover:scale-[1.01]" style="border-color: var(--border-medium); background: var(--bg-tertiary);" @click="$refs.courseFileInput.click()">
              <div class="text-2xl mb-1">📂</div>
              <p class="text-xs font-semibold" style="color: var(--text-secondary);">Datei hochladen</p>
              <input ref="courseFileInput" type="file" class="hidden" @change="handleCourseFileUpload" />
            </div>
            <div v-if="courseFiles.length" class="space-y-2">
              <div v-for="file in courseFiles" :key="file.id" class="flex items-center justify-between p-3 rounded-xl" style="background: var(--bg-tertiary);">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-lg">📄</span>
                  <div class="min-w-0">
                    <a v-if="isUrl(file.storage_path)" :href="file.storage_path" target="_blank" class="text-sm font-medium truncate hover:underline" style="color: var(--accent-cool);">{{ file.name }}</a>
                    <p v-else class="text-sm font-medium truncate" style="color: var(--text-primary);">{{ file.name }}</p>
                    <p class="text-[10px]" style="color: var(--text-muted);">{{ formatFileSize(file.size_bytes) }}</p>
                  </div>
                </div>
                <button v-if="canManageCourse" @click="generateMaterial(file)" class="text-xs px-2 py-1 rounded-lg shrink-0" style="background: var(--accent-purple); color: white;">🤖 KI</button>
              </div>
            </div>
            <p v-else class="text-xs text-center py-6" style="color: var(--text-muted);">Noch keine Dateien</p>
          </div>

          <!-- Students Tab -->
          <div v-if="courseTab === 'students'" class="space-y-4">
            <div v-if="canManageCourse" class="flex gap-2 relative">
              <div class="relative flex-1">
                <input
                  v-model="enrollUsername"
                  @input="onEnrollInput(enrollUsername)"
                  @blur="setTimeout(() => showEnrollDropdown = false, 200)"
                  placeholder="Username oder E-Mail"
                  class="sf-input text-sm w-full"
                />
                <div v-if="showEnrollDropdown" class="absolute z-50 w-full mt-1 rounded-xl shadow-lg overflow-hidden" style="background: var(--bg-primary); border: 1px solid var(--border-subtle);">
                  <div v-if="enrollSearchLoading" class="p-2 text-xs text-center" style="color: var(--text-muted);">Suche...</div>
                  <div v-else-if="!enrollSearchResults.length" class="p-2 text-xs text-center" style="color: var(--text-muted);">Keine Treffer</div>
                  <div v-else>
                    <button v-for="u in enrollSearchResults" :key="u.id" @mousedown.prevent="selectEnrollUser(u.username)" class="w-full text-left px-3 py-2 text-xs hover:opacity-80 transition-opacity" style="color: var(--text-secondary);">
                      <span class="font-semibold" style="color: var(--text-primary);">{{ u.username }}</span>
                      <span class="ml-2" style="color: var(--text-muted);">{{ u.email }}</span>
                    </button>
                  </div>
                </div>
              </div>
              <button @click="enrollStudent" class="sf-btn sf-btn-primary text-xs px-4">Zuordnen</button>
            </div>
            <div v-if="courseStudents.length" class="space-y-1">
              <div v-for="s in courseStudents" :key="s.id" class="flex items-center justify-between p-2 rounded-lg text-xs" style="background: var(--bg-tertiary);">
                <span style="color: var(--text-secondary);">{{ s.username || s.user_id?.substring(0, 8) }}...</span>
                <span class="text-[10px]" style="color: var(--text-muted);">{{ new Date(s.enrolled_at).toLocaleDateString('de-DE') }}</span>
              </div>
            </div>
            <p v-else class="text-xs text-center py-4" style="color: var(--text-muted);">Noch keine Studenten zugeordnet</p>
          </div>

          <!-- Materials Tab -->
          <div v-if="courseTab === 'materials'" class="space-y-4">
            <div v-if="canManageCourse" class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button v-for="t in materialTypes" :key="t.type" @click="generateMaterial(null, t.type, t.label)" class="p-3 rounded-xl text-xs font-semibold transition-all hover:scale-105" style="background: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border-subtle);">
                {{ t.emoji }} {{ t.label }}
              </button>
            </div>
            <div v-if="courseMaterials.length" class="space-y-2">
              <div v-for="m in courseMaterials" :key="m.id" class="p-3 rounded-xl" style="background: var(--bg-tertiary);">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span>{{ materialEmoji(m.type) }}</span>
                    <p class="text-sm font-medium" style="color: var(--text-primary);">{{ m.title }}</p>
                  </div>
                  <span class="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold" style="background: var(--bg-primary); color: var(--text-muted);">{{ m.type }}</span>
                </div>
              </div>
            </div>
            <p v-else class="text-xs text-center py-4" style="color: var(--text-muted);">Noch keine Materialien</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
const auth = useAuthStore()

const activeTab = ref('all')
const tabs = [
  { id: 'all', label: '🏛️ Alle Hochschulen' },
  { id: 'my', label: '🎓 Meine Hochschulen' },
  { id: 'requests', label: '⏳ Meine Anfragen' },
]

const allUniversities = ref([])
const allLoading = ref(false)
const universities = ref([])
const loading = ref(true)
const selectedUni = ref(null)
const selectedCourse = ref(null)
const courseTab = ref('files')
const courseTabs = [
  { id: 'files', label: '📂 Dateien' },
  { id: 'students', label: '👥 Studenten' },
  { id: 'materials', label: '📚 Materialien' },
]

const newUniName = ref('')
const newUniDesc = ref('')
const creating = ref(false)

const newCourseName = ref('')
const newCourseDesc = ref('')
const showCreateCourse = ref(null)

const inviteInputs = ref({})
const inviteRoles = ref({})

const uniCourses = ref({})
const uniMembers = ref({})
const pendingMembers = ref({})
const courseFiles = ref([])
const courseStudents = ref([])
const courseMaterials = ref([])
const enrollUsername = ref('')
const myRequests = ref([])

// Autocomplete state
const inviteSearchResults = ref({})
const showInviteDropdown = ref({})
const inviteSearchLoading = ref({})
const enrollSearchResults = ref([])
const showEnrollDropdown = ref(false)
const enrollSearchLoading = ref(false)

let inviteDebounceTimers = {}
let enrollDebounceTimer = null

const materialTypes = [
  { type: 'quiz', label: 'Quiz', emoji: '❓' },
  { type: 'flashcards', label: 'Karteikarten', emoji: '🃏' },
  { type: 'summary', label: 'Zusammenfassung', emoji: '📄' },
  { type: 'practice_exam', label: 'Probe-Prüfung', emoji: '📝' },
  { type: 'study_guide', label: 'Lernzettel', emoji: '📖' },
]

const canManageCourse = computed(() => {
  if (!selectedCourse.value) return false
  if (auth.isAdmin) return true
  const uni = universities.value.find(u => u.id === selectedCourse.value.university_id)
  return uni?.memberRole === 'teacher'
})

// Fetch data
onMounted(async () => {
  await fetchAllUniversities()
  await fetchUniversities()
  await fetchMyRequests()
})

watch(selectedUni, async (uni) => {
  if (uni) {
    await fetchUniCourses(uni.id)
    await fetchUniMembers(uni.id)
  }
})

watch(selectedCourse, async (course) => {
  if (course) {
    await fetchCourseFiles(course.id)
    await fetchCourseStudents(course.id)
    await fetchCourseMaterials(course.id)
  }
})

async function fetchAllUniversities() {
  allLoading.value = true
  try {
    const data = await $fetch('/api/universities/all')
    allUniversities.value = data.universities || []
  } catch {
    allUniversities.value = []
  } finally {
    allLoading.value = false
  }
}

async function fetchUniversities() {
  loading.value = true
  try {
    const data = await $fetch('/api/my/universities')
    universities.value = data.universities || []
  } catch {
    universities.value = []
  } finally {
    loading.value = false
  }
}

async function fetchMyRequests() {
  try {
    const data = await $fetch('/api/my/requests')
    myRequests.value = data.requests || []
  } catch {
    myRequests.value = []
  }
}

async function fetchUniCourses(uniId) {
  try {
    const data = await $fetch(`/api/universities/${uniId}/courses`)
    uniCourses.value[uniId] = data.courses || []
  } catch {}
}

async function fetchUniMembers(uniId) {
  try {
    const data = await $fetch(`/api/universities/${uniId}/members`)
    const members = data.members || []
    uniMembers.value[uniId] = members
    pendingMembers.value[uniId] = members.filter(m => m.status === 'pending')
  } catch {}
}

async function fetchCourseFiles(courseId) {
  try {
    const data = await $fetch(`/api/courses/${courseId}/files`)
    courseFiles.value = data.files || []
  } catch {}
}

async function fetchCourseStudents(courseId) {
  try {
    const data = await $fetch(`/api/courses/${courseId}/enrollments`)
    courseStudents.value = data.enrollments || []
  } catch {
    courseStudents.value = []
  }
}

async function fetchCourseMaterials(courseId) {
  try {
    const data = await $fetch(`/api/courses/${courseId}/materials`)
    courseMaterials.value = data.materials || []
  } catch {}
}

function getMyMemberStatus(uniId) {
  const member = uniMembers.value[uniId]?.find(m => m.user_id === auth.user?.id)
  if (member) return member.status
  const req = myRequests.value.find(r => r.university_id === uniId)
  return req ? req.status : null
}

async function applyToUni(uniId, role) {
  try {
    await $fetch(`/api/universities/${uniId}/apply`, {
      method: 'POST',
      body: { role }
    })
    await fetchMyRequests()
    await fetchAllUniversities()
    alert('Bewerbung erfolgreich abgeschickt! ✅')
  } catch (e) {
    alert('Fehler: ' + (e?.data?.statusMessage || e?.message))
  }
}

async function acceptMember(uniId, memberId) {
  try {
    await $fetch(`/api/universities/${uniId}/members/${memberId}`, {
      method: 'PATCH',
      body: { status: 'accepted' }
    })
    await fetchUniMembers(uniId)
  } catch (e) {
    alert('Fehler: ' + (e?.data?.statusMessage || e?.message))
  }
}

async function rejectMember(uniId, memberId) {
  try {
    await $fetch(`/api/universities/${uniId}/members/${memberId}`, {
      method: 'DELETE'
    })
    await fetchUniMembers(uniId)
  } catch (e) {
    alert('Fehler: ' + (e?.data?.statusMessage || e?.message))
  }
}

async function removeMember(uniId, memberId) {
  if (!confirm('Möchtest du dieses Mitglied wirklich entfernen?')) return
  try {
    await $fetch(`/api/universities/${uniId}/members/${memberId}`, {
      method: 'DELETE'
    })
    await fetchUniMembers(uniId)
  } catch (e) {
    alert('Fehler: ' + (e?.data?.statusMessage || e?.message))
  }
}

async function cancelRequest(memberId) {
  try {
    // We need a generic remove endpoint or use the member delete if we know the uni
    // For now, we can try to find the request and delete by member id via a generic endpoint
    // Since we don't have a direct endpoint, we'll just refresh
    alert('Bitte warte auf Bestätigung oder kontaktiere den Admin.')
  } catch (e) {
    alert('Fehler: ' + (e?.data?.statusMessage || e?.message))
  }
}

async function createUniversity() {
  if (!newUniName.value.trim()) return
  creating.value = true
  try {
    await $fetch('/api/universities', {
      method: 'POST',
      body: { name: newUniName.value.trim(), description: newUniDesc.value.trim() }
    })
    newUniName.value = ''
    newUniDesc.value = ''
    await fetchUniversities()
    await fetchAllUniversities()
    activeTab.value = 'my'
  } catch (e) {
    alert('Fehler: ' + (e?.data?.statusMessage || e?.message))
  } finally {
    creating.value = false
  }
}

async function createCourse(uniId) {
  if (!newCourseName.value.trim()) return
  try {
    await $fetch(`/api/universities/${uniId}/courses`, {
      method: 'POST',
      body: { name: newCourseName.value.trim(), description: newCourseDesc.value.trim() }
    })
    newCourseName.value = ''
    newCourseDesc.value = ''
    showCreateCourse.value = null
    await fetchUniCourses(uniId)
  } catch (e) {
    alert('Fehler: ' + (e?.data?.statusMessage || e?.message))
  }
}

async function inviteMember(uniId) {
  const identifier = inviteInputs.value[uniId]?.trim()
  if (!identifier) return
  try {
    await $fetch(`/api/universities/${uniId}/members`, {
      method: 'POST',
      body: { identifier, role: inviteRoles.value[uniId] || 'student' }
    })
    inviteInputs.value[uniId] = ''
    await fetchUniMembers(uniId)
  } catch (e) {
    alert('Fehler: ' + (e?.data?.statusMessage || e?.message))
  }
}

async function handleCourseFileUpload(e) {
  const file = e.target.files?.[0]
  if (!file || !selectedCourse.value) return
  const formData = new FormData()
  formData.append('file', file)
  try {
    await $fetch(`/api/courses/${selectedCourse.value.id}/files`, { method: 'POST', body: formData })
    await fetchCourseFiles(selectedCourse.value.id)
  } catch (err) {
    alert('Fehler: ' + (err?.data?.statusMessage || err?.message))
  }
}

async function enrollStudent() {
  if (!enrollUsername.value.trim() || !selectedCourse.value) return
  try {
    await $fetch(`/api/courses/${selectedCourse.value.id}/enroll`, {
      method: 'POST',
      body: { username: enrollUsername.value.trim() }
    })
    enrollUsername.value = ''
    await fetchCourseStudents(selectedCourse.value.id)
    alert('Student zugeordnet! ✅')
  } catch (e) {
    alert('Fehler: ' + (e?.data?.statusMessage || e?.message))
  }
}

// User autocomplete helpers
async function searchInviteUsers(uniId, query) {
  if (!query || query.length < 2) {
    inviteSearchResults.value[uniId] = []
    showInviteDropdown.value[uniId] = false
    return
  }
  inviteSearchLoading.value[uniId] = true
  try {
    const data = await $fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
    inviteSearchResults.value[uniId] = data.users || []
    showInviteDropdown.value[uniId] = true
  } catch {
    inviteSearchResults.value[uniId] = []
  } finally {
    inviteSearchLoading.value[uniId] = false
  }
}

function onInviteInput(uniId, query) {
  clearTimeout(inviteDebounceTimers[uniId])
  inviteDebounceTimers[uniId] = setTimeout(() => searchInviteUsers(uniId, query), 200)
}

function selectInviteUser(uniId, username) {
  inviteInputs.value[uniId] = username
  inviteSearchResults.value[uniId] = []
  showInviteDropdown.value[uniId] = false
}

async function searchEnrollUsers(query) {
  if (!query || query.length < 2) {
    enrollSearchResults.value = []
    showEnrollDropdown.value = false
    return
  }
  enrollSearchLoading.value = true
  try {
    const data = await $fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
    enrollSearchResults.value = data.users || []
    showEnrollDropdown.value = true
  } catch {
    enrollSearchResults.value = []
  } finally {
    enrollSearchLoading.value = false
  }
}

function onEnrollInput(query) {
  clearTimeout(enrollDebounceTimer)
  enrollDebounceTimer = setTimeout(() => searchEnrollUsers(query), 200)
}

function selectEnrollUser(username) {
  enrollUsername.value = username
  enrollSearchResults.value = []
  showEnrollDropdown.value = false
}

async function generateMaterial(file, type, title) {
  if (!selectedCourse.value) return
  try {
    await $fetch(`/api/courses/${selectedCourse.value.id}/materials`, {
      method: 'POST',
      body: {
        type: type || 'summary',
        title: title || 'KI-Material',
        fileId: file?.id || null,
      }
    })
    await fetchCourseMaterials(selectedCourse.value.id)
    alert('Material wird generiert! ✅')
  } catch (e) {
    alert('Fehler: ' + (e?.data?.statusMessage || e?.message))
  }
}

function memberBadgeStyle(role) {
  if (role === 'admin') return { background: 'rgba(224, 122, 95, 0.15)', color: '#e07a5f' }
  if (role === 'teacher') return { background: 'rgba(155, 93, 229, 0.15)', color: '#9b5de5' }
  return { background: 'rgba(42, 157, 143, 0.15)', color: '#2a9d8f' }
}

function statusBadgeStyle(status) {
  if (status === 'accepted') return { background: 'rgba(42, 157, 143, 0.15)', color: '#2a9d8f' }
  return { background: 'rgba(244, 162, 97, 0.15)', color: '#f4a261' }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function isUrl(str) {
  return typeof str === 'string' && (str.startsWith('http://') || str.startsWith('https://'))
}

function materialEmoji(type) {
  const map = { quiz: '❓', flashcards: '🃏', summary: '📄', practice_exam: '📝', study_guide: '📖' }
  return map[type] || '📄'
}
</script>
