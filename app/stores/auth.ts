import { defineStore } from 'pinia'

export interface PublicUser {
  id: string
  username: string
  email: string
  role: 'user' | 'admin'
  createdAt: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<PublicUser | null>(null)
  const adminUnlocked = ref(false)
  const loading = ref(false)
  const initialized = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin' || adminUnlocked.value)
  const canAccessSettings = computed(() => isAdmin.value)

  async function fetchMe() {
    loading.value = true
    try {
      const data = await $fetch<{ user: PublicUser | null, adminUnlocked: boolean }>('/api/auth/me')
      user.value = data.user
      adminUnlocked.value = data.adminUnlocked
    } catch {
      user.value = null
      adminUnlocked.value = false
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
    adminUnlocked.value = data.user.role === 'admin'
    return data.user
  }

  async function login(username: string, password: string) {
    const data = await $fetch<{ user: PublicUser }>('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    user.value = data.user
    adminUnlocked.value = data.user.role === 'admin'
    return data.user
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    adminUnlocked.value = false
  }

  async function unlockAdmin(password: string) {
    await $fetch('/api/auth/admin-unlock', {
      method: 'POST',
      body: { password },
    })
    adminUnlocked.value = true
  }

  return {
    user,
    adminUnlocked,
    loading,
    initialized,
    isLoggedIn,
    isAdmin,
    canAccessSettings,
    fetchMe,
    register,
    login,
    logout,
    unlockAdmin,
  }
})
