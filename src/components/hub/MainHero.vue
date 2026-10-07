<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ArrowDown } from '@lucide/vue'

const { t } = useI18n()

function scrollToGateways() {
  document.getElementById('main-gateways')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <!-- Hero — flat, single-column: tagline → name → what this site is → CTA -->
  <section id="main-hero" class="border-b border-foreground/10">
    <div class="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
      <p class="mb-4 font-mono text-[13px] uppercase tracking-[0.2em] text-primary">
        {{ t('hub.eyebrow') }}
      </p>
      <h1
        class="mb-5 text-4xl font-semibold leading-[1.1] tracking-tight text-foreground md:text-5xl"
      >
        NyaaHibi
      </h1>
      <p class="mb-8 max-w-lg text-[17px] leading-relaxed text-muted-foreground">
        {{ t('main.intro') }}
      </p>
      <button
        class="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#5a4bd1]"
        @click="scrollToGateways"
      >
        <ArrowDown class="h-4 w-4" />
        {{ t('main.heroCta') }}
      </button>
    </div>
  </section>
</template>
