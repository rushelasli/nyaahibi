<script setup lang="ts">
import FuruDownloadGrid from '@/components/furuhibi/downloads/FuruDownloadGrid.vue'
import FuruDownloadsHead from '@/components/furuhibi/downloads/FuruDownloadsHead.vue'
import FuruNav from '@/components/furuhibi/FuruNav.vue'

/** Set by the projects hub (no router); portfolio pages fall back to defaults. */
withDefaults(
  defineProps<{
    /** FuruHibi app URLs — hub passes relative paths, portfolio uses defaults. */
    dspHref?: string
    presetsHref?: string
    /** Self link — same page, mirrors the live download.html nav. */
    downloadHref?: string
  }>(),
  {
    dspHref: 'https://project.nyaahibi.web.id/furuhibi/dsp.html',
    presetsHref: 'https://project.nyaahibi.web.id/furuhibi/preset.html',
    downloadHref: 'https://project.nyaahibi.web.id/furuhibi/download.html',
  },
)
</script>

<template>
  <main>
    <FuruNav
      :dsp-href="dspHref"
      :presets-href="presetsHref"
      :download-href="downloadHref"
      anchor-base="/furuhibi"
    />

    <section class="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-20">
      <FuruDownloadsHead />
      <FuruDownloadGrid />
    </section>
  </main>
</template>
