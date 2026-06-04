<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
const store = useStudyFlowStore()
const auth = useAuthStore()

onMounted(async () => {
  store.loadDarkMode()
  await auth.fetchMe()
  if (auth.isLoggedIn) {
    await store.loadAllData()
  }
})
</script>
