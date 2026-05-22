<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
const store = useStudyFlowStore()
onMounted(() => store.loadFromStorage())
</script>
