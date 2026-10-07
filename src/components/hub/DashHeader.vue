<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ArrowLeft } from '@lucide/vue'

const { t } = useI18n()
</script>

<template>
  <!-- Header — centered logo/title/tagline, as on the old dashboard -->
  <section class="border-b border-foreground/10 bg-card/40">
    <div class="mx-auto max-w-5xl px-5 py-12 text-center md:px-8">
      <img src="/logo.png" alt="" aria-hidden="true" class="mx-auto mb-4 h-16 w-16 object-contain" />
      <h1 class="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        {{ t('dash.title') }}
      </h1>
      <p class="mt-3 font-mono text-[13px] text-muted-foreground">
        {{ t('dash.subtitle') }}
      </p>
      <a
        href="/"
        class="mt-5 inline-flex w-fit items-center gap-1.5 font-mono text-[13px] text-primary underline underline-offset-4 transition-colors hover:text-foreground"
      >
        <ArrowLeft class="h-3.5 w-3.5" />
        {{ t('hub.ctaBrowse') }}
      </a>
    </div>
  </section>
</template>
