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
  const loading = ref(false)
  const initialized = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const canAccessSettings = computed(() => isAdmin.value)

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
    canAccessSettings,
    fetchMe,
    register,
    login,
    logout,
  }
})
