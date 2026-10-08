<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div>
    <p class="mb-3 font-mono text-[13px] uppercase tracking-[0.2em] text-primary">
      {{ t('furuhibi.downloads.eyebrow') }}
    </p>
    <h2 class="mb-3 max-w-[20ch] text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
      {{ t('furuhibi.downloads.heading') }}
    </h2>
    <p class="max-w-2xl text-base leading-relaxed text-muted-foreground">
      {{ t('furuhibi.downloads.intro') }}
    </p>
  </div>
</template>
