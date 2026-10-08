<script setup lang="ts">
import FuruNav from '@/components/furuhibi/FuruNav.vue'
import FuruHero from '@/components/furuhibi/FuruHero.vue'
import FuruProducts from '@/components/furuhibi/FuruProducts.vue'
import FuruEcosystem from '@/components/furuhibi/FuruEcosystem.vue'
import FuruDspBand from '@/components/furuhibi/FuruDspBand.vue'
import FuruPhilosophy from '@/components/furuhibi/FuruPhilosophy.vue'
import FuruSpecs from '@/components/furuhibi/FuruSpecs.vue'
import FuruPipeline from '@/components/furuhibi/FuruPipeline.vue'
import FuruBlockDiagram from '@/components/furuhibi/FuruBlockDiagram.vue'

/** Set by the projects hub (no router); when omitted, falls back to a router link. */
defineProps<{
  backHref?: string
  /** FuruHibi app URLs — hub passes relative paths, portfolio uses defaults. */
  dspHref?: string
  presetsHref?: string
  downloadHref?: string
}>()
</script>

<template>
  <main id="top">
    <FuruNav :dsp-href="dspHref" :presets-href="presetsHref" :download-href="downloadHref" />
    <FuruHero :back-href="backHref" :dsp-href="dspHref" />
    <FuruProducts />
    <FuruEcosystem />
    <FuruDspBand :dsp-href="dspHref" :presets-href="presetsHref" />
    <FuruPhilosophy />
    <FuruSpecs />
    <FuruPipeline />
    <FuruBlockDiagram />
  </main>
</template>
