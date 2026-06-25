import { defineStore } from 'pinia'

export interface PublicUser {
  id: string
  username: string
  email: string
  role: 'user' | 'teacher' | 'admin'
  subscriptionTier: 'free' | 'pro' | 'premium'
  aiCreditsUsed: number
  aiCreditsLimit: number
  subscriptionExpiresAt: string | null
  createdAt: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<PublicUser | null>(null)
  const loading = ref(false)
  const initialized = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isTeacher = computed(() => user.value?.role === 'teacher')
  const canAccessSettings = computed(() => isAdmin.value)

  // Subscription computed properties
  const subscriptionTier = computed(() => user.value?.subscriptionTier || 'free')
  const aiCreditsRemaining = computed(() => {
    if (!user.value) return 0
    if (user.value.subscriptionTier === 'premium') return -1 // unlimited
    return Math.max(0, user.value.aiCreditsLimit - user.value.aiCreditsUsed)
  })
  const hasAICredits = computed(() => {
    if (!user.value) return false
    if (user.value.subscriptionTier === 'premium') return true
    return user.value.aiCreditsUsed < user.value.aiCreditsLimit
  })
  const canUseAI = computed(() => isLoggedIn.value && hasAICredits.value)
  const subscriptionExpired = computed(() => {
    if (!user.value?.subscriptionExpiresAt) return false
    return new Date(user.value.subscriptionExpiresAt) < new Date()
  })

  async function fetchMe() {
    loading.value = true
    try {
      const data = await $fetch<{ user: PublicUser | null }>('/api/auth/me')
      user.value = data.user
    } catch {
      user.value = null
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  async function register(username: string, email: string, password: string) {
    const data = await $fetch<{ user: PublicUser }>('/api/auth/register', {
      method: 'POST',
      body: { username, email, password },
    })
    user.value = data.user
    return data.user
  }

  async function login(username: string, password: string) {
    const data = await $fetch<{ user: PublicUser }>('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    user.value = data.user
    return data.user
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  return {
    user,
    loading,
    initialized,
    isLoggedIn,
    isAdmin,
    isTeacher,
    canAccessSettings,
    subscriptionTier,
    aiCreditsRemaining,
    hasAICredits,
    canUseAI,
    subscriptionExpired,
    fetchMe,
    register,
    login,
    logout,
  }
})
