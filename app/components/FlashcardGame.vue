<template>
  <div class="flashcard-game">
    <!-- Progress bar -->
    <div class="mb-4">
      <div class="flex items-center justify-between text-xs mb-1.5" style="color: var(--text-muted);">
        <span class="font-semibold">Karte {{ currentIndex + 1 }} / {{ cards.length }}</span>
        <span class="font-medium">{{ Math.round((knownCount / cards.length) * 100) }}% gelernt</span>
      </div>
      <div class="h-2 rounded-full overflow-hidden" style="background: var(--border-subtle);">
        <div
          class="h-full rounded-full transition-all duration-500 ease-out sf-animated-gradient"
          :style="{ width: ((currentIndex + 1) / cards.length * 100) + '%' }"
        />
      </div>
    </div>

    <!-- Known / unknown stats -->
    <div class="flex gap-2 mb-4">
      <button
        @click="markKnown(true)"
        class="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        :class="currentKnown === true ? 'ring-2' : ''"
        style="background: rgba(42, 157, 143, 0.12); color: #2a9d8f; border: 1px solid rgba(42, 157, 143, 0.25);"
        :style="currentKnown === true ? 'background: rgba(42, 157, 143, 0.25); box-shadow: 0 0 0 2px rgba(42, 157, 143, 0.4);' : ''"
      >
        ✅ Gewusst ({{ knownCount }})
      </button>
      <button
        @click="markKnown(false)"
        class="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        :class="currentKnown === false ? 'ring-2' : ''"
        style="background: rgba(224, 122, 95, 0.12); color: #e07a5f; border: 1px solid rgba(224, 122, 95, 0.25);"
        :style="currentKnown === false ? 'background: rgba(224, 122, 95, 0.25); box-shadow: 0 0 0 2px rgba(224, 122, 95, 0.4);' : ''"
      >
        ❌ Noch lernen ({{ cards.length - knownCount }})
      </button>
    </div>

    <!-- Card Stack -->
    <div class="relative w-full" style="perspective: 1200px; min-height: 280px;">
      <!-- Stack decoration cards behind -->
      <div
        v-if="cards.length > 1"
        class="absolute inset-x-0 top-2 mx-auto w-[96%] h-full rounded-2xl"
        style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); transform: rotate(1.5deg); opacity: 0.6;"
      />
      <div
        v-if="cards.length > 2"
        class="absolute inset-x-0 top-1 mx-auto w-[98%] h-full rounded-2xl"
        style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); transform: rotate(-0.8deg); opacity: 0.8;"
      />

      <!-- Main Flip Card -->
      <div
        class="flashcard-inner relative w-full h-full cursor-pointer"
        :class="{ 'is-flipped': isFlipped }"
        @click="flip"
      >
        <!-- Front -->
        <div
          class="flashcard-front absolute inset-0 rounded-2xl p-8 flex flex-col items-center justify-center text-center select-none"
          style="background: var(--bg-primary); border: 1px solid var(--border-medium); backface-visibility: hidden;"
        >
          <div class="absolute top-4 left-4 flex items-center gap-1.5">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md" style="background: var(--bg-tertiary); color: var(--text-muted);">
              Frage {{ currentIndex + 1 }}
            </span>
          </div>
          <div class="absolute top-4 right-4 text-lg opacity-40">🃏</div>

          <div class="my-auto">
            <p class="text-lg font-semibold leading-relaxed" style="color: var(--text-primary);">
              {{ currentCard.question }}
            </p>
          </div>

          <div class="absolute bottom-4 left-0 right-0 text-center">
            <span class="text-xs font-medium animate-pulse" style="color: var(--text-muted);">
              👆 Tippen zum Aufdecken
            </span>
          </div>
        </div>

        <!-- Back -->
        <div
          class="flashcard-back absolute inset-0 rounded-2xl p-8 flex flex-col items-center justify-center text-center select-none"
          style="background: linear-gradient(145deg, var(--bg-primary), var(--bg-tertiary)); border: 1px solid var(--accent-cool); backface-visibility: hidden; transform: rotateY(180deg);"
        >
          <div class="absolute top-4 left-4 flex items-center gap-1.5">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md" style="background: rgba(42, 157, 143, 0.12); color: #2a9d8f;">
              Antwort
            </span>
          </div>
          <div class="absolute top-4 right-4 text-lg opacity-40">📚</div>

          <div class="my-auto">
            <p class="text-base leading-relaxed" style="color: var(--text-secondary);">
              {{ currentCard.answer }}
            </p>
          </div>

          <div class="absolute bottom-4 left-0 right-0 text-center">
            <span class="text-xs font-medium" style="color: var(--text-muted);">
              👆 Tippen zum Zurückdrehen
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex items-center justify-between gap-3 mt-5">
      <button
        class="sf-btn sf-btn-secondary px-5 py-2.5 text-xs font-semibold"
        :disabled="currentIndex === 0"
        :style="currentIndex === 0 ? 'opacity: 0.4; cursor: not-allowed;' : ''"
        @click="prev"
      >
        ← Zurück
      </button>

      <button
        v-if="!isFlipped"
        class="sf-btn sf-btn-primary flex-1 py-2.5 text-xs font-semibold"
        @click="flip"
      >
        👆 Aufdecken
      </button>
      <button
        v-else
        class="sf-btn sf-btn-primary flex-1 py-2.5 text-xs font-semibold"
        @click="next"
      >
        {{ isLast ? 'Ergebnis 🏆' : 'Weiter →' }}
      </button>

      <button
        class="sf-btn sf-btn-secondary px-5 py-2.5 text-xs font-semibold"
        :disabled="isLast"
        :style="isLast ? 'opacity: 0.4; cursor: not-allowed;' : ''"
        @click="next"
      >
        Überspringen →
      </button>
    </div>

    <!-- Result Screen -->
    <Transition name="fade">
      <div v-if="showResult" class="text-center space-y-5 py-6 mt-2" style="animation: slideInUp 0.5s ease;">
        <div class="text-5xl mb-2">{{ resultEmoji }}</div>
        <h3 class="text-2xl font-bold" style="color: var(--text-primary);">{{ resultTitle }}</h3>

        <div class="flex justify-center gap-4">
          <div class="w-28 h-28 rounded-2xl flex flex-col items-center justify-center" style="background: var(--bg-primary); border: 2px solid rgba(42, 157, 143, 0.3);">
            <span class="text-2xl font-bold" style="color: var(--accent-cool);">{{ knownCount }}</span>
            <span class="text-[10px] uppercase tracking-wide font-semibold mt-1" style="color: var(--text-muted);">Gewusst</span>
          </div>
          <div class="w-28 h-28 rounded-2xl flex flex-col items-center justify-center" style="background: var(--bg-primary); border: 2px solid rgba(224, 122, 95, 0.3);">
            <span class="text-2xl font-bold" style="color: var(--accent-rose);">{{ cards.length - knownCount }}</span>
            <span class="text-[10px] uppercase tracking-wide font-semibold mt-1" style="color: var(--text-muted);">Wiederholen</span>
          </div>
          <div class="w-28 h-28 rounded-2xl flex flex-col items-center justify-center" style="background: var(--bg-primary); border: 2px solid var(--border-medium);">
            <span class="text-2xl font-bold" style="color: var(--accent-warm);">{{ Math.round((knownCount / cards.length) * 100) }}%</span>
            <span class="text-[10px] uppercase tracking-wide font-semibold mt-1" style="color: var(--text-muted);">Quote</span>
          </div>
        </div>

        <!-- Review list -->
        <div class="text-left space-y-2 max-h-60 overflow-y-auto">
          <p class="text-xs font-semibold uppercase tracking-wide px-1" style="color: var(--text-muted);">Karten-Review</p>
          <div
            v-for="(card, idx) in cards"
            :key="idx"
            class="flex items-start gap-3 p-3 rounded-xl text-sm"
            :style="{ background: knownMap[idx] ? 'rgba(42,157,143,0.08)' : 'rgba(224,122,95,0.08)', border: '1px solid ' + (knownMap[idx] ? 'rgba(42,157,143,0.2)' : 'rgba(224,122,95,0.2)') }"
          >
            <span class="text-base mt-0.5">{{ knownMap[idx] ? '✅' : '❌' }}</span>
            <div class="flex-1 min-w-0">
              <p class="font-medium" style="color: var(--text-primary);">{{ idx + 1 }}. {{ card.question }}</p>
              <p class="text-xs mt-0.5" style="color: var(--text-muted);">{{ card.answer }}</p>
            </div>
          </div>
        </div>

        <div class="flex gap-3 pt-2">
          <button class="sf-btn sf-btn-secondary flex-1 text-xs py-3" @click="restart">
            🔄 Nochmal lernen
          </button>
          <button class="sf-btn sf-btn-primary flex-1 text-xs py-3" @click="emit('reset')">
            📝 Neue Karten
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
const props = defineProps({
  cards: { type: Array, required: true },
})
const emit = defineEmits(['reset'])

