<template>
  <div class="quiz-game">
    <!-- Progress Bar -->
    <div class="mb-4">
      <div class="flex items-center justify-between text-xs mb-1.5" style="color: var(--text-muted);">
        <span class="font-semibold">Frage {{ currentIndex + 1 }} / {{ questions.length }}</span>
        <span v-if="streak >= 2" class="flex items-center gap-1 font-bold" style="color: var(--accent-warm);">
          🔥 {{ streak }}er Serie
        </span>
      </div>
      <div class="h-2.5 rounded-full overflow-hidden" style="background: var(--border-subtle);">
        <div
          class="h-full rounded-full transition-all duration-500 ease-out sf-animated-gradient"
          :style="{ width: ((currentIndex + (answered ? 1 : 0)) / questions.length * 100) + '%' }"
        />
      </div>
    </div>

    <!-- Score Bar (mini) -->
    <div class="flex items-center gap-3 mb-4">
      <div class="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold" style="background: var(--bg-primary); color: var(--text-secondary); border: 1px solid var(--border-medium);">
        <span>⭐</span> {{ score }} / {{ questions.length }} Punkte
      </div>
      <div v-if="timer > 0" class="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold" :style="{ background: timer <= 5 ? 'rgba(224,122,95,0.15)' : 'var(--bg-primary)', color: timer <= 5 ? 'var(--accent-warm)' : 'var(--text-secondary)', border: '1px solid var(--border-medium)' }">
        ⏱️ {{ timer }}s
      </div>
    </div>

    <!-- Question Card -->
    <Transition name="quiz-slide" mode="out-in">
      <div v-if="!showResult" key="question" class="space-y-4">
        <div class="p-5 rounded-2xl font-semibold text-base leading-relaxed" style="background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-medium);">
          <span class="inline-block w-7 h-7 rounded-lg text-xs font-bold text-center leading-7 mr-2" style="background: var(--accent-cool); color: #fff;">
            {{ currentIndex + 1 }}
          </span>
          {{ currentQuestion.question }}
        </div>

        <!-- Answer Grid -->
        <div class="grid grid-cols-1 gap-2.5">
          <button
            v-for="(option, idx) in currentQuestion.options"
            :key="idx"
            class="quiz-answer-btn relative overflow-hidden text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 border"
            :class="{
              'opacity-60 cursor-default': answered && selected !== idx,
              'cursor-pointer hover:scale-[1.01] active:scale-[0.99]': !answered,
              'quiz-shake': answered && selected === idx && !isCorrect(selected),
              'quiz-pulse-correct': answered && selected === idx && isCorrect(selected),
            }"
            :style="answerStyle(idx)"
            :disabled="answered"
            @click="selectAnswer(idx)"
          >
            <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold mr-3 shrink-0" :style="letterStyle(idx)">
              {{ ['A','B','C','D'][idx] }}
            </span>
            <span class="relative z-10">{{ option }}</span>

            <!-- Feedback Icons -->
            <span v-if="answered && isCorrect(idx)" class="absolute right-3 top-1/2 -translate-y-1/2 text-lg">✅</span>
            <span v-if="answered && selected === idx && !isCorrect(idx)" class="absolute right-3 top-1/2 -translate-y-1/2 text-lg">❌</span>
          </button>
        </div>

        <!-- Feedback Message -->
        <Transition name="fade">
          <div v-if="answered" class="text-center py-2">
            <p v-if="isCorrect(selected)" class="text-sm font-bold" style="color: var(--accent-cool);">Richtig! 🎉</p>
            <p v-else class="text-sm font-bold" style="color: var(--accent-rose);">
              Falsch! Richtig war {{ ['A','B','C','D'][currentQuestion.correct] }}
            </p>
          </div>
        </Transition>

        <!-- Next Button -->
        <Transition name="fade">
          <button
            v-if="answered"
            class="sf-btn sf-btn-primary w-full py-3 text-sm font-semibold mt-2"
            @click="nextQuestion"
          >
            {{ isLastQuestion ? 'Ergebnis anzeigen 🏆' : 'Nächste Frage →' }}
          </button>
        </Transition>
      </div>

      <!-- Result Screen -->
      <div v-else key="result" class="text-center space-y-5 py-4" style="animation: slideInUp 0.5s ease;">
        <div class="text-6xl mb-2">{{ resultEmoji }}</div>
        <h3 class="text-2xl font-bold" style="color: var(--text-primary);">{{ resultTitle }}</h3>
        <p class="text-sm" style="color: var(--text-muted);">{{ resultMessage }}</p>

        <div class="flex justify-center gap-4">
          <div class="w-24 h-24 rounded-2xl flex flex-col items-center justify-center" style="background: var(--bg-primary); border: 2px solid var(--border-medium);">
            <span class="text-2xl font-bold" style="color: var(--accent-cool);">{{ score }}</span>
            <span class="text-[10px] uppercase tracking-wide font-semibold mt-1" style="color: var(--text-muted);">Punkte</span>
          </div>
          <div class="w-24 h-24 rounded-2xl flex flex-col items-center justify-center" style="background: var(--bg-primary); border: 2px solid var(--border-medium);">
            <span class="text-2xl font-bold" style="color: var(--accent-warm);">{{ Math.round(score / questions.length * 100) }}%</span>
            <span class="text-[10px] uppercase tracking-wide font-semibold mt-1" style="color: var(--text-muted);">Quote</span>
          </div>
          <div class="w-24 h-24 rounded-2xl flex flex-col items-center justify-center" style="background: var(--bg-primary); border: 2px solid var(--border-medium);">
            <span class="text-2xl font-bold" style="color: var(--accent-rose);">{{ bestStreak }}</span>
            <span class="text-[10px] uppercase tracking-wide font-semibold mt-1" style="color: var(--text-muted);">Serie</span>
          </div>
        </div>

        <!-- Answer Review -->
        <div class="text-left space-y-2 mt-4">
          <p class="text-xs font-semibold uppercase tracking-wide" style="color: var(--text-muted);">Deine Antworten</p>
          <div
            v-for="(q, idx) in questions"
            :key="idx"
            class="flex items-center gap-3 p-3 rounded-xl text-sm"
            :style="{ background: answers[idx] === q.correct ? 'rgba(42,157,143,0.08)' : 'rgba(224,122,95,0.08)', border: '1px solid ' + (answers[idx] === q.correct ? 'rgba(42,157,143,0.2)' : 'rgba(224,122,95,0.2)') }"
          >
            <span class="text-base">{{ answers[idx] === q.correct ? '✅' : '❌' }}</span>
            <div class="flex-1 min-w-0">
              <p class="font-medium truncate" style="color: var(--text-primary);">{{ idx + 1 }}. {{ q.question }}</p>
              <p class="text-xs mt-0.5" style="color: var(--text-muted);">
                Deine Antwort: {{ ['A','B','C','D'][answers[idx]] || '–' }} | Richtig: {{ ['A','B','C','D'][q.correct] }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex gap-3 pt-2">
          <button class="sf-btn sf-btn-secondary flex-1 text-xs py-3" @click="restart">
            🔄 Nochmal spielen
          </button>
          <button class="sf-btn sf-btn-primary flex-1 text-xs py-3" @click="emit('reset')">
            📝 Neues Quiz
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
const props = defineProps({
  questions: { type: Array, required: true },
})
const emit = defineEmits(['reset'])

const currentIndex = ref(0)
const selected = ref(null)
const answered = ref(false)
const score = ref(0)
const streak = ref(0)
const bestStreak = ref(0)
const showResult = ref(false)
const answers = ref([])
const timer = ref(20)
let timerInterval = null

const currentQuestion = computed(() => props.questions[currentIndex.value])
const isLastQuestion = computed(() => currentIndex.value >= props.questions.length - 1)

const resultEmoji = computed(() => {
  const pct = score.value / props.questions.length
  if (pct === 1) return '🏆'
  if (pct >= 0.8) return '⭐'
  if (pct >= 0.6) return '👍'
  if (pct >= 0.4) return '📚'
  return '💪'
})

const resultTitle = computed(() => {
  const pct = score.value / props.questions.length
  if (pct === 1) return 'Perfekt!'
  if (pct >= 0.8) return 'Sehr gut!'
  if (pct >= 0.6) return 'Bestanden!'
  if (pct >= 0.4) return 'Nicht schlecht!'
  return 'Übung macht den Meister!'
})

const resultMessage = computed(() => {
  const pct = score.value / props.questions.length
  if (pct === 1) return 'Du hast alle Fragen richtig beantwortet. Beeindruckend!'
  if (pct >= 0.8) return 'Du kennst den Stoff sehr gut. Weiter so!'
  if (pct >= 0.6) return 'Das ist ein solides Ergebnis. Ein paar Lücken gibt es noch.'
  if (pct >= 0.4) return 'Du bist auf dem richtigen Weg, aber es gibt noch Luft nach oben.'
  return 'Kein Problem – lerne noch etwas und versuche es erneut!'
})

function startTimer() {
  clearInterval(timerInterval)
  timer.value = 20
  timerInterval = setInterval(() => {
    if (timer.value > 0 && !answered.value) {
      timer.value--
    }
    if (timer.value === 0 && !answered.value) {
      selectAnswer(-1) // Time out
    }
  }, 1000)
}

function isCorrect(idx) {
  return idx === currentQuestion.value.correct
}

function answerStyle(idx) {
  if (!answered.value) {
    return {
      background: 'var(--bg-primary)',
      color: 'var(--text-secondary)',
      borderColor: 'var(--border-medium)',
    }
  }
  if (isCorrect(idx)) {
    return {
      background: 'rgba(42, 157, 143, 0.12)',
      color: '#2a9d8f',
      borderColor: '#2a9d8f',
    }
  }
  if (selected.value === idx && !isCorrect(idx)) {
    return {
      background: 'rgba(224, 122, 95, 0.12)',
      color: '#e07a5f',
      borderColor: '#e07a5f',
    }
  }
  return {
    background: 'var(--bg-primary)',
    color: 'var(--text-muted)',
    borderColor: 'var(--border-subtle)',
  }
}

function letterStyle(idx) {
  if (!answered.value) {
    return { background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }
  }
  if (isCorrect(idx)) {
    return { background: '#2a9d8f', color: '#fff' }
  }
  if (selected.value === idx && !isCorrect(idx)) {
    return { background: '#e07a5f', color: '#fff' }
  }
  return { background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }
}

function selectAnswer(idx) {
  if (answered.value) return
  selected.value = idx
  answered.value = true
  clearInterval(timerInterval)

  answers.value[currentIndex.value] = idx

  if (isCorrect(idx)) {
    score.value++
    streak.value++
    if (streak.value > bestStreak.value) bestStreak.value = streak.value
  } else {
    streak.value = 0
  }
}

function nextQuestion() {
  if (isLastQuestion.value) {
    showResult.value = true
    return
  }
  currentIndex.value++
  selected.value = null
  answered.value = false
  startTimer()
}

function restart() {
  currentIndex.value = 0
  selected.value = null
  answered.value = false
  score.value = 0
  streak.value = 0
  bestStreak.value = 0
  showResult.value = false
  answers.value = new Array(props.questions.length).fill(null)
  startTimer()
}

onMounted(() => {
  answers.value = new Array(props.questions.length).fill(null)
  startTimer()
})

onBeforeUnmount(() => {
  clearInterval(timerInterval)
})
</script>

<style scoped>
.quiz-answer-btn {
  display: flex;
  align-items: center;
}
.quiz-answer-btn:not(:disabled):hover {
  transform: scale(1.01);
}
.quiz-answer-btn:not(:disabled):active {
  transform: scale(0.99);
}

@keyframes quizShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}
.quiz-shake {
  animation: quizShake 0.4s ease;
}

@keyframes quizPulseCorrect {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(42, 157, 143, 0.4); }
  50% { transform: scale(1.02); box-shadow: 0 0 0 8px rgba(42, 157, 143, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(42, 157, 143, 0); }
}
.quiz-pulse-correct {
  animation: quizPulseCorrect 0.5s ease;
}

.quiz-slide-enter-active,
.quiz-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.quiz-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.quiz-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
