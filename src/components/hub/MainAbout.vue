<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import SectionHeading from '@/components/hub/SectionHeading.vue'

const { t } = useI18n()
</script>

<template>
  <!-- About — what the site is, in two short paragraphs -->
  <section id="main-about" class="border-b border-foreground/10">
    <div class="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
      <SectionHeading
        :eyebrow="t('main.aboutEyebrow')"
        :title="t('main.aboutTitle')"
        title-class="mb-8"
      />
      <div class="max-w-2xl space-y-4 text-[17px] leading-relaxed text-muted-foreground">
        <p>{{ t('main.aboutP1') }}</p>
        <p>{{ t('main.aboutP2') }}</p>
      </div>
    </div>
  </section>
</template>
