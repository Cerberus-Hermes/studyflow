<template>
  <div>
    <!-- ========================= -->
    <!-- DASHBOARD TAB -->
    <!-- ========================= -->
    <div v-if="activeTab === 'dashboard'" class="animate-fade-in space-y-8">
      <!-- Hero -->
      <div class="sf-card p-8 relative overflow-hidden" style="animation: slideInUp 0.5s ease forwards;">
        <div class="absolute top-0 right-0 w-64 h-64 opacity-10" style="background: radial-gradient(circle, var(--accent-purple), transparent);"></div>
        <div class="relative z-10">
          <h2 class="text-2xl font-bold mb-2" style="color: var(--text-primary);">📊 Dein Dashboard</h2>
          <p class="text-sm" style="color: var(--text-muted);">Übersicht aller deiner Lernaktivitäten — offen und erledigt.</p>
        </div>
      </div>

      <!-- Streak + Progress Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <!-- Streak -->
        <div class="sf-card p-6 text-center" style="animation: slideInUp 0.5s ease 0.05s forwards; opacity: 0;">
          <div class="text-4xl mb-3">🔥</div>
          <p class="text-3xl font-bold mb-1" style="color: var(--accent-warm);">{{ store.streak.current }}</p>
          <p class="text-xs" style="color: var(--text-muted);">Tage in Folge</p>
          <div v-if="store.streak.best > 0" class="mt-2 text-xs" style="color: var(--text-muted);">
            Best: {{ store.streak.best }} 🏆
          </div>
        </div>

        <!-- Weekly Progress -->
        <div class="sf-card p-6" style="animation: slideInUp 0.5s ease 0.1s forwards; opacity: 0;">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-semibold" style="color: var(--text-primary);">Wochenfortschritt</span>
            <span class="text-xs font-bold" style="color: var(--accent-cool);">{{ weeklyProgress }}%</span>
          </div>
          <div class="w-full h-3 rounded-full overflow-hidden" style="background: var(--border-subtle);">
            <div class="h-full rounded-full transition-all duration-500 sf-animated-gradient" :style="{ width: weeklyProgress + '%' }"></div>
          </div>
          <p class="text-xs mt-2" style="color: var(--text-muted);">
            {{ store.doneTasks.length + store.doneGoals.length + store.doneDeadlines.length }} / {{ store.tasks.length + store.goals.length + store.deadlines.length }} erledigt
          </p>
        </div>

        <!-- Today's Focus -->
        <div class="sf-card p-6" style="animation: slideInUp 0.5s ease 0.15s forwards; opacity: 0;">
          <div class="text-sm font-semibold mb-3" style="color: var(--text-primary);">🎯 Heutiger Fokus</div>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span style="color: var(--text-muted);">Dringende Tasks</span>
              <span class="font-bold" style="color: var(--accent-warm);">{{ urgentToday }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span style="color: var(--text-muted);">Deadlines diese Woche</span>
              <span class="font-bold" style="color: var(--accent-rose);">{{ deadlinesThisWeek }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span style="color: var(--text-muted);">Lernpläne</span>
              <span class="font-bold" style="color: var(--accent-purple);">{{ store.upcomingStudyPlans.length }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pie Charts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard icon="📝" title="Aufgaben" :active="store.activeTasks.length" :done="store.doneTasks.length" active-color="#e07a5f" done-color="#2a9d8f" icon-bg="rgba(224, 122, 95, 0.15)" :delay="0.1" />
        <DashboardCard icon="🎯" title="Ziele" :active="store.activeGoals.length" :done="store.doneGoals.length" active-color="#2a9d8f" done-color="#9b5de5" icon-bg="rgba(42, 157, 143, 0.15)" :delay="0.15" />
        <DashboardCard icon="⏰" title="Deadlines" :active="store.activeDeadlines.length" :done="store.doneDeadlines.length" active-color="#f15bb5" done-color="#2a9d8f" icon-bg="rgba(241, 91, 181, 0.15)" :delay="0.2" />
        <DashboardCard icon="📚" title="Lernpläne" :active="store.upcomingStudyPlans.length" :done="store.studyPlans.length - store.upcomingStudyPlans.length" active-color="#9b5de5" done-color="#f4a261" icon-bg="rgba(155, 93, 229, 0.15)" :delay="0.25" />
      </div>

      <!-- Color-coded To-Do + Export -->
      <div class="sf-card p-6" style="animation: slideInUp 0.5s ease 0.3s forwards; opacity: 0;">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: rgba(224, 122, 95, 0.15);">📝</div>
            <h3 class="text-lg font-bold" style="color: var(--text-primary);">Offene Aufgaben — nach Priorität</h3>
          </div>
          <div class="flex gap-2">
            <button @click="exportJSON" class="sf-btn sf-btn-secondary text-xs py-2">💾 JSON</button>
            <button @click="exportCSV" class="sf-btn sf-btn-secondary text-xs py-2">📊 CSV</button>
          </div>
        </div>

        <div class="flex gap-4 mb-4 text-xs" style="color: var(--text-muted);">
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full" style="background: #e07a5f;"></span> Dringend</span>
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full" style="background: #f4a261;"></span> Wichtig</span>
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full" style="background: #2a9d8f;"></span> Optional</span>
        </div>

        <ul class="space-y-2">
          <li v-for="task in store.activeTasks" :key="task.id"
              class="flex items-center gap-3 p-4 rounded-xl"
              :style="{ background: 'var(--bg-tertiary)', borderLeft: `4px solid ${priorityColor(task.priority)}` }">
            <span class="sf-badge text-white shrink-0 text-xs" :style="{ background: priorityColor(task.priority) }">{{ priorityLabel(task.priority) }}</span>
            <span class="text-sm" style="color: var(--text-primary);">{{ task.text }}</span>
          </li>
          <li v-if="store.activeTasks.length === 0" class="text-center py-8" style="color: var(--text-muted);"><div class="text-3xl mb-2">🎉</div><p class="text-sm">Alles erledigt!</p></li>
        </ul>
      </div>
    </div>

    <!-- ========================= -->
    <!-- ORGANISATION TAB -->
    <!-- ========================= -->
    <div v-else-if="activeTab === 'orga'" class="animate-fade-in space-y-8">
      <div class="sf-card p-8 relative overflow-hidden" style="animation: slideInUp 0.5s ease forwards;">
        <div class="absolute top-0 right-0 w-64 h-64 opacity-10" style="background: radial-gradient(circle, var(--accent-warm), transparent);"></div>
        <div class="relative z-10">
          <h2 class="text-2xl font-bold mb-2" style="color: var(--text-primary);">Willkommen zurück! 👋</h2>
          <p class="text-sm" style="color: var(--text-muted);">
            Du hast <span class="font-bold" style="color: var(--accent-warm);">{{ store.activeTasks.length }}</span> offene Aufgaben,
            <span class="font-bold" style="color: var(--accent-cool);">{{ store.activeGoals.length }}</span> Ziele und
            <span class="font-bold" style="color: var(--accent-rose);">{{ store.activeDeadlines.length }}</span> Deadlines diese Woche.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <button @click="openCompletedModal" class="sf-card sf-stat-card group text-left relative overflow-hidden" style="animation: slideInUp 0.5s ease 0.05s forwards; opacity: 0;">
          <div class="flex items-center justify-between mb-3"><div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style="background: rgba(224, 122, 95, 0.15);">📝</div><span class="text-xs font-medium px-2.5 py-1 rounded-full" style="background: rgba(224, 122, 95, 0.1); color: var(--accent-warm);">Tasks</span></div>
          <p class="text-4xl font-bold mb-1" style="color: var(--accent-warm);">{{ store.activeTasks.length }}</p>
          <p class="text-xs" style="color: var(--text-muted);">Offene Aufgaben</p>
        </button>
        <button @click="openCompletedModal" class="sf-card sf-stat-card group text-left relative overflow-hidden" style="animation: slideInUp 0.5s ease 0.1s forwards; opacity: 0;">
          <div class="flex items-center justify-between mb-3"><div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style="background: rgba(42, 157, 143, 0.15);">🎯</div><span class="text-xs font-medium px-2.5 py-1 rounded-full" style="background: rgba(42, 157, 143, 0.1); color: var(--accent-cool);">Ziele</span></div>
          <p class="text-4xl font-bold mb-1" style="color: var(--accent-cool);">{{ store.activeGoals.length }}</p>
          <p class="text-xs" style="color: var(--text-muted);">Offene Ziele</p>
        </button>
        <button @click="openCompletedModal" class="sf-card sf-stat-card group text-left relative overflow-hidden" style="animation: slideInUp 0.5s ease 0.15s forwards; opacity: 0;">
          <div class="flex items-center justify-between mb-3"><div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style="background: rgba(241, 91, 181, 0.15);">⏰</div><span class="text-xs font-medium px-2.5 py-1 rounded-full" style="background: rgba(241, 91, 181, 0.1); color: var(--accent-rose);">Deadlines</span></div>
          <p class="text-4xl font-bold mb-1" style="color: var(--accent-rose);">{{ store.activeDeadlines.length }}</p>
          <p class="text-xs" style="color: var(--text-muted);">Bald fällig</p>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- To-Do -->
        <div class="sf-card p-6" style="animation: slideInUp 0.5s ease 0.2s forwards; opacity: 0;">
          <div class="flex items-center gap-3 mb-5"><div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: rgba(224, 122, 95, 0.15);">📝</div><h3 class="text-lg font-bold" style="color: var(--text-primary);">Aufgaben</h3><span class="ml-auto text-xs font-bold px-3 py-1 rounded-full" style="background: rgba(224, 122, 95, 0.1); color: var(--accent-warm);">{{ store.activeTasks.length }}</span></div>
          <div class="space-y-3 mb-5">
            <input v-model="taskInput" @keyup.enter="handleAddTask" placeholder="Was steht an?" class="sf-input" />
            <div class="flex gap-2">
              <select v-model="taskPriority" class="sf-input sf-select flex-1 text-sm"><option value="1">🔴 Dringend</option><option value="2">🟠 Wichtig</option><option value="3">🟢 Optional</option></select>
              <button @click="handleAddTask" class="sf-btn sf-btn-primary px-6">+</button>
            </div>
          </div>
          <ul class="space-y-2 max-h-72 overflow-y-auto pr-1">
            <li v-for="task in store.activeTasks" :key="task.id" class="group flex items-center justify-between gap-3 p-4 rounded-xl transition-all duration-200 hover:scale-[1.01]" :style="{ background: 'var(--bg-tertiary)', borderLeft: `3px solid ${priorityColor(task.priority)}` }">
              <div class="flex items-center gap-3 min-w-0"><span class="sf-badge text-white shrink-0 text-xs" :style="{ background: priorityColor(task.priority) }">{{ priorityLabel(task.priority) }}</span><span class="truncate text-sm" style="color: var(--text-primary);">{{ task.text }}</span></div>
              <button @click="store.completeTask(task.id)" class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110" style="background: var(--accent-cool);"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></button>
            </li>
            <li v-if="store.activeTasks.length === 0" class="text-center py-8" style="color: var(--text-muted);"><div class="text-3xl mb-2">🎉</div><p class="text-sm">Alles erledigt!</p></li>
          </ul>
        </div>

        <!-- Ziele -->
        <div class="sf-card p-6" style="animation: slideInUp 0.5s ease 0.25s forwards; opacity: 0;">
          <div class="flex items-center gap-3 mb-5"><div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: rgba(42, 157, 143, 0.15);">🎯</div><h3 class="text-lg font-bold" style="color: var(--text-primary);">Ziele</h3><span class="ml-auto text-xs font-bold px-3 py-1 rounded-full" style="background: rgba(42, 157, 143, 0.1); color: var(--accent-cool);">{{ store.activeGoals.length }}</span></div>
          <div class="space-y-3 mb-5">
            <input v-model="goalInput" @keyup.enter="handleAddGoal" placeholder="Neues Ziel setzen..." class="sf-input" />
            <div class="flex gap-2">
              <input v-model="goalDate" type="date" class="sf-input flex-1 text-sm" />
              <button @click="handleAddGoal" class="sf-btn sf-btn-primary px-6" style="background: linear-gradient(135deg, var(--accent-cool), var(--accent-cool-light));">+</button>
            </div>
          </div>
          <ul class="space-y-2 max-h-72 overflow-y-auto pr-1">
            <li v-for="goal in store.activeGoals" :key="goal.id" class="group flex items-center justify-between gap-3 p-4 rounded-xl transition-all duration-200 hover:scale-[1.01]" style="background: var(--bg-tertiary);">
              <div class="min-w-0"><p class="text-sm font-medium" style="color: var(--text-primary);">{{ goal.text }}</p><p class="text-xs mt-0.5" style="color: var(--text-muted);">📅 {{ formatDate(goal.date) }}</p></div>
              <button @click="store.completeGoal(goal.id)" class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110" style="background: var(--accent-cool);"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></button>
            </li>
            <li v-if="store.activeGoals.length === 0" class="text-center py-8" style="color: var(--text-muted);"><div class="text-3xl mb-2">🎯</div><p class="text-sm">Noch keine Ziele gesetzt</p></li>
          </ul>
        </div>

        <!-- Lernplan -->
        <div class="sf-card p-6" style="animation: slideInUp 0.5s ease 0.3s forwards; opacity: 0;">
          <div class="flex items-center gap-3 mb-5"><div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: rgba(155, 93, 229, 0.15);">🧠</div><h3 class="text-lg font-bold" style="color: var(--text-primary);">Lernplan</h3><span class="ml-auto text-xs font-bold px-3 py-1 rounded-full" style="background: rgba(155, 93, 229, 0.1); color: var(--accent-purple);">{{ store.upcomingStudyPlans.length }}</span></div>
          <div class="space-y-3 mb-5">
            <div class="flex gap-2">
              <input v-model="studySubject" @keyup.enter="handleAddStudy" placeholder="Fach..." class="sf-input flex-1 text-sm" />
              <input v-model="studyDate" type="date" class="sf-input w-36 text-sm" />
            </div>
            <button @click="handleAddStudy" class="sf-btn sf-btn-primary w-full text-sm" style="background: linear-gradient(135deg, var(--accent-purple), var(--accent-rose));">📚 Hinzufügen</button>
          </div>
          <ul class="space-y-2 max-h-60 overflow-y-auto pr-1">
            <li v-for="plan in store.upcomingStudyPlans" :key="plan.id" class="flex items-center gap-3 p-3 rounded-xl" style="background: var(--bg-tertiary);">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center text-sm" style="background: rgba(155, 93, 229, 0.15);">📚</div>
              <div class="min-w-0"><p class="text-sm font-medium" style="color: var(--text-primary);">{{ plan.subject }}</p><p class="text-xs" style="color: var(--text-muted);">{{ formatDate(plan.date) }}</p></div>
            </li>
            <li v-if="store.upcomingStudyPlans.length === 0" class="text-center py-6" style="color: var(--text-muted);"><p class="text-sm">Noch keine Lernpläne</p></li>
          </ul>
        </div>

        <!-- Deadlines -->
        <div class="sf-card p-6" style="animation: slideInUp 0.5s ease 0.35s forwards; opacity: 0;">
          <div class="flex items-center gap-3 mb-5"><div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: rgba(241, 91, 181, 0.15);">⏰</div><h3 class="text-lg font-bold" style="color: var(--text-primary);">Deadlines</h3><span class="ml-auto text-xs font-bold px-3 py-1 rounded-full" style="background: rgba(241, 91, 181, 0.1); color: var(--accent-rose);">{{ store.activeDeadlines.length }}</span></div>
          <div class="space-y-3 mb-5">
            <input v-model="deadlineInput" @keyup.enter="handleAddDeadline" placeholder="Was ist fällig?" class="sf-input" />
            <div class="flex gap-2">
              <input v-model="deadlineDate" type="date" class="sf-input flex-1 text-sm" />
              <button @click="handleAddDeadline" class="sf-btn sf-btn-primary px-6" style="background: linear-gradient(135deg, var(--accent-rose), var(--accent-purple));">+</button>
            </div>
          </div>
          <ul class="space-y-2 max-h-72 overflow-y-auto pr-1">
            <li v-for="dl in store.activeDeadlines" :key="dl.id" class="group flex items-center justify-between gap-3 p-4 rounded-xl transition-all duration-200 hover:scale-[1.01]" style="background: var(--bg-tertiary);">
              <div class="min-w-0 flex items-center gap-3"><div class="w-2 h-2 rounded-full shrink-0" style="background: var(--accent-rose);"></div><div><p class="text-sm font-medium" style="color: var(--text-primary);">{{ dl.text }}</p><p class="text-xs mt-0.5" style="color: var(--text-muted);">⏰ {{ formatDate(dl.date) }}</p></div></div>
              <button @click="store.completeDeadline(dl.id)" class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110" style="background: var(--accent-rose);"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></button>
            </li>
            <li v-if="store.activeDeadlines.length === 0" class="text-center py-8" style="color: var(--text-muted);"><div class="text-3xl mb-2">✅</div><p class="text-sm">Keine Deadlines!</p></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- ========================= -->
    <!-- KALENDER TAB -->
    <!-- ========================= -->
    <div v-else-if="activeTab === 'calendar'" class="animate-fade-in space-y-6">
      <div class="sf-card p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: rgba(224, 122, 95, 0.15);">📅</div>
            <h3 class="text-lg font-bold" style="color: var(--text-primary);">{{ calendarMode === 'week' ? 'Wochenübersicht' : 'Monatsübersicht' }}</h3>
          </div>
          <div class="flex items-center gap-2">
            <select v-model="calendarMode" class="sf-input sf-select text-sm py-2 px-3"><option value="week">Woche</option><option value="month">Monat</option></select>
            <button @click="calendarMode === 'week' ? store.changeWeek(-1) : store.changeMonth(-1)" class="sf-btn sf-btn-secondary w-10 h-10 p-0 rounded-xl">⬅</button>
            <span class="text-sm font-semibold px-4 py-2 rounded-xl" style="background: var(--bg-tertiary); color: var(--text-secondary);">{{ calendarMode === 'week' ? weekRange : store.monthName }}</span>
            <button @click="calendarMode === 'week' ? store.changeWeek(1) : store.changeMonth(1)" class="sf-btn sf-btn-secondary w-10 h-10 p-0 rounded-xl">➡</button>
          </div>
        </div>

        <!-- Week View -->
        <div v-if="calendarMode === 'week'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          <div v-for="(day, idx) in store.weekDays" :key="idx"
               class="min-h-[200px] p-4 rounded-xl transition-all duration-200"
               :class="{ 'ring-2 ring-offset-2': isToday(day) }"
               style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle);"
               @dragover.prevent="dragOverDay = day"
               @dragleave="dragOverDay = null"
               @drop.prevent="handleDrop(day)">
            <h4 class="text-xs font-bold mb-3 uppercase tracking-wider" :style="isToday(day) ? { color: 'var(--accent-warm)' } : { color: 'var(--text-muted)' }">
              {{ dayNames[idx] }}
              <span class="block mt-0.5 text-sm font-normal normal-case" style="color: var(--text-secondary);">{{ day.getDate() }}.{{ day.getMonth()+1 }}.</span>
            </h4>
            <div class="space-y-1.5">
              <div v-for="entry in store.entriesForDay(day)" :key="entry.id"
                   class="group text-xs p-2.5 rounded-lg text-white cursor-move transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
                   :style="{ background: entry.type === 'deadline' ? 'var(--accent-rose)' : 'var(--accent-cool)', opacity: dragOverDay === day ? 0.5 : 1 }"
                   draggable="true"
                   @dragstart="dragStart(entry)"
                   @dragend="dragOverDay = null">
                <div class="flex items-center justify-between gap-1">
                  <span class="truncate">{{ entry.text }}</span>
                  <button @click.stop="store.completeCalendarEntry(entry.id)" class="shrink-0 w-5 h-5 rounded flex items-center justify-center bg-white/20 hover:bg-white/30 transition-all">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Month View -->
        <div v-else>
          <div class="grid grid-cols-7 gap-1 mb-1">
            <div v-for="d in ['Mo','Di','Mi','Do','Fr','Sa','So']" :key="d" class="text-center text-xs font-bold py-2 uppercase tracking-wider" style="color: var(--text-muted);">{{ d }}</div>
          </div>
          <div class="grid grid-cols-7 gap-1">
            <div v-for="(day, idx) in store.monthDays" :key="idx"
                 class="min-h-[100px] p-2 rounded-lg transition-all duration-200"
                 :class="day ? 'hover:scale-[1.02] cursor-pointer' : ''"
                 :style="day ? { background: isToday(day) ? 'rgba(224, 122, 95, 0.15)' : 'var(--bg-tertiary)', border: `1px solid ${isToday(day) ? 'var(--accent-warm)' : 'var(--border-subtle)'}` } : { background: 'transparent' }"
                 @dragover.prevent="dragOverDay = day"
                 @dragleave="dragOverDay = null"
                 @drop.prevent="handleDrop(day)">
              <template v-if="day">
                <span class="text-xs font-bold" :style="isToday(day) ? { color: 'var(--accent-warm)' } : { color: 'var(--text-secondary)' }">{{ day.getDate() }}</span>
                <div class="space-y-1 mt-1">
                  <div v-for="entry in store.entriesForDay(day)" :key="entry.id"
                       class="text-[10px] p-1 rounded truncate text-white cursor-move"
                       :style="{ background: entry.type === 'deadline' ? 'var(--accent-rose)' : 'var(--accent-cool)', opacity: dragOverDay === day ? 0.5 : 1 }"
                       draggable="true"
                       @dragstart="dragStart(entry)"
                       @dragend="dragOverDay = null">
                    {{ entry.text }}
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Drag hint -->
        <div class="mt-4 text-center text-xs" style="color: var(--text-muted);">
          💡 Ziehe Einträge per Drag & Drop auf andere Tage um sie zu verschieben
        </div>
      </div>
    </div>

    <!-- ========================= -->
    <!-- KI TAB -->
    <!-- ========================= -->
    <div v-else-if="activeTab === 'ai'" class="animate-fade-in space-y-8">
      <div class="sf-card p-8 text-center relative overflow-hidden" style="animation: slideInUp 0.5s ease forwards;">
        <div class="absolute inset-0 opacity-5"><div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full sf-animated-gradient blur-3xl"></div></div>
        <div class="relative z-10">
          <div class="w-20 h-20 rounded-3xl sf-animated-gradient flex items-center justify-center text-white text-4xl mx-auto mb-4 shadow-2xl">🤖</div>
          <h2 class="text-2xl font-bold mb-2" style="color: var(--text-primary);">KI Lernoptimierung</h2>
          <p class="text-sm max-w-lg mx-auto" style="color: var(--text-muted);">Lade dein Lernmaterial hoch und erhalte sofort Ergebnisse.</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AIUploadCard icon="📄" title="KI Zusammenfassung" desc="Lade Vorlesungsfolien hoch und erhalte automatisch Zusammenfassungen." result-template="summary" demo="• Wichtigste Definitionen zusammengefasst&lt;br&gt;• Kernaussagen strukturiert&lt;br&gt;• Prüfungsrelevante Themen markiert" :delay="0.1" />
        <AIUploadCard icon="🃏" title="KI Karteikarten" desc="Erstelle automatisch Lernkarten aus deinem Material." result-template="flashcards" demo="&lt;strong&gt;Frage:&lt;/strong&gt; Was ist Polymorphie?&lt;br&gt;&lt;strong&gt;Antwort:&lt;/strong&gt; Objekte können unterschiedliche Formen annehmen." :delay="0.15" />
        <AIUploadCard icon="📝" title="KI Aufgabenerstellung" desc="Generiere passende Übungsaufgaben zu deinem Stoff." result-template="tasks" demo="Erstelle eine Klasse &quot;Student&quot; mit Konstruktor, Getter und Setter Methoden." :delay="0.2" />
        <AIUploadCard icon="❓" title="KI Quiz" desc="Erstelle Multiple-Choice-Quizze aus deinen Folien." result-template="quiz" demo="Welche Aussage beschreibt Vererbung in Java?&lt;br&gt;⭕ Eine Klasse kann Eigenschaften anderer Klassen übernehmen" :delay="0.25" />
      </div>
    </div>

    <!-- ========================= -->
    <!-- EINSTELLUNGEN TAB -->
    <!-- ========================= -->
    <div v-else-if="activeTab === 'settings'" class="animate-fade-in space-y-8 max-w-2xl mx-auto">
      <div class="sf-card p-8 text-center">
        <div class="w-16 h-16 rounded-2xl sf-animated-gradient flex items-center justify-center text-white text-3xl mx-auto mb-4">⚙️</div>
        <h2 class="text-2xl font-bold mb-2" style="color: var(--text-primary);">Einstellungen</h2>
        <p class="text-sm" style="color: var(--text-muted);">Konfiguration und System-Informationen</p>
      </div>
      <div class="sf-card p-6 space-y-4">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background: rgba(42, 157, 143, 0.15);">🔐</div>
          <div>
            <h3 class="text-lg font-bold" style="color: var(--text-primary);">KI-Konfiguration</h3>
            <p class="text-xs" style="color: var(--text-muted);">Serverseitige API-Verwaltung</p>
          </div>
        </div>
        <div class="p-4 rounded-xl space-y-2" style="background: var(--bg-tertiary);">
          <div class="flex items-center gap-2 text-sm">
            <span class="text-xl">🛡️</span>
            <span style="color: var(--text-secondary);">Der Kimi API Key wird <strong style="color: var(--accent-cool);">serverseitig</strong> verwaltet</span>
          </div>
          <p class="text-xs pl-8" style="color: var(--text-muted);">Der Key liegt nie im Browser. Er wird über die Umgebungsvariable <code class="px-1 py-0.5 rounded text-xs" style="background: var(--bg-primary); color: var(--accent-warm);">KIMI_API_KEY</code> auf dem Server konfiguriert.</p>
        </div>
        <div class="p-4 rounded-xl" style="background: rgba(155, 93, 229, 0.1); border: 1px solid rgba(155, 93, 229, 0.2);">
          <p class="text-sm font-semibold mb-2" style="color: var(--accent-purple);">📚 Für Entwickler / Deployment</p>
          <div class="space-y-1 text-xs" style="color: var(--text-muted);">
            <p><strong style="color: var(--text-secondary);">Vercel:</strong> Settings → Environment Variables → <code>KIMI_API_KEY=sk-...</code></p>
            <p><strong style="color: var(--text-secondary);">Lokal:</strong> <code>.env</code> Datei mit <code>KIMI_API_KEY=sk-...</code></p>
            <p><strong style="color: var(--text-secondary);">Optional:</strong> <code>KIMI_BASE_URL=https://api.moonshot.ai/v1</code> (international) oder <code>.cn</code> (China)</p>
          </div>
        </div>
      </div>
      <div class="sf-card p-6 space-y-4" style="border: 1px solid rgba(224, 122, 95, 0.3);">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background: rgba(224, 122, 95, 0.15);">⚠️</div>
          <div>
            <h3 class="text-lg font-bold" style="color: var(--text-primary);">Daten zurücksetzen</h3>
            <p class="text-xs" style="color: var(--text-muted);">Vorsicht — löscht alle deine Daten</p>
          </div>
        </div>
        <button @click="resetAllData" class="sf-btn w-full text-sm" style="background: rgba(224, 122, 95, 0.15); color: var(--accent-warm); border: 1px solid rgba(224, 122, 95, 0.3);">🗑️ Alle Daten löschen</button>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[999] flex items-center justify-center p-4" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);" @click.self="showModal = false">
        <div class="sf-card w-full max-w-lg p-8 max-h-[80vh] overflow-y-auto" style="animation: slideInUp 0.3s ease;">
          <h3 class="text-xl font-bold mb-6 flex items-center gap-2" style="color: var(--text-primary);"><span class="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style="background: rgba(42, 157, 143, 0.15);">✅</span>Erledigte Objekte</h3>
          <ul class="space-y-2">
            <li v-for="(item, idx) in store.completedItems.slice().reverse()" :key="idx" class="p-3 rounded-xl text-sm flex items-center gap-2" style="background: var(--bg-tertiary); color: var(--text-secondary);"><span class="w-1.5 h-1.5 rounded-full shrink-0" style="background: var(--accent-cool);"></span>{{ item }}</li>
            <li v-if="store.completedItems.length === 0" class="text-center py-6" style="color: var(--text-muted);">Noch nichts erledigt.</li>
          </ul>
          <button @click="showModal = false" class="sf-btn w-full mt-6" style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-medium);">Schliessen</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
const store = useStudyFlowStore()
const activeTab = inject('activeTab')

const taskInput = ref('')
const taskPriority = ref('1')
const goalInput = ref('')
const goalDate = ref('')
const studySubject = ref('')
const studyDate = ref('')
const deadlineInput = ref('')
const deadlineDate = ref('')
const showModal = ref(false)
const calendarMode = ref('week')

// Drag & Drop
const draggedEntry = ref(null)
const dragOverDay = ref(null)

const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

const resetAllData = () => {
  if (confirm('Wirklich ALLE Daten löschen? Das kann nicht rückgängig gemacht werden!')) {
    store.tasks = []
    store.goals = []
    store.studyPlans = []
    store.deadlines = []
    store.calendarEntries = []
    store.completedItems = []
    store.saveToStorage?.()
  }
}

const handleAddTask = () => {
  if (!taskInput.value.trim()) return
  store.addTask(taskInput.value.trim(), Number(taskPriority.value))
  taskInput.value = ''
}

const handleAddGoal = () => {
  if (!goalInput.value.trim() || !goalDate.value) return
  store.addGoal(goalInput.value.trim(), goalDate.value)
  goalInput.value = ''
  goalDate.value = ''
}

const handleAddStudy = () => {
  if (!studySubject.value.trim() || !studyDate.value) return
  store.addStudyPlan(studySubject.value.trim(), studyDate.value)
  studySubject.value = ''
  studyDate.value = ''
}

const handleAddDeadline = () => {
  if (!deadlineInput.value.trim() || !deadlineDate.value) return
  store.addDeadline(deadlineInput.value.trim(), deadlineDate.value)
  deadlineInput.value = ''
  deadlineDate.value = ''
}

const openCompletedModal = () => showModal.value = true

const priorityLabel = (p) => p === 1 ? 'Dringend' : p === 2 ? 'Wichtig' : 'Optional'
const priorityColor = (p) => p === 1 ? '#e07a5f' : p === 2 ? '#f4a261' : '#2a9d8f'
const formatDate = (d) => new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
const isToday = (date) => {
  if (!date) return false
  const today = new Date()
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
}

const weekRange = computed(() => {
  const start = store.weekDays[0]
  const end = store.weekDays[6]
  return `${start.getDate()}.${start.getMonth()+1}. – ${end.getDate()}.${end.getMonth()+1}.`
})

const weeklyProgress = computed(() => {
  const total = store.tasks.length + store.goals.length + store.deadlines.length
  if (total === 0) return 0
  const done = store.doneTasks.length + store.doneGoals.length + store.doneDeadlines.length
  return Math.round((done / total) * 100)
})

const urgentToday = computed(() => store.activeTasks.filter(t => t.priority === 1).length)

const deadlinesThisWeek = computed(() => {
  const today = new Date()
  const weekEnd = new Date(today.getTime() + 7 * 86400000)
  return store.activeDeadlines.filter(d => {
    const dd = new Date(d.date)
    return dd >= today && dd <= weekEnd
  }).length
})

// Drag & Drop handlers
const dragStart = (entry) => {
  draggedEntry.value = entry
}

const handleDrop = (day) => {
  if (draggedEntry.value && day) {
    const newDate = day.toISOString().split('T')[0]
    store.moveCalendarEntry(draggedEntry.value.id, newDate)
    draggedEntry.value = null
    dragOverDay.value = null
  }
}

// Export
const exportJSON = () => {
  const data = store.exportData()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `studyflow_backup_${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const exportCSV = () => {
  const csv = store.exportCSV()
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `studyflow_export_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
