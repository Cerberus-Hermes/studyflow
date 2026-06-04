<template>
  <div class="sf-card sf-dashboard-card group" :style="`animation-delay: ${delay}s;`">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-4">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg icon-box" :style="{ background: iconBg }">{{ icon }}</div>
      <div class="flex-1 min-w-0">
        <h3 class="text-base font-bold truncate" style="color: var(--text-primary);">{{ title }}</h3>
        <p class="text-xs" style="color: var(--text-muted);">{{ total }} Einträge</p>
      </div>
    </div>

    <!-- Mini Donut + Stats side-by-side -->
    <div class="flex items-center gap-4">
      <div class="shrink-0" style="width: 110px; height: 110px;">
        <Doughnut v-if="chartData.labels.length > 0 && total > 0" :data="chartData" :options="chartOptions" />
        <div v-else class="w-full h-full rounded-full flex items-center justify-center" style="background: var(--bg-tertiary);">
          <span class="text-2xl opacity-30">📊</span>
        </div>
      </div>

      <div class="flex-1 space-y-3">
        <!-- Active stat -->
        <div class="flex items-center gap-2.5">
          <div class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: activeColor, boxShadow: `0 0 8px ${activeColor}66` }"></div>
          <div class="flex-1 min-w-0">
            <p class="text-xs" style="color: var(--text-muted);">Offen</p>
            <p class="text-xl font-bold leading-tight" :style="{ color: activeColor }">{{ active }}</p>
          </div>
        </div>
        <!-- Done stat -->
        <div class="flex items-center gap-2.5">
          <div class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: doneColor, boxShadow: `0 0 8px ${doneColor}66` }"></div>
          <div class="flex-1 min-w-0">
            <p class="text-xs" style="color: var(--text-muted);">Erledigt</p>
            <p class="text-xl font-bold leading-tight" :style="{ color: doneColor }">{{ done }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Mini progress bar -->
    <div class="mt-4">
      <div class="w-full h-1.5 rounded-full overflow-hidden" style="background: var(--bg-tertiary);">
        <div
          class="h-full rounded-full transition-all duration-700 ease-out"
          :style="{ width: progressPct + '%', background: doneColor }"
        ></div>
      </div>
      <p class="text-[11px] mt-1.5 text-right" style="color: var(--text-muted);">
        {{ progressPct }}% erledigt
      </p>
    </div>
  </div>
</template>

<script setup>
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'

ChartJS.register(ArcElement, Tooltip)

const props = defineProps({
  icon: String,
  title: String,
  active: { type: Number, default: 0 },
  done: { type: Number, default: 0 },
  activeColor: { type: String, default: '#e07a5f' },
  doneColor: { type: String, default: '#2a9d8f' },
  iconBg: String,
  delay: { type: Number, default: 0 },
})

const total = computed(() => props.active + props.done)
const progressPct = computed(() => total.value > 0 ? Math.round((props.done / total.value) * 100) : 0)

const chartData = computed(() => ({
  labels: ['Offen', 'Erledigt'],
  datasets: [{
    data: [props.active, props.done],
    backgroundColor: [props.activeColor, props.doneColor],
    borderWidth: 0,
    hoverOffset: 4,
  }],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '72%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'var(--bg-tertiary)',
      titleColor: 'var(--text-primary)',
      bodyColor: 'var(--text-secondary)',
      borderColor: 'var(--border-medium)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 10,
      displayColors: true,
      boxPadding: 4,
    },
  },
}
</script>

<style scoped>
.sf-dashboard-card {
  padding: 20px;
  animation: slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.icon-box {
  transition: transform 0.3s ease;
}

.group:hover .icon-box {
  transform: scale(1.08) rotate(-4deg);
}
</style>
