<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { createSbfg, SBFG_LEGEND, type Sbfg, type SbfgStats } from './sbfg'

const { t, tm } = useI18n()

const svgEl = ref<SVGSVGElement | null>(null)
const playing = ref(false)
const speed = ref(900)
const stats = ref<SbfgStats>({ blocks: 0, ring: 0, underrun: 0, staging: 0 })
let engine: Sbfg | undefined

const legend = computed(() => tm('furuhibi.sbfg.legend') as unknown as string[])
const statLabels = computed(() => tm('furuhibi.sbfg.stats') as unknown as string[])
const speeds = computed(() => tm('furuhibi.sbfg.speeds') as unknown as string[])
const speedValues = [1400, 900, 500]

function toggle() {
  if (playing.value) engine?.pause()
  else engine?.play()
}

function stepOnce() {
  engine?.pause()
  engine?.step()
}

function onSpeed() {
  engine?.setSpeed(Number(speed.value))
}

onMounted(() => {
  if (svgEl.value) {
    engine = createSbfg(svgEl.value, {
      stats,
      playing,
      readyStatus: () => t('furuhibi.sbfg.readyStatus'),
    })
  }
})

onUnmounted(() => engine?.dispose())
</script>

<template>
  <div class="rounded-xl border border-foreground/10 bg-card p-6">
    <div class="mb-3 flex items-center gap-2">
      <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-primary"></span>
      <p class="text-base font-semibold text-foreground md:text-lg">
        {{ t('furuhibi.sbfg.title') }}
      </p>
    </div>
    <p class="mb-5 text-[15px] leading-relaxed text-muted-foreground">
      {{ t('furuhibi.sbfg.sub') }}
    </p>

    <div class="overflow-hidden rounded-lg border border-foreground/10 bg-background/40 p-2">
      <svg
        ref="svgEl"
        viewBox="0 0 900 300"
        xmlns="http://www.w3.org/2000/svg"
        class="block w-full"
        role="img"
        :aria-label="t('furuhibi.sbfg.title')"
      ></svg>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-2">
      <button
        class="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#5a4bd1]"
        @click="toggle"
      >
        {{ playing ? t('furuhibi.sbfg.pause') : t('furuhibi.sbfg.play') }}
      </button>
      <button
        class="inline-flex items-center rounded-lg border border-foreground/15 px-4 py-2 text-sm font-medium text-foreground/90 transition-colors hover:border-foreground/30 hover:bg-foreground/5"
        @click="stepOnce"
      >
        {{ t('furuhibi.sbfg.step') }}
      </button>
      <button
        class="inline-flex items-center rounded-lg border border-foreground/15 px-4 py-2 text-sm font-medium text-foreground/90 transition-colors hover:border-foreground/30 hover:bg-foreground/5"
        @click="engine?.reset()"
      >
        {{ t('furuhibi.sbfg.reset') }}
      </button>
      <label
        class="ml-auto flex items-center gap-2 font-mono text-[13px] text-muted-foreground"
      >
        {{ t('furuhibi.sbfg.speedLabel') }}
        <select
          v-model="speed"
          class="rounded-md border border-foreground/15 bg-background px-2 py-1.5 font-mono text-[13px] text-foreground"
          @change="onSpeed"
        >
          <option v-for="(label, i) in speeds" :key="label" :value="speedValues[i]">
            {{ label }}
          </option>
        </select>
      </label>
    </div>

    <div class="mt-4 flex flex-wrap gap-x-4 gap-y-1">
      <span
        v-for="(label, i) in legend"
        :key="label"
        class="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground"
      >
        <i class="h-2.5 w-2.5 rounded-full" :style="{ background: SBFG_LEGEND[i] }"></i>
        {{ label }}
      </span>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      <div
        v-for="(label, i) in statLabels"
        :key="label"
        class="rounded-lg border border-foreground/10 bg-background/40 px-3 py-2"
      >
        <b class="block font-mono text-lg text-foreground">{{
          [stats.blocks, stats.ring, stats.underrun, `${stats.staging}B`][i]
        }}</b>
        <span class="font-mono text-[11px] text-muted-foreground">{{ label }}</span>
      </div>
    </div>
  </div>
</template>
