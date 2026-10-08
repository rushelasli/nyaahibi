<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import FuruDspChips from './FuruDspChips.vue'
import FuruEqGraph from './FuruEqGraph.vue'
import { usePresetCard } from './usePresetCard'
import type { DspPreset, PeqPreset } from './presetsApi'

const props = withDefaults(
  defineProps<{
    preset: PeqPreset | DspPreset
    variant: 'peq' | 'dsp'
    /** FuruHibi DSP app URL (hub passes a relative path). */
    dspHref?: string
  }>(),
  { dspHref: 'https://project.nyaahibi.web.id/furuhibi/dsp' },
)

const { t } = useI18n()
const { connected, status, statusKind, metaLine, authorLine, openInDsp, applyToDevice } =
  usePresetCard(props)
</script>

<template>
  <div class="rounded-xl border border-foreground/10 bg-card p-4 md:p-5">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <p class="break-words text-base font-semibold text-foreground">{{ preset.name }}</p>
      <p class="font-mono text-xs text-muted-foreground">{{ metaLine }}</p>
    </div>
    <p v-if="authorLine" class="mt-1 font-mono text-xs text-muted-foreground">
      {{ authorLine }}
    </p>

    <FuruEqGraph v-if="variant === 'peq'" :bands="(preset as PeqPreset).bands" />
    <FuruDspChips v-else :settings="(preset as DspPreset).settings" />

    <div class="mt-3 flex flex-wrap justify-end gap-2">
      <button
        class="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 font-mono text-xs text-primary transition-colors hover:bg-primary/20"
        @click="openInDsp"
      >
        {{ t('furuhibi.presets.cards.openDsp') }}
      </button>
      <button
        class="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 font-mono text-xs text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="!connected"
        @click="applyToDevice"
      >
        {{ t('furuhibi.presets.cards.apply') }}
      </button>
    </div>
    <p
      class="mt-1.5 min-h-[1.2em] text-right text-xs"
      :class="
        statusKind === 'ok' ? 'text-primary' : statusKind === 'err' ? 'text-destructive' : 'text-muted-foreground'
      "
    >
      {{ status }}
    </p>
  </div>
</template>
