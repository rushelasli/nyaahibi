<script setup lang="ts">
import FuruPresetCard from './FuruPresetCard.vue'
import type { DspPreset, PeqPreset } from './presetsApi'

defineProps<{
  title: string
  desc?: string
  /** Resolved status line (loading/empty/error) — null hides it. */
  status?: string | null
  statusError?: boolean
  presets: (PeqPreset | DspPreset)[]
  variant: 'peq' | 'dsp'
  noMatch: string
  showNoMatch: boolean
  dspHref: string
}>()
</script>

<template>
  <section class="mb-11">
    <h2
      class="mb-1 border-b border-foreground/10 pb-2.5 text-lg font-semibold tracking-tight text-foreground md:text-xl"
    >
      {{ title }}
    </h2>
    <p v-if="desc" class="mb-3.5 mt-1.5 text-[13px] text-muted-foreground">{{ desc }}</p>

    <p
      v-if="status"
      class="p-7 text-center text-sm"
      :class="statusError ? 'text-destructive' : 'text-muted-foreground'"
    >
      {{ status }}
    </p>

    <div v-else-if="presets.length" class="mt-3.5 flex flex-col gap-3.5">
      <FuruPresetCard
        v-for="preset in presets"
        :key="preset.id"
        :preset="preset"
        :variant="variant"
        :dsp-href="dspHref"
      />
    </div>

    <p v-if="showNoMatch" class="p-3.5 text-center text-[13px] text-muted-foreground">
      {{ noMatch }}
    </p>
  </section>
</template>
