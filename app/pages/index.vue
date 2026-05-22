<template>
  <div>
    <!-- ========================= -->
    <!-- ORGANISATION TAB -->
    <!-- ========================= -->
    <div v-if="activeTab === 'orga'" class="animate-fade-in space-y-8">
      <!-- Welcome Section -->
      <div class="sf-card p-8 relative overflow-hidden" style="animation: slideInUp 0.5s ease forwards;">
        <div class="absolute top-0 right-0 w-64 h-64 opacity-10" style="background: radial-gradient(circle, var(--accent-warm), transparent);"></div>
        <div class="relative z-10">
          <h2 class="text-2xl font-bold mb-2" style="color: var(--text-primary);">
            Willkommen zurück! 👋
          </h2>
          <p class="text-sm" style="color: var(--text-muted);">
            Du hast <span class="font-bold" style="color: var(--accent-warm);">{{ store.activeTasks.length }}</span> offene Aufgaben,
            <span class="font-bold" style="color: var(--accent-cool);">{{ store.activeGoals.length }}</span> Ziele und
            <span class="font-bold" style="color: var(--accent-rose);">{{ store.activeDeadlines.length }}</span> Deadlines diese Woche.
          </p>
        </div>
      </div>

      <!-- Bento Dashboard -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <button @click="openCompletedModal" class="sf-card sf-stat-card group text-left relative overflow-hidden" style="animation: slideInUp 0.5s ease 0.05s forwards; opacity: 0;">
          <div class="flex items-center justify-between mb-3">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style="background: rgba(224, 122, 95, 0.15);">📝</div>
            <span class="text-xs font-medium px-2.5 py-1 rounded-full" style="background: rgba(224, 122, 95, 0.1); color: var(--accent-warm);">Tasks</span>
          </div>
          <p class="text-4xl font-bold mb-1" style="color: var(--accent-warm);">{{ store.activeTasks.length }}</p>
          <p class="text-xs" style="color: var(--text-muted);">Offene Aufgaben</p>
          <div class="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style="background: linear-gradient(90deg, var(--accent-warm), var(--accent-warm-light));"></div>
        </button>

        <button @click="openCompletedModal" class="sf-card sf-stat-card group text-left relative overflow-hidden" style="animation: slideInUp 0.5s ease 0.1s forwards; opacity: 0;">
          <div class="flex items-center justify-between mb-3">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style="background: rgba(42, 157, 143, 0.15);">🎯</div>
            <span class="text-xs font-medium px-2.5 py-1 rounded-full" style="background: rgba(42, 157, 143, 0.1); color: var(--accent-cool);">Ziele</span>
          </div>
          <p class="text-4xl font-bold mb-1" style="color: var(--accent-cool);">{{ store.activeGoals.length }}</p>
          <p class="text-xs" style="color: var(--text-muted);">Offene Ziele</p>
          <div class="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style="background: linear-gradient(90deg, var(--accent-cool), var(--accent-cool-light));"></div>
        </button>

        <button @click="openCompletedModal" class="sf-card sf-stat-card group text-left relative overflow-hidden" style="animation: slideInUp 0.5s ease 0.15s forwards; opacity: 0;">
          <div class="flex items-center justify-between mb-3">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style="background: rgba(241, 91, 181, 0.15);">⏰</div>
            <span class="text-xs font-medium px-2.5 py-1 rounded-full" style="background: rgba(241, 91, 181, 0.1); color: var(--accent-rose);">Deadlines</span>
          </div>
          <p class="text-4xl font-bold mb-1" style="color: var(--accent-rose);">{{ store.activeDeadlines.length }}</p>
          <p class="text-xs" style="color: var(--text-muted);">Bald fällig</p>
          <div class="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style="background: linear-gradient(90deg, var(--accent-rose), var(--accent-purple));"></div>
        </button>
      </div>

      <!-- Tasks & Goals & Deadlines & Lernplan Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- To-Do -->
        <div class="sf-card p-6" style="animation: slideInUp 0.5s ease 0.2s forwards; opacity: 0;">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: rgba(224, 122, 95, 0.15);">📝</div>
            <h3 class="text-lg font-bold" style="color: var(--text-primary);">Aufgaben</h3>
            <span class="ml-auto text-xs font-bold px-3 py-1 rounded-full" style="background: rgba(224, 122, 95, 0.1); color: var(--accent-warm);">{{ store.activeTasks.length }}</span>
          </div>

          <div class="space-y-3 mb-5">
            <input v-model="taskInput" @keyup.enter="handleAddTask" placeholder="Was steht an?" class="sf-input" />
            <div class="flex gap-2">
              <select v-model="taskPriority" class="sf-input sf-select flex-1 text-sm">
                <option value="1">🔴 Dringend</option>
                <option value="2">🟠 Wichtig</option>
                <option value="3">🟢 Optional</option>
              </select>
              <button @click="handleAddTask" class="sf-btn sf-btn-primary px-6">+</button>
            </div>
          </div>

          <ul class="space-y-2 max-h-72 overflow-y-auto pr-1">
            <li v-for="task in store.activeTasks" :key="task.id"
                class="group flex items-center justify-between gap-3 p-4 rounded-xl transition-all duration-200 hover:scale-[1.01]"
                :style="{ background: 'var(--bg-tertiary)', borderLeft: `3px solid ${priorityColor(task.priority)}` }">
              <div class="flex items-center gap-3 min-w-0">
                <span class="sf-badge text-white shrink-0 text-xs" :style="{ background: priorityColor(task.priority) }">
                  {{ priorityLabel(task.priority) }}
                </span>
                <span class="truncate text-sm" style="color: var(--text-primary);">{{ task.text }}</span>
              </div>
              <button @click="store.completeTask(task.id)"
                      class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                      style="background: var(--accent-cool);">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
              </button>
            </li>
            <li v-if="store.activeTasks.length === 0" class="text-center py-8" style="color: var(--text-muted);">
              <div class="text-3xl mb-2">🎉</div>
              <p class="text-sm">Alles erledigt!</p>
            </li>
          </ul>
        </div>

        <!-- Ziele -->
        <div class="sf-card p-6" style="animation: slideInUp 0.5s ease 0.25s forwards; opacity: 0;">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: rgba(42, 157, 143, 0.15);">🎯</div>
            <h3 class="text-lg font-bold" style="color: var(--text-primary);">Ziele</h3>
            <span class="ml-auto text-xs font-bold px-3 py-1 rounded-full" style="background: rgba(42, 157, 143, 0.1); color: var(--accent-cool);">{{ store.activeGoals.length }}</span>
          </div>

          <div class="space-y-3 mb-5">
            <input v-model="goalInput" @keyup.enter="handleAddGoal" placeholder="Neues Ziel setzen..." class="sf-input" />
            <div class="flex gap-2">
              <input v-model="goalDate" type="date" class="sf-input flex-1 text-sm" />
              <button @click="handleAddGoal" class="sf-btn sf-btn-primary px-6" style="background: linear-gradient(135deg, var(--accent-cool), var(--accent-cool-light));">+</button>
            </div>
          </div>

          <ul class="space-y-2 max-h-72 overflow-y-auto pr-1">
            <li v-for="goal in store.activeGoals" :key="goal.id"
                class="group flex items-center justify-between gap-3 p-4 rounded-xl transition-all duration-200 hover:scale-[1.01]"
                style="background: var(--bg-tertiary);">
              <div class="min-w-0">
                <p class="text-sm font-medium" style="color: var(--text-primary);">{{ goal.text }}</p>
                <p class="text-xs mt-0.5" style="color: var(--text-muted);">📅 {{ formatDate(goal.date) }}</p>
              </div>
              <button @click="store.completeGoal(goal.id)"
                      class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                      style="background: var(--accent-cool);">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
              </button>
            </li>
            <li v-if="store.activeGoals.length === 0" class="text-center py-8" style="color: var(--text-muted);">
              <div class="text-3xl mb-2">🎯</div>
              <p class="text-sm">Noch keine Ziele gesetzt</p>
            </li>
          </ul>
        </div>

        <!-- Lernplan -->
        <div class="sf-card p-6" style="animation: slideInUp 0.5s ease 0.3s forwards; opacity: 0;">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: rgba(155, 93, 229, 0.15);">🧠</div>
            <h3 class="text-lg font-bold" style="color: var(--text-primary);">Lernplan</h3>
            <span class="ml-auto text-xs font-bold px-3 py-1 rounded-full" style="background: rgba(155, 93, 229, 0.1); color: var(--accent-purple);">{{ store.upcomingStudyPlans.length }}</span>
          </div>

          <div class="space-y-3 mb-5">
            <div class="flex gap-2">
              <input v-model="studySubject" @keyup.enter="handleAddStudy" placeholder="Fach..." class="sf-input flex-1 text-sm" />
              <input v-model="studyDate" type="date" class="sf-input w-36 text-sm" />
            </div>
            <button @click="handleAddStudy" class="sf-btn sf-btn-primary w-full text-sm" style="background: linear-gradient(135deg, var(--accent-purple), var(--accent-rose));">📚 Hinzufügen
            </button>
          </div>

          <ul class="space-y-2 max-h-60 overflow-y-auto pr-1">
            <li v-for="plan in store.upcomingStudyPlans" :key="plan.id"
                class="flex items-center gap-3 p-3 rounded-xl"
                style="background: var(--bg-tertiary);">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center text-sm" style="background: rgba(155, 93, 229, 0.15);">📚</div>
              <div class="min-w-0">
                <p class="text-sm font-medium" style="color: var(--text-primary);">{{ plan.subject }}</p>
                <p class="text-xs" style="color: var(--text-muted);">{{ formatDate(plan.date) }}</p>
              </div>
            </li>
            <li v-if="store.upcomingStudyPlans.length === 0" class="text-center py-6" style="color: var(--text-muted);">
              <p class="text-sm">Noch keine Lernpläne</p>
            </li>
          </ul>
        </div>

        <!-- Deadlines -->
        <div class="sf-card p-6" style="animation: slideInUp 0.5s ease 0.35s forwards; opacity: 0;">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: rgba(241, 91, 181, 0.15);">⏰</div>
            <h3 class="text-lg font-bold" style="color: var(--text-primary);">Deadlines</h3>
            <span class="ml-auto text-xs font-bold px-3 py-1 rounded-full" style="background: rgba(241, 91, 181, 0.1); color: var(--accent-rose);">{{ store.activeDeadlines.length }}</span>
          </div>

          <div class="space-y-3 mb-5">
            <input v-model="deadlineInput" @keyup.enter="handleAddDeadline" placeholder="Was ist fällig?" class="sf-input" />
            <div class="flex gap-2">
              <input v-model="deadlineDate" type="date" class="sf-input flex-1 text-sm" />
              <button @click="handleAddDeadline" class="sf-btn sf-btn-primary px-6" style="background: linear-gradient(135deg, var(--accent-rose), var(--accent-purple));">+</button>
            </div>
          </div>

          <ul class="space-y-2 max-h-72 overflow-y-auto pr-1">
            <li v-for="dl in store.activeDeadlines" :key="dl.id"
                class="group flex items-center justify-between gap-3 p-4 rounded-xl transition-all duration-200 hover:scale-[1.01]"
                style="background: var(--bg-tertiary);">
              <div class="min-w-0 flex items-center gap-3">
                <div class="w-2 h-2 rounded-full shrink-0" style="background: var(--accent-rose);"></div>
                <div>
                  <p class="text-sm font-medium" style="color: var(--text-primary);">{{ dl.text }}</p>
                  <p class="text-xs mt-0.5" style="color: var(--text-muted);">⏰ {{ formatDate(dl.date) }}</p>
                </div>
              </div>
              <button @click="store.completeDeadline(dl.id)"
                      class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                      style="background: var(--accent-rose);">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
              </button>
            </li>
            <li v-if="store.activeDeadlines.length === 0" class="text-center py-8" style="color: var(--text-muted);">
              <div class="text-3xl mb-2">✅</div>
              <p class="text-sm">Keine Deadlines!</p>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- ========================= -->
    <!-- KALENDER TAB -->
    <!-- ========================= -->
    <div v-else-if="activeTab === 'calendar'" class="animate-fade-in space-y-6">
      <div class="sf-card p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: rgba(224, 122, 95, 0.15);">📅</div>
            <h3 class="text-lg font-bold" style="color: var(--text-primary);">Wochenübersicht</h3>
          </div>
          <div class="flex items-center gap-2">
            <button @click="store.changeWeek(-1)" class="sf-btn sf-btn-secondary w-10 h-10 p-0 rounded-xl">⬅</button>
            <span class="text-sm font-semibold px-4 py-2 rounded-xl" style="background: var(--bg-tertiary); color: var(--text-secondary);">{{ weekRange }}</span>
            <button @click="store.changeWeek(1)" class="sf-btn sf-btn-secondary w-10 h-10 p-0 rounded-xl">➡</button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          <div v-for="(day, idx) in store.weekDays" :key="idx"
               class="min-h-[200px] p-4 rounded-xl transition-all duration-200 hover:scale-[1.02]"
               style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle);">
            <h4 class="text-xs font-bold mb-3 uppercase tracking-wider" :style="isToday(day) ? { color: 'var(--accent-warm)' } : { color: 'var(--text-muted)' }">
              {{ dayNames[idx] }}
              <span class="block mt-0.5 text-sm font-normal normal-case" style="color: var(--text-secondary);">{{ day.getDate() }}.{{ day.getMonth()+1 }}.</span>
            </h4>
            <div class="space-y-1.5">
              <div v-for="entry in store.entriesForDay(day)" :key="entry.id"
                   class="group text-xs p-2.5 rounded-lg text-white cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
                   :style="{ background: entry.type === 'deadline' ? 'var(--accent-rose)' : 'var(--accent-cool)' }">
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
      </div>
    </div>

    <!-- ========================= -->
    <!-- KI TAB -->
    <!-- ========================= -->
    <div v-else-if="activeTab === 'ai'" class="animate-fade-in space-y-8">
      <!-- Hero -->
      <div class="sf-card p-8 text-center relative overflow-hidden" style="animation: slideInUp 0.5s ease forwards;">
        <div class="absolute inset-0 opacity-5">
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full sf-animated-gradient blur-3xl"></div>
        </div>
        <div class="relative z-10">
          <div class="w-20 h-20 rounded-3xl sf-animated-gradient flex items-center justify-center text-white text-4xl mx-auto mb-4 shadow-2xl">
            🤖
          </div>
          <h2 class="text-2xl font-bold mb-2" style="color: var(--text-primary);">KI Lernoptimierung</h2>
          <p class="text-sm max-w-lg mx-auto" style="color: var(--text-muted);">
            Lade dein Lernmaterial hoch und erhalte sofort Ergebnisse.
          </p>
        </div>
      </div>

      <!-- AI Tools Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AIUploadCard
          icon="📄"
          title="KI Zusammenfassung"
          desc="Lade Vorlesungsfolien hoch und erhalte automatisch Zusammenfassungen."
          result-template="summary"
          demo="• Wichtigste Definitionen zusammengefasst&lt;br&gt;• Kernaussagen strukturiert&lt;br&gt;• Prüfungsrelevante Themen markiert"
          :delay="0.1"
        />
        <AIUploadCard
          icon="🃏"
          title="KI Karteikarten"
          desc="Erstelle automatisch Lernkarten aus deinem Material."
          result-template="flashcards"
          demo="&lt;strong&gt;Frage:&lt;/strong&gt; Was ist Polymorphie?&lt;br&gt;&lt;strong&gt;Antwort:&lt;/strong&gt; Objekte können unterschiedliche Formen annehmen."
          :delay="0.15"
        />
        <AIUploadCard
          icon="📝"
          title="KI Aufgabenerstellung"
          desc="Generiere passende Übungsaufgaben zu deinem Stoff."
          result-template="tasks"
          demo="Erstelle eine Klasse &quot;Student&quot; mit Konstruktor, Getter und Setter Methoden."
          :delay="0.2"
        />
        <AIUploadCard
          icon="❓"
          title="KI Quiz"
          desc="Erstelle Multiple-Choice-Quizze aus deinen Folien."
          result-template="quiz"
          demo="Welche Aussage beschreibt Vererbung in Java?&lt;br&gt;⭕ Eine Klasse kann Eigenschaften anderer Klassen übernehmen"
          :delay="0.25"
        />
      </div>
    </div>

    <!-- ========================= -->
    <!-- EINSTELLUNGEN TAB -->
    <!-- ========================= -->
    <div v-else-if="activeTab === 'settings'" class="animate-fade-in space-y-8 max-w-2xl mx-auto">
      <div class="sf-card p-8 text-center">
        <div class="w-16 h-16 rounded-2xl sf-animated-gradient flex items-center justify-center text-white text-3xl mx-auto mb-4">
          ⚙️
        </div>
        <h2 class="text-2xl font-bold mb-2" style="color: var(--text-primary);">Einstellungen</h2>
        <p class="text-sm" style="color: var(--text-muted);">Konfiguration und System-Informationen</p>
      </div>

      <!-- Server Config Info -->
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
          <p class="text-xs pl-8" style="color: var(--text-muted);">
            Der Key liegt nie im Browser. Er wird über die Umgebungsvariable <code class="px-1 py-0.5 rounded text-xs" style="background: var(--bg-primary); color: var(--accent-warm);">KIMI_API_KEY</code> auf dem Server konfiguriert.
          </p>
        </div>

        <div class="p-4 rounded-xl" style="background: rgba(155, 93, 229, 0.1); border: 1px solid rgba(155, 93, 229, 0.2);">
          <p class="text-sm font-semibold mb-2" style="color: var(--accent-purple);">📚 Für Entwickler / Deployment</p>
          <div class="space-y-1 text-xs" style="color: var(--text-muted);">
            <p><strong style="color: var(--text-secondary);">Vercel:</strong> Settings → Environment Variables → <code>KIMI_API_KEY=sk-...</code></p>
            <p><strong style="color: var(--text-secondary);">Lokal:</strong> <code>.env</code> Datei mit <code>KIMI_API_KEY=sk-...</code></p>
            <p><strong style="color: var(--text-secondary);">Optional:</strong> <code>KIMI_BASE_URL=https://api.moonshot.cn/v1</code></p>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="sf-card p-6 space-y-4" style="border: 1px solid rgba(224, 122, 95, 0.3);">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background: rgba(224, 122, 95, 0.15);">⚠️</div>
          <div>
            <h3 class="text-lg font-bold" style="color: var(--text-primary);">Daten zurücksetzen</h3>
            <p class="text-xs" style="color: var(--text-muted);">Vorsicht — löscht alle deine Daten</p>
          </div>
        </div>
        <button @click="resetAllData" class="sf-btn w-full text-sm" style="background: rgba(224, 122, 95, 0.15); color: var(--accent-warm); border: 1px solid rgba(224, 122, 95, 0.3);">
          🗑️ Alle Daten löschen
        </button>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[999] flex items-center justify-center p-4" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);" @click.self="showModal = false">
        <div class="sf-card w-full max-w-lg p-8 max-h-[80vh] overflow-y-auto" style="animation: slideInUp 0.3s ease;">
          <h3 class="text-xl font-bold mb-6 flex items-center gap-2" style="color: var(--text-primary);">
            <span class="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style="background: rgba(42, 157, 143, 0.15);">✅</span>
            Erledigte Objekte
          </h3>
          <ul class="space-y-2">
            <li v-for="(item, idx) in store.completedItems.slice().reverse()" :key="idx"
                class="p-3 rounded-xl text-sm flex items-center gap-2"
                style="background: var(--bg-tertiary); color: var(--text-secondary);">
              <span class="w-1.5 h-1.5 rounded-full shrink-0" style="background: var(--accent-cool);"></span>
              {{ item }}
            </li>
            <li v-if="store.completedItems.length === 0" class="text-center py-6" style="color: var(--text-muted);">
              Noch nichts erledigt.
            </li>
          </ul>
          <button @click="showModal = false" class="sf-btn w-full mt-6" style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-medium);">
            Schliessen
          </button>
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
  const today = new Date()
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
}

const weekRange = computed(() => {
  const start = store.weekDays[0]
  const end = store.weekDays[6]
  return `${start.getDate()}.${start.getMonth()+1}. – ${end.getDate()}.${end.getMonth()+1}.`
})
</script>
