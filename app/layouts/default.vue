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
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl sf-animated-gradient flex items-center justify-center text-white text-lg shadow-lg">
              📚
            </div>
            <div>
              <h1 class="text-xl font-bold tracking-tight" style="color: var(--text-primary);">StudyFlow</h1>
              <p class="text-xs" style="color: var(--text-muted);">Dein Lern-Universum</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <!-- Tab Navigation -->
            <nav class="hidden sm:flex items-center gap-1 p-1 rounded-2xl" style="background: var(--bg-tertiary);">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                class="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                :class="activeTab === tab.id
                  ? 'text-white shadow-lg'
                  : 'hover:text-white/80'"
                :style="activeTab === tab.id
                  ? { background: 'linear-gradient(135deg, var(--accent-warm), var(--accent-warm-light))' }
                  : { color: 'var(--text-secondary)' }"
              >
                {{ tab.icon }} {{ tab.label }}
              </button>
            </nav>

            <!-- Mobile Tab Select -->
            <select v-model="activeTab" class="sf-input sf-select sm:hidden w-40 text-sm py-2 px-3">
              <option v-for="tab in tabs" :key="tab.id" :value="tab.id">{{ tab.icon }} {{ tab.label }}</option>
            </select>

            <!-- Dark Mode Toggle -->
            <button
              @click="store.toggleDarkMode()"
              class="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105"
              style="background: var(--bg-tertiary); color: var(--text-secondary);"
            >
              <span class="text-lg">{{ store.darkMode ? '☀️' : '🌙' }}</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="relative z-10 py-6 mt-auto" style="border-top: 1px solid var(--border-subtle);">
      <div class="max-w-7xl mx-auto px-4 text-center text-xs" style="color: var(--text-muted);">
        <p>StudyFlow &copy; 2026 — Crafted with precision</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
const store = useStudyFlowStore()
const activeTab = useState('activeTab', () => 'orga')

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'orga', label: 'Organisation', icon: '📋' },
  { id: 'calendar', label: 'Kalender', icon: '📅' },
  { id: 'ai', label: 'KI Tools', icon: '🤖' },
  { id: 'settings', label: 'Einstellungen', icon: '⚙️' },
]

provide('activeTab', activeTab)
</script>