const currentIndex = ref(0)
const isFlipped = ref(false)
const showResult = ref(false)
const knownMap = ref(new Array(props.cards.length).fill(null))

const currentCard = computed(() => props.cards[currentIndex.value])
const isLast = computed(() => currentIndex.value >= props.cards.length - 1)
const knownCount = computed(() => knownMap.value.filter(Boolean).length)
const currentKnown = computed(() => knownMap.value[currentIndex.value])

const resultEmoji = computed(() => {
  const pct = knownCount.value / props.cards.length
  if (pct === 1) return '🏆'
  if (pct >= 0.8) return '⭐'
  if (pct >= 0.5) return '👍'
  return '📚'
})

const resultTitle = computed(() => {
  const pct = knownCount.value / props.cards.length
  if (pct === 1) return 'Perfekt beherrscht!'
  if (pct >= 0.8) return 'Sehr gut!'
  if (pct >= 0.5) return 'Gut vorangekommen!'
  return 'Übung macht den Meister'
})

function flip() {
  isFlipped.value = !isFlipped.value
}

function next() {
  if (isLast.value) {
    showResult.value = true
    return
  }
  isFlipped.value = false
  // small delay for flip animation to reset
  setTimeout(() => {
    currentIndex.value++
  }, 150)
}

function prev() {
  if (currentIndex.value > 0) {
    isFlipped.value = false
    setTimeout(() => {
      currentIndex.value--
    }, 150)
  }
}

function markKnown(known) {
  knownMap.value[currentIndex.value] = known
}

function restart() {
  currentIndex.value = 0
  isFlipped.value = false
  showResult.value = false
  knownMap.value = new Array(props.cards.length).fill(null)
}
</script>

<style scoped>
.flashcard-inner {
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 260px;
}

.flashcard-inner.is-flipped {
  transform: rotateY(180deg);
}

.flashcard-front,
.flashcard-back {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.flashcard-back {
  transform: rotateY(180deg);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
