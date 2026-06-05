<template>
  <div class="min-h-screen flex flex-col" style="background: var(--bg-primary); transition: background 0.4s ease;">
    <!-- Decorative Background -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute -top-[30%] -right-[10%] w-[600px] h-[600px] rounded-full opacity-30 blur-[100px]" style="background: var(--accent-warm);"></div>
      <div class="absolute top-[40%] -left-[10%] w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]" style="background: var(--accent-purple);"></div>
      <div class="absolute -bottom-[20%] right-[20%] w-[400px] h-[400px] rounded-full opacity-20 blur-[100px]" style="background: var(--accent-cool);"></div>
    </div>

    <!-- Header -->
    <header class="relative z-10 sf-glass sticky top-0" style="border-bottom: 1px solid var(--border-subtle);">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 shrink-0">
            <div class="w-10 h-10 rounded-xl sf-animated-gradient flex items-center justify-center text-white text-lg shadow-lg">
              📚
            </div>
            <div>
              <h1 class="text-xl font-bold tracking-tight" style="color: var(--text-primary);">StudyFlow</h1>
              <p class="text-xs" style="color: var(--text-muted);">Dein Lern-Universum</p>
            </div>
          </div>

          <div class="flex items-center gap-2 sm:gap-3 min-w-0">
            <nav class="hidden lg:flex items-center gap-1 p-1 rounded-2xl overflow-x-auto max-w-[50vw]" style="background: var(--bg-tertiary);">
              <button
                v-for="tab in visibleTabs"
                :key="tab.id"
                class="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0"
                :class="activeTab === tab.id ? 'text-white shadow-lg' : 'hover:text-white/80'"
                :style="activeTab === tab.id
                  ? { background: 'linear-gradient(135deg, var(--accent-warm), var(--accent-warm-light))' }
                  : { color: 'var(--text-secondary)' }"
                @click="setTab(tab.id)"
              >
                {{ tab.icon }} {{ tab.label }}
              </button>
            </nav>

            <select
              :value="activeTab"
              class="sf-input sf-select lg:hidden w-36 text-sm py-2 px-3 shrink-0"
              @change="setTab(($event.target).value)"
            >
              <option v-for="tab in visibleTabs" :key="tab.id" :value="tab.id">{{ tab.icon }} {{ tab.label }}</option>
            </select>

            <!-- Auth -->
            <div v-if="auth.initialized" class="flex items-center gap-2 shrink-0">
              <template v-if="auth.isLoggedIn">
                <span class="hidden sm:inline text-xs font-medium px-2 py-1 rounded-lg max-w-[100px] truncate" style="background: var(--bg-tertiary); color: var(--text-secondary);">
                  {{ auth.user?.username }}
                </span>
                <button
                  class="text-xs px-3 py-2 rounded-xl transition-all hover:scale-105"
                  style="background: var(--bg-tertiary); color: var(--text-muted);"
                  @click="handleLogout"
                >
                  Abmelden
                </button>
              </template>
              <NuxtLink v-else to="/login" class="sf-btn sf-btn-primary text-xs py-2 px-3 whitespace-nowrap">
                Anmelden
              </NuxtLink>
            </div>

            <button
              class="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 shrink-0"
              style="background: var(--bg-tertiary); color: var(--text-secondary);"
              @click="store.toggleDarkMode()"
            >
              <span class="text-lg">{{ store.darkMode ? '☀️' : '🌙' }}</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
      <slot />
    </main>

    <footer class="relative z-10 py-6 mt-auto" style="border-top: 1px solid var(--border-subtle);">
      <div class="max-w-7xl mx-auto px-4 text-center text-xs" style="color: var(--text-muted);">
        <p>StudyFlow &copy; 2026 — Crafted with precision</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
const store = useStudyFlowStore()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const activeTab = useState('activeTab', () => 'orga')

const allTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', public: true },
  { id: 'orga', label: 'Organisation', icon: '📋', public: true },
  { id: 'calendar', label: 'Kalender', icon: '📅', public: true },
  { id: 'ai', label: 'KI Tools', icon: '🤖', public: false },
  { id: 'feedback', label: 'Feedback', icon: '💬', public: true },
  { id: 'settings', label: 'Einstellungen', icon: '⚙️', public: true },
]

const visibleTabs = computed(() => {
  if (auth.isLoggedIn) return allTabs
  return allTabs.filter(t => t.public)
})

function setTab(id) {
  activeTab.value = id
  if (route.path === '/') {
    router.replace({ query: { ...route.query, tab: id } })
  }
}

async function handleLogout() {
  await auth.logout()
  if (activeTab.value === 'settings') {
    activeTab.value = 'orga'
  }
}

watch(
  () => route.query.tab,
  (tab) => {
    if (typeof tab === 'string' && allTabs.some(t => t.id === tab)) {
      activeTab.value = tab
    }
  },
  { immediate: true },
)

provide('activeTab', activeTab)
</script>
