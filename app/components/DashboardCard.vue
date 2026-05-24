<template>
  <div class="sf-card p-6" :style="`animation: slideInUp 0.5s ease ${delay}s forwards; opacity: 0;`">
    <div class="flex items-center gap-3 mb-4">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" :style="{ background: iconBg }">{{ icon }}</div>
      <div>
        <h3 class="text-lg font-bold" style="color: var(--text-primary);">{{ title }}</h3>
        <p class="text-xs" style="color: var(--text-muted);">{{ total }} Einträge insgesamt</p>
      </div>
    </div>

    <div class="flex items-center justify-center mb-4" style="height: 180px;">
      <Pie v-if="chartData.labels.length > 0" :data="chartData" :options="chartOptions" />
      <div v-else class="text-center" style="color: var(--text-muted);">
        <div class="text-3xl mb-2">📊</div>
        <p class="text-sm">Noch keine Daten</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div class="p-3 rounded-xl text-center" style="background: var(--bg-tertiary);">
        <p class="text-2xl font-bold" :style="{ color: activeColor }">{{ active }}</p>
        <p class="text-xs" style="color: var(--text-muted);">Offen</p>
      </div>
      <div class="p-3 rounded-xl text-center" style="background: var(--bg-tertiary);">
        <p class="text-2xl font-bold" :style="{ color: doneColor }">{{ done }}</p>
        <p class="text-xs" style="color: var(--text-muted);">Erledigt</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  icon: String,
  title: String,
  active: Number,
  done: Number,
  activeColor: { type: String, default: '#e07a5f' },
  doneColor: { type: String, default: '#2a9d8f' },
  iconBg: String,
  delay: { type: Number, default: 0 },
})

const total = computed(() => props.active + props.done)

const chartData = computed(() => ({
  labels: ['Offen', 'Erledigt'],
  datasets: [{
    data: [props.active, props.done],
    backgroundColor: [props.activeColor, props.doneColor],
    borderColor: 'var(--bg-secondary)',
    borderWidth: 3,
    hoverOffset: 8,
  }],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: 'var(--text-secondary)',
        usePointStyle: true,
        padding: 15,
        font: { size: 11 },
      },
    },
    tooltip: {
      backgroundColor: 'var(--bg-tertiary)',
      titleColor: 'var(--text-primary)',
      bodyColor: 'var(--text-secondary)',
      borderColor: 'var(--border-subtle)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
    },
  },
  cutout: '45%',
}
</script>
