<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { QBUF_COLORS, QBUF_FILLS, useQbuf } from './qbuf'

const { t, tm } = useI18n()
const { stages, inIdx, outIdx, pulsing, seg } = useQbuf()

const labels = computed(() => tm('furuhibi.qbuf.labels') as unknown as string[])
const legend = computed(() => tm('furuhibi.qbuf.legend') as unknown as string[])
</script>

<template>
  <div class="rounded-xl border border-foreground/10 bg-card p-6">
    <div class="mb-3 flex items-center gap-2">
      <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-primary"></span>
      <p class="text-base font-semibold text-foreground md:text-lg">
        {{ t('furuhibi.qbuf.title') }}
      </p>
    </div>

    <div class="mt-4 rounded-lg border border-foreground/10 bg-background/40 p-3 md:p-4">
      <!-- Flow-in: horizontal on small screens, vertical side column on md+ -->
      <div class="md:hidden">
        <p class="text-center font-mono text-[13px] font-semibold text-primary">
          {{ t('furuhibi.qbuf.inLabel') }}
        </p>
        <div class="relative h-6">
          <span
            class="absolute top-0 -translate-x-1/2 text-base text-primary"
            style="transition: left 900ms ease"
            :style="{ left: seg(inIdx) }"
            >&#8595;</span
          >
        </div>
      </div>

      <div class="grid grid-cols-[22px_1fr_22px] items-stretch gap-2">
        <div class="relative hidden md:block">
          <span
            class="absolute -translate-y-1/2 text-base text-primary"
            style="transition: top 900ms ease"
            :style="{ top: `calc(${seg(inIdx)} - 8px)` }"
            >&#8594;</span
          >
          <span
            class="absolute left-1/2 -translate-x-1/2 font-mono text-[11px] font-semibold text-primary [writing-mode:vertical-rl]"
            :style="{ top: `calc(${seg(inIdx)} + 12px)` }"
            >{{ t('furuhibi.qbuf.inShort') }}</span
          >
        </div>

        <div class="grid grid-cols-4 gap-1.5 md:gap-2">
          <div
            v-for="(stage, i) in stages"
            :key="i"
            class="rounded-md border-2 bg-background p-1.5 transition-transform duration-300"
            :class="pulsing ? 'scale-[1.06]' : ''"
            :style="{ borderColor: QBUF_COLORS[stage] }"
          >
            <p class="mb-1 text-center font-mono text-[10px] text-muted-foreground">
              Buffer {{ i + 1 }}
            </p>
            <div class="flex h-12 w-full flex-col justify-end overflow-hidden rounded-sm bg-foreground/5 md:h-16">
              <div
                :style="{
                  height: QBUF_FILLS[stage] + '%',
                  background: QBUF_COLORS[stage],
                  transition: 'height 2400ms linear',
                }"
              ></div>
            </div>
            <p
              class="mt-1 text-center font-mono text-[11px] font-semibold"
              :style="{ color: QBUF_COLORS[stage] }"
            >
              {{ labels[stage] }}
            </p>
          </div>
        </div>

        <div class="relative hidden md:block">
          <span
            class="absolute -translate-y-1/2 text-base text-primary"
            style="transition: top 900ms ease"
            :style="{ top: `calc(${seg(outIdx)} - 8px)` }"
            >&#8594;</span
          >
          <span
            class="absolute left-1/2 -translate-x-1/2 font-mono text-[11px] font-semibold text-primary [writing-mode:vertical-rl]"
            :style="{ top: `calc(${seg(outIdx)} + 12px)` }"
            >{{ t('furuhibi.qbuf.outShort') }}</span
          >
        </div>
      </div>

      <div class="md:hidden">
        <div class="relative h-6">
          <span
            class="absolute top-0 -translate-x-1/2 text-base text-primary"
            style="transition: left 900ms ease"
            :style="{ left: seg(outIdx) }"
            >&#8595;</span
          >
        </div>
        <p class="text-center font-mono text-[13px] font-semibold text-primary">
          {{ t('furuhibi.qbuf.outLabel') }}
        </p>
      </div>

      <div class="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
        <span
          v-for="(label, i) in legend"
          :key="label"
          class="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground"
        >
          <i class="h-2.5 w-2.5 rounded-full" :style="{ background: QBUF_COLORS[i] }"></i>
          {{ label }}
        </span>
      </div>
    </div>

    <p class="mt-4 text-[13px] leading-relaxed text-muted-foreground" v-html="t('furuhibi.qbuf.caption')" />
  </div>
</template>
