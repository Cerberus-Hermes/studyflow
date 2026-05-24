import { defineStore } from 'pinia'

export interface Task {
  id: number
  text: string
  priority: number
  done: boolean
  createdAt: string
}

export interface Goal {
  id: number
  text: string
  date: string
  done: boolean
}

export interface StudyPlan {
  id: number
  subject: string
  date: string
}

export interface Deadline {
  id: number
  text: string
  date: string
  done: boolean
}

export interface CalendarEntry {
  id: number
  date: string
  text: string
  type: 'deadline' | 'goal'
  done: boolean
}

export const useStudyFlowStore = defineStore('studyflow', () => {
  // State
  const tasks = ref<Task[]>([])
  const goals = ref<Goal[]>([])
  const studyPlans = ref<StudyPlan[]>([])
  const deadlines = ref<Deadline[]>([])
  const calendarEntries = ref<CalendarEntry[]>([])
  const completedItems = ref<string[]>([])
  const currentWeek = ref(new Date())
  const currentMonth = ref(new Date())
  const darkMode = ref(true)

  // Load from localStorage
  const loadFromStorage = () => {
    if (process.client) {
      tasks.value = JSON.parse(localStorage.getItem('sf_tasks') || '[]')
      goals.value = JSON.parse(localStorage.getItem('sf_goals') || '[]')
      studyPlans.value = JSON.parse(localStorage.getItem('sf_study') || '[]')
      deadlines.value = JSON.parse(localStorage.getItem('sf_deadlines') || '[]')
      calendarEntries.value = JSON.parse(localStorage.getItem('sf_calendar') || '[]')
      completedItems.value = JSON.parse(localStorage.getItem('sf_completed') || '[]')
      const savedDark = localStorage.getItem('sf_dark')
      darkMode.value = savedDark === null ? true : savedDark === 'true'
      if (darkMode.value) document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    }
  }

  const saveToStorage = () => {
    if (process.client) {
      localStorage.setItem('sf_tasks', JSON.stringify(tasks.value))
      localStorage.setItem('sf_goals', JSON.stringify(goals.value))
      localStorage.setItem('sf_study', JSON.stringify(studyPlans.value))
      localStorage.setItem('sf_deadlines', JSON.stringify(deadlines.value))
      localStorage.setItem('sf_calendar', JSON.stringify(calendarEntries.value))
      localStorage.setItem('sf_completed', JSON.stringify(completedItems.value))
      localStorage.setItem('sf_dark', String(darkMode.value))
    }
  }

  // Watchers
  watch([tasks, goals, studyPlans, deadlines, calendarEntries, completedItems, darkMode], saveToStorage, { deep: true })

  // Actions
  const addTask = (text: string, priority: number) => {
    tasks.value.push({
      id: Date.now(),
      text,
      priority,
      done: false,
      createdAt: new Date().toISOString(),
    })
  }

  const completeTask = (id: number) => {
    const t = tasks.value.find(x => x.id === id)
    if (t) {
      t.done = true
      completedItems.value.push(`Aufgabe: ${t.text}`)
    }
  }

  const addGoal = (text: string, date: string) => {
    goals.value.push({ id: Date.now(), text, date, done: false })
    calendarEntries.value.push({
      id: Date.now() + Math.random(),
      date,
      text,
      type: 'goal',
      done: false,
    })
  }

  const completeGoal = (id: number) => {
    const g = goals.value.find(x => x.id === id)
    if (g) {
      g.done = true
      completedItems.value.push(`Ziel: ${g.text}`)
    }
  }

  const addStudyPlan = (subject: string, date: string) => {
    studyPlans.value.push({ id: Date.now(), subject, date })
  }

  const addDeadline = (text: string, date: string) => {
    deadlines.value.push({ id: Date.now(), text, date, done: false })
    calendarEntries.value.push({
      id: Date.now() + Math.random(),
      date,
      text,
      type: 'deadline',
      done: false,
    })
  }

  const completeDeadline = (id: number) => {
    const d = deadlines.value.find(x => x.id === id)
    if (d) {
      d.done = true
      completedItems.value.push(`Deadline: ${d.text}`)
    }
  }

  const completeCalendarEntry = (id: number) => {
    const e = calendarEntries.value.find(x => x.id === id)
    if (e) {
      e.done = true
      completedItems.value.push(`Kalender: ${e.text}`)
    }
  }

  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value
    if (darkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

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

  return {
    tasks, goals, studyPlans, deadlines, calendarEntries, completedItems,
    currentWeek, currentMonth, darkMode,
    loadFromStorage, saveToStorage,
    addTask, completeTask,
    addGoal, completeGoal,
    addStudyPlan,
    addDeadline, completeDeadline,
    completeCalendarEntry,
    toggleDarkMode, changeWeek, changeMonth,
    activeTasks, doneTasks, activeGoals, doneGoals, activeDeadlines, doneDeadlines, upcomingStudyPlans,
    weekDays, monthName, monthDays, entriesForDay,
  }
})
