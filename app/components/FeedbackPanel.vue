<template>
  <div class="animate-fade-in space-y-8 max-w-2xl mx-auto">
    <div class="sf-card p-8 text-center">
      <div class="w-16 h-16 rounded-2xl sf-animated-gradient flex items-center justify-center text-white text-3xl mx-auto mb-4">💬</div>
      <h2 class="text-2xl font-bold mb-2" style="color: var(--text-primary);">Feedback</h2>
      <p class="text-sm" style="color: var(--text-muted);">Deine Meinung hilft uns, StudyFlow zu verbessern — auch ohne Konto.</p>
    </div>

    <div class="sf-card p-6 space-y-5">
      <div>
        <p class="text-sm font-semibold mb-3" style="color: var(--text-primary);">Ich bin …</p>
        <div class="space-y-2">
          <label
            v-for="opt in userTypeOptions"
            :key="opt.value"
            class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
            :style="{
              background: userType === opt.value ? 'rgba(42, 157, 143, 0.12)' : 'var(--bg-tertiary)',
              border: userType === opt.value ? '1px solid rgba(42, 157, 143, 0.4)' : '1px solid var(--border-subtle)',
            }"
          >
            <input v-model="userType" type="radio" :value="opt.value" class="accent-[var(--accent-cool)]" />
            <span class="text-sm" style="color: var(--text-secondary);">{{ opt.label }}</span>
          </label>
        </div>
      </div>

      <div>
        <label class="text-lg font-semibold block mb-2" style="color: var(--text-primary);">
          Hilft dir das besser zu lernen?
        </label>
        <textarea
          v-model="feedbackText"
          rows="5"
          class="sf-input w-full text-sm"
          placeholder="Erzähl uns, was gut läuft und was wir verbessern können…"
          maxlength="5000"
        />
        <p class="text-xs text-right mt-1" style="color: var(--text-muted);">{{ feedbackText.length }} / 5000</p>
      </div>

      <div>
        <label class="text-sm font-semibold block mb-2" style="color: var(--text-primary);">
          Hat bei folgendem Problem geholfen
        </label>
        <textarea
          v-model="problemHelped"
          rows="3"
          class="sf-input w-full text-sm"
          placeholder="z. B. Prüfungsvorbereitung, Zeitplanung, Motivation …"
          maxlength="2000"
        />
        <p class="text-xs text-right mt-1" style="color: var(--text-muted);">{{ problemHelped.length }} / 2000 (optional)</p>
      </div>

      <p v-if="submitError" class="text-xs p-3 rounded-xl" style="background: rgba(224, 122, 95, 0.15); color: var(--accent-warm);">{{ submitError }}</p>
      <p v-if="submitSuccess" class="text-xs p-3 rounded-xl" style="background: rgba(42, 157, 143, 0.15); color: var(--accent-cool);">Danke für dein Feedback! ✅</p>
      <button
        class="sf-btn sf-btn-primary w-full text-sm"
        :disabled="submitting || !canSubmit"
        @click="submitFeedback"
      >
        {{ submitting ? 'Wird gespeichert…' : 'Feedback absenden' }}
      </button>

      <p v-if="!auth.isLoggedIn" class="text-xs text-center" style="color: var(--text-muted);">
        <NuxtLink to="/login?redirect=/?tab=feedback" class="underline" style="color: var(--accent-cool);">Anmelden</NuxtLink>
        — um Feedback geräteübergreifend zu sehen
      </p>
    </div>

    <div v-if="myFeedback.length" class="sf-card p-6 space-y-3">
      <h3 class="text-sm font-bold" style="color: var(--text-primary);">
        {{ auth.isLoggedIn ? 'Deine bisherigen Einträge' : 'Deine Einträge (dieser Browser)' }}
      </h3>
      <div
        v-for="item in myFeedback"
        :key="item.id"
        class="p-4 rounded-xl text-sm space-y-2"
        style="background: var(--bg-tertiary); color: var(--text-secondary);"
      >
        <span
          v-if="item.userType"
          class="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
          style="background: rgba(42, 157, 143, 0.15); color: var(--accent-cool);"
        >
          {{ userTypeLabel(item.userType) }}
        </span>
        <p class="whitespace-pre-wrap">{{ item.text }}</p>
        <p v-if="item.problemHelped" class="text-xs" style="color: var(--text-muted);">
          <strong style="color: var(--text-secondary);">Problem:</strong> {{ item.problemHelped }}
        </p>
        <p class="text-xs" style="color: var(--text-muted);">{{ formatDate(item.createdAt) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const auth = useAuthStore()

const userTypeOptions = [
  { value: 'student', label: 'Student / Schüler' },
  { value: 'worker', label: 'Arbeiter' },
  { value: 'other', label: 'Sonstiges' },
]

const userTypeLabels = {
  student: 'Student / Schüler',
  worker: 'Arbeiter',
  other: 'Sonstiges',
}

const feedbackText = ref('')
const problemHelped = ref('')
const userType = ref('')
const myFeedback = ref([])
const submitting = ref(false)
const submitError = ref('')
const submitSuccess = ref(false)

const canSubmit = computed(() => feedbackText.value.trim() && userType.value)
const userTypeLabel = (type) => userTypeLabels[type] || type

const formatDate = (iso) =>
  new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

async function loadMyFeedback() {
  if (!auth.isLoggedIn) {
    myFeedback.value = []
    return
  }
  try {
    const data = await $fetch('/api/feedback')
    myFeedback.value = data.feedback || []
  } catch {
    myFeedback.value = []
  }
}

async function submitFeedback() {
  if (!canSubmit.value) return
  submitting.value = true
  submitError.value = ''
  submitSuccess.value = false
  try {
    await $fetch('/api/feedback', {
      method: 'POST',
      body: {
        text: feedbackText.value.trim(),
        userType: userType.value,
        problemHelped: problemHelped.value.trim(),
      },
    })
    feedbackText.value = ''
    problemHelped.value = ''
    userType.value = ''
    submitSuccess.value = true

    if (auth.isLoggedIn) {
      await loadMyFeedback()
    }
  } catch (e) {
    submitError.value = e?.data?.message || e?.message || 'Speichern fehlgeschlagen'
  } finally {
    submitting.value = false
  }
}

onMounted(() => loadMyFeedback())

watch(() => auth.isLoggedIn, () => loadMyFeedback())
</script>
