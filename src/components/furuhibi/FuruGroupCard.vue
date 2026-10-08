<script setup lang="ts">
/** Shared pipeline "group" card — head dot + title, a step list, and an
 *  optional widget in the footer slot (SBFG / quad buffer / DSP FX). */
defineProps<{
  title: string
  steps: { name: string; desc: string }[]
}>()
</script>

<template>
  <div class="rounded-xl border border-foreground/10 bg-card">
    <div class="flex items-center gap-2 border-b border-foreground/10 px-5 py-3.5">
      <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-primary"></span>
      <p class="text-sm font-semibold text-foreground md:text-base">{{ title }}</p>
    </div>

    <div>
      <div
        v-for="step in steps"
        :key="step.name"
        class="border-t border-foreground/10 px-5 py-4 first:border-t-0"
      >
        <p class="font-mono text-[13px] text-primary">{{ step.name }}</p>
        <p class="mt-1 text-[14px] leading-relaxed text-muted-foreground" v-html="step.desc" />
      </div>
    </div>

    <div v-if="$slots.widget" class="border-t border-foreground/10 p-5">
      <slot />
    </div>
  </div>
</template>
