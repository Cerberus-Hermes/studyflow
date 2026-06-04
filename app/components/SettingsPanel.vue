<template>
  <div class="animate-fade-in space-y-8 max-w-2xl mx-auto">
    <!-- Nicht-Admin Hinweis -->
    <div v-if="!auth.isAdmin" class="sf-card p-8 space-y-4">
      <div class="text-center">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4" style="background: rgba(155, 93, 229, 0.15);">🔒</div>
        <h2 class="text-2xl font-bold mb-2" style="color: var(--text-primary);">Admin-Bereich</h2>
        <p class="text-sm" style="color: var(--text-muted);">Einstellungen sind nur für Administratoren verfügbar.</p>
      </div>

      <div v-if="!auth.isLoggedIn" class="text-center">
        <NuxtLink to="/login?redirect=/?tab=settings" class="sf-btn sf-btn-primary text-sm">Zuerst anmelden</NuxtLink>
      </div>
    </div>

    <template v-else>
      <div class="sf-card p-8 text-center">
        <div class="w-16 h-16 rounded-2xl sf-animated-gradient flex items-center justify-center text-white text-3xl mx-auto mb-4">⚙️</div>
        <h2 class="text-2xl font-bold mb-2" style="color: var(--text-primary);">Einstellungen</h2>
        <p class="text-sm" style="color: var(--text-muted);">Admin — Konfiguration & Feedback-Übersicht</p>
      </div>

      <div class="sf-card p-6 space-y-4">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background: rgba(42, 157, 143, 0.15);">🔐</div>
          <div>
            <h3 class="text-lg font-bold" style="color: var(--text-primary);">KI-Konfiguration</h3>
            <p class="text-xs" style="color: var(--text-muted);">Serverseitige API-Verwaltung</p>
          </div>
        </div>
        <div class="p-4 rounded-xl space-y-2" style="background: var(--bg-tertiary);">
          <div class="flex items-center gap-2 text-sm">
            <span class="text-xl">🛡️</span>
            <span style="color: var(--text-secondary);">Der Kimi API Key wird <strong style="color: var(--accent-cool);">serverseitig</strong> verwaltet</span>
          </div>
          <p class="text-xs pl-8" style="color: var(--text-muted);">Variable <code class="px-1 py-0.5 rounded text-xs" style="background: var(--bg-primary); color: var(--accent-warm);">KIMI_API_KEY</code> in <code>.env</code> oder Vercel.</p>
        </div>
        <div class="p-4 rounded-xl" style="background: rgba(155, 93, 229, 0.1); border: 1px solid rgba(155, 93, 229, 0.2);">
          <p class="text-sm font-semibold mb-2" style="color: var(--accent-purple);">Auth (Server)</p>
          <div class="space-y-1 text-xs" style="color: var(--text-muted);">
            <p><code>AUTH_SECRET</code> — Session-Signatur (min. 16 Zeichen)</p>
          </div>
        </div>
      </div>

      <div class="sf-card p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold" style="color: var(--text-primary);">📋 Gespeichertes Feedback</h3>
          <button class="sf-btn sf-btn-secondary text-xs py-2" :disabled="loadingFeedback" @click="loadAllFeedback">
            {{ loadingFeedback ? '…' : 'Aktualisieren' }}
          </button>
        </div>
        <div v-if="allFeedback.length === 0" class="text-center py-6 text-sm" style="color: var(--text-muted);">Noch kein Feedback vorhanden.</div>
        <div
          v-for="item in allFeedback"
          :key="item.id"
          class="p-4 rounded-xl text-sm space-y-1"
          style="background: var(--bg-tertiary); border-left: 3px solid var(--accent-cool);"
        >
          <div class="flex flex-wrap justify-between gap-2 text-xs" style="color: var(--text-muted);">
            <span class="font-semibold" style="color: var(--accent-warm);">{{ item.username }}{{ item.userId === 'guest' ? ' (ohne Konto)' : '' }}</span>
            <span
              v-if="item.userType"
              class="px-2 py-0.5 rounded-full font-semibold"
              style="background: rgba(42, 157, 143, 0.15); color: var(--accent-cool);"
            >
              {{ userTypeLabel(item.userType) }}
            </span>
            <span>{{ formatDate(item.createdAt) }}</span>
          </div>
          <p class="whitespace-pre-wrap" style="color: var(--text-secondary);">{{ item.text }}</p>
          <p v-if="item.problemHelped" class="text-xs pt-1" style="color: var(--text-muted);">
            <strong style="color: var(--text-secondary);">Problem:</strong> {{ item.problemHelped }}
          </p>
        </div>
      </div>

      <div class="sf-card p-6 space-y-4" style="border: 1px solid rgba(224, 122, 95, 0.3);">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background: rgba(224, 122, 95, 0.15);">⚠️</div>
          <div>
            <h3 class="text-lg font-bold" style="color: var(--text-primary);">Account-Daten</h3>
            <p class="text-xs" style="color: var(--text-muted);">Alle deine Daten werden in Supabase gespeichert</p>
          </div>
        </div>
        <button
          class="sf-btn w-full text-sm"
          style="background: rgba(224, 122, 95, 0.15); color: var(--accent-warm); border: 1px solid rgba(224, 122, 95, 0.3);"
          @click="$emit('reset-data')"
        >
          🗑️ Alle Account-Daten löschen
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
defineEmits(['reset-data'])

const auth = useAuthStore()
const allFeedback = ref([])
const loadingFeedback = ref(false)

const userTypeLabels = {
  student: 'Student / Schüler',
  worker: 'Arbeiter',
  other: 'Sonstiges',
}

const userTypeLabel = (type) => userTypeLabels[type] || type || '—'

const formatDate = (iso) =>
  new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

async function loadAllFeedback() {
  loadingFeedback.value = true
  try {
    const data = await $fetch('/api/feedback', { query: { all: '1' } })
    allFeedback.value = data.feedback || []
  } catch {
    allFeedback.value = []
  } finally {
    loadingFeedback.value = false
  }
}

onMounted(() => {
  if (auth.isAdmin) loadAllFeedback()
})
</script>
