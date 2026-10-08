<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FuruGroupCard from './FuruGroupCard.vue'
import FuruSbfg from './widgets/FuruSbfg.vue'
import FuruQuadBuffer from './widgets/FuruQuadBuffer.vue'
import FuruDspFx from './widgets/FuruDspFx.vue'

interface Group {
  title: string
  steps: { name: string; desc: string }[]
}

const { t, tm } = useI18n()

const groups = computed(() => tm('furuhibi.archGroups') as unknown as Group[])
</script>

<template>
  <!-- Audio pipeline — diagram + the three core groups, each with its widget -->
  <section id="architecture" class="scroll-mt-32 border-b border-foreground/10">
    <div class="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-20">
      <p class="mb-3 font-mono text-[13px] uppercase tracking-[0.2em] text-primary">
        {{ t('furuhibi.archEyebrow') }}
      </p>
      <h2 class="mb-3 max-w-[22ch] text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        {{ t('furuhibi.archTitle') }}
      </h2>
      <p class="mb-8 max-w-xl text-[16px] leading-relaxed text-muted-foreground">
        {{ t('furuhibi.archDesc') }}
      </p>

      <figure class="mb-10 overflow-hidden rounded-xl border border-foreground/10 bg-white p-4 md:p-6">
        <img
          src="/projects/furuhibi/audiopipeline.png"
          :alt="t('furuhibi.archAlt')"
          class="w-full"
          loading="lazy"
        />
      </figure>

      <div class="flex flex-col gap-5">
        <FuruGroupCard :title="groups[0].title" :steps="groups[0].steps">
          <FuruSbfg />
        </FuruGroupCard>
        <FuruGroupCard :title="groups[1].title" :steps="groups[1].steps">
          <FuruQuadBuffer />
        </FuruGroupCard>
        <FuruGroupCard :title="groups[2].title" :steps="groups[2].steps">
          <FuruDspFx />
        </FuruGroupCard>
      </div>
    </div>
  </section>
</template>
