<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import FuruDeviceBar from './FuruDeviceBar.vue'
import FuruPresetSection from './FuruPresetSection.vue'
import { usePresetLists } from './usePresetLists'

withDefaults(
  defineProps<{
    /** FuruHibi DSP app URL (hub passes a relative path). */
    dspHref?: string
  }>(),
  { dspHref: 'https://project.nyaahibi.web.id/furuhibi/dsp.html' },
)

const { t } = useI18n()
const { query, peqState, dspState, filteredPeq, filteredDsp, peqNoMatch, dspNoMatch, statusOf } =
  usePresetLists()
</script>

<template>
  <FuruDeviceBar />

  <!-- One search box filters both categories at once (live behaviour) -->
  <div class="relative mx-auto mb-8 max-w-[480px]">
    <input
      v-model="query"
      type="text"
      autocomplete="off"
      class="w-full rounded-lg border border-foreground/15 bg-card px-3.5 py-2.5 pr-10 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
      :placeholder="t('furuhibi.presets.search.placeholder')"
    />
    <button
      v-if="query"
      class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-foreground"
      :aria-label="t('furuhibi.presets.search.clear')"
      @click="query = ''"
    >
      ✕
    </button>
  </div>

  <FuruPresetSection
    :title="t('furuhibi.presets.peq.title')"
    :status="statusOf(peqState, 'peq')"
    :status-error="peqState.kind === 'error'"
    :presets="filteredPeq"
    variant="peq"
    :no-match="t('furuhibi.presets.peq.noMatch')"
    :show-no-match="peqNoMatch"
    :dsp-href="dspHref"
  />

  <FuruPresetSection
    :title="t('furuhibi.presets.dsp.title')"
    :desc="t('furuhibi.presets.dsp.desc')"
    :status="statusOf(dspState, 'dsp')"
    :status-error="dspState.kind === 'error'"
    :presets="filteredDsp"
    variant="dsp"
    :no-match="t('furuhibi.presets.dsp.noMatch')"
    :show-no-match="dspNoMatch"
    :dsp-href="dspHref"
  />
</template>
