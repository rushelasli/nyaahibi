<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    /** i18n namespace for this project's copy (e.g. "amp", "microamp") */
    ns?: string
  }>(),
  { ns: 'amp' },
)

const { t } = useI18n()
</script>

<template>
  <!-- About — eyebrow, title, two paragraphs (the mascot photos belong
       to the home pages only and were dropped from the detail pages) -->
  <section class="border-b border-foreground/10">
    <div class="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-20">
      <p class="mb-3 font-mono text-[13px] uppercase tracking-[0.2em] text-primary">
        {{ t(props.ns + '.aboutEyebrow') }}
      </p>
      <h2 class="mb-8 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        {{ t(props.ns + '.aboutTitle') }}
      </h2>

      <div class="max-w-3xl space-y-4 text-[16px] leading-relaxed text-muted-foreground">
        <p v-html="t(props.ns + '.aboutP1')" />
        <p v-html="t(props.ns + '.aboutP2')" />
      </div>
    </div>
  </section>
</template>
