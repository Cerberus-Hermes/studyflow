import { defineStore } from 'pinia'

export interface Task {
  id: string
  text: string
  priority: number
  done: boolean
  createdAt: string
}

export interface Goal {
  id: string
  text: string
  date: string
  done: boolean
}

export interface StudyPlan {
  id: string
  subject: string
  date: string
}

export interface Deadline {
  id: string
  text: string
  date: string
  done: boolean
}

export interface CalendarEntry {
  id: string
  date: string
  text: string
  type: 'deadline' | 'goal'
  done: boolean
}

export interface CompletedItem {
  id: string
  text: string
  createdAt: string
}

export const useStudyFlowStore = defineStore('studyflow', () => {
  // State
  const tasks = ref<Task[]>([])
  const goals = ref<Goal[]>([])
  const studyPlans = ref<StudyPlan[]>([])
  const deadlines = ref<Deadline[]>([])
  const calendarEntries = ref<CalendarEntry[]>([])
  const completedItems = ref<CompletedItem[]>([])
  const currentWeek = ref(new Date())
  const currentMonth = ref(new Date())
  const darkMode = ref(true)
  const loading = ref(false)

  // Load dark mode from localStorage (UI preference only)
  const loadDarkMode = () => {
    if (process.client) {
      const savedDark = localStorage.getItem('sf_dark')
      darkMode.value = savedDark === null ? true : savedDark === 'true'
      if (darkMode.value) document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    }
  }

  const saveDarkMode = () => {
    if (process.client) {
      localStorage.setItem('sf_dark', String(darkMode.value))
    }
  }

  watch(darkMode, saveDarkMode)

  // Load all data from server
  async function loadAllData() {
    loading.value = true
    try {
      const [tRes, gRes, sRes, dRes, cRes, compRes] = await Promise.all([
        $fetch<{ tasks: Task[] }>('/api/tasks').catch(() => ({ tasks: [] })),
        $fetch<{ goals: Goal[] }>('/api/goals').catch(() => ({ goals: [] })),
        $fetch<{ studyPlans: StudyPlan[] }>('/api/study-plans').catch(() => ({ studyPlans: [] })),
        $fetch<{ deadlines: Deadline[] }>('/api/deadlines').catch(() => ({ deadlines: [] })),
        $fetch<{ calendarEntries: CalendarEntry[] }>('/api/calendar-entries').catch(() => ({ calendarEntries: [] })),
        $fetch<{ completedItems: CompletedItem[] }>('/api/completed-items').catch(() => ({ completedItems: [] })),
      ])
      tasks.value = tRes.tasks
      goals.value = gRes.goals
      studyPlans.value = sRes.studyPlans
      deadlines.value = dRes.deadlines
      calendarEntries.value = cRes.calendarEntries
      completedItems.value = compRes.completedItems
    } finally {
      loading.value = false
    }
  }

  // Tasks
  async function addTask(text: string, priority: number) {
    const res = await $fetch<{ task: Task }>('/api/tasks', {
      method: 'POST',
      body: { text, priority },
    })
    tasks.value.push(res.task)
  }

  async function completeTask(id: string) {
    const res = await $fetch<{ task: Task }>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: { done: true },
    })
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) tasks.value[idx] = res.task
    const today = new Date().toLocaleDateString('de-DE')
    const text = tasks.value.find(t => t.id === id)?.text || ''
    await addCompletedItem(`Aufgabe: ${text} (${today})`)
  }

  async function deleteTask(id: string) {
    await $fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    tasks.value = tasks.value.filter(t => t.id !== id)
  }

  // Goals
  async function addGoal(text: string, date: string) {
    const [gRes, cRes] = await Promise.all([
      $fetch<{ goal: Goal }>('/api/goals', {
        method: 'POST',
        body: { text, date },
      }),
      $fetch<{ calendarEntry: CalendarEntry }>('/api/calendar-entries', {
        method: 'POST',
        body: { date, text, type: 'goal' },
      }),
    ])
    goals.value.push(gRes.goal)
    calendarEntries.value.push(cRes.calendarEntry)
  }

  async function completeGoal(id: string) {
    const res = await $fetch<{ goal: Goal }>(`/api/goals/${id}`, {
      method: 'PATCH',
      body: { done: true },
    })
    const idx = goals.value.findIndex(g => g.id === id)
    if (idx !== -1) goals.value[idx] = res.goal
    const today = new Date().toLocaleDateString('de-DE')
    const text = goals.value.find(g => g.id === id)?.text || ''
    await addCompletedItem(`Ziel: ${text} (${today})`)
  }

  async function deleteGoal(id: string) {
    await $fetch(`/api/goals/${id}`, { method: 'DELETE' })
    goals.value = goals.value.filter(g => g.id !== id)
  }

  // Study Plans
  async function addStudyPlan(subject: string, date: string) {
    const res = await $fetch<{ studyPlan: StudyPlan }>('/api/study-plans', {
      method: 'POST',
      body: { subject, date },
    })
    studyPlans.value.push(res.studyPlan)
  }

  async function deleteStudyPlan(id: string) {
    await $fetch(`/api/study-plans/${id}`, { method: 'DELETE' })
    studyPlans.value = studyPlans.value.filter(s => s.id !== id)
  }

  // Deadlines
  async function addDeadline(text: string, date: string) {
    const [dRes, cRes] = await Promise.all([
      $fetch<{ deadline: Deadline }>('/api/deadlines', {
        method: 'POST',
        body: { text, date },
      }),
      $fetch<{ calendarEntry: CalendarEntry }>('/api/calendar-entries', {
        method: 'POST',
        body: { date, text, type: 'deadline' },
      }),
    ])
    deadlines.value.push(dRes.deadline)
    calendarEntries.value.push(cRes.calendarEntry)
  }

  async function completeDeadline(id: string) {
    const res = await $fetch<{ deadline: Deadline }>(`/api/deadlines/${id}`, {
      method: 'PATCH',
      body: { done: true },
    })
    const idx = deadlines.value.findIndex(d => d.id === id)
    if (idx !== -1) deadlines.value[idx] = res.deadline
    const today = new Date().toLocaleDateString('de-DE')
    const text = deadlines.value.find(d => d.id === id)?.text || ''
    await addCompletedItem(`Deadline: ${text} (${today})`)
  }

  async function deleteDeadline(id: string) {
    await $fetch(`/api/deadlines/${id}`, { method: 'DELETE' })
    deadlines.value = deadlines.value.filter(d => d.id !== id)
  }

  // Calendar Entries
  async function completeCalendarEntry(id: string) {
    const res = await $fetch<{ calendarEntry: CalendarEntry }>(`/api/calendar-entries/${id}`, {
      method: 'PATCH',
      body: { done: true },
    })
    const idx = calendarEntries.value.findIndex(e => e.id === id)
    if (idx !== -1) calendarEntries.value[idx] = res.calendarEntry
    const today = new Date().toLocaleDateString('de-DE')
    const text = calendarEntries.value.find(e => e.id === id)?.text || ''
    await addCompletedItem(`Kalender: ${text} (${today})`)
  }

  async function moveCalendarEntry(id: string, newDate: string) {
    const res = await $fetch<{ calendarEntry: CalendarEntry }>(`/api/calendar-entries/${id}`, {
      method: 'PATCH',
      body: { date: newDate },
    })
    const idx = calendarEntries.value.findIndex(e => e.id === id)
    if (idx !== -1) calendarEntries.value[idx] = res.calendarEntry
    // Also update corresponding goal/deadline
    const goal = goals.value.find(g => g.text === res.calendarEntry.text && !g.done)
    if (goal) {
      const gRes = await $fetch<{ goal: Goal }>(`/api/goals/${goal.id}`, {
        method: 'PATCH',
        body: { date: newDate },
      })
      const gIdx = goals.value.findIndex(g => g.id === goal.id)
      if (gIdx !== -1) goals.value[gIdx] = gRes.goal
    }
    const deadline = deadlines.value.find(d => d.text === res.calendarEntry.text && !d.done)
    if (deadline) {
      const dRes = await $fetch<{ deadline: Deadline }>(`/api/deadlines/${deadline.id}`, {
        method: 'PATCH',
        body: { date: newDate },
      })
      const dIdx = deadlines.value.findIndex(d => d.id === deadline.id)
      if (dIdx !== -1) deadlines.value[dIdx] = dRes.deadline
    }
  }

  // Completed Items
  async function addCompletedItem(text: string) {
    const res = await $fetch<{ completedItem: CompletedItem }>('/api/completed-items', {
      method: 'POST',
      body: { text },
    })
    completedItems.value.unshift(res.completedItem)
  }

  async function clearCompletedItems() {
    await $fetch('/api/completed-items', { method: 'DELETE' })
    completedItems.value = []
  }

  // Dark Mode
  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value
    if (darkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Week / Month navigation
  const changeWeek = (dir: number) => {
    currentWeek.value = new Date(currentWeek.value.getTime() + dir * 7 * 24 * 60 * 60 * 1000)
  }

  const changeMonth = (dir: number) => {
    const d = new Date(currentMonth.value)
    d.setMonth(d.getMonth() + dir)
    currentMonth.value = d
  }

  // Getters
  const activeTasks = computed(() => tasks.value.filter(t => !t.done).sort((a, b) => a.priority - b.priority))
  const doneTasks = computed(() => tasks.value.filter(t => t.done))
  const activeGoals = computed(() => goals.value.filter(g => !g.done))
  const doneGoals = computed(() => goals.value.filter(g => g.done))
  const activeDeadlines = computed(() => deadlines.value.filter(d => !d.done))
  const doneDeadlines = computed(() => deadlines.value.filter(d => d.done))
  const upcomingStudyPlans = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return studyPlans.value.filter(s => s.date >= today).sort((a, b) => a.date.localeCompare(b.date))
  })

  const weekStart = computed(() => {
    const d = new Date(currentWeek.value)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
  })

  const weekDays = computed(() => {
    const days = []
    const start = new Date(weekStart.value)
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      days.push(d)
    }
    return days
  })

  const monthName = computed(() => {
    return currentMonth.value.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
  })

  const monthDays = computed(() => {
    const year = currentMonth.value.getFullYear()
    const month = currentMonth.value.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay() || 7 // 1=Mo, 7=So

    const days = []
    // Padding for days before month starts
    for (let i = 1; i < startDayOfWeek; i++) {
      days.push(null)
    }
    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  })

  const entriesForDay = (date: Date) => {
    const ds = date.toISOString().split('T')[0]
    return calendarEntries.value.filter(e => e.date === ds && !e.done)
  }

  // Streak tracking
  const streak = computed(() => {
    const dates = completedItems.value.map(item => {
      const match = item.text.match(/\(([^)]+)\)/)
      return match ? match[1] : null
    }).filter(Boolean).sort().reverse()

    if (dates.length === 0) return { current: 0, best: 0 }

    let current = 0
    let best = 0
    let temp = 1

    for (let i = 0; i < dates.length - 1; i++) {
      const d1 = new Date(dates[i]!.split('.').reverse().join('-'))
      const d2 = new Date(dates[i + 1]!.split('.').reverse().join('-'))
      const diff = Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24))
      if (diff === 1) temp++
      else {
        best = Math.max(best, temp)
        temp = 1
      }
    }
    best = Math.max(best, temp)

    // Check current streak
    const today = new Date().toLocaleDateString('de-DE')
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('de-DE')

    if (dates.includes(today)) current = 1
    else if (dates.includes(yesterday)) current = 1
    else return { current: 0, best }

    for (let i = 1; i < 365; i++) {
      const d = new Date(Date.now() - i * 86400000).toLocaleDateString('de-DE')
      if (dates.includes(d)) current++
      else break
    }

    return { current, best }
  })

  // Export data
  const exportData = () => {
    const data = {
      tasks: tasks.value,
      goals: goals.value,
      studyPlans: studyPlans.value,
      deadlines: deadlines.value,
      completedItems: completedItems.value.map(c => c.text),
      exportedAt: new Date().toISOString(),
    }
    return JSON.stringify(data, null, 2)
  }

  const exportCSV = () => {
    let csv = 'Typ,Text,Datum,Status,Priorität\n'
    tasks.value.forEach(t => csv += `Task,"${t.text}",,"${t.done ? 'Erledigt' : 'Offen'}",${t.priority}\n`)
    goals.value.forEach(g => csv += `Ziel,"${g.text}",${g.date},"${g.done ? 'Erledigt' : 'Offen'}",\n`)
    deadlines.value.forEach(d => csv += `Deadline,"${d.text}",${d.date},"${d.done ? 'Erledigt' : 'Offen'}",\n`)
    studyPlans.value.forEach(s => csv += `Lernplan,"${s.subject}",${s.date},,\n`)
    return csv
  }

  return {
    tasks, goals, studyPlans, deadlines, calendarEntries, completedItems,
    currentWeek, currentMonth, darkMode, loading,
    loadAllData, loadDarkMode,
    addTask, completeTask, deleteTask,
    addGoal, completeGoal, deleteGoal,
    addStudyPlan, deleteStudyPlan,
    addDeadline, completeDeadline, deleteDeadline,
    completeCalendarEntry, moveCalendarEntry,
    addCompletedItem, clearCompletedItems,
    toggleDarkMode, changeWeek, changeMonth,
    activeTasks, doneTasks, activeGoals, doneGoals, activeDeadlines, doneDeadlines, upcomingStudyPlans,
    weekDays, monthName, monthDays, entriesForDay,
    streak, exportData, exportCSV,
  }
})
