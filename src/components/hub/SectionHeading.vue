<script setup lang="ts">
/** Shared mono eyebrow + section title — used 7x across both landings. */
defineProps<{
  /** Already-translated eyebrow line. */
  eyebrow: string
  /** Already-translated h2 text. */
  title: string
  /** h2 bottom margin (default `mb-10`; the main About section uses `mb-8`). */
  titleClass?: string
}>()
</script>

<template>
  <p class="mb-3 font-mono text-[13px] uppercase tracking-[0.2em] text-primary">
    {{ eyebrow }}
  </p>
  <h2
    :class="titleClass ?? 'mb-10'"
    class="text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
  >
    {{ title }}
  </h2>
</template>
