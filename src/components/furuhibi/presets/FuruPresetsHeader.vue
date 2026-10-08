<script setup lang="ts">
import { useI18n } from 'vue-i18n'

withDefaults(
  defineProps<{
    /** FuruHibi DSP app URL (hub passes a relative path). */
    dspHref?: string
    /** Landing page href — the hub links it by sub-path. */
    landingHref?: string
  }>(),
  {
    dspHref: 'https://project.nyaahibi.web.id/furuhibi/dsp',
    landingHref: 'https://project.nyaahibi.web.id/furuhibi/',
  },
)

const { t } = useI18n()
</script>

<template>
  <!-- Compact header — mirrors the live preset.html masthead -->
  <header class="border-b border-foreground/10 bg-card">
    <div class="mx-auto max-w-5xl px-5 py-9 text-center md:px-8">
      <h1 class="mb-1.5 text-2xl font-semibold text-primary md:text-3xl">
        {{ t('furuhibi.presets.title') }}
      </h1>
      <p class="text-sm text-muted-foreground">{{ t('furuhibi.presets.sub') }}</p>
      <div class="mt-4 flex flex-wrap justify-center gap-2">
        <a
          :href="landingHref"
          class="rounded-lg border border-foreground/15 px-4 py-2 text-sm font-medium text-foreground/90 transition-colors hover:border-foreground/30 hover:bg-foreground/5"
          >{{ t('furuhibi.presets.back') }}</a
        >
        <a
          :href="dspHref"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#5a4bd1]"
          >{{ t('furuhibi.presets.dspAdjust') }}</a
        >
      </div>
    </div>
  </header>
</template>
