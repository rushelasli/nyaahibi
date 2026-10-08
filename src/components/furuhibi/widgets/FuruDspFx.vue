<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { createDspfx, DSPFX_IN, DSPFX_ORDER, DSPFX_OUT, type Dspfx, type DspfxKey } from './dspfx'

const { t, tm } = useI18n()

const svgEl = ref<SVGSVGElement | null>(null)
const active = ref<DspfxKey>('eq')
let engine: Dspfx | undefined

const effects = computed(
  () => tm('furuhibi.dspFx.effects') as unknown as Record<string, { label: string; desc: string }>,
)
const legend = computed(() => tm('furuhibi.dspFx.legend') as unknown as string[])

watch(active, (key) => engine?.activate(key))

onMounted(() => {
  if (svgEl.value) {
    engine = createDspfx(svgEl.value)
    engine.activate(active.value)
  }
})

onUnmounted(() => engine?.dispose())
</script>

<template>
  <div class="rounded-xl border border-foreground/10 bg-card p-6">
    <div class="mb-3 flex items-center gap-2">
      <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-primary"></span>
      <p class="text-base font-semibold text-foreground md:text-lg">
        {{ t('furuhibi.dspFx.title') }}
      </p>
    </div>
    <p class="mb-5 text-[15px] leading-relaxed text-muted-foreground">
      {{ t('furuhibi.dspFx.sub') }}
    </p>

    <div class="mb-3 flex flex-wrap gap-2">
      <button
        v-for="key in DSPFX_ORDER"
        :key="key"
        class="rounded-full border px-3 py-1.5 font-mono text-[13px] transition-colors"
        :class="
          active === key
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-foreground/15 text-foreground/80 hover:border-foreground/30'
        "
        @click="active = key"
      >
        {{ effects[key].label }}
      </button>
    </div>

    <div class="overflow-hidden rounded-lg border border-foreground/10 bg-background/40 p-2">
      <svg
        ref="svgEl"
        viewBox="0 0 900 260"
        xmlns="http://www.w3.org/2000/svg"
        class="block w-full"
        role="img"
        :aria-label="effects[active].label"
      ></svg>
    </div>

    <p
      class="mt-3 text-[14px] leading-relaxed text-muted-foreground"
      v-html="effects[active].desc"
    />

    <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1">
      <span
        v-for="(label, i) in legend"
        :key="label"
        class="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground"
      >
        <i class="h-2.5 w-2.5 rounded-full" :style="{ background: [DSPFX_IN, DSPFX_OUT][i] }"></i>
        {{ label }}
      </span>
    </div>
  </div>
</template>
