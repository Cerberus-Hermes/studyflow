<template>
  <div class="max-w-md mx-auto animate-fade-in">
    <div class="sf-card p-8">
      <div class="text-center mb-8">
        <div class="w-16 h-16 rounded-2xl sf-animated-gradient flex items-center justify-center text-white text-3xl mx-auto mb-4">🔐</div>
        <h1 class="text-2xl font-bold mb-2" style="color: var(--text-primary);">
          {{ mode === 'login' ? 'Anmelden' : 'Registrieren' }}
        </h1>
        <p class="text-sm" style="color: var(--text-muted);">StudyFlow Konto</p>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <div v-if="mode === 'register'">
          <label class="text-xs font-semibold mb-1 block" style="color: var(--text-muted);">E-Mail</label>
          <input v-model="email" type="email" required class="sf-input w-full" placeholder="deine@email.de" />
        </div>

        <div>
          <label class="text-xs font-semibold mb-1 block" style="color: var(--text-muted);">Benutzername</label>
          <input v-model="username" type="text" required class="sf-input w-full" placeholder="benutzername" />
        </div>

        <div>
          <label class="text-xs font-semibold mb-1 block" style="color: var(--text-muted);">Passwort</label>
          <input v-model="password" type="password" required minlength="6" class="sf-input w-full" placeholder="••••••••" />
        </div>

        <p v-if="error" class="text-xs p-3 rounded-xl" style="background: rgba(224, 122, 95, 0.15); color: var(--accent-warm);">{{ error }}</p>

        <button type="submit" class="sf-btn sf-btn-primary w-full" :disabled="loading">
          {{ loading ? 'Bitte warten…' : (mode === 'login' ? 'Anmelden' : 'Konto erstellen') }}
        </button>
      </form>

      <p class="text-center text-sm mt-6" style="color: var(--text-muted);">
        <button type="button" class="underline hover:opacity-80" style="color: var(--accent-cool);" @click="toggleMode">
          {{ mode === 'login' ? 'Noch kein Konto? Registrieren' : 'Bereits registriert? Anmelden' }}
        </button>
      </p>

      <button type="button" class="sf-btn w-full mt-4 text-sm" style="background: var(--bg-tertiary); color: var(--text-secondary);" @click="goHome">
        ← Zurück zur App
      </button>
    </div>
  </div>
</template>

<script setup>
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const mode = ref(route.query.mode === 'register' ? 'register' : 'login')
const username = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const toggleMode = () => {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  error.value = ''
}

const submit = async () => {
  error.value = ''
  loading.value = true
  try {
    if (mode.value === 'login') {
      await auth.login(username.value.trim(), password.value)
    } else {
      await auth.register(username.value.trim(), email.value.trim(), password.value)
    }
    const store = useStudyFlowStore()
    await store.loadAllData()
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.push(redirect)
  } catch (e) {
    error.value = e?.data?.message || e?.message || 'Fehler bei der Anmeldung'
  } finally {
    loading.value = false
  }
}

const goHome = () => router.push('/')

watch(() => route.query.mode, (m) => {
  if (m === 'register') mode.value = 'register'
  if (m === 'login') mode.value = 'login'
})
</script>
