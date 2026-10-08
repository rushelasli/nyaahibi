<script setup lang="ts">
import FuruPresetBrowser from '@/components/furuhibi/presets/FuruPresetBrowser.vue'
import FuruPresetsHeader from '@/components/furuhibi/presets/FuruPresetsHeader.vue'

/** Set by the projects hub (no router); portfolio pages fall back to defaults. */
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
</script>

<template>
  <main>
    <FuruPresetsHeader :dsp-href="dspHref" :landing-href="landingHref" />

    <div class="mx-auto max-w-5xl px-5 py-9 md:px-8">
      <FuruPresetBrowser :dsp-href="dspHref" />
    </div>
  </main>
</template>
