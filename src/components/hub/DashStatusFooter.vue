<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const year = new Date().getFullYear()

// Server clock (WIB) — starts empty so SSR and hydration match, then
// ticks every second, like the footer of the old dashboard.
const clock = ref('')
let timer: ReturnType<typeof setInterval> | undefined

function tick() {
  const now = new Date()
  const time = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  }).format(now)
  const date = new Intl.DateTimeFormat(locale.value === 'id' ? 'id-ID' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(now)
  clock.value = `© ${year} NyaaHibi Project — ${t('dash.footer.serverTime')} ${time} ${date}`
}

// Visit counter — the old page polled /stats on the homeserver; if no
// valid endpoint answers, the line simply stays hidden.
const visitStats = ref<{ total: number | string; today: number | string } | null>(null)

const statsLine = computed(() => {
  const s = visitStats.value
  if (!s) return ''
  return `${t('dash.footer.total')} : ${s.total} | ${t('dash.footer.today')} : ${s.today}`
})

onMounted(async () => {
  tick()
  timer = setInterval(tick, 1000)
  try {
    const res = await fetch('/stats')
    const data = (await res.json()) as { total?: number; today?: number }
    if (typeof data?.total === 'number' && typeof data?.today === 'number') {
      visitStats.value = { total: data.total, today: data.today }
    }
  } catch {
    /* no stats endpoint — stay hidden */
  }
})

watch(locale, tick)
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <!-- Footer band from the old dashboard: live WIB clock + best-effort visit stats -->
  <section>
    <div
      class="mx-auto max-w-5xl px-5 py-8 text-center font-mono text-xs text-subtle-foreground md:px-8"
    >
      <p>{{ clock }}</p>
      <p v-if="statsLine" class="mt-1">{{ statsLine }}</p>
    </div>
  </section>
</template>
