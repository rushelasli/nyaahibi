<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FuruGroupCard from './FuruGroupCard.vue'

interface Step {
  name: string
  desc: string
}

const { t, tm } = useI18n()

const steps = computed(() => tm('furuhibi.blockSteps') as unknown as Step[])
</script>

<template>
  <!-- Block & routing diagram + the "Fungsi Block" step list -->
  <section id="block-diagram" class="scroll-mt-32 border-b border-foreground/10">
    <div class="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-20">
      <p class="mb-3 font-mono text-[13px] uppercase tracking-[0.2em] text-primary">
        {{ t('furuhibi.blockEyebrow') }}
      </p>
      <h2 class="mb-3 max-w-[22ch] text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        {{ t('furuhibi.blockTitle') }}
      </h2>
      <p class="mb-8 max-w-xl text-[16px] leading-relaxed text-muted-foreground">
        {{ t('furuhibi.blockDesc') }}
      </p>

      <figure class="mb-8 overflow-hidden rounded-xl border border-foreground/10 bg-white p-4 md:p-6">
        <img
          src="/projects/furuhibi/diagramblockpwr.png"
          :alt="t('furuhibi.blockAlt')"
          class="w-full"
          loading="lazy"
        />
      </figure>

      <FuruGroupCard :title="t('furuhibi.blockGroupTitle')" :steps="steps" />
    </div>
  </section>
</template>
