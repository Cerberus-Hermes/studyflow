<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
    <!-- Header -->
    <header class="bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl sm:text-4xl font-bold tracking-tight">📚 StudyFlow</h1>
            <p class="text-primary-100 mt-1 text-sm sm:text-base">Dein persoenlicher Studenten Organizer</p>
          </div>
          <button @click="store.toggleDarkMode()" class="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
            <span class="text-xl">{{ store.darkMode ? '☀️' : '🌙' }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Navigation -->
    <nav class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex gap-2 overflow-x-auto py-3 no-scrollbar">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200',
              activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            ]"
          >
            {{ tab.icon }} {{ tab.label }}
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-6 mt-auto">
      <div class="max-w-7xl mx-auto px-4 text-center text-sm">
        <p>StudyFlow &copy; 2026 — Built with Nuxt 4 & Pinia</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
const store = useStudyFlowStore()
const activeTab = useState('activeTab', () => 'orga')

const tabs = [
  { id: 'orga', label: 'Organisation', icon: '📋' },
  { id: 'ai', label: 'KI Lernoptimierung', icon: '🤖' },
]

provide('activeTab', activeTab)
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
